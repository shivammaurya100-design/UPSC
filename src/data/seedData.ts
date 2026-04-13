import {
  SyllabusCategory,
  GSPaper,
  SyllabusNode,
  Topic,
  Note,
  MindMap,
  MindMapNode,
  PYQ,
  Flashcard,
  MCQ,
} from '../types';

// ============================================================
// GS Paper I — Indian Heritage, History, Geography
// ============================================================

const gs1Topics: SyllabusNode[] = [
  {
    id: 'gs1-heritage',
    title: 'Indian Heritage & Culture',
    category: 'history',
    paper: 'GS I',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs1-heritage-ancient',
        title: 'Ancient India (Indus Valley, Vedic, Mauryan, Gupta)',
        category: 'history',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs1-heritage-medieval',
        title: 'Medieval India (Delhi Sultanate, Vijayanagara, Mughals)',
        category: 'history',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs1-heritage-modern',
        title: 'Modern India (British Rule, Freedom Struggle)',
        category: 'history',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs1-heritage-arts',
        title: 'Indian Art & Architecture',
        category: 'history',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs1-world-history',
    title: 'World History',
    category: 'history',
    paper: 'GS I',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs1-wh-industrial',
        title: 'Industrial Revolution & its Impact',
        category: 'history',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs1-wh-world-wars',
        title: 'World Wars & Their Aftermath',
        category: 'history',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs1-wh-colonialism',
        title: 'Colonialism & Decolonization',
        category: 'history',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs1-wh-coldwar',
        title: 'Cold War Era & Non-Alignment',
        category: 'history',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs1-geography',
    title: 'Indian Geography',
    category: 'geography',
    paper: 'GS I',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs1-geo-physical',
        title: 'Physical Geography of India',
        category: 'geography',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs1-geo-resources',
        title: 'Resources: Land, Water, Agriculture',
        category: 'geography',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs1-geo-industry',
        title: 'Industry & Transportation',
        category: 'geography',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs1-geo-environment',
        title: 'Environmental Geography',
        category: 'geography',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs1-world-geo',
    title: 'World Geography',
    category: 'geography',
    paper: 'GS I',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs1-wg-tectonics',
        title: 'Geomorphology & Plate Tectonics',
        category: 'geography',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs1-wg-climate',
        title: 'Climatic Regions & Oceanography',
        category: 'geography',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs1-wg-vegetation',
        title: 'Biogeography & Vegetation',
        category: 'geography',
        paper: 'GS I',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
];

// ============================================================
// GS Paper II — Polity, Governance, IR
// ============================================================

const gs2Topics: SyllabusNode[] = [
  {
    id: 'gs2-constitution',
    title: 'Indian Constitution',
    category: 'polity',
    paper: 'GS II',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs2-const-features',
        title: 'Features & Making of the Constitution',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-const-preamble',
        title: 'Preamble, Part I–IV (Citizenship, Fundamental Rights)',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-const-directive',
        title: 'Directive Principles & Fundamental Duties',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-const-amendment',
        title: 'Constitutional Amendment Process',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs2-organs',
    title: 'Union Government',
    category: 'polity',
    paper: 'GS II',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs2-organs-president',
        title: 'President & Vice President',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-organs-pm',
        title: 'Prime Minister & Council of Ministers',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-organs-parliament',
        title: 'Parliament: Lok Sabha, Rajya Sabha, Legislative Process',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-organs-sc',
        title: 'Supreme Court & Judicial Review',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs2-federalism',
    title: 'Federalism & Local Government',
    category: 'polity',
    paper: 'GS II',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs2-fed-centstate',
        title: 'Centre-State Relations & Finance Commission',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-fed-panchayat',
        title: 'Panchayati Raj Institutions',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-fed-urban',
        title: 'Urban Local Bodies & Municipalities',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs2-governance',
    title: 'Governance & Accountability',
    category: 'polity',
    paper: 'GS II',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs2-gov-constitutional',
        title: 'Constitutional & Non-Constitutional Bodies',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-gov-rights',
        title: 'RTI, CIC, CVC, Lokpal',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-gov-goodgov',
        title: 'Good Governance & e-Governance',
        category: 'polity',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs2-ir',
    title: 'International Relations',
    category: 'currentAffairs',
    paper: 'GS II',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs2-ir-bilateral',
        title: 'Bilateral Relations (India-China, India-Pak, India-US)',
        category: 'currentAffairs',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-ir-multilateral',
        title: 'Multilateral Fora (UN, BRICS, SCO, WTO)',
        category: 'currentAffairs',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs2-ir-softpower',
        title: 'India\'s Soft Power & Diaspora',
        category: 'currentAffairs',
        paper: 'GS II',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
];

// ============================================================
// GS Paper III — Economy, Environment, Sci-Tech, Security
// ============================================================

const gs3Topics: SyllabusNode[] = [
  {
    id: 'gs3-economy',
    title: 'Indian Economy',
    category: 'economy',
    paper: 'GS III',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs3-eco-planning',
        title: 'Economic Planning & Five-Year Plans',
        category: 'economy',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-eco-reforms',
        title: 'Economic Reforms & Liberalization (1991)',
        category: 'economy',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-eco-sectors',
        title: 'Agriculture, Industry & Service Sectors',
        category: 'economy',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-eco-finance',
        title: 'Banking, Monetary Policy & Inflation',
        category: 'economy',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-eco-budget',
        title: 'Union Budget & Fiscal Policy',
        category: 'economy',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs3-environment',
    title: 'Environment & Ecology',
    category: 'environment',
    paper: 'GS III',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs3-env-conservation',
        title: 'Conservation, Environmental Pollution & Degradation',
        category: 'environment',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-env-biodiversity',
        title: 'Biodiversity & Wildlife Conservation',
        category: 'environment',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-env-climate',
        title: 'Climate Change & International Agreements',
        category: 'environment',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-env-laws',
        title: 'Environmental Laws & Policies',
        category: 'environment',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs3-scitech',
    title: 'Science & Technology',
    category: 'science',
    paper: 'GS III',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs3-st-it',
        title: 'IT, Cybersecurity & Digital Economy',
        category: 'science',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-st-space',
        title: 'Space Technology & ISRO',
        category: 'science',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-st-biotech',
        title: 'Biotechnology & Health',
        category: 'science',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-st-nuclear',
        title: 'Nuclear Technology & Energy',
        category: 'science',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs3-security',
    title: 'Internal & External Security',
    category: 'currentAffairs',
    paper: 'GS III',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs3-sec-internal',
        title: 'Internal Security Challenges',
        category: 'currentAffairs',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-sec-terrorism',
        title: 'Terrorism & Naxalism',
        category: 'currentAffairs',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs3-sec-cyber',
        title: 'Cyber Security & Intelligence Agencies',
        category: 'science',
        paper: 'GS III',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
];

// ============================================================
// GS Paper IV — Ethics, Integrity, Aptitude
// ============================================================

const gs4Topics: SyllabusNode[] = [
  {
    id: 'gs4-ethics-basics',
    title: 'Ethics Fundamentals',
    category: 'ethics',
    paper: 'GS IV',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs4-eb-human',
        title: 'Human Values & Ethics',
        category: 'ethics',
        paper: 'GS IV',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs4-eb-foundations',
        title: 'Foundations of Ethics',
        category: 'ethics',
        paper: 'GS IV',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs4-eb-moralpsych',
        title: 'Moral Emotions & Moral Psychology',
        category: 'ethics',
        paper: 'GS IV',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs4-attitude',
    title: 'Attitude, Aptitude & Emotional Intelligence',
    category: 'ethics',
    paper: 'GS IV',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs4-at-attitude',
        title: 'Structure, Nature & Influence of Attitude',
        category: 'ethics',
        paper: 'GS IV',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs4-at-aptitude',
        title: 'Aptitude, Emotional Intelligence & Empathy',
        category: 'ethics',
        paper: 'GS IV',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'gs4-case-studies',
    title: 'Case Studies (Ethical Dilemmas)',
    category: 'ethics',
    paper: 'GS IV',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'gs4-cs-public',
        title: 'Public Service Delivery Cases',
        category: 'ethics',
        paper: 'GS IV',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs4-cs-corruption',
        title: 'Corruption & Integrity Cases',
        category: 'ethics',
        paper: 'GS IV',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'gs4-cs-conflict',
        title: 'Value Conflicts & Dilemmas',
        category: 'ethics',
        paper: 'GS IV',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
];

// ============================================================
// CSAT — Paper II
// ============================================================

const csatTopics: SyllabusNode[] = [
  {
    id: 'csat-reasoning',
    title: 'Logical Reasoning & Analytical Ability',
    category: 'csat',
    paper: 'CSAT',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'csat-lr-verbal',
        title: 'Verbal Reasoning (Analogies, Blood Relations)',
        category: 'csat',
        paper: 'CSAT',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'csat-lr-nonverbal',
        title: 'Non-Verbal Reasoning (Series, Cubes)',
        category: 'csat',
        paper: 'CSAT',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'csat-lr-logic',
        title: 'Logical Deduction & Syllogisms',
        category: 'csat',
        paper: 'CSAT',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'csat-quant',
    title: 'Quantitative Aptitude',
    category: 'csat',
    paper: 'CSAT',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'csat-qa-arithmetic',
        title: 'Arithmetic (Percentages, Ratio, Time-Speed)',
        category: 'csat',
        paper: 'CSAT',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'csat-qa-data',
        title: 'Data Interpretation (Tables, Charts, DI)',
        category: 'csat',
        paper: 'CSAT',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'csat-qa-algebra',
        title: 'Basic Algebra & Number Systems',
        category: 'csat',
        paper: 'CSAT',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'csat-comprehension',
    title: 'Comprehension & English Grammar',
    category: 'csat',
    paper: 'CSAT',
    depth: 0,
    isCompleted: false,
    children: [
      {
        id: 'csat-comp-reading',
        title: 'Reading Comprehension',
        category: 'csat',
        paper: 'CSAT',
        depth: 1,
        isCompleted: false,
      },
      {
        id: 'csat-comp-grammar',
        title: 'Grammar, Vocabulary & Usage',
        category: 'csat',
        paper: 'CSAT',
        depth: 1,
        isCompleted: false,
      },
    ],
  },
];

// ============================================================
// All Syllabus Nodes (flattened)
// ============================================================

export const allSyllabusNodes: SyllabusNode[] = [
  ...gs1Topics,
  ...gs2Topics,
  ...gs3Topics,
  ...gs4Topics,
  ...csatTopics,
];

// ============================================================
// Mock Topic data
// ============================================================

export const mockTopics: Topic[] = [
  {
    id: 'gs1-heritage',
    title: 'Indian Heritage & Culture',
    description: 'A comprehensive study of India\'s cultural heritage from ancient to modern times.',
    category: 'history',
    paper: 'GS I',
    subtopics: ['Ancient India', 'Medieval India', 'Modern India', 'Art & Architecture'],
    progress: 35,
    lastStudied: '2026-04-10',
    estimatedMinutes: 240,
    difficulty: 'medium',
    isBookmarked: true,
  },
  {
    id: 'gs1-geography',
    title: 'Indian & World Geography',
    description: 'Physical, economic, and human geography of India and the world.',
    category: 'geography',
    paper: 'GS I',
    subtopics: ['Physical Geography', 'Resources', 'Industry', 'World Geography'],
    progress: 20,
    estimatedMinutes: 300,
    difficulty: 'hard',
    isBookmarked: false,
  },
  {
    id: 'gs2-constitution',
    title: 'Indian Constitution',
    description: 'Constitutional features, structure, and governance mechanisms.',
    category: 'polity',
    paper: 'GS II',
    subtopics: ['Constitutional Features', 'FRs & DPSPs', 'Organs of Gov', 'Federalism'],
    progress: 60,
    lastStudied: '2026-04-12',
    estimatedMinutes: 360,
    difficulty: 'hard',
    isBookmarked: true,
  },
  {
    id: 'gs2-ir',
    title: 'International Relations',
    description: 'India\'s foreign policy, bilateral relations, and global engagements.',
    category: 'currentAffairs',
    paper: 'GS II',
    subtopics: ['Bilateral Relations', 'Multilateral Fora', 'Soft Power'],
    progress: 10,
    estimatedMinutes: 180,
    difficulty: 'medium',
    isBookmarked: false,
  },
  {
    id: 'gs3-economy',
    title: 'Indian Economy',
    description: 'Economic planning, reforms, sectors, banking, and fiscal policy.',
    category: 'economy',
    paper: 'GS III',
    subtopics: ['Planning & Reforms', 'Sectors', 'Banking & Finance', 'Budget'],
    progress: 45,
    lastStudied: '2026-04-11',
    estimatedMinutes: 300,
    difficulty: 'hard',
    isBookmarked: true,
  },
  {
    id: 'gs3-environment',
    title: 'Environment & Ecology',
    description: 'Conservation, climate change, biodiversity, and environmental laws.',
    category: 'environment',
    paper: 'GS III',
    subtopics: ['Conservation', 'Biodiversity', 'Climate Change', 'Laws'],
    progress: 55,
    lastStudied: '2026-04-09',
    estimatedMinutes: 200,
    difficulty: 'medium',
    isBookmarked: false,
  },
  {
    id: 'gs4-ethics-basics',
    title: 'Ethics & Integrity',
    description: 'Foundations of ethics, moral values, attitude, and case studies.',
    category: 'ethics',
    paper: 'GS IV',
    subtopics: ['Ethics Fundamentals', 'Attitude & Aptitude', 'Case Studies'],
    progress: 30,
    estimatedMinutes: 240,
    difficulty: 'medium',
    isBookmarked: false,
  },
  {
    id: 'csat-reasoning',
    title: 'CSAT Reasoning',
    description: 'Logical reasoning, analytical ability, and quantitative aptitude for CSAT Paper II.',
    category: 'csat',
    paper: 'CSAT',
    subtopics: ['Logical Reasoning', 'Quantitative Aptitude', 'Comprehension'],
    progress: 75,
    lastStudied: '2026-04-08',
    estimatedMinutes: 300,
    difficulty: 'medium',
    isBookmarked: true,
  },
];

// ============================================================
// Mock Notes
// ============================================================

export const mockNotes: Note[] = [
  {
    id: 'note-constitution-preamble',
    topicId: 'gs2-constitution',
    title: 'Preamble: The Key to the Constitution',
    content:
      'The Preamble is the introductory statement of the Constitution. It outlines the objectives and guiding principles. Amended by the 42nd Amendment (1976) to add "Socialist", "Secular", and "Integrity".\n\nKey terms: Sovereign, Socialist, Secular, Democratic, Republic, Justice, Liberty, Equality, Fraternity.',
    keyPoints: [
      'Preamble is not enforceable in a court of law (Kesavananda Bharati case)',
      'It serves as a source of intent for constitutional interpretation',
      '42nd Amendment added "Socialist", "Secular", "Integrity"',
      'Ambernd by basic structure doctrine — cannot alter basic features',
    ],
    importantLinks: ['Kesavananda Bharati v. State of Kerala (1973)'],
    tags: ['Preamble', 'Basic Structure', '42nd Amendment'],
  },
  {
    id: 'note-economy-planning',
    topicId: 'gs3-economy',
    title: 'Economic Planning in India: From Nehru to NITI Aayog',
    content:
      'India adopted centralized economic planning after independence. The Planning Commission was established in 1950 and was replaced by NITI Aayog in 2015.\n\nFive-Year Plans served as blueprints for development. The 12th Five-Year Plan (2012-2017) was the last one executed under the Planning Commission model.',
    keyPoints: [
      'Planning Commission → NITI Aayog (2015) — shift from "top-down" to "cooperative federalism"',
      'NITI Aayog: no more fixed resource allocation; states receive flexi-funds',
      'Three-year Action Agenda and Seven-Year Strategy document the new approach',
      'Sustainable Development Goals (SDGs) now guide development planning',
    ],
    importantLinks: ['NITI Aayog: niti.gov.in'],
    tags: ['Planning', 'NITI Aayog', 'Five Year Plans', 'Federalism'],
  },
  {
    id: 'note-heritage-ancient',
    topicId: 'gs1-heritage',
    title: 'Indus Valley Civilization: Key Features',
    content:
      'The Indus Valley Civilization (c. 3300–1300 BCE) was one of the earliest urban civilizations. Major sites: Harappa, Mohenjo-daro, Dholavira, Lothal.\n\nUrban planning features: grid pattern, advanced drainage, standardized bricks, granaries.',
    keyPoints: [
      'Harappan script remains undeciphered — over 400 signs identified',
      'Trade networks extended to Mesopotamia (Mohenjo-daro seals found)',
      'Uniform weights and measures suggest standardized trade practices',
      'No evidence of elaborate warfare or monumental religious structures unlike Mesopotamia',
    ],
    importantLinks: ['ASI Harappa excavations site', 'Rohan D. Kodati on IVC'],
    tags: ['IVC', 'Harappa', 'Mohenjo-daro', 'Indus Script'],
  },
  {
    id: 'note-env-climate',
    topicId: 'gs3-environment',
    title: 'Climate Change: India\'s Commitments & Challenges',
    content:
      'India is the third-largest emitter of CO₂ (after China and USA). At COP26 (2021), PM Modi announced Panchamitra: 500 GW renewable energy target by 2030, 50% energy from renewables by 2030, 1 billion tonnes carbon reduction by 2030.',
    keyPoints: [
      'India\'s NDC: reduce emission intensity by 33-35% by 2030 from 2005 levels',
      'Net Zero by 2070 target announced at COP26',
      'National Adaptation Fund for Climate Change (NAFCC)',
      'India submitted its first Biennial Updated Report to UNFCCC',
    ],
    importantLinks: ['UNFCCC', 'MoEFCC', 'IPCC Reports'],
    tags: ['Climate Change', 'COP26', 'NDC', 'Net Zero', 'Paris Agreement'],
  },
  {
    id: 'note-csat-syllogism',
    topicId: 'csat-reasoning',
    title: 'Syllogisms: Rules & Worked Examples',
    content:
      'A syllogism is a form of deductive reasoning consisting of a major premise, minor premise, and conclusion.\n\nCategorical syllogisms follow rules laid down by traditional logic. Violations result in formal fallacies.',
    keyPoints: [
      'Rule 1: Any subject of the conclusion must appear in a premise — no double quantifier',
      'Rule 2: If a term is distributed in the conclusion, it must be distributed in its premise',
      'Rule 3: Two negative premises cannot produce a valid conclusion',
      'Rule 4: If one premise is negative, the conclusion must be negative',
    ],
    importantLinks: ['UPSC CSAT Paper II 2013 Q.58', 'CSAT Practice Set Vol. III'],
    tags: ['Syllogism', 'Logical Reasoning', 'CSAT'],
  },
];

// ============================================================
// Mock Mind Maps
// ============================================================

const buildMindMap = (root: string, nodes: string[]): MindMapNode => ({
  id: root.toLowerCase().replace(/\s+/g, '-'),
  label: root,
  isRoot: true,
  children: nodes.map((n) => ({
    id: n.toLowerCase().replace(/\s+/g, '-'),
    label: n,
  })),
});

export const mockMindMaps: MindMap[] = [
  {
    topicId: 'gs2-constitution',
    root: buildMindMap('Indian Constitution', [
      'Preamble',
      'Part I: Territory & Citizenship',
      'Part III: Fundamental Rights',
      'Part IV: DPSPs',
      'Part IVA: Fundamental Duties',
      'Part V: Union Government',
      'Part VI: State Government',
      'Part IX: Panchayats & Municipalities',
      'Part XI: Federal Relations',
      'Schedule 1-12',
    ]),
  },
  {
    topicId: 'gs3-economy',
    root: buildMindMap('Indian Economy', [
      'Planning Era',
      'Liberalization (1991)',
      'Agriculture Sector',
      'Industry Sector',
      'Service Sector',
      'Banking & Finance',
      'Fiscal Policy',
      'Monetary Policy',
    ]),
  },
  {
    topicId: 'gs3-environment',
    root: buildMindMap('Environment & Ecology', [
      'Biodiversity',
      'Climate Change',
      'Conservation Laws',
      'Pollution Control',
      'International Agreements',
      'Environmental Movements',
    ]),
  },
  {
    topicId: 'gs4-ethics-basics',
    root: buildMindMap('Ethics & Integrity', [
      'Meta Ethics',
      'Normative Ethics',
      'Applied Ethics',
      'Moral Psychology',
      'Emotional Intelligence',
      'Case Studies',
    ]),
  },
];

// ============================================================
// Mock PYQs
// ============================================================

export const mockPYQs: PYQ[] = [
  {
    id: 'pyq-2023-gs1-1',
    topicId: 'gs1-heritage',
    question: 'The stone age paintings of India are found mainly in which of the following regions?',
    options: [
      'Central India (Madhya Pradesh)',
      'Kashmir Valley',
      'Vindhya plateau and Mirzapur hills',
      'All of the above',
    ],
    correctOption: 3,
    explanation: 'Stone age paintings in India are found in several regions including Bhimbetka (MP), Kashmir valley sites, and Vindhya plateau regions — making all options correct.',
    source: 'UPSC CSE Prelims 2023',
    year: 2023,
    paper: 'GS I',
    set: 'Set B',
  },
  {
    id: 'pyq-2023-gs1-2',
    topicId: 'gs1-geography',
    question: 'Which of the following statements about the Himalayan passes is correct?',
    options: [
      'Himalayan passes are more numerous in the eastern than western Himalayas',
      'Himalayan passes are evenly distributed across all three ranges',
      'Himalayan passes are concentrated in the Karakoram range',
      'The western Himalayas have more passes due to gentler gradients',
    ],
    correctOption: 0,
    explanation: 'The eastern Himalayas have more passes (Sikkim, Assam) because the Himalayas widen eastwards and have lower altitudes, providing easier routes.',
    source: 'UPSC CSE Prelims 2023',
    year: 2023,
    paper: 'GS I',
    set: 'Set A',
  },
  {
    id: 'pyq-2022-gs2-1',
    topicId: 'gs2-constitution',
    question: 'In the context of the Indian Constitution, which of the following is/are part of the "basic structure" doctrine?',
    options: [
      'Supremacy of the Constitution',
      'Federalism and secularism',
      'Individual freedom',
      'All of the above',
    ],
    correctOption: 3,
    explanation: 'The basic structure doctrine (Kesavananda Bharati, 1973) encompasses multiple features including supremacy of constitution, federalism, secularism, and individual freedoms.',
    source: 'UPSC CSE Prelims 2022',
    year: 2022,
    paper: 'GS II',
    set: 'Set C',
  },
  {
    id: 'pyq-2022-gs3-1',
    topicId: 'gs3-economy',
    question: 'Which committee recommended the merger of the Railway Budget with the Union Budget?',
    options: [
      'Rangarajan Committee',
      'Mashelkar Committee',
      'Fitch Committee',
      'Dasgupta Committee',
    ],
    correctOption: 0,
    explanation: 'The Rangarajan Committee (2012) recommended the merger of Railway Budget with the Union Budget. This was implemented from 2017-18.',
    source: 'UPSC CSE Prelims 2022',
    year: 2022,
    paper: 'GS III',
    set: 'Set B',
  },
  {
    id: 'pyq-2021-csat-1',
    topicId: 'csat-reasoning',
    question: 'In a certain code, "TIGER" is written as "UJHFS". How is "EAGLE" written in that code?',
    options: ['FBHMF', 'FBGMF', 'FBHMG', 'FCHMF'],
    correctOption: 0,
    explanation: 'Each letter is shifted by +1 in the alphabet: E→F, A→B, G→H, L→M, E→F. So EAGLE = FBHMF.',
    source: 'UPSC CSE Prelims 2021',
    year: 2021,
    paper: 'CSAT',
    set: 'Set D',
  },
];

// ============================================================
// Mock Flashcards
// ============================================================

export const mockFlashcards: Flashcard[] = [
  {
    id: 'fc-constitution-1',
    topicId: 'gs2-constitution',
    front: 'What is the maximum number of High Courts a state can have?',
    back: 'Originally one HC per state. However, a state can have multiple High Courts with the President\'s approval (e.g., Jammu & Kashmir has two). No upper limit set by Constitution.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-constitution-2',
    topicId: 'gs2-constitution',
    front: 'Which case established the "Basic Structure Doctrine"?',
    back: 'Kesavananda Bharati v. State of Kerala (1973) — 13-judge bench. Supreme Court held that the basic features of the Constitution cannot be amended by Parliament.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-economy-1',
    topicId: 'gs3-economy',
    front: 'What does FRBM Act stand for, and what does it mandate?',
    back: 'Fiscal Responsibility and Budget Management Act (2003). Mandates reduction of fiscal deficit to 3% of GDP and revenue deficit to zero by the end of a defined period.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-economy-2',
    topicId: 'gs3-economy',
    front: 'What are "Special Economic Zones" (SEZs) and their tax benefits?',
    back: 'SEZs are designated export-oriented zones with simplified procedures. Tax benefits include: 100% deduction in profits for first 5 years, 50% for next 5 years, custom duty exemption on imports.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-heritage-1',
    topicId: 'gs1-heritage',
    front: 'Which Indus Valley site had a "Great Bath" as a prominent structure?',
    back: 'Mohenjo-daro — the Great Bath is one of the most well-known structures, believed to have been used for ritual bathing. It is constructed with precisely fitted brick alignments.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-env-1',
    topicId: 'gs3-environment',
    front: 'Which Indian law is the primary legislation for wildlife protection?',
    back: 'Wildlife (Protection) Act, 1972 — provides for protection of wild animals, birds, and plants. Amended in 2022 to include "terrorist" wildlife offenders.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-csat-1',
    topicId: 'csat-reasoning',
    front: 'In a class of 40 students, 20 play cricket and 25 play football. If 5 play neither, how many play both?',
    back: 'Let A = cricket, B = football. n(A∪B) = 40 - 5 = 35. n(A) + n(B) - n(A∩B) = 35. 20 + 25 - n(A∩B) = 35. n(A∩B) = 10.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-ethics-1',
    topicId: 'gs4-ethics-basics',
    front: 'What is the difference between "Law" and "Morality"?',
    back: 'Law is externally enforced by the state through courts/police. Morality is internally guided by individual conscience. Both can overlap (e.g., murder is both illegal and immoral) but not always (e.g., euthanasia — legally regulated but morally debated).',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
];

// ============================================================
// Category metadata
// ============================================================

export const CATEGORY_META: Record<SyllabusCategory, {
  label: string;
  icon: string;
  description: string;
  paper: GSPaper | 'CSAT' | 'Essay' | 'Optional';
}> = {
  history: {
    label: 'History & Heritage',
    icon: '🏛️',
    description: 'Indian heritage, culture, modern history, world history',
    paper: 'GS I',
  },
  geography: {
    label: 'Geography',
    icon: '🌍',
    description: 'Indian & world geography, resources, environment',
    paper: 'GS I',
  },
  polity: {
    label: 'Polity & Governance',
    icon: '⚖️',
    description: 'Constitution, governance, institutions, federalism',
    paper: 'GS II',
  },
  economy: {
    label: 'Economy',
    icon: '📊',
    description: 'Indian economy, planning, sectors, banking',
    paper: 'GS III',
  },
  environment: {
    label: 'Environment',
    icon: '🌿',
    description: 'Ecology, climate change, conservation',
    paper: 'GS III',
  },
  science: {
    label: 'Science & Tech',
    icon: '🔬',
    description: 'S&T developments, IT, space, biotechnology',
    paper: 'GS III',
  },
  currentAffairs: {
    label: 'Current Affairs & IR',
    icon: '📰',
    description: 'Current events and international relations',
    paper: 'GS II',
  },
  ethics: {
    label: 'Ethics',
    icon: '🧠',
    description: 'Ethics, integrity, aptitude, case studies',
    paper: 'GS IV',
  },
  csat: {
    label: 'CSAT',
    icon: '📐',
    description: 'Reasoning, quant, comprehension for Paper II',
    paper: 'CSAT',
  },
  optional: {
    label: 'Optional',
    icon: '📚',
    description: 'Subject-specific optional papers',
    paper: 'Optional',
  },
};
