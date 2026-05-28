#!/usr/bin/env node
// Sync src/data/{publications,talks,awards,misc}.ts from https://researchmap.jp/amrmap.
//
// Manual fields preserved across syncs (matched by stable key):
//   • publications.highlight  — keyed by DOI
//   • grants.role             — keyed by grant number, falling back to normalized title
//   • books.role              — keyed by normalized title
//
// Run locally:  node scripts/sync-researchmap.mjs
// Exit code 0 always; the workflow inspects `git status` to decide whether to commit.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const PERMALINK = 'amrmap';
const API = `https://api.researchmap.jp/${PERMALINK}`;

// ---------- HTTP ----------

async function fetchAll(endpoint) {
  const items = [];
  let url = `${API}/${endpoint}?limit=200`;
  while (url) {
    const res = await fetch(url, { headers: { Accept: 'application/ld+json' } });
    if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
    const data = await res.json();
    items.push(...(data.items ?? []));
    url = data._links?.next?.href ?? null;
  }
  return items;
}

// ---------- Helpers ----------

const pickLang = (field, ...langs) => {
  if (!field) return undefined;
  for (const l of langs) if (field[l]) return field[l];
  const v = Object.values(field)[0];
  return typeof v === 'string' ? v : undefined;
};

const parseYear = (date) => {
  const m = String(date ?? '').match(/^(\d{4})/);
  return m ? Number(m[1]) : undefined;
};

const normalizeTitle = (t) =>
  (t ?? '').toLowerCase().replace(/\s+/g, ' ').replace(/[、，,。.!?！？]/g, '').trim();

function formatAuthors(authorsField) {
  if (!authorsField) return '';
  const en = authorsField.en;
  const ja = authorsField.ja;
  if (en && en.length) {
    const formatted = en.map((a) => {
      const parts = String(a.name ?? '').trim().split(/\s+/);
      if (parts.length < 2) return a.name ?? '';
      const family = parts[parts.length - 1];
      const initials = parts.slice(0, -1).map((p) => `${p[0]}.`).join(' ');
      return `${family}, ${initials}`;
    });
    return joinAuthors(formatted);
  }
  if (ja && ja.length) return joinAuthors(ja.map((a) => a.name ?? ''));
  return '';
}

function joinAuthors(names) {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  if (names.length <= 4) {
    return names.slice(0, -1).join(', ') + ` & ${names[names.length - 1]}`;
  }
  return names.slice(0, 3).join(', ') + ', et al.';
}

// ---------- Type mapping ----------

const paperType = {
  scientific_journal: 'journal',
  international_conference_proceedings: 'conference',
  in_book: 'chapter',
};

function presentationType(it) {
  const t = it.presentation_type ?? '';
  if (it.invited === true || t === 'invited_oral_presentation' || t === 'nominated_symposium' || t === 'public_discourse') {
    return 'invited';
  }
  if (t.includes('poster')) return 'poster';
  if (t.includes('keynote')) return 'keynote';
  return 'oral';
}

function miscType(it) {
  if (it.misc_type === 'introduction_commerce_magazine') return 'column';
  const url = (it.see_also ?? []).find((s) => s.label === 'url')?.['@id'] ?? '';
  if (/arxiv\.org/i.test(url)) return 'preprint';
  return 'working-paper';
}

// Researchmap funder names → short form matching current data style.
function shortenFunder(offer) {
  if (!offer) return offer;
  if (/JST\s*RISTEX/i.test(offer) || /科学技術振興機構社会技術研究開発センター/.test(offer)) return 'JST RISTEX';
  if (/日本学術振興会/.test(offer) || /Japan Society for the Promotion of Science/i.test(offer)) return 'JSPS';
  if (/科学技術振興機構/.test(offer)) return 'JST';
  return offer;
}

function formatFunder(it) {
  const offer = pickLang(it.offer_organization, 'ja', 'en');
  const category = pickLang(it.category, 'ja', 'en');
  const system = pickLang(it.system_name, 'ja', 'en');
  const short = shortenFunder(offer);
  // Prefer category (e.g. "基盤研究(B)") over the longer system_name when both exist.
  // For JST RISTEX, system_name is the program name — keep it short by taking the bracketed acronym if any.
  let tail = category;
  if (!tail && system) {
    // For verbose system_names like "SDGsの達成に向けた共創的研究開発プログラム（…）", keep the leading phrase before parens.
    tail = system.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').trim();
  }
  return [short, tail].filter(Boolean).join(' ');
}

function formatPeriod(it) {
  const from = (it.from_date ?? '').slice(0, 7);
  const to = (it.to_date ?? '').slice(0, 7);
  return `${from} – ${to}`;
}

function buildPaperUrl(it) {
  const doi = it.identifiers?.doi?.[0];
  if (doi) return `https://doi.org/${doi}`;
  const u = (it.see_also ?? []).find((s) => s.label === 'url');
  return u?.['@id'];
}

// ---------- Existing manual-override extraction ----------
// We parse the existing .ts files with a regex (since the structure is regular
// hand-written object literals). This avoids a TS toolchain in CI.

async function readSafe(p) {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return '';
  }
}

function splitObjects(arrayText) {
  // Given the body of an array literal, return each top-level object literal as a string.
  const objs = [];
  let depth = 0;
  let start = -1;
  let inStr = null;
  for (let i = 0; i < arrayText.length; i++) {
    const c = arrayText[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
    if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        objs.push(arrayText.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return objs;
}

function extractArrayBody(text, exportName) {
  const re = new RegExp(`export const ${exportName}[^=]*=\\s*\\[`, 'm');
  const m = text.match(re);
  if (!m) return '';
  const startIdx = m.index + m[0].length;
  let depth = 1;
  let i = startIdx;
  let inStr = null;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) break;
    }
  }
  return text.slice(startIdx, i);
}

function readField(objText, key) {
  // Match: key: 'value' | "value" | true | false | 123
  const reStr = new RegExp(`(?:^|[\\s,{])${key}\\s*:\\s*(['"\`])((?:\\\\.|(?!\\1).)*)\\1`, 's');
  const m = objText.match(reStr);
  if (m) return m[2].replace(/\\(.)/g, '$1');
  const reBool = new RegExp(`(?:^|[\\s,{])${key}\\s*:\\s*(true|false)`);
  const mb = objText.match(reBool);
  if (mb) return mb[1] === 'true';
  return undefined;
}

async function extractOverrides() {
  const overrides = {
    highlight: new Map(),
    grantRoleByNumber: new Map(),
    grantRoleByTitle: new Map(),
    bookRole: new Map(),
  };

  const pubText = await readSafe(path.join(DATA_DIR, 'publications.ts'));
  for (const obj of splitObjects(extractArrayBody(pubText, 'publications'))) {
    const url = readField(obj, 'url');
    const highlight = readField(obj, 'highlight');
    if (url && highlight === true) {
      const doi = String(url).match(/doi\.org\/(.+)/)?.[1];
      if (doi) overrides.highlight.set(doi.toLowerCase(), true);
    }
  }
  for (const obj of splitObjects(extractArrayBody(pubText, 'books'))) {
    const title = readField(obj, 'title');
    const role = readField(obj, 'role');
    if (title && role) overrides.bookRole.set(normalizeTitle(title), role);
  }

  const awardsText = await readSafe(path.join(DATA_DIR, 'awards.ts'));
  for (const obj of splitObjects(extractArrayBody(awardsText, 'grants'))) {
    const title = readField(obj, 'title');
    const role = readField(obj, 'role');
    const grantNumber = readField(obj, 'grantNumber');
    if (!role) continue;
    if (grantNumber) overrides.grantRoleByNumber.set(String(grantNumber), role);
    if (title) overrides.grantRoleByTitle.set(normalizeTitle(title), role);
  }

  return overrides;
}

// ---------- TS serialization ----------

function tsString(s) {
  // JSON-style string with double quotes — keeps Unicode intact, handles all escapes.
  return JSON.stringify(s);
}

function tsValue(v, indent) {
  if (v === undefined || v === null) return 'undefined';
  if (typeof v === 'string') return tsString(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return tsArray(v, indent);
  if (typeof v === 'object') return tsObject(v, indent);
  return 'undefined';
}

function tsObject(obj, indent) {
  const inner = indent + '  ';
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    lines.push(`${inner}${k}: ${tsValue(v, inner)},`);
  }
  return `{\n${lines.join('\n')}\n${indent}}`;
}

function tsArray(arr, indent) {
  if (arr.length === 0) return '[]';
  const inner = indent + '  ';
  const items = arr.map((x) => `${inner}${tsValue(x, inner)},`);
  return `[\n${items.join('\n')}\n${indent}]`;
}

// ---------- Builders ----------

function buildPublications(papers, highlightOverrides) {
  return papers.map((it) => {
    const url = buildPaperUrl(it);
    const doi = it.identifiers?.doi?.[0]?.toLowerCase();
    const obj = {
      year: parseYear(it.publication_date),
      date: it.publication_date || undefined,
      authors: formatAuthors(it.authors),
      title: pickLang(it.paper_title, 'en', 'ja') ?? '',
      venue: pickLang(it.publication_name, 'en', 'ja') ?? '',
      url,
      type: paperType[it.published_paper_type],
      highlight: doi && highlightOverrides.get(doi) ? true : undefined,
    };
    return obj;
  });
}

function buildBooks(booksEtc, bookRoleOverrides) {
  return booksEtc.map((it) => {
    const title = pickLang(it.book_title, 'ja', 'en') ?? '';
    const url = (it.see_also ?? []).find((s) => s.label === 'url')?.['@id'];
    return {
      year: parseYear(it.publication_date),
      date: it.publication_date || undefined,
      title,
      role: bookRoleOverrides.get(normalizeTitle(title)) ?? 'Author',
      publisher: pickLang(it.publisher, 'ja', 'en') ?? '',
      url,
    };
  });
}

function buildTalks(presentations) {
  return presentations.map((it) => {
    const title = pickLang(it.presentation_title, 'en', 'ja') ?? '';
    const venue = pickLang(it.event, 'en', 'ja') ?? '';
    return {
      date: it.publication_date ?? '',
      type: presentationType(it),
      title,
      venue,
      url: `https://researchmap.jp/${PERMALINK}/presentations/${it['rm:id']}`,
    };
  });
}

function buildAwards(awards) {
  return awards.map((it) => {
    const award = pickLang(it.award_name, 'ja', 'en') ?? '';
    const subtitle = pickLang(it.award_title, 'ja', 'en');
    return {
      year: parseYear(it.award_date),
      date: it.award_date || undefined,
      title: subtitle ? `${award} — ${subtitle}` : award,
      org: pickLang(it.association, 'ja', 'en'),
    };
  });
}

// If Matsui (松井 / Matsui) is listed first among investigators, default role to 代表.
function inferGrantRole(it) {
  const list = it.investigators?.ja ?? it.investigators?.en ?? [];
  const first = list[0]?.name ?? '';
  if (/松井|Matsui/i.test(first)) return '代表';
  return '分担';
}

function buildGrants(projects, overrides) {
  return projects.map((it) => {
    const title = pickLang(it.research_project_title, 'ja', 'en') ?? '';
    const grantNumber = it.identifiers?.grant_number?.[0];
    const role =
      (grantNumber && overrides.grantRoleByNumber.get(String(grantNumber))) ||
      overrides.grantRoleByTitle.get(normalizeTitle(title)) ||
      inferGrantRole(it);
    return {
      period: formatPeriod(it),
      title,
      role,
      funder: formatFunder(it),
      grantNumber,
    };
  });
}

function buildMisc(misc) {
  return misc.map((it) => {
    const title = pickLang(it.paper_title, 'ja', 'en') ?? '';
    const venue = pickLang(it.publication_name, 'ja', 'en') ?? '';
    const url = (it.see_also ?? []).find((s) => s.label === 'url')?.['@id'];
    return {
      year: parseYear(it.publication_date),
      date: it.publication_date || undefined,
      type: miscType(it),
      authors: formatAuthors(it.authors),
      title,
      venue,
      url,
    };
  });
}

// ---------- File emission ----------

const HEADER = (sources) => `// AUTO-GENERATED by scripts/sync-researchmap.mjs.
// Source: https://researchmap.jp/${PERMALINK} (${sources}).
// Do not edit manually except for fields preserved by the sync script
// (publications.highlight by DOI, grants.role by title, books.role by title).
// Run \`node scripts/sync-researchmap.mjs\` to regenerate.
`;

function emitPublicationsFile(pubs, books) {
  return `${HEADER('published_papers, books_etc')}
export type Publication = {
  year: number;
  date?: string; // raw researchmap publication_date: YYYY | YYYY-MM | YYYY-MM-DD
  authors: string;
  title: string;
  venue: string;
  url?: string;
  type?: 'journal' | 'conference' | 'preprint' | 'chapter' | 'book';
  highlight?: boolean;
};

export const publications: Publication[] = ${tsArray(pubs, '')};

export type Book = {
  year: number;
  date?: string;
  title: string;
  role: string;
  publisher: string;
  url?: string;
};

export const books: Book[] = ${tsArray(books, '')};
`;
}

function emitTalksFile(talks) {
  return `${HEADER('presentations')}
export type Talk = {
  date: string; // YYYY-MM-DD
  title: string;
  venue: string;
  type: 'invited' | 'oral' | 'poster' | 'keynote';
  url?: string;
};

export const talks: Talk[] = ${tsArray(talks, '')};
`;
}

function emitAwardsFile(awards, grants) {
  return `${HEADER('awards, research_projects')}
export type Award = {
  year: number;
  date?: string;
  title: string;
  org?: string;
  url?: string;
};

export const awards: Award[] = ${tsArray(awards, '')};

export type Grant = {
  period: string;
  title: string;
  role: string;
  funder: string;
  url?: string;
  grantNumber?: string;
};

export const grants: Grant[] = ${tsArray(grants, '')};
`;
}

function emitMiscFile(misc) {
  return `${HEADER('misc')}
export type MiscItem = {
  year: number;
  date?: string;
  authors: string;
  title: string;
  venue: string;
  type: 'column' | 'preprint' | 'working-paper' | 'report';
  url?: string;
};

export const misc: MiscItem[] = ${tsArray(misc, '')};
`;
}

// ---------- Main ----------

async function main() {
  console.log('Fetching researchmap data…');
  const [papers, presentations, awards, projects, books_etc, misc] = await Promise.all([
    fetchAll('published_papers'),
    fetchAll('presentations'),
    fetchAll('awards'),
    fetchAll('research_projects'),
    fetchAll('books_etc'),
    fetchAll('misc'),
  ]);
  console.log(
    `  papers=${papers.length}  presentations=${presentations.length}  awards=${awards.length}  ` +
    `projects=${projects.length}  books=${books_etc.length}  misc=${misc.length}`,
  );

  const overrides = await extractOverrides();
  console.log(
    `Preserving overrides: highlight=${overrides.highlight.size}  ` +
    `grantRole=${overrides.grantRoleByNumber.size}/${overrides.grantRoleByTitle.size}(num/title)  ` +
    `bookRole=${overrides.bookRole.size}`,
  );

  const pubs = buildPublications(papers, overrides.highlight);
  const books = buildBooks(books_etc, overrides.bookRole);
  const talks = buildTalks(presentations);
  const awardsOut = buildAwards(awards);
  const grants = buildGrants(projects, overrides);
  const miscOut = buildMisc(misc);

  const writes = [
    [path.join(DATA_DIR, 'publications.ts'), emitPublicationsFile(pubs, books)],
    [path.join(DATA_DIR, 'talks.ts'), emitTalksFile(talks)],
    [path.join(DATA_DIR, 'awards.ts'), emitAwardsFile(awardsOut, grants)],
    [path.join(DATA_DIR, 'misc.ts'), emitMiscFile(miscOut)],
  ];

  for (const [file, content] of writes) {
    await fs.writeFile(file, content);
    console.log(`Wrote ${path.relative(ROOT, file)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
