// Unified, date-sorted activity feed. Sources: hand-written news + papers + talks + misc + awards + grants + books.
//
// Items keep their researchmap-original titles (no translation). The locale parameter
// is only used to translate auxiliary text (bodies on manual news, type labels).

import type { Locale } from './site';
import { news } from './news';
import { publications, books } from './publications';
import { talks } from './talks';
import { misc } from './misc';
import { awards, grants } from './awards';

export type FeedTag =
  | 'paper'
  | 'talk'
  | 'misc'
  | 'award'
  | 'grant'
  | 'book'
  | 'media'
  | 'lab';

export type FeedItem = {
  date: string; // YYYY-MM-DD (year-only sources get YYYY-12-31 so they sort to year end)
  title: string;
  meta?: string; // authors / venue / role
  body?: string; // narrative body, locale-aware (manual news only)
  tag: FeedTag;
  url?: string;
};

// Year-only sources use Dec 31 so they appear near the end of their year, after dated items.
const yearEnd = (y: number) => `${y}-12-31`;

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
      date: yearEnd(p.year),
      title: p.title,
      meta: `${p.authors} · ${p.venue}`,
      tag: 'paper',
      url: p.url,
    });
  }

  for (const t of talks) {
    items.push({
      date: t.date,
      title: t.title,
      meta: t.venue,
      tag: 'talk',
      url: t.url,
    });
  }

  for (const m of misc) {
    items.push({
      date: yearEnd(m.year),
      title: m.title,
      meta: `${m.authors} · ${m.venue}`,
      tag: 'misc',
      url: m.url,
    });
  }

  for (const a of awards) {
    items.push({
      date: yearEnd(a.year),
      title: a.title,
      meta: a.org,
      tag: 'award',
      url: a.url,
    });
  }

  for (const g of grants) {
    const startYear = Number(g.period.slice(0, 4));
    items.push({
      date: `${startYear}-04-01`,
      title: g.title,
      meta: `${g.role} · ${g.funder} · ${g.period}`,
      tag: 'grant',
      url: g.url,
    });
  }

  for (const b of books) {
    items.push({
      date: yearEnd(b.year),
      title: b.title,
      meta: `${b.role} · ${b.publisher}`,
      tag: 'book',
      url: b.url,
    });
  }

  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}
