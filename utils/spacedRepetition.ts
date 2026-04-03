import { UserRating, UserWordProgress, WordStatus } from '../types';

const MIN_EASE = 1.3;
const MAX_EASE = 2.5;
const MAX_INTERVAL = 30;

export function calculateNextReview(
  progress: Partial<UserWordProgress>,
  rating: UserRating
): { intervalDays: number; easeFactor: number; correctCount: number; status: WordStatus } {
  const ease = progress.ease_factor ?? 2.5;
  const interval = progress.interval_days ?? 0;
  const correct = progress.correct_count ?? 0;

  let newInterval: number;
  let newEase: number;
  let newCorrect: number;

  switch (rating) {
    case 'easy':
      newInterval = Math.min(interval * ease * 1.3, MAX_INTERVAL) || 3;
      newEase = Math.min(ease + 0.15, MAX_EASE);
      newCorrect = correct + 2;
      break;
    case 'good':
      newInterval = Math.min(interval * ease, MAX_INTERVAL) || 1;
      newEase = Math.min(ease + 0.1, MAX_EASE);
      newCorrect = correct + 1;
      break;
    case 'hard':
    case 'wrong':
      newInterval = 1;
      newEase = Math.max(ease - 0.2, MIN_EASE);
      newCorrect = 0;
      break;
    default:
      return { intervalDays: interval, easeFactor: ease, correctCount: correct, status: 'new' };
  }

  const status: WordStatus = newCorrect >= 4 && newInterval >= 14 ? 'mastered' : 
                              newCorrect >= 1 ? 'review' : 'learning';

  return {
    intervalDays: Math.round(Math.max(1, newInterval)),
    easeFactor: newEase,
    correctCount: newCorrect,
    status,
  };
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
