import { supabase } from './supabase';
import { Lesson, LessonWord, UserRating, Word } from '../types';
import { calculateNextReview, formatDate, addDays } from '../utils/spacedRepetition';

export async function generateDailyLesson(userId: string, dailyGoal: number, targetLanguage: string): Promise<Lesson | null> {
  const today = formatDate(new Date());

  // Check existing lesson
  const { data: existing } = await supabase
    .from('lessons')
    .select('*, lesson_words(*, word:words(*))')
    .eq('user_id', userId)
    .eq('lesson_date', today)
    .single();

  if (existing) return existing;

  // Get words due for review
  const { data: dueReviews } = await supabase
    .from('user_word_progress')
    .select('word_id')
    .eq('user_id', userId)
    .lte('next_review_date', today)
    .neq('status', 'mastered');

  const reviewIds = (dueReviews || []).map(r => r.word_id);

  // Get new words
  const { data: studied } = await supabase
    .from('user_word_progress')
    .select('word_id')
    .eq('user_id', userId);

  const studiedIds = (studied || []).map(s => s.word_id);
  const excludeIds = [...new Set([...reviewIds, ...studiedIds])];

  let newWordsQuery = supabase
    .from('words')
    .select('*')
    .eq('language_code', targetLanguage)
    .limit(dailyGoal);

  if (excludeIds.length > 0) {
    newWordsQuery = newWordsQuery.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data: newWords } = await newWordsQuery;

  // Build lesson words
  const lessonWords: { word_id: string; is_new: boolean }[] = [];
  const addedIds = new Set<string>();

  // Add new words (80%)
  const targetNew = Math.ceil(dailyGoal * 0.8);
  for (const w of (newWords || []).slice(0, targetNew)) {
    if (!addedIds.has(w.id)) {
      lessonWords.push({ word_id: w.id, is_new: true });
      addedIds.add(w.id);
    }
  }

  // Add review words (20%)
  const needed = dailyGoal - lessonWords.length;
  for (const id of reviewIds.slice(0, needed)) {
    if (!addedIds.has(id)) {
      lessonWords.push({ word_id: id, is_new: false });
      addedIds.add(id);
    }
  }

  // Shuffle
  for (let i = lessonWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lessonWords[i], lessonWords[j]] = [lessonWords[j], lessonWords[i]];
  }

  if (lessonWords.length === 0) return null;

  // Create lesson
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .insert({
      user_id: userId,
      lesson_date: today,
      total_words: lessonWords.length,
      status: 'in_progress',
    })
    .select()
    .single();

  if (lessonError || !lesson) return null;

  // Create lesson words
  const lessonWordsInsert = lessonWords.map((lw, i) => ({
    lesson_id: lesson.id,
    word_id: lw.word_id,
    position: i,
    word_type: lw.is_new ? 'new' : 'review',
  }));

  await supabase.from('lesson_words').insert(lessonWordsInsert);

  // Create progress for new words
  for (const lw of lessonWords.filter(l => l.is_new)) {
    await supabase.from('user_word_progress').insert({
      user_id: userId,
      word_id: lw.word_id,
      status: 'new',
      correct_count: 0,
      total_correct: 0,
      total_attempts: 0,
      ease_factor: 2.5,
      interval_days: 0,
      next_review_date: today,
    });
  }

  // Fetch full lesson with words
  const { data: fullLesson } = await supabase
    .from('lessons')
    .select('*, lesson_words(*, word:words(*))')
    .eq('id', lesson.id)
    .single();

  return fullLesson;
}

export async function updateFlashcardRating(
  lessonWordId: string,
  wordId: string,
  userId: string,
  rating: UserRating
): Promise<void> {
  const today = formatDate(new Date());

  // Update lesson word
  await supabase.from('lesson_words').update({ user_rating: rating }).eq('id', lessonWordId);

  // Get progress
  const { data: progress } = await supabase
    .from('user_word_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .single();

  const review = calculateNextReview(progress || {}, rating);
  const nextDate = formatDate(addDays(new Date(), review.intervalDays));

  if (progress) {
    await supabase
      .from('user_word_progress')
      .update({
        ...review,
        total_attempts: (progress.total_attempts || 0) + 1,
        total_correct: (rating === 'easy' || rating === 'good')
          ? (progress.total_correct || 0) + 1
          : progress.total_correct,
        next_review_date: nextDate,
      })
      .eq('id', progress.id);
  }
}

export async function completeLesson(lessonId: string, userId: string, gameScore: number, gameTotal: number): Promise<void> {
  const today = formatDate(new Date());

  await supabase
    .from('lessons')
    .update({
      status: 'completed',
      words_completed: gameTotal > 0 ? gameTotal : 0,
      game_score: gameScore,
      game_total: gameTotal,
    })
    .eq('id', lessonId);

  // Update user streak
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  
  if (profile) {
    const isConsecutive = profile.last_lesson_date === formatDate(addDays(new Date(), -1));
    const newStreak = isConsecutive ? profile.current_streak + 1 : 1;

    await supabase
      .from('profiles')
      .update({
        current_streak: newStreak,
        last_lesson_date: today,
        total_words_learned: (profile.total_words_learned || 0) + 1,
      })
      .eq('id', userId);
  }
}
