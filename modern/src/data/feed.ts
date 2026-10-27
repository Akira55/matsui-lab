// Unified, date-sorted activity feed. Sources: hand-written news + papers + talks + misc + awards + grants + books.
//
// Items keep their researchmap-original titles unless translations.ts has an English
// rendering, which is used on the English feed. The locale parameter also translates
// auxiliary text (bodies on manual news, type labels).

import type { Locale } from './site';
import { news } from './news';
import { publications, books } from './publications';
import { talks } from './talks';
import { misc } from './misc';
import { awards, grants } from './awards';
import { service } from './service';
import { tr } from './translations';

export type FeedTag =
  | 'paper'
  | 'talk'
  | 'misc'
  | 'award'
  | 'grant'
  | 'book'
  | 'service'
  | 'media'
  | 'lab';

export type FeedItem = {
  date: string; // display: YYYY | YYYY-MM | YYYY-MM-DD (whatever the source gave us)
  title: string;
  meta?: string; // authors / venue / role
  body?: string; // narrative body, locale-aware (manual news only)
  tag: FeedTag;
  url?: string;
};

// Pad a partial date (YYYY or YYYY-MM) to YYYY-MM-DD so we can sort everything together.
// We pad with end-of-period so a year-only entry sorts after dated entries within the same year.
function sortKey(date: string): string {
  const parts = date.split('-');
  if (parts.length >= 3) return date.slice(0, 10);
  if (parts.length === 2) return `${date}-31`;
  return `${date}-12-31`;
}

// Choose the best display date: prefer the source's raw date, fall back to YYYY.
const pubDate = (p: { date?: string; year: number }) => p.date ?? String(p.year);

// Join meta parts with the separator, dropping the ones researchmap left empty.
// A misc entry with no venue used to render as "Authors ·" with a dangling separator.
const joinMeta = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join(' · ') || undefined;

export function getFeed(locale: Locale): FeedItem[] {
  const items: FeedItem[] = [];

  for (const n of news) {
    items.push({
      date: n.date,
      title: n.title[locale],
      body: n.body?.[locale],
      tag: n.tag ?? 'lab',
      url: n.url,
    });
  }

  for (const p of publications) {
    items.push({
      date: pubDate(p),
      title: tr(p.title, locale),
      meta: joinMeta(tr(p.authors, locale), tr(p.venue, locale)),
      tag: 'paper',
      url: p.url,
    });
  }

  for (const t of talks) {
    items.push({
      date: t.date,
      title: tr(t.title, locale),
      meta: joinMeta(tr(t.venue, locale)),
      tag: 'talk',
      url: t.url,
    });
  }

  for (const m of misc) {
    items.push({
      date: pubDate(m),
      title: tr(m.title, locale),
      meta: joinMeta(tr(m.authors, locale), tr(m.venue, locale)),
      tag: 'misc',
      url: m.url,
    });
  }

  for (const a of awards) {
    items.push({
      date: pubDate(a),
      title: tr(a.title, locale),
      meta: joinMeta(tr(a.org, locale)),
      tag: 'award',
      url: a.url,
    });
  }

  for (const g of grants) {
    const startYear = Number(g.period.slice(0, 4));
    items.push({
      date: `${startYear}-04-01`,
      title: tr(g.title, locale),
      meta: joinMeta(tr(g.role, locale), tr(g.funder, locale), tr(g.period, locale)),
      tag: 'grant',
      url: g.url,
    });
  }

  for (const b of books) {
    items.push({
      date: pubDate(b),
      title: tr(b.title, locale),
      meta: joinMeta(tr(b.role, locale), tr(b.publisher, locale)),
      tag: 'book',
      url: b.url,
    });
  }

  for (const s of service) {
    items.push({
      date: pubDate(s),
      title: tr(s.title, locale),
      meta: joinMeta(tr(s.roles, locale), tr(s.promoter, locale)),
      tag: 'service',
      url: s.url,
    });
  }

  return items.sort((a, b) => (sortKey(a.date) < sortKey(b.date) ? 1 : -1));
}
