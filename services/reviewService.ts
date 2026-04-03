import { supabase } from './supabase';
import { UserWordProgress, Word, UserStats } from '../types';

export async function getWordsForReview(userId: string, limit: number = 20) {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('user_word_progress')
    .select('*, word:words(*)')
    .eq('user_id', userId)
    .lte('next_review_date', today)
    .neq('status', 'mastered')
    .order('next_review_date')
    .limit(limit);

  return data || [];
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_streak, total_words_learned, target_language')
    .eq('id', userId)
    .single();

  const { data: progress } = await supabase
    .from('user_word_progress')
    .select('status, next_review_date')
    .eq('user_id', userId);

  const today = new Date().toISOString().split('T')[0];

  const stats: UserStats = {
    new_words: 0,
    learning: 0,
    review: 0,
    mastered: 0,
    due_today: 0,
    current_streak: profile?.current_streak || 0,
    total_words_learned: profile?.total_words_learned || 0,
  };

  (progress || []).forEach(p => {
    switch (p.status) {
      case 'new': stats.new_words++; break;
      case 'learning': stats.learning++; break;
      case 'review': stats.review++; break;
      case 'mastered': stats.mastered++; break;
    }
    if (p.next_review_date && p.next_review_date <= today && p.status !== 'mastered') {
      stats.due_today++;
    }
  });

  return stats;
}

export async function getTodayLesson(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('lessons')
    .select('*, lesson_words(*, word:words(*))')
    .eq('user_id', userId)
    .eq('lesson_date', today)
    .single();

  return data;
}
