import type { Locale } from './site';

export const nav: Record<Locale, Record<string, string>> = {
  en: {
    home: 'Home',
    research: 'Research',
    members: 'Members',
    publications: 'Publications',
    talks: 'Talks',
    news: 'News',
    join: 'Join',
    contact: 'Contact',
  },
  ja: {
    home: 'ホーム',
    research: '研究',
    members: 'メンバー',
    publications: '論文',
    talks: '講演',
    news: 'ニュース',
    join: '参加',
    contact: 'お問い合わせ',
  },
};

export const ui: Record<Locale, Record<string, string>> = {
  en: {
    readMore: 'Read more',
    viewAll: 'View all',
    seeMembers: 'See all members',
    seePublications: 'See all publications',
    seeTalks: 'See all talks',
    seeMisc: 'See MISC (columns / preprints / WPs)',
    seeNews: 'See all updates',
    address: 'Address',
    email: 'Email',
    languageLabel: '日本語',
    skipToContent: 'Skip to content',
    showMore: 'Show more',
  },
  ja: {
    readMore: '続きを読む',
    viewAll: 'すべて見る',
    seeMembers: 'メンバー一覧',
    seePublications: '論文一覧',
    seeTalks: '講演一覧',
    seeMisc: 'MISC（コラム・プレプリント・WP）',
    seeNews: 'すべてのお知らせを見る',
    address: '所在地',
    email: 'メール',
    languageLabel: 'English',
    skipToContent: '本文へスキップ',
    showMore: 'さらに表示',
  },
};
