// Database seed — populate MCQs, articles, posts, flashcards from mock data

import { initDB } from '../utils/db';
import { seedMCQs } from '../services/mcqService';
import { seedArticles } from '../services/caService';
import { seedPosts } from '../services/communityService';
import { run } from '../utils/db';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../utils/db';

// System user ID for seeded posts (no FK issues)
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

// ─── MCQ Seed Data ─────────────────────────────────────────────────

const MCQ_SEED: Array<{
  id: string; topicId: string; question: string;
  options: string[]; correctOption: number; explanation: string;
  source: string; year?: number;
}> = [
  // History — Indus Valley
  { id: 'mcq-hist-001', topicId: 'gs1-heritage', question: 'The Indus Valley Civilization was primarily:', options: ['A river valley civilization along the Indus and its tributaries', 'A coastal civilization focused on maritime trade', 'A desert civilization centered around Rajasthan', 'A mountainous civilization of the Himalayan region'], correctOption: 0, explanation: 'The IVC was primarily a river valley civilization flourishing along the Indus River and its tributaries including the Ghaggar-Hakra river system.', source: 'Practice' },
  { id: 'mcq-hist-002', topicId: 'gs1-heritage', question: 'Which of the following was NOT a characteristic of Harappan urban planning?', options: ['Grid-pattern streets', 'Advanced drainage system', 'Elaborate temple complexes', 'Uniform brick sizes'], correctOption: 2, explanation: 'The Harappans did not build elaborate temple complexes. Instead, they focused on functional civic structures like granaries, citadels, and residential areas with sophisticated drainage.', source: 'Practice' },
  { id: 'mcq-hist-003', topicId: 'gs1-heritage', question: 'The Janas and the Vidathas mentioned in the Vedic texts were:', options: ['Ruling dynasties of the Vedic period', 'Local assemblies and republican clans', 'Trading guilds of ancient India', 'Priestly sects of the Vedic age'], correctOption: 1, explanation: 'Jana was a clan/community and Vidatha was a祭祀 assembly in the Vedic period, representing early forms of democratic institutions.', source: 'PYQ 2019', year: 2019 },
  { id: 'mcq-hist-004', topicId: 'gs1-heritage', question: 'The concept of "Buddhist Councils" was primarily aimed at:', options: ['Electing the head of the Buddhist sangha', 'Compiling and standardizing Buddhist scriptures', 'Deciding on military campaigns against rival kingdoms', 'Establishing trade routes for Buddhist merchants'], correctOption: 1, explanation: 'The Buddhist Councils were convened to compile, recite, and standardize the Buddha\'s teachings into the Tipitaka after his death.', source: 'Practice' },
  { id: 'mcq-hist-005', topicId: 'gs1-heritage', question: 'The "Mughal painting" tradition was most influenced by:', options: ['Persian miniature painting traditions', 'Tantric Buddhist art of Tibet', 'Greek Hellenistic art', 'Chola bronze sculptures'], correctOption: 0, explanation: 'Mughal painting emerged from the synthesis of Safavid Persian miniature traditions with indigenous Indian subjects and techniques.', source: 'Practice' },
  // Polity
  { id: 'mcq-poly-001', topicId: 'gs2-constitution', question: 'The President of India can declare a financial emergency under Article 360:', options: ['Only on the advice of the Council of Ministers', 'On the President\'s own discretion', 'On the advice of the Supreme Court', 'Only with Parliament\'s prior approval'], correctOption: 0, explanation: 'Under Article 360, the President can declare financial emergency only on the written recommendation of the Council of Ministers headed by the PM.', source: 'Practice' },
  { id: 'mcq-poly-002', topicId: 'gs2-constitution', question: 'Which of the following is NOT a part of the Parliament\'s financial bureaucracy?', options: ['Finance Commission', 'Comptroller and Auditor General', ' Attorney General of India', 'Public Accounts Committee'], correctOption: 2, explanation: 'The Attorney General of India is a constitutional functionary under Article 76 who advises the government but is not part of Parliament\'s financial bureaucracy.', source: 'Practice' },
  { id: 'mcq-poly-003', topicId: 'gs2-constitution', question: 'The concept of "Basic Structure" of the Constitution was first established in:', options: ['Kesavananda Bharati case (1973)', 'Minerva Mills case (1980)', 'Golaknath case (1967)', 'Maneka Gandhi case (1978)'], correctOption: 0, explanation: 'The Supreme Court in Kesavananda Bharati v. State of Kerala (1973) first propounded the Basic Structure doctrine, ruling that Parliament cannot amend the basic features of the Constitution.', source: 'PYQ 2020', year: 2020 },
  { id: 'mcq-poly-004', topicId: 'gs2-constitution', question: 'NITI Aayog replaced which body?', options: ['Finance Commission', 'Planning Commission', 'Economic Advisory Council', 'National Development Council'], correctOption: 1, explanation: 'NITI Aayog (National Institution for Transforming India) was established in 2015 replacing the Planning Commission, with a governing council of all Chief Ministers.', source: 'Practice' },
  { id: 'mcq-poly-005', topicId: 'gs2-governance', question: 'The 73rd Constitutional Amendment Act is related to:', options: ['Municipalities', 'Panchayati Raj Institutions', 'Scheduled Tribes', 'Urban local bodies only'], correctOption: 1, explanation: 'The 73rd Amendment (1992) added Part IX to the Constitution, establishing a three-tier Panchayati Raj system with Gram Sabhas, and made it a fundamental aspect of democratic governance.', source: 'PYQ 2021', year: 2021 },
  // Economy
  { id: 'mcq-eco-001', topicId: 'gs3-economy', question: 'The distinction between "revenue expenditure" and "capital expenditure" is based on:', options: ['The amount of spending', 'Whether the spending creates an asset or not', 'The sector of spending', 'The duration of the spending program'], correctOption: 1, explanation: 'Revenue expenditure does not create assets (e.g., salaries, subsidies) while capital expenditure creates assets (e.g., infrastructure, machinery). This distinction is critical for fiscal analysis.', source: 'Practice' },
  { id: 'mcq-eco-002', topicId: 'gs3-economy', question: 'Which committee recommended the adoption of "Medium-Term Fiscal Policy"?', options: ['Chelliah Committee', 'Kelkar Committee', 'Eighth Finance Commission', 'NITI Aayog'], correctOption: 0, explanation: 'The Chelliah Committee on Tax Reforms (1992) recommended medium-term fiscal policy to bring fiscal deficit under control through a structured consolidation path.', source: 'Practice' },
  { id: 'mcq-eco-003', topicId: 'gs3-economy', question: 'The GST Council is chaired by:', options: ['Finance Minister of India', 'Chief Economic Adviser', 'President of India', 'Law Minister of India'], correctOption: 0, explanation: 'The GST Council is chaired by the Union Finance Minister and includes the Union Minister of State for Revenue and all State Finance/Taxation Ministers.', source: 'Practice' },
  // Environment
  { id: 'mcq-env-001', topicId: 'gs3-environment', question: 'The "Kyoto Protocol" was adopted under which framework?', options: ['UNCLOS', 'UNFCCC', 'CITES', 'Montreal Protocol'], correctOption: 1, explanation: 'The Kyoto Protocol (1997) was adopted under the UN Framework Convention on Climate Change (UNFCCC) as the first legally binding international treaty on climate change mitigation.', source: 'PYQ 2022', year: 2022 },
  { id: 'mcq-env-002', topicId: 'gs3-environment', question: 'India\'s Intended Nationally Determined Contribution (INDC) targets include:', options: ['33-35% emission reduction by 2030 from 2005 levels', '50% renewable energy capacity by 2030', 'Net zero by 2050', '100% electric vehicle adoption by 2035'], correctOption: 0, explanation: 'India\'s INDC submitted to UNFCCC includes: 33-35% emission intensity reduction vs 2005, 40% installed electric capacity from non-fossil sources, and forest cover creation.', source: 'Practice' },
  // Science & Tech
  { id: 'mcq-st-001', topicId: 'gs3-scitech', question: 'Gaganyaan is India\'s:', options: ['Mars mission program', 'Crewed orbital spacecraft program', 'Lunar exploration module', 'Military reconnaissance satellite'], correctOption: 1, explanation: 'Gaganyaan is India\'s first crewed orbital spacecraft program, aimed at demonstrating human spaceflight capability by sending astronauts to orbit for up to 3 days.', source: 'PIB 2024' },
  { id: 'mcq-st-002', topicId: 'gs3-scitech', question: 'The National Quantum Mission was approved by the Cabinet in:', options: ['2020', '2021', '2023', '2024'], correctOption: 2, explanation: 'The Union Cabinet approved the National Quantum Mission in April 2023, with a budget of ₹6,003 crore, to be implemented from 2023-2031.', source: 'Practice' },
  // Ethics
  { id: 'mcq-eth-001', topicId: 'gs4-ethics', question: 'The philosophical concept of "Swadeshi" in the context of value education means:', options: ['Economic nationalism only', 'Self-reliance and self-sufficiency', 'Exclusion of foreign goods', 'Religious revivalism'], correctOption: 1, explanation: 'Swadeshi in ethical terms refers to self-reliance, self-sufficiency, and the principle of doing things oneself — a concept with deep roots in Indian philosophical tradition from the Gita.', source: 'Practice' },
  { id: 'mcq-eth-002', topicId: 'gs4-ethics', question: 'Which of the following is a key principle of ethical governance?', options: ['Procedural correctness', 'Transparency and accountability', 'Speed of decision-making only', 'Minimizing expenditure'], correctOption: 1, explanation: 'Ethical governance rests on transparency (openness in processes), accountability (answerability for actions), and integrity — these form the cornerstone of public administration ethics.', source: 'Practice' },
  // CSAT
  { id: 'mcq-csat-001', topicId: 'csat-logic', question: 'If all roses are flowers and some flowers fade quickly, which conclusion is valid?', options: ['All roses fade quickly', 'Some roses fade quickly', 'No roses fade quickly', 'Some flowers are not roses'], correctOption: 1, explanation: 'Since some flowers fade quickly and all roses are flowers, it follows logically that at least some roses could be among those fading flowers. This is a valid syllogistic conclusion.', source: 'Practice' },
  { id: 'mcq-csat-002', topicId: 'csat-data', question: 'A train covers 240 km in 4 hours. What is its speed in km/h?', options: ['50 km/h', '60 km/h', '70 km/h', '80 km/h'], correctOption: 1, explanation: 'Speed = Distance / Time = 240 km / 4 hours = 60 km/h. This is basic speed calculation used frequently in CSAT arithmetic sections.', source: 'Practice' },
  // More MCQs for variety
  { id: 'mcq-hist-006', topicId: 'gs1-heritage', question: 'The "Saraswati Civilization" refers to:', options: ['Harappan culture along the Ghaggar-Hakra river', 'Vedic culture of Punjab plains', 'Mauryan empire along the Narmada', 'Chola empire in the south'], correctOption: 0, explanation: 'The Saraswati Civilization refers to the pre-historic and Harappan settlements along the Ghaggar-Hakra river system, which is identified with the mythical Vedic river Saraswati.', source: 'Practice' },
  { id: 'mcq-poly-006', topicId: 'gs2-constitution', question: 'The concept of "Doctrine of Necessity" is associated with:', options: ['Supreme Court appointments', 'President\'s discretion in emergencies', 'Parliamentary lawmaking', 'Election Commission decisions'], correctOption: 1, explanation: 'The Doctrine of Necessity gives the President discretionary powers in certain situations (like when no party has majority) where constitutional provisions do not provide clear guidance.', source: 'Practice' },
  { id: 'mcq-eco-004', topicId: 'gs3-economy', question: 'The "Liberalised Foreign Direct Investment Policy" allows 100% FDI in which sector?', options: ['Retail trading', 'Single-brand retail', 'Coal mining', 'Print media'], correctOption: 1, explanation: '100% FDI under automatic route is allowed in single-brand retail trading, subject to certain conditions regarding local sourcing and Indian entity requirements.', source: 'Practice' },
  { id: 'mcq-env-003', topicId: 'gs3-environment', question: 'The "Carbon Credit Trading Scheme" in India is administered by:', options: ['SEBI', 'CPCB', 'Bureau of Energy Efficiency', 'Power Grid Corporation'], correctOption: 0, explanation: 'India\'s Carbon Credit Trading Scheme (CCTS) was launched in 2023 under the Energy Conservation Act, administered by CBEEX (Central Board of Electricity and Energy), regulated by CERC.', source: 'Practice' },
  { id: 'mcq-st-003', topicId: 'gs3-scitech', question: 'The "IndiaAI" mission was approved with a budget of:', options: ['₹3,000 crore', '₹10,372 crore', '₹7,500 crore', '₹5,000 crore'], correctOption: 1, explanation: 'IndiaAI Mission was approved by the Cabinet in March 2024 with a budget of ₹10,372 crore over 5 years to build a comprehensive AI ecosystem in India.', source: 'PIB 2024' },
];

// ─── Article Seed Data ─────────────────────────────────────────────

const ARTICLE_SEED = [
  { id: 'ca-001', title: 'India-EU Free Trade Agreement: Key Trade Barriers Removed After 7 Years of Negotiations', summary: 'India and the EU concluded the long-pending FTA. The agreement covers goods, services, investment, and geographical indications.', source: 'The Hindu', publishedAt: new Date().toISOString(), linkedTopics: ['gs3-economy', 'gs2-governance'], tags: ['International Relations', 'Trade', 'Economy'], importance: 'high' as const },
  { id: 'ca-002', title: 'Supreme Court Landmark Ruling: Electoral Bonds Scheme Declared Unconstitutional', summary: 'A five-judge bench struck down the Electoral Bonds Scheme as violative of Article 19(1)(a).', source: 'Indian Express', publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(), linkedTopics: ['gs2-constitution', 'gs2-governance'], tags: ['Polity', 'Supreme Court', 'Electoral Reform'], importance: 'high' as const },
  { id: 'ca-003', title: 'COP31 Host City Announced: Brazil to Host 2026 UN Climate Conference in Belém', summary: 'COP31 will be held in Belém, Brazil — located in the Amazon basin. India reaffirmed its NDC targets.', source: 'PIB', publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(), linkedTopics: ['gs3-environment'], tags: ['Environment', 'Climate Change', 'International'], importance: 'high' as const },
  { id: 'ca-004', title: 'Gaganyaan Mission Update: ISRO Announces First Uncrewed Test by Q3 2026', summary: 'ISRO Chairman announced the first uncrewed test flight of the Gaganyaan mission is scheduled for Q3 2026.', source: 'PIB', publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(), linkedTopics: ['gs3-scitech'], tags: ['Science & Technology', 'Space', 'ISRO'], importance: 'medium' as const },
  { id: 'ca-005', title: '53rd GST Council Meeting: Revisions to Tax Rates on Insurance Premiums & Renewable Energy', summary: 'The GST Council approved revised rates on life insurance premiums (18% cap) and simplified rates for renewable energy components.', source: 'Economic Times', publishedAt: new Date(Date.now() - 3600000 * 10).toISOString(), linkedTopics: ['gs3-economy'], tags: ['Economy', 'GST', 'Finance'], importance: 'medium' as const },
  { id: 'ca-006', title: 'National Education Policy 2020: States Begin Phase-II Implementation Rollout', summary: 'Multiple states have begun rolling out NEP 2020\'s second phase, focusing on multilingualism, vocational education, and teacher training reforms.', source: 'The Hindu', publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(), linkedTopics: ['gs2-governance'], tags: ['Education', 'Governance', 'Policy'], importance: 'medium' as const },
  { id: 'ca-007', title: 'Digital India Mission: 70% Villages Now Have High-Speed Broadband Access', summary: 'Under BharatNet Phase III, 70% of villages now have optical fiber connectivity providing broadband access, ahead of the 2025 target.', source: 'PIB', publishedAt: new Date(Date.now() - 3600000 * 14).toISOString(), linkedTopics: ['gs3-economy'], tags: ['Technology', 'Infrastructure', 'Digital'], importance: 'medium' as const },
];

// ─── Community Post Seed Data ──────────────────────────────────────

const POST_SEED = [
  { id: 'cp-001', userId: 'system', authorName: 'Topper AIR 45', authorTitle: 'CSE 2023', type: 'strategy' as const, title: 'How I covered the entire GS Syllabus in 18 months — my daily routine', body: 'Starting with a disclaimer: there is no magic formula. What worked for me was consistency and a structured approach. Here\'s my daily schedule that helped me cover all 4 GS papers plus CSAT.\n\nMorning: Current affairs (1 hour) using The Hindu + IASbaba.\nMid-morning: Static portion (3 hours) — one GS paper per day rotation.\nAfternoon: MCQ practice (1 hour) — PYQs first, then standard books.\nEvening: Answer writing (1.5 hours) — start with 10-marker questions, graduate to 15-marker.\nNight: Revision of notes (30 minutes).\n\nKey insight: Link static topics to current affairs from day 1. Every topic has a contemporary angle.', tags: ['Strategy', 'GS', 'Time-Management'], upvotes: 234, comments: 87, views: 12500, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), isPinned: true },
  { id: 'cp-002', userId: 'system', authorName: 'First Attempt Cleared', authorTitle: 'CSE 2024', type: 'question' as const, title: 'What is the most efficient way to prepare for CSAT without coaching?', body: 'I have been preparing for Prelims 2025 and find CSAT particularly challenging. My quant basics are weak. Should I start with NCERT math or directly go to standard books? How many hours per week should I dedicate to CSAT?\n\nAlso, is it true that only 10-15 questions from CSAT are sufficient to qualify? I have heard mixed advice.', tags: ['CSAT', 'Prelims', 'Quant'], upvotes: 156, comments: 42, views: 8900, createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), isPinned: false },
  { id: 'cp-003', userId: 'system', authorName: 'Optional Geography', authorTitle: 'CSE 2022', type: 'resource' as const, title: 'Complete Book List for Geography Optional — with edition details', body: 'Many aspirants ask me about Geography Optional resources. Here\'s my complete list:\n\nPaper I:\n- Physical Geography by Savindra Singh (latest ed.)\n- Geomorphology by Strahler & Strahler\n- Climatology by Critchfield\n- Oceanography by K Siddhartha\n- Biogeography by Chandana\n\nPaper II:\n- India: Physical, Economic, Social Geography by Majid Husain\n- Regional Planning in India by Chandna\n- Economic Geography by Saxena\n\nAtlas: Oxford Student Atlas.\n\nPlease do not buy all at once. Buy chapter-wise as you cover topics.', tags: ['Geography', 'Optional', 'Books'], upvotes: 198, comments: 65, views: 11200, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), isPinned: false },
];

// ─── Flashcard Seed Data ────────────────────────────────────────────

const FLASHCARD_SEED = [
  { id: 'fc-001', topicId: 'gs2-constitution', front: 'What is the minimum age to become the President of India?', back: '35 years (Article 58)', easeFactor: 2.5, interval: 0, repetitions: 0 },
  { id: 'fc-002', topicId: 'gs2-constitution', front: 'Which article empowers the President to declare Financial Emergency?', back: 'Article 360 — can be declared if the financial stability or credit of India is threatened', easeFactor: 2.5, interval: 0, repetitions: 0 },
  { id: 'fc-003', topicId: 'gs2-constitution', front: 'What is the minimum age for a member of Lok Sabha?', back: '25 years (Article 84)', easeFactor: 2.5, interval: 0, repetitions: 0 },
  { id: 'fc-004', topicId: 'gs3-economy', front: 'What is the difference between Revenue Expenditure and Capital Expenditure?', back: 'Revenue expenditure does not create assets (salaries, subsidies). Capital expenditure creates assets (infrastructure, machinery). Both affect fiscal deficit differently.', easeFactor: 2.5, interval: 0, repetitions: 0 },
  { id: 'fc-005', topicId: 'gs3-economy', front: 'What is the current FRBM target for fiscal deficit?', back: 'Fiscal deficit not exceeding 3% of GDP by FY 2025-26, with a roadmap of 0.5% reduction annually from 2021-22 levels.', easeFactor: 2.5, interval: 0, repetitions: 0 },
  { id: 'fc-006', topicId: 'gs3-environment', front: 'What are the three pillars of sustainable development?', back: '1. Economic development 2. Social inclusion 3. Environmental sustainability (Brundtland Commission, 1987)', easeFactor: 2.5, interval: 0, repetitions: 0 },
  { id: 'fc-007', topicId: 'gs3-scitech', front: 'What is the budget allocation for IndiaAI Mission?', back: '₹10,372 crore over 5 years (2024-2029), approved by Cabinet in March 2024', easeFactor: 2.5, interval: 0, repetitions: 0 },
  { id: 'fc-008', topicId: 'gs4-ethics', front: 'What are the 5Cs of ethical leadership?', back: 'Character, Courage, Compassion, Conviction, Consistency', easeFactor: 2.5, interval: 0, repetitions: 0 },
  { id: 'fc-009', topicId: 'gs1-heritage', front: 'What were the three phases of the Indus Valley Civilization?', back: '1. Early Harappan (3300-2600 BCE) 2. Mature Harappan (2600-1900 BCE) 3. Late Harappan (1900-1300 BCE)', easeFactor: 2.5, interval: 0, repetitions: 0 },
  { id: 'fc-010', topicId: 'gs1-heritage', front: 'What is the difference between Mahajanapadas and Janapadas?', back: 'Mahajanapadas were 16 powerful kingdoms/republics (6th century BCE). Janapadas were earlier tribal territorial units where the Jana (people) settled.', easeFactor: 2.5, interval: 0, repetitions: 0 },
];

// ─── Run Seed ───────────────────────────────────────────────────────

export function seed(): void {
  console.log('🌱 Seeding database...');

  // Seed MCQs
  try {
    seedMCQs(MCQ_SEED);
    console.log(`  ✅ Seeded ${MCQ_SEED.length} MCQs`);
  } catch (e) {
    console.error('  ❌ MCQ seed error:', e);
  }

  // Seed Articles
  try {
    seedArticles(ARTICLE_SEED as any);
    console.log(`  ✅ Seeded ${ARTICLE_SEED.length} articles`);
  } catch (e) {
    console.error('  ❌ Article seed error:', e);
  }

  // Create system user for seeded posts first
  run(
    `INSERT OR IGNORE INTO users (id, email, password_hash, name, exam_stage, target_year)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [SYSTEM_USER_ID, 'system@upscpathfinder.app', 'nopassword', 'UPSC Pathfinder', 'prelims', 2025]
  );

  // Seed Posts
  try {
    seedPosts(POST_SEED.map(p => ({ ...p, userId: SYSTEM_USER_ID })) as any);
    console.log(`  ✅ Seeded ${POST_SEED.length} community posts`);
  } catch (e) {
    console.error('  ❌ Post seed error:', e);
  }

  // Seed Flashcards
  try {
    const insert = db.transaction((cards: typeof FLASHCARD_SEED) => {
      for (const card of cards) {
        run(
          `INSERT OR IGNORE INTO flashcards (id, topic_id, front, back, ease_factor, interval, repetitions)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [card.id, card.topicId, card.front, card.back, card.easeFactor, card.interval, card.repetitions]
        );
      }
    });
    insert(FLASHCARD_SEED);
    console.log(`  ✅ Seeded ${FLASHCARD_SEED.length} flashcards`);
  } catch (e) {
    console.error('  ❌ Flashcard seed error:', e);
  }

  console.log('🌱 Seed complete!');
}