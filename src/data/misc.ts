export type MiscItem = {
  year: number;
  authors: string; // researchmap original (mixed JP/EN)
  title: string; // researchmap original
  venue: string; // researchmap original
  type: 'column' | 'preprint' | 'working-paper' | 'report';
  url?: string;
};

// Sourced from https://researchmap.jp/amrmap/misc — kept verbatim, newest first.
export const misc: MiscItem[] = [
  {
    year: 2025,
    type: 'column',
    authors: '小林 照義, 松井 暉',
    title: '連載「つながり」から経済を読み解くネットワーク科学 vol.4 一般化ランダム・ネットワーク',
    venue: '経済セミナー（日本評論社）',
  },
  {
    year: 2025,
    type: 'working-paper',
    authors: 'Sakai, Kwak, An, Matsui',
    title: 'Quantifying Gender Stereotypes in Japan between 1900 and 1999 with Word Embeddings',
    venue: 'Working paper',
  },
  {
    year: 2025,
    type: 'working-paper',
    authors: 'Matsui et al.',
    title: 'Modeling User Redemption Behavior in Complex Incentive Digital Environment',
    venue: 'Working paper',
  },
  {
    year: 2025,
    type: 'working-paper',
    authors: 'Honna, Murayama, Matsui',
    title: 'Data-driven Methods of Extracting Text Structure and Information Transfer',
    venue: 'Working paper',
  },
  {
    year: 2025,
    type: 'working-paper',
    authors: 'Matsui et al.',
    title: 'User Exploration and Exploitation Behavior Under Real-time Interactions',
    venue: 'Working paper',
  },
  {
    year: 2025,
    type: 'column',
    authors: '小林 照義, 松井 暉',
    title: '連載「つながり」から経済を読み解くネットワーク科学 vol.3 次数分布の再現とネットワーク生成モデル',
    venue: '経済セミナー（日本評論社）',
  },
  {
    year: 2025,
    type: 'preprint',
    authors: 'Matsui et al.',
    title: 'Global Patterns of Knowledge: Language, Genre, and Geography',
    venue: 'arXiv (2025-07-29)',
    url: 'https://arxiv.org/abs/2507.21762',
  },
  {
    year: 2025,
    type: 'column',
    authors: '小林 照義, 松井 暉',
    title: '連載「つながり」から経済を読み解くネットワーク科学 vol.2',
    venue: '経済セミナー（日本評論社）',
  },
  {
    year: 2025,
    type: 'column',
    authors: '小林 照義, 松井 暉',
    title: '連載「つながり」から経済を読み解くネットワーク科学 vol.1',
    venue: '経済セミナー（日本評論社）',
  },
  {
    year: 2025,
    type: 'preprint',
    authors: 'Murayama et al.',
    title: 'The "recognition," "belief," and "action" regarding conspiracy theories',
    venue: 'arXiv (2025-03-15)',
  },
  {
    year: 2024,
    type: 'report',
    authors: '松井 暉',
    title: '国際会議 IC2S2 2023 参加報告',
    venue: '計算社会科学会 機関誌',
  },
  {
    year: 2024,
    type: 'column',
    authors: '松井 暉',
    title: '引用されない「引用」',
    venue: '経済セミナー（日本評論社）',
  },
  {
    year: 2023,
    type: 'column',
    authors: '松井 暉',
    title: 'コロナ禍と食への関心の変化',
    venue: '経済セミナー（日本評論社）',
  },
  {
    year: 2023,
    type: 'column',
    authors: '松井 暉',
    title: '違法広告掲載サイト閉鎖の帰結',
    venue: '経済セミナー（日本評論社）',
  },
  {
    year: 2022,
    type: 'preprint',
    authors: 'Matsui, Ferrara',
    title: 'Extracting Fast and Slow: User-Action Embedding with Inter-temporal Information',
    venue: 'arXiv (2022-06-20)',
    url: 'https://arxiv.org/abs/2206.09535',
  },
  {
    year: 2022,
    type: 'column',
    authors: '松井 暉',
    title: '特集『計算社会科学の挑戦』鼎談司会',
    venue: '経済セミナー（日本評論社）',
  },
  {
    year: 2022,
    type: 'column',
    authors: '松井 暉',
    title: '言葉から内面を探る',
    venue: '経済セミナー（日本評論社）',
  },
  {
    year: 2022,
    type: 'column',
    authors: '松井 暉',
    title: '「愛」の文化的発展に迫る',
    venue: '経済セミナー（日本評論社）',
  },
  {
    year: 2022,
    type: 'column',
    authors: '松井 暉',
    title: '「調子の良い」時期のはじまりかた',
    venue: '経済セミナー（日本評論社）',
  },
  {
    year: 2021,
    type: 'column',
    authors: '松井 暉',
    title: '求職サイトにおける採用者の行動を詳細なデータで分析する',
    venue: '経済セミナー（日本評論社）',
  },
];
