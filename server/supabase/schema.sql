-- UPSC Pathfinder — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ─────────────────────────────────────────────────────────
-- Uses Supabase Auth (auth.users) + profile table

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  exam_stage TEXT DEFAULT 'prelims' CHECK (exam_stage IN ('prelims','mains','interview')),
  target_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()) + 1,
  optional_subject TEXT,
  daily_goal_minutes INTEGER DEFAULT 60,
  streak_days INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can read/update their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── MCQs ──────────────────────────────────────────────────────────
CREATE TABLE public.mcqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INTEGER NOT NULL CHECK (correct_option BETWEEN 0 AND 3),
  explanation TEXT NOT NULL,
  source TEXT DEFAULT 'Practice',
  year INTEGER,
  paper TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mcqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read MCQs" ON public.mcqs FOR SELECT USING (true);

-- ─── MCQ Answers ──────────────────────────────────────────────────
CREATE TABLE public.mcq_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mcq_id UUID NOT NULL REFERENCES public.mcqs(id) ON DELETE CASCADE,
  selected_option INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mcq_id)
);

ALTER TABLE public.mcq_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own answers" ON public.mcq_answers
  FOR ALL USING (auth.uid() = user_id);

-- ─── Practice Stats ────────────────────────────────────────────────
CREATE TABLE public.practice_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_attempted INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy REAL DEFAULT 0,
  weak_topics JSONB DEFAULT '[]',
  strong_topics JSONB DEFAULT '[]',
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.practice_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own stats" ON public.practice_stats
  FOR ALL USING (auth.uid() = user_id);

-- ─── Flashcards ───────────────────────────────────────────────────
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read flashcards" ON public.flashcards FOR SELECT USING (true);

-- ─── Flashcard SRS ─────────────────────────────────────────────────
CREATE TABLE public.flashcard_srs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  ease_factor REAL DEFAULT 2.5,
  "interval" INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

ALTER TABLE public.flashcard_srs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own SRS" ON public.flashcard_srs
  FOR ALL USING (auth.uid() = user_id);

-- ─── Topic Progress ───────────────────────────────────────────────
CREATE TABLE public.topic_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  completed_subtopics INTEGER DEFAULT 0,
  total_subtopics INTEGER DEFAULT 0,
  percent_complete REAL DEFAULT 0,
  last_studied TIMESTAMPTZ DEFAULT NOW(),
  mcq_score REAL,
  notes_read_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own progress" ON public.topic_progress
  FOR ALL USING (auth.uid() = user_id);

-- ─── Community Posts ───────────────────────────────────────────────
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_title TEXT,
  type TEXT NOT NULL CHECK (type IN ('strategy','question','discussion','resource')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  upvotes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Comments ─────────────────────────────────────────────────────
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── News Articles ─────────────────────────────────────────────────
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source TEXT,
  published_at TIMESTAMPTZ,
  linked_topics JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  importance TEXT DEFAULT 'medium' CHECK (importance IN ('high','medium','low')),
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read articles" ON public.news_articles FOR SELECT USING (true);

-- ─── Bookmarks ─────────────────────────────────────────────────────
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('article','post','mcq','flashcard')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- ─── Study Streaks ────────────────────────────────────────────────
CREATE TABLE public.study_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  total_active_days INTEGER DEFAULT 0
);

ALTER TABLE public.study_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own streak" ON public.study_streaks
  FOR ALL USING (auth.uid() = user_id);

-- ─── Helper RPC Functions ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_views(post_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.community_posts SET views = views + 1 WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_comments(post_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.community_posts SET comments = comments + 1 WHERE id = post_id;
END;
$$;

-- Allow service role to call these functions (bypass RLS)
ALTER FUNCTION public.increment_views(UUID) SECURITY DEFINER;
ALTER FUNCTION public.increment_comments(UUID) SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_comments(UUID) TO postgres, anon, authenticated, service_role;

-- ─── Admin Users ─────────────────────────────────────────────────
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read themselves" ON public.admins FOR SELECT USING (true);
CREATE POLICY "No direct inserts via anon/auth" ON public.admins FOR INSERT WITH CHECK (false);
CREATE POLICY "Admins can update themselves" ON public.admins FOR UPDATE USING (true);

-- Seed default admin (password: admin123 — CHANGE THIS IMMEDIATELY AFTER DEPLOYMENT)
-- Hash generated with bcrypt, rounds=12
INSERT INTO public.admins (email, password_hash, name)
VALUES (
  'admin@upscpathfinder.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.9kRUVzZ5wW9Wy',
  'Super Admin'
) ON CONFLICT (email) DO NOTHING;

-- ─── Indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_mcq_answers_user ON public.mcq_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_srs_user_card ON public.flashcard_srs(user_id, card_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_mcqs_topic ON public.mcqs(topic_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_importance ON public.news_articles(importance);
CREATE INDEX IF NOT EXISTS idx_flashcard_srs_next_review ON public.flashcard_srs(next_review);

-- ─── AI Evaluations ────────────────────────────────────────────────
CREATE TABLE public.ai_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  question TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  score INTEGER NOT NULL,
  relevance INTEGER NOT NULL,
  structure INTEGER NOT NULL,
  depth INTEGER NOT NULL,
  current_examples INTEGER NOT NULL,
  overall_feedback TEXT NOT NULL,
  improvement_points JSONB NOT NULL,
  suggested_keywords JSONB NOT NULL,
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own evaluations" ON public.ai_evaluations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own evaluations" ON public.ai_evaluations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_evaluations_user ON public.ai_evaluations(user_id, evaluated_at DESC);

-- ─── Seed Data ────────────────────────────────────────────────────
-- MCQs
INSERT INTO public.mcqs (id, topic_id, question, options, correct_option, explanation, source, year) VALUES
  ('11111111-1111-1111-1111-111111111101', 'gs1-heritage', 'The Indus Valley Civilization was primarily:', '["A river valley civilization along the Indus and its tributaries","A coastal civilization focused on maritime trade","A desert civilization centered around Rajasthan","A mountainous civilization of the Himalayan region"]'::jsonb, 0, 'The IVC was primarily a river valley civilization flourishing along the Indus River and its tributaries including the Ghaggar-Hakra river system.', 'Practice', NULL),
  ('11111111-1111-1111-1111-111111111102', 'gs1-heritage', 'Which of the following was NOT a characteristic of Harappan urban planning?', '["Grid-pattern streets","Advanced drainage system","Elaborate temple complexes","Uniform brick sizes"]'::jsonb, 2, 'The Harappans did not build elaborate temple complexes. Instead, they focused on functional civic structures like granaries, citadels, and residential areas with sophisticated drainage.', 'Practice', NULL),
  ('11111111-1111-1111-1111-111111111103', 'gs1-heritage', 'The concept of "Buddhist Councils" was primarily aimed at:', '["Electing the head of the Buddhist sangha","Compiling and standardizing Buddhist scriptures","Deciding on military campaigns against rival kingdoms","Establishing trade routes for Buddhist merchants"]'::jsonb, 1, 'The Buddhist Councils were convened to compile, recite, and standardize the Buddha''s teachings into the Tipitaka after his death.', 'Practice', NULL),
  ('11111111-1111-1111-1111-111111111104', 'gs2-constitution', 'The President of India can declare a financial emergency under Article 360:', '["Only on the advice of the Council of Ministers","On the President''s own discretion","On the advice of the Supreme Court","Only with Parliament''s prior approval"]'::jsonb, 0, 'Under Article 360, the President can declare financial emergency only on the written recommendation of the Council of Ministers headed by the PM.', 'Practice', NULL),
  ('11111111-1111-1111-1111-111111111105', 'gs2-constitution', 'The concept of "Basic Structure" of the Constitution was first established in:', '["Kesavananda Bharati case","Minerva Mills case","Golaknath case","Maneka Gandhi case"]'::jsonb, 0, 'The Supreme Court in Kesavananda Bharati v. State of Kerala first propounded the Basic Structure doctrine, ruling that Parliament cannot amend the basic features of the Constitution.', 'PYQ 2020', 2020),
  ('11111111-1111-1111-1111-111111111106', 'gs2-constitution', 'NITI Aayog replaced which body?', '["Finance Commission","Planning Commission","Economic Advisory Council","National Development Council"]'::jsonb, 1, 'NITI Aayog (National Institution for Transforming India) was established in 2015 replacing the Planning Commission, with a governing council of all Chief Ministers.', 'Practice', NULL),
  ('11111111-1111-1111-1111-111111111107', 'gs3-economy', 'The distinction between "revenue expenditure" and "capital expenditure" is based on:', '["The amount of spending","Whether the spending creates an asset or not","The sector of spending","The duration of the spending program"]'::jsonb, 1, 'Revenue expenditure does not create assets (e.g., salaries, subsidies) while capital expenditure creates assets (e.g., infrastructure, machinery). This distinction is critical for fiscal analysis.', 'Practice', NULL),
  ('11111111-1111-1111-1111-111111111108', 'gs3-economy', 'The GST Council is chaired by:', '["Finance Minister of India","Chief Economic Adviser","President of India","Law Minister of India"]'::jsonb, 0, 'The GST Council is chaired by the Union Finance Minister and includes the Union Minister of State for Revenue and all State Finance/Taxation Ministers.', 'Practice', NULL),
  ('11111111-1111-1111-1111-111111111109', 'gs3-environment', 'The "Kyoto Protocol" was adopted under which framework?', '["UNCLOS","UNFCCC","CITES","Montreal Protocol"]'::jsonb, 1, 'The Kyoto Protocol was adopted under the UN Framework Convention on Climate Change (UNFCCC) as the first legally binding international treaty on climate change mitigation.', 'PYQ 2022', 2022),
  ('11111111-1111-1111-1111-111111111110', 'gs3-scitech', 'Gaganyaan is India''s:', '["Mars mission program","Crewed orbital spacecraft program","Lunar exploration module","Military reconnaissance satellite"]'::jsonb, 1, 'Gaganyaan is India''s first crewed orbital spacecraft program, aimed at demonstrating human spaceflight capability by sending astronauts to orbit for up to 3 days.', 'PIB 2024', NULL),
  ('11111111-1111-1111-1111-111111111111', 'gs4-ethics', 'Which of the following is a key principle of ethical governance?', '["Procedural correctness","Transparency and accountability","Speed of decision-making only","Minimizing expenditure"]'::jsonb, 1, 'Ethical governance rests on transparency (openness in processes), accountability (answerability for actions), and integrity — these form the cornerstone of public administration ethics.', 'Practice', NULL),
  ('11111111-1111-1111-1111-111111111112', 'gs1-heritage', 'The "Saraswati Civilization" refers to:', '["Harappan culture along the Ghaggar-Hakra river","Vedic culture of Punjab plains","Mauryan empire along the Narmada","Chola empire in the south"]'::jsonb, 0, 'The Saraswati Civilization refers to the pre-historic and Harappan settlements along the Ghaggar-Hakra river system, identified with the mythical Vedic river Saraswati.', 'Practice', NULL),
  ('11111111-1111-1111-1111-111111111113', 'gs3-environment', 'India''s Intended Nationally Determined Contribution (INDC) targets include:', '["33-35% emission reduction by 2030 from 2005 levels","50% renewable energy capacity by 2030","Net zero by 2050","100% electric vehicle adoption by 2035"]'::jsonb, 0, 'India''s INDC submitted to UNFCCC includes: 33-35% emission intensity reduction vs 2005, 40% installed electric capacity from non-fossil sources, and forest cover creation.', 'Practice', NULL),
  ('11111111-1111-1111-1111-111111111114', 'gs3-scitech', 'The National Quantum Mission was approved by the Cabinet in:', '["2020","2021",2023,"2024"]'::jsonb, 2, 'The Union Cabinet approved the National Quantum Mission in April 2023, with a budget of ₹6,003 crore, to be implemented from 2023-2031.', 'Practice', 2023),
  ('11111111-1111-1111-1111-111111111115', 'csat-logic', 'If all roses are flowers and some flowers fade quickly, which conclusion is valid?', '["All roses fade quickly","Some roses fade quickly","No roses fade quickly","Some flowers are not roses"]'::jsonb, 1, 'Since some flowers fade quickly and all roses are flowers, it follows logically that at least some roses could be among those fading flowers. This is a valid syllogistic conclusion.', 'Practice', NULL),
  ('11111111-1111-1111-1111-111111111116', 'csat-data', 'A train covers 240 km in 4 hours. What is its speed in km/h?', '["50 km/h","60 km/h","70 km/h","80 km/h"]'::jsonb, 1, 'Speed = Distance / Time = 240 km / 4 hours = 60 km/h. This is basic speed calculation used frequently in CSAT arithmetic sections.', 'Practice', NULL);

-- News Articles
INSERT INTO public.news_articles (id, title, summary, source, published_at, linked_topics, tags, importance) VALUES
  ('22222222-2222-2222-2222-222222222201', 'India-EU Free Trade Agreement: Key Trade Barriers Removed After 7 Years of Negotiations', 'India and the EU concluded the long-pending FTA. The agreement covers goods, services, investment, and geographical indications.', 'The Hindu', NOW(), '["gs3-economy","gs2-governance"]'::jsonb, '["International Relations","Trade","Economy"]'::jsonb, 'high'),
  ('22222222-2222-2222-2222-222222222202', 'Supreme Court Landmark Ruling: Electoral Bonds Scheme Declared Unconstitutional', 'A five-judge bench struck down the Electoral Bonds Scheme as violative of Article 19(1)(a).', 'Indian Express', NOW() - INTERVAL '4 hours', '["gs2-constitution","gs2-governance"]'::jsonb, '["Polity","Supreme Court","Electoral Reform"]'::jsonb, 'high'),
  ('22222222-2222-2222-2222-222222222203', 'COP31 Host City Announced: Brazil to Host 2026 UN Climate Conference in Belém', 'COP31 will be held in Belém, Brazil — located in the Amazon basin. India reaffirmed its NDC targets.', 'PIB', NOW() - INTERVAL '6 hours', '["gs3-environment"]'::jsonb, '["Environment","Climate Change","International"]'::jsonb, 'high'),
  ('22222222-2222-2222-2222-222222222204', 'Gaganyaan Mission Update: ISRO Announces First Uncrewed Test by Q3 2026', 'ISRO Chairman announced the first uncrewed test flight of the Gaganyaan mission is scheduled for Q3 2026.', 'PIB', NOW() - INTERVAL '8 hours', '["gs3-scitech"]'::jsonb, '["Science & Technology","Space","ISRO"]'::jsonb, 'medium'),
  ('22222222-2222-2222-2222-222222222205', '53rd GST Council Meeting: Revisions to Tax Rates on Insurance Premiums & Renewable Energy', 'The GST Council approved revised rates on life insurance premiums (18% cap) and simplified rates for renewable energy components.', 'Economic Times', NOW() - INTERVAL '10 hours', '["gs3-economy"]'::jsonb, '["Economy","GST","Finance"]'::jsonb, 'medium');

-- Flashcards
INSERT INTO public.flashcards (id, topic_id, front, back) VALUES
  ('33333333-3333-3333-3333-333333333301', 'gs2-constitution', 'What is the minimum age to become the President of India?', '35 years (Article 58)'),
  ('33333333-3333-3333-3333-333333333302', 'gs2-constitution', 'Which article empowers the President to declare Financial Emergency?', 'Article 360 — can be declared if the financial stability or credit of India is threatened'),
  ('33333333-3333-3333-3333-333333333303', 'gs3-economy', 'What is the difference between Revenue Expenditure and Capital Expenditure?', 'Revenue expenditure does not create assets (salaries, subsidies). Capital expenditure creates assets (infrastructure, machinery). Both affect fiscal deficit differently.'),
  ('33333333-3333-3333-3333-333333333304', 'gs3-economy', 'What is the current FRBM target for fiscal deficit?', 'Fiscal deficit not exceeding 3% of GDP by FY 2025-26, with a roadmap of 0.5% reduction annually from 2021-22 levels.'),
  ('33333333-3333-3333-3333-333333333305', 'gs3-environment', 'What are the three pillars of sustainable development?', '1. Economic development 2. Social inclusion 3. Environmental sustainability (Brundtland Commission, 1987)'),
  ('33333333-3333-3333-3333-333333333306', 'gs3-scitech', 'What is the budget allocation for IndiaAI Mission?', '₹10,372 crore over 5 years (2024-2029), approved by Cabinet in March 2024'),
  ('33333333-3333-3333-3333-333333333307', 'gs4-ethics', 'What are the 5Cs of ethical leadership?', 'Character, Courage, Compassion, Conviction, Consistency'),
  ('33333333-3333-3333-3333-333333333308', 'gs1-heritage', 'What were the three phases of the Indus Valley Civilization?', '1. Early Harappan (3300-2600 BCE) 2. Mature Harappan (2600-1900 BCE) 3. Late Harappan (1900-1300 BCE)'),
  ('33333333-3333-3333-3333-333333333309', 'gs1-heritage', 'What is the difference between Mahajanapadas and Janapadas?', 'Mahajanapadas were 16 powerful kingdoms/republics (6th century BCE). Janapadas were earlier tribal territorial units where the Jana (people) settled.'),
  ('33333333-3333-3333-3333-333333333310', 'gs2-constitution', 'What is the minimum age for a member of Lok Sabha?', '25 years (Article 84)');
