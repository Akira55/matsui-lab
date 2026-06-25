#!/usr/bin/env node
// Build data/activities.yml from the researchmap-synced src/data/*.ts files.
//
// This runs AFTER scripts/sync-researchmap.mjs in CI: the sync fetches
// researchmap into src/data, and this script maps those records into the
// newsletter category vocabulary and writes a flat activity list.
//
// It reads the .ts files (no network, no TS toolchain) using the same regex
// approach as the sync script, so it can run locally too.
//
// Manual additions / category fixes live in data/activities.manual.yml and are
// merged on top of this file by scripts/update_newsletter_diff.py.
//
// Run locally:  node scripts/build-activities.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const OUT_FILE = path.join(ROOT, 'data', 'activities.yml');

// ---------- .ts reading (mirrors scripts/sync-researchmap.mjs) ----------

async function readSafe(p) {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return '';
  }
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

function splitObjects(arrayText) {
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

function readField(objText, key) {
  const reStr = new RegExp(`(?:^|[\\s,{])${key}\\s*:\\s*(['"\`])((?:\\\\.|(?!\\1).)*)\\1`, 's');
  const m = objText.match(reStr);
  if (m) return m[2].replace(/\\(.)/g, '$1');
  return undefined;
}

async function readRecords(file, exportName) {
  const text = await readSafe(path.join(DATA_DIR, file));
  return splitObjects(extractArrayBody(text, exportName));
}

// ---------- Category mapping ----------

const hasJapanese = (s) => /[぀-ヿ㐀-鿿々〆ヵヶ]/.test(s ?? '');

// published_papers → 論文掲載 / 国際会議発表
function publicationCategory(type) {
  if (type === 'conference') return '国際会議発表';
  return '論文掲載'; // journal, chapter, book, or unknown
}

// presentations → 招待講演 / 国際会議発表 / 国内研究発表
function talkCategory(type, venue) {
  if (type === 'invited' || type === 'keynote') return '招待講演';
  // oral / poster: classify by venue language (heuristic; override in manual file).
  return hasJapanese(venue) ? '国内研究発表' : '国際会議発表';
}

// ---------- Builders ----------

function clean(obj) {
  // drop undefined / empty fields, keep insertion order
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
}

async function buildActivities() {
  const activities = [];

  // Publications → 論文掲載 / 国際会議発表
  for (const obj of await readRecords('publications.ts', 'publications')) {
    const date = readField(obj, 'date');
    const title = readField(obj, 'title');
    if (!date || !title) continue;
    activities.push(clean({
      title,
      category: publicationCategory(readField(obj, 'type')),
      date,
      venue: readField(obj, 'venue'),
      details: readField(obj, 'authors'),
      url: readField(obj, 'url'),
    }));
  }

  // Talks → 招待講演 / 国際会議発表 / 国内研究発表
  for (const obj of await readRecords('talks.ts', 'talks')) {
    const date = readField(obj, 'date');
    const title = readField(obj, 'title');
    if (!date || !title) continue;
    const type = readField(obj, 'type');
    const venue = readField(obj, 'venue');
    activities.push(clean({
      title,
      category: talkCategory(type, venue),
      date,
      venue,
      details: type === 'poster' ? 'ポスター発表' : undefined,
      url: readField(obj, 'url'),
    }));
  }

  // Academic contributions → 学術貢献活動
  for (const obj of await readRecords('service.ts', 'service')) {
    const date = readField(obj, 'date');
    const title = readField(obj, 'title');
    if (!date || !title) continue;
    activities.push(clean({
      title,
      category: '学術貢献活動',
      date,
      role: readField(obj, 'roles'),
      url: readField(obj, 'url'),
    }));
  }

  // Misc → メディア掲載 (columns / reports only)
  for (const obj of await readRecords('misc.ts', 'misc')) {
    const date = readField(obj, 'date');
    const title = readField(obj, 'title');
    const type = readField(obj, 'type');
    if (!date || !title) continue;
    if (type !== 'column' && type !== 'report') continue; // skip preprints / working papers
    activities.push(clean({
      title,
      category: 'メディア掲載',
      date,
      venue: readField(obj, 'venue'),
      details: readField(obj, 'authors'),
      url: readField(obj, 'url'),
    }));
  }

  // Stable order: newest first, then by title.
  activities.sort((a, b) => (b.date.localeCompare(a.date)) || a.title.localeCompare(b.title));
  return activities;
}

// ---------- YAML emission ----------

const FIELD_ORDER = ['title', 'category', 'date', 'venue', 'location', 'details', 'role', 'url'];

function yamlScalar(v) {
  // JSON.stringify yields a double-quoted scalar that is valid YAML and keeps Unicode.
  return JSON.stringify(String(v));
}

function emitYaml(activities) {
  const lines = [];
  lines.push('# AUTO-GENERATED by scripts/build-activities.mjs from src/data/*.');
  lines.push('# researchmap 由来の研究活動を、ニュースレター用カテゴリへ割り当てたものです。');
  lines.push('# 手動の追加・カテゴリ修正は data/activities.manual.yml で行ってください。');
  lines.push('# (このファイルは同期のたびに上書きされます)。');
  lines.push('');
  lines.push('activities:');
  if (activities.length === 0) {
    lines.push('  []');
  }
  for (const a of activities) {
    let first = true;
    for (const key of FIELD_ORDER) {
      if (a[key] === undefined) continue;
      const prefix = first ? '  - ' : '    ';
      lines.push(`${prefix}${key}: ${yamlScalar(a[key])}`);
      first = false;
    }
  }
  return lines.join('\n') + '\n';
}

// ---------- Main ----------

async function main() {
  const activities = await buildActivities();
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, emitYaml(activities));
  console.log(`Wrote ${path.relative(ROOT, OUT_FILE)} (${activities.length} activities)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
