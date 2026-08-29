import type { Locale } from './site';

// Manual milestone announcements. Papers / talks / misc / awards / grants flow into
// the unified feed automatically (see feed.ts), so add entries here only for things
// that are NOT covered by those data sources (lab events, committees, media, etc.).
export type NewsItem = {
  date: string; // ISO YYYY-MM-DD
  title: Record<Locale, string>;
  body?: Record<Locale, string>;
  url?: string;
  tag?: 'paper' | 'talk' | 'award' | 'grant' | 'book' | 'media' | 'lab';
};

export const news: NewsItem[] = [
  {
    date: '2025-08-01',
    tag: 'lab',
    title: {
      en: 'Joined the Diversity and Inclusion Promotion Committee of the Japanese Society for AI',
      ja: '人工知能学会 多様性・包摂推進委員会に参加',
    },
    url: 'https://sites.google.com/ai-gakkai.org/jsai-dei/%E3%83%9B%E3%83%BC%E3%83%A0',
  },
  {
    date: '2025-04-01',
    tag: 'lab',
    title: {
      en: 'Matsui Lab launched at Kobe University CSSRC',
      ja: '神戸大学 計算社会科学研究センターに着任、松井研究室スタート',
    },
    body: {
      en: 'Akira joined the Computational Social Science Research Center as Lecturer.',
      ja: '松井暉が計算社会科学研究センターに講師として着任しました。',
    },
    url: 'https://www.rieb.kobe-u.ac.jp/faculty/global_finance/a_matsui.html',
  },
];
