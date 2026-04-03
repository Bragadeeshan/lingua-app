export type WordStatus = 'new' | 'learning' | 'review' | 'mastered';
export type WordType = 'new' | 'review';
export type UserRating = 'easy' | 'good' | 'hard' | 'wrong';
export type LessonStatus = 'in_progress' | 'completed' | 'skipped';

export interface Language {
  id: string;
  code: string;
  name: string;
  flag_emoji: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  native_language: string;
  target_language: string | null;
  daily_goal: number;
  current_streak: number;
  last_lesson_date: string | null;
  total_words_learned: number;
}

export interface Word {
  id: string;
  language_code: string;
  word: string;
  english_translation: string;
  phonetic: string | null;
  example_sentence: string | null;
  difficulty: number;
  category: string | null;
}

export interface UserWordProgress {
  id: string;
  user_id: string;
  word_id: string;
  status: WordStatus;
  correct_count: number;
  total_correct: number;
  total_attempts: number;
  ease_factor: number;
  interval_days: number;
  next_review_date: string | null;
}

export interface LessonWord {
  id: string;
  lesson_id: string;
  word_id: string;
  position: number;
  word_type: WordType;
  user_rating: UserRating | null;
  word: Word;
}

export interface Lesson {
  id: string;
  user_id: string;
  lesson_date: string;
  total_words: number;
  words_completed: number;
  game_score: number | null;
  game_total: number | null;
  status: LessonStatus;
  lesson_words: LessonWord[];
}

export interface GamePair {
  word_id: string;
  word: string;
  meaning: string;
}

export interface UserStats {
  new_words: number;
  learning: number;
  review: number;
  mastered: number;
  due_today: number;
  current_streak: number;
  total_words_learned: number;
}
