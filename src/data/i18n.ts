import type { Locale } from './site';

export const nav: Record<Locale, Record<string, string>> = {
  en: {
    home: 'Home Folder',
    research: 'Research Folder',
    members: 'People Folder',
    publications: 'Publications Folder',
    talks: 'Talks Folder',
    news: 'Recent Items',
    join: 'Joining the Lab…',
    contact: 'Contact…',
  },
  ja: {
    home: 'ホームフォルダ',
    research: '研究フォルダ',
    members: 'メンバーフォルダ',
    publications: '論文フォルダ',
    talks: '講演フォルダ',
    news: '最近使った項目',
    join: '研究室への参加…',
    contact: 'お問い合わせ…',
  },
};

export const ui: Record<Locale, Record<string, string>> = {
  en: {
    readMore: 'Read more',
    viewAll: 'View all',
    seeMembers: 'Open People Folder…',
    seePublications: 'Open Publications Folder…',
    seeTalks: 'See all talks',
    seeMisc: 'See MISC (columns / preprints / WPs)',
    seeNews: 'See all updates',
    address: 'Address',
    email: 'Email',
    languageLabel: '日本語',
    skipToContent: 'Skip to content',
    showMore: 'Open Recent Items…',
  },
  ja: {
    readMore: '続きを読む',
    viewAll: 'すべて見る',
    seeMembers: 'メンバーフォルダを開く…',
    seePublications: '論文フォルダを開く…',
    seeTalks: '講演一覧',
    seeMisc: 'MISC（コラム・プレプリント・WP）',
    seeNews: 'すべてのお知らせを見る',
    address: '所在地',
    email: 'メール',
    languageLabel: 'English',
    skipToContent: '本文へスキップ',
    showMore: '最近使った項目を開く…',
  },
};
