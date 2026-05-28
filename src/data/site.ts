export const site = {
  labName: {
    en: 'Matsui Lab',
    ja: '松井研究室',
  },
  // Short, punchy taglines for the hero.
  tagline: {
    en: 'Individuals, groups, behavior — decoding how knowledge accumulates and takes shape',
    ja: '個人、集団、行動。知識の蓄積と構成を読み解く',
  },
  subTagline: {
    en: 'Computational Social Science · Web Information Studies',
    ja: '計算社会科学 × ウェブ情報学',
  },
  affiliation: {
    en: 'Computational Social Science Research Center, Kobe University',
    ja: '神戸大学 計算社会科学研究センター',
  },
  // Contact goes through a Google Form (email intentionally hidden).
  contactForm: 'https://docs.google.com/forms/d/e/1FAIpQLSfvAmGgq_IXLdEaSYVTh67YJcyjDSoMk7zEJLv_2q-ESg48VQ/viewform',
  // Google Analytics 4 Measurement ID. Leave empty to disable. Only loaded in production builds.
  gaMeasurementId: 'G-K9QDSXVXFN',
  socials: {
    researchmap: 'https://researchmap.jp/amrmap',
    kobe: 'https://www.rieb.kobe-u.ac.jp/faculty/global_finance/a_matsui.html',
    cv: 'https://drive.google.com/file/d/1GHtOea9stCCcV_tRbgtvR9lDEVsj9z6t/view?usp=sharing',
    // Fill these in when ready; the UI hides empty entries.
    googleScholar: '',
    orcid: '',
    dblp: '',
    semanticScholar: '',
    arxiv: '',
    github: '',
    twitter: '',
  },
  // Keyword chips for the hero / about block.
  keywords: {
    en: [
      'Computational Social Science',
      'Wikipedia',
      'Web Information Studies',
      'Economic Policy',
      'NLP / Embeddings',
      'Online Behavior',
    ],
    ja: [
      '計算社会科学',
      'ウィキペディア',
      'ウェブ情報学',
      '経済政策',
      '自然言語処理',
      'オンライン行動',
    ],
  },
};

export type Locale = 'en' | 'ja';
