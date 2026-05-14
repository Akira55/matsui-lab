// Researchmap-original strings. Awards/grants for this researcher are primarily in Japanese.

export type Award = {
  year: number;
  title: string;
  org?: string;
  url?: string;
};

export const awards: Award[] = [
  {
    year: 2024,
    title: '第3回計算社会科学会議 優秀発表賞（本名真一氏との共著）',
    org: '計算社会科学会',
  },
  {
    year: 2015,
    title: 'みずほ学術振興財団 佳作賞',
    org: 'みずほ学術振興財団',
  },
  {
    year: 2015,
    title: '神戸大学 白桃賞',
    org: '神戸大学',
  },
];

export type Grant = {
  period: string;
  title: string;
  role: string;
  funder: string;
  url?: string; // KAKEN database URL etc.
};

export const grants: Grant[] = [
  {
    period: '2025-04 – 2029-03',
    title: '連携型ポイントプログラム市場の両面性に関する研究',
    role: '分担',
    funder: 'JSPS 基盤研究(B)',
  },
  {
    period: '2024-04 – 2027-03',
    title: '日本の研究活動の総合的な再検討',
    role: '代表',
    funder: 'JSPS 若手研究',
  },
  {
    period: '2023-11 – 2027-03',
    title: '陰謀論に至る経路の特定',
    role: '分担',
    funder: 'JST RISTEX SDGs プログラム',
  },
  {
    period: '2022-08 – 2024-03',
    title: '郵送応募方式の効果に関する実証分析',
    role: '代表',
    funder: 'JSPS 研究活動スタート支援',
  },
  {
    period: '2021-04 – 2024-03',
    title: '小売競争構造の動学的分析',
    role: '分担',
    funder: 'JSPS 基盤研究(B)',
  },
];
