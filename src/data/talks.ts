export type Talk = {
  date: string; // YYYY-MM-DD
  title: string; // researchmap original
  venue: string; // researchmap original
  type: 'invited' | 'oral' | 'poster' | 'keynote';
  url?: string;
};

const rm = (id: string) => `https://researchmap.jp/amrmap/presentations/${id}`;

// Sourced from https://researchmap.jp/amrmap/presentations — titles are kept verbatim.
export const talks: Talk[] = [
  {
    date: '2025-12-20',
    type: 'invited',
    title: 'Global Patterns of Knowledge: Language, Genre, and the Geography of Knowledge',
    venue: 'CCSS Workshop on Computational Social Science: Simulation + Data Science + Networks',
    url: rm('51913323'),
  },
  {
    date: '2025-12-14',
    type: 'oral',
    title: 'サイエンス・オブ・サイエンスで科学者の行動を分析する',
    venue: '第16回横幹連合コンファレンス',
    url: rm('51857374'),
  },
  {
    date: '2025-12-08',
    type: 'oral',
    title:
      "Uncovering Knowledge Production Modes: Geopolitical Biases in Wikipedia's Fundamental Data",
    venue: 'International Workshop on Conspiracy Theory and Misinformation',
    url: rm('51857367'),
  },
  {
    date: '2025-07-24',
    type: 'oral',
    title: 'Staying Streamed: The Impact of Loyalty and Diversity in Driving User Retention',
    venue: 'The International Conference for Computational Social Science',
    url: rm('50693252'),
  },
  {
    date: '2025-07-22',
    type: 'oral',
    title:
      'Global Editing Patterns on Wikipedia Platform Reveal Segmentations in Knowledge Production',
    venue: 'The International Conference for Computational Social Science',
    url: rm('50693264'),
  },
  {
    date: '2025-03-25',
    type: 'invited',
    title: 'ツイッター(X)以外の計算社会科学研究',
    venue: '電子情報通信学会総合大会',
    url: rm('49551637'),
  },
  {
    date: '2025-03-11',
    type: 'oral',
    title: 'データドリブンな文章構造と情報伝達の抽出手法',
    venue: '言語処理学会 第31回年次大会',
    url: rm('49399656'),
  },
  {
    date: '2025-02-26',
    type: 'oral',
    title: 'TikTokにおける音楽的要素が拡散現象に与える影響の分析',
    venue: '第4回計算社会科学会大会 (CSSJ2025)',
    url: rm('49474898'),
  },
  {
    date: '2025-02-19',
    type: 'oral',
    title: 'Wikipediaにおける編集パターンの言語間比較',
    venue: '第4回計算社会科学会大会 (CSSJ2025)',
    url: rm('49186092'),
  },
  {
    date: '2025-02-18',
    type: 'oral',
    title: 'The impact of loyalty and diversity on user behavior in live streaming platform',
    venue: '第4回計算社会科学会大会 (CSSJ2025)',
    url: rm('49474879'),
  },
  {
    date: '2025-02-16',
    type: 'oral',
    title: '決済アプリの送金時のテキストメッセージ分析',
    venue: '第4回計算社会科学会大会 (CSSJ2025)',
    url: rm('49474901'),
  },
  {
    date: '2024-11-07',
    type: 'invited',
    title: 'ライブ配信プラットフォームにおけるユーザー行動分析',
    venue: '分析的マーケティング研究会セミナー',
    url: rm('48405783'),
  },
  {
    date: '2024-10-16',
    type: 'invited',
    title: 'Throw Your Hat in the Ring (of Wikipedia): Exploring Urban-Rural Disparities',
    venue: 'Wikimedia Research Showcase',
    url: rm('48245502'),
  },
  {
    date: '2024-09-11',
    type: 'oral',
    title: 'ロイヤルティプログラムの分析',
    venue: '日本行動計量学会第52回大会 マーケティング特別セッション',
    url: rm('47729939'),
  },
  {
    date: '2024-09-09',
    type: 'invited',
    title: 'Wikipediaにおける情報供給に関する研究',
    venue: '学術情報メディアセンターセミナー「Web情報学の今」',
    url: rm('47707610'),
  },
  {
    date: '2024-07-19',
    type: 'oral',
    title: 'Balancing Act: The Dual Pathways of Exploitation and Exploration in Live Streaming',
    venue: 'The International Conference for Computational Social Science',
    url: rm('47182557'),
  },
  {
    date: '2024-07-18',
    type: 'oral',
    title: 'Behind the screens of fandom: Unraveling the threads of online platform',
    venue: 'The International Conference for Computational Social Science',
    url: rm('46790726'),
  },
  {
    date: '2024-06-09',
    type: 'oral',
    title: '購買行動とロイヤリティプログラム',
    venue: '日本マーケティング・サイエンス学会 第115回研究大会',
    url: rm('47371757'),
  },
  {
    date: '2023-12-27',
    type: 'oral',
    title: 'The Two-Sided Nature of Online Platforms',
    venue: 'CCSS Workshop on Computational Social Science',
    url: rm('47498306'),
  },
  {
    date: '2023-12-03',
    type: 'oral',
    title: '家計簿データを利用したマイナポイントの効果測定',
    venue: '日本マーケティング・サイエンス学会 第114回研究大会',
    url: rm('47371736'),
  },
];
