import { Language } from '../types';

export const LANGUAGES: Language[] = [
  { id: '1', code: 'es', name: 'Spanish', flag_emoji: '🇪🇸' },
  { id: '2', code: 'fr', name: 'French', flag_emoji: '🇫🇷' },
  { id: '3', code: 'de', name: 'German', flag_emoji: '🇩🇪' },
  { id: '4', code: 'it', name: 'Italian', flag_emoji: '🇮🇹' },
  { id: '5', code: 'pt', name: 'Portuguese', flag_emoji: '🇵🇹' },
];

export const DAILY_GOALS = [5, 10, 15, 20, 25];

export const STATUS_COLORS = {
  new: '#3B82F6',
  learning: '#F59E0B',
  review: '#8B5CF6',
  mastered: '#10B981',
};
