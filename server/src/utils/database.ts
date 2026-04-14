// Supabase typed database types

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow>;
        Update: Partial<ProfileRow>;
      };
      mcqs: {
        Row: MCQRow;
        Insert: Partial<MCQRow>;
        Update: Partial<MCQRow>;
      };
      mcq_answers: {
        Row: MCQAnswerRow;
        Insert: Partial<MCQAnswerRow>;
        Update: Partial<MCQAnswerRow>;
      };
      practice_stats: {
        Row: PracticeStatsRow;
        Insert: Partial<PracticeStatsRow>;
        Update: Partial<PracticeStatsRow>;
      };
      flashcards: {
        Row: FlashcardRow;
        Insert: Partial<FlashcardRow>;
        Update: Partial<FlashcardRow>;
      };
      flashcard_srs: {
        Row: FlashcardSRSRow;
        Insert: Partial<FlashcardSRSRow>;
        Update: Partial<FlashcardSRSRow>;
      };
      community_posts: {
        Row: CommunityPostRow;
        Insert: Partial<CommunityPostRow>;
        Update: Partial<CommunityPostRow>;
      };
      comments: {
        Row: CommentRow;
        Insert: Partial<CommentRow>;
        Update: Partial<CommentRow>;
      };
      news_articles: {
        Row: NewsArticleRow;
        Insert: Partial<NewsArticleRow>;
        Update: Partial<NewsArticleRow>;
      };
      bookmarks: {
        Row: BookmarkRow;
        Insert: Partial<BookmarkRow>;
        Update: Partial<BookmarkRow>;
      };
      topic_progress: {
        Row: TopicProgressRow;
        Insert: Partial<TopicProgressRow>;
        Update: Partial<TopicProgressRow>;
      };
      study_streaks: {
        Row: StudyStreakRow;
        Insert: Partial<StudyStreakRow>;
        Update: Partial<StudyStreakRow>;
      };
    };
  };
}

export interface ProfileRow {
  id: string;
  email: string;
  name: string;
  exam_stage: string;
  target_year: number;
  optional_subject: string | null;
  daily_goal_minutes: number;
  streak_days: number;
  xp: number;
  created_at: string;
  updated_at: string;
}

export interface MCQRow {
  id: string;
  topic_id: string;
  question: string;
  options: string[];
  correct_option: number;
  explanation: string;
  source: string;
  year: number | null;
  paper: string | null;
  created_at: string;
}

export interface MCQAnswerRow {
  id: string;
  user_id: string;
  mcq_id: string;
  selected_option: number;
  is_correct: boolean;
  answered_at: string;
}

export interface PracticeStatsRow {
  id: string;
  user_id: string;
  total_attempted: number;
  correct_answers: number;
  accuracy: number;
  weak_topics: string[];
  strong_topics: string[];
  last_updated: string;
}

export interface FlashcardRow {
  id: string;
  topic_id: string;
  front: string;
  back: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string | null;
  last_reviewed: string | null;
  created_at: string;
}

export interface FlashcardSRSRow {
  id: string;
  user_id: string;
  card_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  last_reviewed: string;
}

export interface CommunityPostRow {
  id: string;
  user_id: string;
  author_name: string;
  author_title: string | null;
  type: string;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  comments: number;
  views: number;
  is_pinned: boolean;
  created_at: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  body: string;
  upvotes: number;
  created_at: string;
}

export interface NewsArticleRow {
  id: string;
  title: string;
  summary: string;
  source: string | null;
  published_at: string | null;
  linked_topics: string[];
  tags: string[];
  importance: string;
  url: string | null;
  created_at: string;
}

export interface BookmarkRow {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  created_at: string;
}

export interface TopicProgressRow {
  id: string;
  user_id: string;
  topic_id: string;
  completed_subtopics: number;
  total_subtopics: number;
  percent_complete: number;
  last_studied: string;
  mcq_score: number | null;
  notes_read_count: number;
  created_at: string;
  updated_at: string;
}

export interface StudyStreakRow {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_active_days: number;
}
