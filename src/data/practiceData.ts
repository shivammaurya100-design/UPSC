// Extended seed data for Practice, Tests, Community, Subscription modules

import { MCQ, Flashcard } from '../types';
import { CommunityPost, SubscriptionPlan, StudyGroup, PracticeStats } from '../types/practice';
import { TestSession, TestResult, TestAnalytics } from '../types/practice';

// ============================================================
// Extended MCQ Bank (50,000+ target — MVP has 200+)
// ============================================================

export const extendedMCQs: MCQ[] = [
  // --- GS I: History ---
  {
    id: 'mcq-hist-001',
    topicId: 'gs1-heritage',
    question: 'The Indus Valley Civilization was primarily:',
    options: [
      'A river valley civilization along the Indus and its tributaries',
      'A coastal civilization focused on maritime trade',
      'A desert civilization centered around Rajasthan',
      'A mountainous civilization of the Himalayan region',
    ],
    correctOption: 0,
    explanation: 'The IVC was primarily a river valley civilization flourishing along the Indus River and its tributaries including the Ghaggar-Hakra river system.',
    source: 'Practice',
  },
  {
    id: 'mcq-hist-002',
    topicId: 'gs1-heritage',
    question: 'Which of the following was NOT a characteristic of Harappan urban planning?',
    options: [
      'Grid-pattern streets',
      'Advanced drainage system',
      'Elaborate temple complexes',
      'Uniform brick sizes',
    ],
    correctOption: 2,
    explanation: 'The Harappans did not build elaborate temple complexes. Instead, they focused on functional civic structures like granaries, citadels, and residential areas with sophisticated drainage.',
    source: 'Practice',
  },
  {
    id: 'mcq-hist-003',
    topicId: 'gs1-heritage',
    question: 'The Janas and the Vidathas mentioned in the Vedic texts were:',
    options: [
      'Ruling dynasties of the Vedic period',
      'Local assemblies and republican clans',
      'Trading guilds of ancient India',
      'Priestly sects of the Vedic age',
    ],
    correctOption: 1,
    explanation: 'Jana was a clan/community and Vidatha was a祭祀 assembly in the Vedic period, representing early forms of democratic institutions.',
    source: 'PYQ 2019',
    year: 2019,
  },
  {
    id: 'mcq-hist-004',
    topicId: 'gs1-heritage',
    question: 'The concept of "Buddhist Councils" was primarily aimed at:',
    options: [
      'Electing the head of the Buddhist sangha',
      'Compiling and standardizing Buddhist scriptures',
      'Deciding on military campaigns against rival kingdoms',
      'Establishing trade routes for Buddhist merchants',
    ],
    correctOption: 1,
    explanation: 'The Buddhist Councils were convened to compile, recite, and standardize the Buddha\'s teachings into the Tipitaka after his death.',
    source: 'Practice',
  },
  {
    id: 'mcq-hist-005',
    topicId: 'gs1-heritage',
    question: 'The "Mughal painting" tradition was most influenced by:',
    options: [
      'Persian miniature painting traditions',
      'Tantric Buddhist art of Tibet',
      'Greek Hellenistic art',
      'Chola bronze sculptures',
    ],
    correctOption: 0,
    explanation: 'Mughal painting was heavily influenced by Persian miniature painting, which the Mughals brought with them from Persia and adapted to Indian subjects.',
    source: 'Practice',
  },
  // --- GS II: Polity ---
  {
    id: 'mcq-poly-001',
    topicId: 'gs2-constitution',
    question: 'Which article of the Indian Constitution deals with "Equality before law"?',
    options: ['Article 14', 'Article 17', 'Article 19', 'Article 21'],
    correctOption: 0,
    explanation: 'Article 14 guarantees equality before law and equal protection of laws to all persons within the territory of India.',
    source: 'Practice',
  },
  {
    id: 'mcq-poly-002',
    topicId: 'gs2-constitution',
    question: 'The "Doctrine of Pleasure" in Indian constitutional law relates to:',
    options: [
      'Right to constitutional remedies',
      'Tenure of public servants and judges',
      'Power of the President to grant pardons',
      'Salaries of government officials',
    ],
    correctOption: 1,
    explanation: 'The Doctrine of Pleasure states that civil servants hold office during the pleasure of the President/Governor, meaning they can be removed without reason (though Article 311 provides protections).',
    source: 'Practice',
  },
  {
    id: 'mcq-poly-003',
    topicId: 'gs2-constitution',
    question: 'A Money Bill can be introduced in Parliament with the prior sanction of:',
    options: ['The Prime Minister', 'The President', 'The Finance Minister', 'The Chairman of Rajya Sabha'],
    correctOption: 1,
    explanation: 'Article 110 states that a Money Bill can only be introduced in Lok Sabha with the prior recommendation of the President.',
    source: 'Practice',
  },
  {
    id: 'mcq-poly-004',
    topicId: 'gs2-constitution',
    question: 'The 73rd and 74th Constitutional Amendment Acts added a new part to the Constitution dealing with:',
    options: [
      'Fundamental Duties',
      'Directive Principles of State Policy',
      'Panchayati Raj and Urban Local Bodies',
      'Concurrent List',
    ],
    correctOption: 2,
    explanation: 'The 73rd Amendment (1992) added Part IX on Panchayati Raj and the 74th Amendment added Part IX-A on Urban Local Bodies, ensuring constitutional status to local governance.',
    source: 'PYQ 2020',
    year: 2020,
  },
  {
    id: 'mcq-poly-005',
    topicId: 'gs2-constitution',
    question: 'The concept of "Basic Structure" of the Constitution was first articulated by the Supreme Court in:',
    options: ['Gopalan v. SAIL', 'Kesavananda Bharati v. State of Kerala', 'Minerva Mills v. Union of India', 'SR Bommai v. Union of India'],
    correctOption: 1,
    explanation: 'Kesavananda Bharati v. State of Kerala (1973) was the landmark case where a 13-judge bench propounded the Basic Structure Doctrine, limiting Parliament\'s amending power.',
    source: 'PYQ 2018',
    year: 2018,
  },
  // --- GS III: Economy ---
  {
    id: 'mcq-eco-001',
    topicId: 'gs3-economy',
    question: 'Which committee on financial sector reforms recommended the establishment of RBI as a proto-central bank?',
    options: [
      'Narsimham Committee I',
      'Narsimham Committee II',
      'Chakravarty Committee',
      'Kelkar Committee',
    ],
    correctOption: 2,
    explanation: 'The Chakravarty Committee (1985) examined the working of the monetary system and RBI, recommending changes that shaped modern monetary policy in India.',
    source: 'Practice',
  },
  {
    id: 'mcq-eco-002',
    topicId: 'gs3-economy',
    question: 'The "MUDRA Bank" scheme provides credit to:',
    options: [
      'Large industrial houses',
      'Micro units and small entrepreneurs',
      'Agricultural cooperatives',
      'State government corporations',
    ],
    correctOption: 1,
    explanation: 'MUDRA (Micro Units Development & Refinance Agency) Bank provides credit to non-corporate small and micro enterprises, including shopkeepers, artisans, and entrepreneurs.',
    source: 'Practice',
  },
  {
    id: 'mcq-eco-003',
    topicId: 'gs3-economy',
    question: 'Which of the following is NOT a component of GST?',
    options: ['CGST', 'SGST', 'IGST', 'UGST'],
    correctOption: 3,
    explanation: 'GST in India has four components: CGST (Central), SGST (State), IGST (Integrated — for inter-state), and UTGST (Union Territories). UGST does not exist.',
    source: 'Practice',
  },
  {
    id: 'mcq-eco-004',
    topicId: 'gs3-economy',
    question: 'The "Global Innovation Index" is published by:',
    options: [
      'World Economic Forum',
      'World Intellectual Property Organization',
      'UNDP',
      'International Monetary Fund',
    ],
    correctOption: 1,
    explanation: 'The Global Innovation Index is published annually by the World Intellectual Property Organization (WIPO) in partnership with other institutions.',
    source: 'PYQ 2021',
    year: 2021,
  },
  {
    id: 'mcq-eco-005',
    topicId: 'gs3-economy',
    question: 'The distinction between "Capital Receipt" and "Revenue Receipt" in the Union Budget is based on:',
    options: [
      'Whether the amount is tax or non-tax',
      'Whether the government creates a liability or reduces its assets',
      'Whether it is spent on Plan or Non-Plan expenditure',
      'Whether it comes from the centre or states',
    ],
    correctOption: 1,
    explanation: 'Capital receipts create liability or reduce financial assets (e.g., borrowings, disinvestment), while revenue receipts do not create liability and are recurring in nature (e.g., taxes).',
    source: 'Practice',
  },
  // --- CSAT Reasoning ---
  {
    id: 'mcq-csat-001',
    topicId: 'csat-reasoning',
    question: 'If "FRIEND" is coded as "HUMJTG", how is "ENEMY" coded?',
    options: ['GPHGA', 'GPGHA', 'HOHGA', 'GQHIA'],
    correctOption: 0,
    explanation: 'Each letter is shifted by +2 positions in the alphabet: E→G, N→P, E→G, M→O, Y→A. So ENEMY = GPHGA.',
    source: 'CSAT Practice',
  },
  {
    id: 'mcq-csat-002',
    topicId: 'csat-reasoning',
    question: 'A train 200m long passes a platform 150m long in 10 seconds. What is the speed of the train?',
    options: ['35 m/s', '30 m/s', '20 m/s', '25 m/s'],
    correctOption: 0,
    explanation: 'Distance covered = 200 + 150 = 350m. Speed = Distance/Time = 350/10 = 35 m/s.',
    source: 'CSAT Practice',
  },
  {
    id: 'mcq-csat-003',
    topicId: 'csat-reasoning',
    question: 'In a certain code, "TRAIN" is written as "12345" and "RAIN" is written as "2345". How is "PLANE" written?',
    options: ['72345', '74325', '72354', '72435'],
    correctOption: 0,
    explanation: 'T=1, R=2, A=3, I=4, N=5. R=2, A=3, I=4, N=5 (RAIN = 2345). P is new → 7. So PLANE = 72345.',
    source: 'CSAT Practice',
  },
  {
    id: 'mcq-csat-004',
    topicId: 'csat-reasoning',
    question: 'If the day before yesterday was Thursday, what day will it be the day after tomorrow?',
    options: ['Monday', 'Sunday', 'Saturday', 'Tuesday'],
    correctOption: 0,
    explanation: 'Day before yesterday = Thursday → Today = Saturday. Day after tomorrow = Monday.',
    source: 'CSAT Practice',
  },
  {
    id: 'mcq-csat-005',
    topicId: 'csat-reasoning',
    question: 'A is B\'s sister. C is B\'s mother. D is C\'s father. E is D\'s mother. How is A related to D?',
    options: ['Granddaughter', 'Daughter', 'Grandmother', 'Grandfather'],
    correctOption: 0,
    explanation: 'A and B are siblings (sisters). C is B\'s mother. D is C\'s father (A\'s maternal grandfather). A is D\'s granddaughter.',
    source: 'CSAT Practice',
  },
  // --- Environment ---
  {
    id: 'mcq-env-001',
    topicId: 'gs3-environment',
    question: 'The "Montreal Protocol" (1987) is related to:',
    options: [
      'Biodiversity conservation',
      'Ozone layer depletion',
      'Climate change mitigation',
      'Desertification control',
    ],
    correctOption: 1,
    explanation: 'The Montreal Protocol (1987) is an international treaty designed to protect the ozone layer by phasing out the production of numerous substances responsible for ozone depletion.',
    source: 'PYQ 2019',
    year: 2019,
  },
  {
    id: 'mcq-env-002',
    topicId: 'gs3-environment',
    question: 'Which Indian wildlife species is closest to extinction in the wild?',
    options: ['Bengal Tiger', 'Asiatic Lion', 'Hangul (Kashmir Stag)', 'One-horned Rhino'],
    correctOption: 2,
    explanation: 'The Hangul (Cervus hanglu) is listed as Critically Endangered with fewer than 200 individuals remaining in the wild in the Kashmir region.',
    source: 'PYQ 2020',
    year: 2020,
  },
  {
    id: 'mcq-env-003',
    topicId: 'gs3-environment',
    question: 'The "Carbon Credit" system works on the principle of:',
    options: [
      'Cap on total emissions with tradable permits',
      'Taxing all carbon-based fuels uniformly',
      'Banning fossil fuel use completely',
      'Subsidizing renewable energy producers only',
    ],
    correctOption: 0,
    explanation: 'Carbon credit systems set a cap on total emissions and allow entities to buy/sell credits, creating a market mechanism to reduce emissions cost-effectively.',
    source: 'Practice',
  },
  // --- Science & Tech ---
  {
    id: 'mcq-st-001',
    topicId: 'gs3-scitech',
    question: 'Which organization maintains the "National Registry of Citizens" in India?',
    options: [
      'Election Commission of India',
      'National Population Register (NPR)',
      'Census Commissioner',
      'Ministry of Home Affairs',
    ],
    correctOption: 1,
    explanation: 'The National Population Register (NPR) is prepared under the Citizenship Act, 1955, and is maintained by the Registrar General and Census Commissioner of India.',
    source: 'Practice',
  },
  {
    id: 'mcq-st-002',
    topicId: 'gs3-scitech',
    question: '"Aadhaar" uses which technology for identification?',
    options: ['Facial recognition only', 'Biometric (fingerprints and iris scan)', 'RFID tags', 'QR codes'],
    correctOption: 1,
    explanation: 'Aadhaar uses demographic and biometric information including fingerprints, iris scan, and facial photograph for unique identification of Indian residents.',
    source: 'Practice',
  },
  // --- Ethics ---
  {
    id: 'mcq-eth-001',
    topicId: 'gs4-ethics-basics',
    question: '"Integrity" in public service means:',
    options: [
      'Following orders without question',
      'Consistency between moral conviction and public action',
      'Maximizing personal savings while in service',
      'Avoiding all forms of social interaction',
    ],
    correctOption: 1,
    explanation: 'Integrity means consistency between one\'s moral convictions and professional conduct — doing the right thing even when no one is watching, and aligning personal values with public duties.',
    source: 'GS IV Practice',
  },
  {
    id: 'mcq-eth-002',
    topicId: 'gs4-ethics-basics',
    question: 'The "Problem of Evil" in ethics primarily deals with:',
    options: [
      'The ethical treatment of animals',
      'The existence of suffering in a world created by a benevolent deity',
      'The moral status of artificial intelligence',
      'The ethics of warfare',
    ],
    correctOption: 1,
    explanation: 'The Problem of Evil is a philosophical argument questioning how evil exists if a benevolent, omnipotent God created the world — central to meta-ethical debates.',
    source: 'GS IV Practice',
  },
];

// ============================================================
// Extended Flashcards (with spaced repetition data)
// ============================================================

export const extendedFlashcards: Flashcard[] = [
  // History
  {
    id: 'fc-hist-001',
    topicId: 'gs1-heritage',
    front: 'What is the significance of the "Pashupata" seal found in Harappa?',
    back: 'The Pashupata seal depicts a seated figure in a yogic posture surrounded by animals — believed to be an early representation of Shiva as Pashupati (Lord of Animals), suggesting proto-Shiva worship in the IVC.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-hist-002',
    topicId: 'gs1-heritage',
    front: 'What distinguishes "Buddha Images" from earlier anthropomorphic representations?',
    back: 'Early Buddhist art used symbols (Bodhi tree, footprints, wheel) to represent Buddha. Anthropomorphic Buddha images appeared around 1st century CE (Gandhara and Mathura schools), influenced by Greco-Roman art.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-hist-003',
    topicId: 'gs1-heritage',
    front: 'What was the "Ain-i-Akbari" and who wrote it?',
    back: 'Ain-i-Akbari (Part III of the Akbarnama) was written by Abul Fazl. It is an administrative account of Emperor Akbar\'s empire covering revenues, geography, culture, and the bureaucracy of the Mughal state.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  // Polity
  {
    id: 'fc-poly-001',
    topicId: 'gs2-constitution',
    front: 'Distinguish between "Residuary Powers" and "Concurrent Powers" in Indian federalism.',
    back: 'Residuary Powers (Article 248 + Seventh Schedule): Subjects not listed anywhere belong to Parliament (e.g., computer science). Concurrent Powers: Both Centre and States can legislate (e.g., education, environment) — Centre prevails in case of conflict.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-poly-002',
    topicId: 'gs2-constitution',
    front: 'What is the difference between "Absolute Immunity" and "Qualified Immunity" for government officials?',
    back: 'Absolute Immunity: Complete protection from suit for official acts (e.g., President\'s functions). Qualified Immunity: Protection only for discretionary acts in good faith, not for ministerial or unconstitutional acts.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-poly-003',
    topicId: 'gs2-constitution',
    front: 'What is "Split Voting" in the election process?',
    back: 'Split Voting occurs when a Member of Parliament votes differently from their party\'s official stance. Anti-defection law (10th Schedule) penalizes such splits unless 2/3rd of party members approve.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  // Economy
  {
    id: 'fc-eco-001',
    topicId: 'gs3-economy',
    front: 'What is "Deadweight Loss" in taxation?',
    back: 'Deadweight loss is the loss of economic efficiency when equilibrium is not achieved due to taxation. It represents the total welfare loss to society that occurs when supply and demand are not at market equilibrium because of a tax.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-eco-002',
    topicId: 'gs3-economy',
    front: 'What is the difference between "Headline Inflation" and "Core Inflation"?',
    back: 'Headline Inflation: Total inflation including food and energy prices (volatile). Core Inflation: Inflation excluding food, beverages, and energy — considered a better indicator of long-term inflation trends by central banks.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  // Environment
  {
    id: 'fc-env-001',
    topicId: 'gs3-environment',
    front: 'What is the "2°C target" under the Paris Agreement?',
    back: 'The Paris Agreement (2015) commits nations to limiting global temperature rise to well below 2°C above pre-industrial levels, and to pursuing efforts to limit it to 1.5°C. India\'s NDC aligns with this target through emission intensity reduction.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  // Ethics
  {
    id: 'fc-eth-001',
    topicId: 'gs4-ethics-basics',
    front: 'What is "Emotional Intelligence" (EI) as per Goleman\'s model?',
    back: 'Goleman\'s EI has 5 components: Self-Awareness (knowing oneself), Self-Regulation (controlling impulses), Motivation (inner drive), Empathy (understanding others), Social Skills (building relationships). All crucial for civil servants.',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
  {
    id: 'fc-eth-002',
    topicId: 'gs4-ethics-basics',
    front: 'What is the difference between "Code of Ethics" and "Code of Conduct"?',
    back: 'Code of Ethics: Aspirational principles defining moral values (e.g., "serve with integrity"). Code of Conduct: Specific behavioral rules and procedures with consequences for violations (e.g., "accept gifts below Rs. 300 only").',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  },
];

// ============================================================
// Mock Community Posts
// ============================================================

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post-001',
    type: 'strategy',
    title: 'How I cleared UPSC in my 3rd attempt — Strategy that worked for me',
    body: 'After two failed attempts, I changed my approach completely. The biggest change was moving from passive reading to active revision. Here\'s what I did differently...\n\n**GS Strategy:**\n1. One source per subject, revised 5 times minimum\n2. PYQs as the Bible — everything traces back to them\n3. Current affairs linked to static syllabus from Day 1\n\n**Answer Writing:**\nThe single biggest improvement came from writing 1 answer every day and getting it evaluated. Quality > Quantity always.',
    authorId: 'user-topper-01',
    authorName: 'Priya Sharma, AIR 156 (2024)',
    upvotes: 342,
    comments: 67,
    views: 8920,
    tags: ['strategy', 'attempt-3', 'answer-writing'],
    createdAt: '2026-04-10T09:30:00Z',
    isPinned: true,
  },
  {
    id: 'post-002',
    type: 'doubt',
    title: 'Can someone explain the difference between "Directive Principles" and "Fundamental Rights" in context of judicial enforceability?',
    body: 'I keep getting confused between DPSPs and FRs, especially on which ones are enforceable and which are not. The 42nd and 44th Amendments confuse me further.\n\nSpecifically:\n1. Are ALL DPSPs non-enforceable?\n2. What is the test courts use to enforce DPSPs?\n3. Which DPSPs have been held enforceable by SC?',
    authorId: 'user-asp-23',
    authorName: 'Rahul Verma',
    upvotes: 89,
    comments: 23,
    views: 1245,
    tags: ['polity', 'doubt', 'dpsp', 'fundamental-rights'],
    topicId: 'gs2-constitution',
    paper: 'GS II',
    createdAt: '2026-04-11T14:20:00Z',
    isPinned: false,
    isAnswered: true,
  },
  {
    id: 'post-003',
    type: 'discussion',
    title: 'Is focusing on Optional Paper strategy more important than GS in Mains 2026?',
    body: 'With the increasing cut-offs, I feel Optional Paper strategy needs more attention. Many toppers say their optional paper made the difference.\n\nI\'m taking Geography as optional. Anyone with strategy tips?\n\n**My current plan:**\n- Follow Khullar + Majid Hussain\n- Make notes from Gopal Kalanidhivan papers\n- Practice map-based questions daily\n\nIs this enough? What am I missing?',
    authorId: 'user-asp-45',
    authorName: 'Ananya Singh',
    upvotes: 156,
    comments: 42,
    views: 3420,
    tags: ['optional', 'geography', 'mains-2026', 'strategy'],
    createdAt: '2026-04-09T11:00:00Z',
    isPinned: false,
  },
  {
    id: 'post-004',
    type: 'motivation',
    title: 'Failed Prelims 3 times. Should I quit or try one more time?',
    body: 'I\'m 27 years old, attempted Prelims in 2023, 2024, and 2025. Failed all three times. I scored 82, 88, and 95 marks respectively.\n\nI feel demotivated. My family is pressuring me to take up a bank job. But UPSC has been my dream since I was in Class 10.\n\nI would appreciate any advice or words of encouragement from fellow aspirants or successful candidates.',
    authorId: 'user-asp-99',
    authorName: 'Vikram Patel',
    upvotes: 445,
    comments: 112,
    views: 15600,
    tags: ['motivation', 'failure', 'prelims', 'mental-health'],
    createdAt: '2026-04-08T20:00:00Z',
    isPinned: false,
  },
  {
    id: 'post-005',
    type: 'discussion',
    title: 'Daily Current Affairs: How to integrate with static syllabus without spending 4 hours daily?',
    body: 'I follow multiple sources — PIB, The Hindu, IAS Baba monthly magazine. But I end up spending 4+ hours on CA and still feel I\'m not connecting it to static.\n\nLooking for:\n1. Efficient note-making strategy for CA\n2. Sources that already link CA to static\n3. How to prioritize — should I focus on only PIB + one newspaper?',
    authorId: 'user-asp-77',
    authorName: 'Sneha Reddy',
    upvotes: 234,
    comments: 55,
    views: 5600,
    tags: ['current-affairs', 'strategy', 'time-management'],
    createdAt: '2026-04-07T08:45:00Z',
    isPinned: false,
  },
];

// ============================================================
// Study Groups
// ============================================================

export const mockStudyGroups: StudyGroup[] = [
  {
    id: 'sg-001',
    name: 'GS Paper II — Daily Polity Discussion',
    category: 'polity',
    paper: 'GS II',
    members: 1247,
    description: 'Daily discussion of one topic from Polity. Covers Articles, landmark cases, and current developments.',
    isJoined: false,
  },
  {
    id: 'sg-002',
    name: 'Economics for UPSC — Simplified',
    category: 'economy',
    paper: 'GS III',
    members: 892,
    description: 'Economic concepts made simple. Focus on Raghuram Rajan, Economic Survey, and Budget analysis.',
    isJoined: true,
  },
  {
    id: 'sg-003',
    name: 'Environment & Ecology — Current + Static',
    category: 'environment',
    paper: 'GS III',
    members: 634,
    description: 'Linking current environmental news to static GS III syllabus. Covers climate summits, biodiversity reports.',
    isJoined: false,
  },
  {
    id: 'sg-004',
    name: 'CSAT Quantitative — Practice Group',
    category: 'csat',
    paper: 'CSAT',
    members: 2103,
    description: 'Daily 10 questions from quantitative aptitude. All difficulty levels covered.',
    isJoined: false,
  },
];

// ============================================================
// Subscription Plans
// ============================================================

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    tier: 'free',
    name: 'Free',
    priceINR: 0,
    priceUSD: 0,
    durationDays: 0,
    features: [
      '500 MCQs per month',
      'Basic study notes',
      'Community access',
      'Daily current affairs digest',
      'Syllabus tracker',
    ],
    isPopular: false,
  },
  {
    id: 'plan-pro',
    tier: 'pro',
    name: 'Pro',
    priceINR: 999,
    priceUSD: 12,
    durationDays: 365,
    features: [
      'Unlimited MCQ bank (50,000+)',
      'All PYQs with explanations',
      'AI Answer Evaluation (10/month)',
      'Full test series access',
      'Offline mode — download content',
      'Flashcard system + Spaced Repetition',
      'Performance analytics',
      'Priority support',
    ],
    isPopular: true,
  },
  {
    id: 'plan-premium',
    tier: 'premium',
    name: 'Premium',
    priceINR: 2999,
    priceUSD: 36,
    durationDays: 365,
    features: [
      'Everything in Pro',
      'Unlimited AI Answer Evaluation',
      'Personal study plan by AI',
      '1:1 mentor connect',
      'Exclusive topper masterclasses',
      'Early access to new features',
      'Merchandise kit',
      'Dedicated success manager',
    ],
    isPopular: false,
  },
];

// ============================================================
// Practice Stats
// ============================================================

export const mockPracticeStats: PracticeStats = {
  totalAttempted: 1847,
  correctAnswers: 1243,
  accuracy: 67.3,
  streakDays: 12,
  avgTimePerQuestion: 42,
  weakTopics: ['World History - Cold War', 'Ethics - Case Studies', 'Economy - Banking'],
  strongTopics: ['Indian Constitution', 'Ancient History', 'Environment'],
  improvementPercent: 8.4,
};

// ============================================================
// Mock Test Sessions
// ============================================================

export const createMockTestSession = (
  id: string,
  title: string,
  paper: string,
  questionCount: number,
  durationMin: number,
): TestSession => ({
  id,
  title,
  type: 'full_length',
  paper: paper as any,
  questions: extendedMCQs.slice(0, questionCount).map((mcq) => ({
    id: mcq.id,
    question: mcq.question,
    options: mcq.options,
    correctOption: mcq.correctOption,
    explanation: mcq.explanation,
    selectedOption: null,
    isAnswered: false,
    isMarked: false,
  })),
  durationMinutes: durationMin,
  mode: 'exam',
  negativeMarking: true,
  negativeMark: 0.33,
  submittedAnswers: new Map(),
  sectionTime: {},
});

// ============================================================
// Mock Test Results
// ============================================================

export const mockTestResult: TestResult = {
  sessionId: 'result-001',
  title: 'GS Paper I — Full Length Mock Test',
  paper: 'GS I',
  totalQuestions: 20,
  attempted: 17,
  correct: 11,
  incorrect: 6,
  unattempted: 3,
  score: 88,
  maxScore: 100,
  negativeMarks: 2,
  finalScore: 86,
  timeTaken: '48 min',
  rank: 1245,
  percentile: 78,
  analytics: {
    topicWiseScore: {
      'History': { correct: 5, total: 8 },
      'Geography': { correct: 3, total: 6 },
      'Polity': { correct: 2, total: 3 },
      'Economy': { correct: 1, total: 3 },
    },
    difficultyWiseScore: {
      easy: { correct: 6, total: 7 },
      medium: { correct: 4, total: 8 },
      hard: { correct: 1, total: 5 },
    },
    timePerQuestion: 144,
    accuracyTrend: [55, 62, 60, 67, 71, 68, 75, 78],
    improvementAreas: ['Economy', 'Modern History'],
    strongAreas: ['Ancient History', 'Geography - Physical'],
  },
};
