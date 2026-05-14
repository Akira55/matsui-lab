import type { Locale } from './site';

export type Member = {
  slug: string;
  name: Record<Locale, string>;
  role: Record<Locale, string>;
  affiliation?: Record<Locale, string>;
  bio?: Record<Locale, string>;
  links?: { label: string; href: string }[];
  photo?: string;
  emoji?: string; // little kawaii avatar fallback
};

export const members: Member[] = [
  {
    slug: 'akira-matsui',
    name: {
      en: 'Akira Matsui',
      ja: '松井 暉 (まつい あきら)',
    },
    role: {
      en: 'Principal Investigator · Lecturer',
      ja: '主宰者・講師',
    },
    affiliation: {
      en: 'Computational Social Science Research Center, Kobe University',
      ja: '神戸大学 計算社会科学研究センター',
    },
    bio: {
      en: 'Computational social scientist asking what digital trace data can tell us about society and the economy. PhD in Computer Science from USC (2022); previously Lecturer at Yokohama National University (2022–2025).',
      ja: 'デジタル痕跡データから社会・経済の構造を読み解く計算社会科学者。南カリフォルニア大学にて計算機科学博士号取得（2022年）。横浜国立大学講師（2022–2025年）を経て現職。',
    },
    links: [
      { label: 'researchmap', href: 'https://researchmap.jp/amrmap' },
      {
        label: 'Kobe U',
        href: 'https://www.rieb.kobe-u.ac.jp/faculty/global_finance/a_matsui.html',
      },
    ],
    emoji: '📊',
  },
];
