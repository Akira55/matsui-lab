export type Publication = {
  year: number;
  authors: string;
  title: string;
  venue: string;
  url?: string; // DOI or canonical URL
  type?: 'journal' | 'conference' | 'preprint' | 'chapter' | 'book';
  highlight?: boolean; // sparkle badge
};

// Sourced from https://researchmap.jp/amrmap (newest first).
// DOIs resolved via Crossref.
export const publications: Publication[] = [
  {
    year: 2026,
    authors: 'Honna, S. & Matsui, A.',
    title:
      'Disruptive transformation of artworks in master–disciple relationships: the case of Ukiyo-e artworks',
    venue: 'EPJ Data Science',
    url: 'https://doi.org/10.1140/epjds/s13688-026-00646-1',
    type: 'journal',
    highlight: true,
  },
  {
    year: 2024,
    authors: 'Matsui, A. & Ferrara, E.',
    title: 'Word embedding for social sciences: an interdisciplinary survey',
    venue: 'PeerJ Computer Science',
    url: 'https://doi.org/10.7717/peerj-cs.2562',
    type: 'journal',
    highlight: true,
  },
  {
    year: 2024,
    authors: 'Nishikawa, M., Sakai, D. & Matsui, A.',
    title:
      'The impact of the internationalization of political science on publishing in two languages: the case of Japan, 1971–2023',
    venue: 'Scientometrics',
    url: 'https://doi.org/10.1007/s11192-024-05179-w',
    type: 'journal',
  },
  {
    year: 2024,
    authors: 'Matsui, A., Miyazaki, K. & Murayama, T.',
    title:
      "Throw Your Hat in the Ring (of Wikipedia): Exploring Urban–Rural Disparities in Local Politicians' Information Supply",
    venue: 'ICWSM 18, 1027–1040',
    url: 'https://doi.org/10.1609/icwsm.v18i1.31370',
    type: 'conference',
    highlight: true,
  },
  {
    year: 2024,
    authors: 'Salama, S., Matsui, A. & Kamihigashi, T.',
    title:
      "Extracting Official Agencies' Communication Patterns During the COVID-19 Pandemic: A Text Mining Approach",
    venue: 'ICR’24',
    url: 'https://doi.org/10.1007/978-3-031-65522-7_1',
    type: 'conference',
  },
  {
    year: 2024,
    authors: 'Matsui, A., Murayama, T. & Yoshida, M.',
    title: 'Hater Is Not the Only Source of Toxic Communication Online, But Also Fan',
    venue: 'CySoc 2024',
    url: 'https://scholar.google.com/scholar?q=Hater+Is+Not+the+Only+Source+of+Toxic+Communication+Matsui+Murayama+Yoshida',
    type: 'conference',
  },
  {
    year: 2023,
    authors:
      'Murayama, T., Matsui, A., Miyazaki, K., Matsubara, Y. & Sakurai, Y.',
    title: 'The Chance of Winning Election Impacts on Social Media Strategy',
    venue: 'ICWSM 17, 674–685',
    url: 'https://doi.org/10.1609/icwsm.v17i1.22178',
    type: 'conference',
  },
  {
    year: 2023,
    authors:
      'Miyazaki, K., Murayama, T., Matsui, A., Nishikawa, M., Uchiba, T., Kwak, H. & An, J.',
    title:
      'Political Honeymoon Effect on Social Media: Characterizing Social Media Reaction to the Changes of Prime Minister in Japan',
    venue: 'ACM Web Science 2023',
    url: 'https://doi.org/10.1145/3578503.3583594',
    type: 'conference',
  },
  {
    year: 2023,
    authors: 'Benjamin, D. M., Morstatter, F., Abbas, A. E., et al.',
    title: 'Hybrid forecasting of geopolitical events',
    venue: 'AI Magazine 44(1), 112–128',
    url: 'https://doi.org/10.1002/aaai.12085',
    type: 'journal',
  },
  {
    year: 2022,
    authors: 'Matsui, A. & Moriwaki, D.',
    title: 'Online-to-offline advertisements as field experiments',
    venue: 'The Japanese Economic Review 73(1), 211–242',
    url: 'https://doi.org/10.1007/s42973-021-00101-y',
    type: 'journal',
  },
  {
    year: 2021,
    authors: 'Matsui, A., Ren, X. & Ferrara, E.',
    title:
      'Using Word Embedding to Reveal Monetary Policy Explanation Changes',
    venue: 'Workshop on Economics and Natural Language Processing',
    url: 'https://doi.org/10.18653/v1/2021.econlp-1.8',
    type: 'conference',
  },
  {
    year: 2021,
    authors: 'Matsui, A., Chen, E., Wang, Y. & Ferrara, E.',
    title: 'The impact of peer review on the contribution potential of scientific papers',
    venue: 'PeerJ 9',
    url: 'https://doi.org/10.7717/peerj.11999',
    type: 'journal',
  },
  {
    year: 2021,
    authors:
      'Moriwaki, D., Hayakawa, Y., Matsui, A., Saito, Y., Munemasa, I. & Shibata, M.',
    title: 'A Real-World Implementation of Unbiased Lift-based Bidding System',
    venue: 'IEEE Big Data, 1877–1888',
    url: 'https://doi.org/10.1109/BigData52589.2021.9671800',
    type: 'conference',
  },
  {
    year: 2020,
    authors: 'Matsui, A., Kobayashi, T., Moriwaki, D. & Ferrara, E.',
    title:
      'Detecting multi-timescale consumption patterns from receipt data: a non-negative tensor factorization approach',
    venue: 'Journal of Computational Social Science',
    url: 'https://doi.org/10.1007/s42001-020-00078-5',
    type: 'journal',
  },
  {
    year: 2020,
    authors: 'Matsui, A., Sapienza, A. & Ferrara, E.',
    title: "Does Streaming Esports Affect Players' Behavior and Performance?",
    venue: 'Games and Culture 15(1), 9–31',
    url: 'https://doi.org/10.1177/1555412019838095',
    type: 'journal',
  },
  {
    year: 2019,
    authors:
      'Morstatter, F., Galstyan, A., Satyukov, G., Benjamin, D., et al. (incl. Matsui, A.)',
    title: 'SAGE: A Hybrid Geopolitical Event Forecasting System',
    venue: 'IJCAI 28, 6557–6559',
    url: 'https://doi.org/10.24963/ijcai.2019/955',
    type: 'conference',
  },
  {
    year: 2018,
    authors:
      'Deb, A., Majmundar, A., Seo, S., Matsui, A., Tandon, R., Yan, S., Allem, J.-P. & Ferrara, E.',
    title: 'Social Bots for Online Public Health Interventions',
    venue: 'IEEE/ACM ASONAM, 186–189',
    url: 'https://doi.org/10.1109/ASONAM.2018.8508382',
    type: 'conference',
  },
];

export type Book = {
  year: number;
  title: string;
  role: string;
  publisher: string;
  url?: string;
};

export const books: Book[] = [
  {
    year: 2025,
    title: 'Science of Science (Japanese translation)',
    role: 'Translator',
    publisher: '森北出版 (Morikita Publishing)',
    // url: '<fill in actual Morikita product page>',
  },
];
