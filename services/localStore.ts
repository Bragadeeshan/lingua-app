import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, UserStats, Lesson, LessonWord, Word } from '../types';

const PROFILE_KEY = '@lingua_profile';
const PROGRESS_KEY = '@lingua_progress';
const LESSONS_KEY = '@lingua_lessons';

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export async function getUserId(): Promise<string | null> {
  try {
    const profile = await AsyncStorage.getItem(PROFILE_KEY);
    if (profile) {
      const p = JSON.parse(profile);
      return p.id;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getOrCreateUserId(): Promise<string> {
  try {
    let profile = await AsyncStorage.getItem(PROFILE_KEY);
    if (profile) {
      const p = JSON.parse(profile);
      return p.id;
    }
    return generateUUID();
  } catch {
    return generateUUID();
  }
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: Partial<Profile> & { id: string }): Promise<void> {
  const existing = await getProfile();
  const updated = { ...existing, ...profile, updated_at: new Date().toISOString() };
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
}

export async function getWordsForReview(): Promise<any[]> {
  try {
    const data = await AsyncStorage.getItem(PROGRESS_KEY);
    const progress = data ? JSON.parse(data) : [];
    const today = new Date().toISOString().split('T')[0];
    
    return progress.filter((p: any) => 
      p.next_review_date && p.next_review_date <= today && p.status !== 'mastered'
    );
  } catch {
    return [];
  }
}

export async function getUserStats(): Promise<UserStats> {
  const profile = await getProfile();
  try {
    const data = await AsyncStorage.getItem(PROGRESS_KEY);
    const progress = data ? JSON.parse(data) : [];
    const today = new Date().toISOString().split('T')[0];
    
    const stats: UserStats = {
      new_words: 0,
      learning: 0,
      review: 0,
      mastered: 0,
      due_today: 0,
      current_streak: profile?.current_streak || 0,
      total_words_learned: progress.length,
    };
    
    progress.forEach((p: any) => {
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
  } catch {
    return {
      new_words: 0,
      learning: 0,
      review: 0,
      mastered: 0,
      due_today: 0,
      current_streak: profile?.current_streak || 0,
      total_words_learned: 0,
    };
  }
}

export async function getTodayLesson(): Promise<Lesson | null> {
  try {
    const data = await AsyncStorage.getItem(LESSONS_KEY);
    const lessons = data ? JSON.parse(data) : [];
    const today = new Date().toISOString().split('T')[0];
    
    return lessons.find((l: any) => l.lesson_date === today) || null;
  } catch {
    return null;
  }
}

export async function saveLesson(lesson: Lesson): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(LESSONS_KEY);
    const lessons = data ? JSON.parse(data) : [];
    
    const index = lessons.findIndex((l: any) => l.id === lesson.id);
    if (index >= 0) {
      lessons[index] = lesson;
    } else {
      lessons.push(lesson);
    }
    
    await AsyncStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  } catch (e) {
    console.error('Error saving lesson:', e);
  }
}

export async function getProgress(wordId: string): Promise<any | null> {
  try {
    const data = await AsyncStorage.getItem(PROGRESS_KEY);
    const progress = data ? JSON.parse(data) : [];
    return progress.find((p: any) => p.word_id === wordId) || null;
  } catch {
    return null;
  }
}

export async function saveProgress(wordId: string, updates: any): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(PROGRESS_KEY);
    const progress = data ? JSON.parse(data) : [];
    
    const index = progress.findIndex((p: any) => p.word_id === wordId);
    if (index >= 0) {
      progress[index] = { ...progress[index], ...updates };
    } else {
      progress.push({ word_id: wordId, ...updates });
    }
    
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress:', e);
  }
}

// Spanish words for offline use
export const SPANISH_WORDS: Word[] = [
  { id: '1', language_code: 'es', word: 'Hola', english_translation: 'Hello', phonetic: 'OH-lah', example_sentence: '¡Hola, buenos días!', difficulty: 1, category: 'greetings' },
  { id: '2', language_code: 'es', word: 'Adiós', english_translation: 'Goodbye', phonetic: 'ah-dee-OHS', example_sentence: 'Adiós, hasta mañana.', difficulty: 1, category: 'greetings' },
  { id: '3', language_code: 'es', word: 'Gracias', english_translation: 'Thank you', phonetic: 'GRAH-see-ahs', example_sentence: 'Muchas gracias.', difficulty: 1, category: 'greetings' },
  { id: '4', language_code: 'es', word: 'Por favor', english_translation: 'Please', phonetic: 'pohr fah-BOHR', example_sentence: 'Agua, por favor.', difficulty: 1, category: 'greetings' },
  { id: '5', language_code: 'es', word: 'Buenos días', english_translation: 'Good morning', phonetic: 'BWEH-nohs DEE-ahs', example_sentence: 'Buenos días.', difficulty: 1, category: 'greetings' },
  { id: '6', language_code: 'es', word: '¿Cómo estás?', english_translation: 'How are you?', phonetic: 'KOH-moh ehs-TAHS', example_sentence: '¿Cómo estás hoy?', difficulty: 1, category: 'phrases' },
  { id: '7', language_code: 'es', word: 'Muy bien', english_translation: 'Very well', phonetic: 'mwee bee-EHN', example_sentence: 'Estoy muy bien.', difficulty: 1, category: 'phrases' },
  { id: '8', language_code: 'es', word: 'No entiendo', english_translation: 'I do not understand', phonetic: 'noh ehn-tee-EHN-doh', example_sentence: 'No entiendo.', difficulty: 1, category: 'phrases' },
  { id: '9', language_code: 'es', word: 'Uno', english_translation: 'One', phonetic: 'OO-noh', example_sentence: 'Tengo uno.', difficulty: 1, category: 'numbers' },
  { id: '10', language_code: 'es', word: 'Dos', english_translation: 'Two', phonetic: 'dohs', example_sentence: 'Necesito dos.', difficulty: 1, category: 'numbers' },
  { id: '11', language_code: 'es', word: 'Tres', english_translation: 'Three', phonetic: 'trehs', example_sentence: 'Tengo tres.', difficulty: 1, category: 'numbers' },
  { id: '12', language_code: 'es', word: 'Agua', english_translation: 'Water', phonetic: 'AH-gwah', example_sentence: 'Un vaso de agua.', difficulty: 1, category: 'food' },
  { id: '13', language_code: 'es', word: 'Café', english_translation: 'Coffee', phonetic: 'kah-FEH', example_sentence: 'Un café, por favor.', difficulty: 1, category: 'food' },
  { id: '14', language_code: 'es', word: 'Pan', english_translation: 'Bread', phonetic: 'pahn', example_sentence: 'Me gusta el pan.', difficulty: 1, category: 'food' },
  { id: '15', language_code: 'es', word: 'Ser', english_translation: 'To be', phonetic: 'sehr', example_sentence: 'Yo soy estudiante.', difficulty: 1, category: 'verbs' },
  { id: '16', language_code: 'es', word: 'Tener', english_translation: 'To have', phonetic: 'teh-NEHR', example_sentence: 'Tengo mucho trabajo.', difficulty: 1, category: 'verbs' },
  { id: '17', language_code: 'es', word: 'Casa', english_translation: 'House', phonetic: 'KAH-sah', example_sentence: 'Mi casa es grande.', difficulty: 1, category: 'nouns' },
  { id: '18', language_code: 'es', word: 'Amigo', english_translation: 'Friend', phonetic: 'ah-MEE-goh', example_sentence: 'Él es mi amigo.', difficulty: 1, category: 'nouns' },
  { id: '19', language_code: 'es', word: 'Dinero', english_translation: 'Money', phonetic: 'dee-NEH-roh', example_sentence: 'Necesito más dinero.', difficulty: 1, category: 'nouns' },
  { id: '20', language_code: 'es', word: 'Grande', english_translation: 'Big', phonetic: 'GRAHN-deh', example_sentence: 'Esta casa es grande.', difficulty: 1, category: 'adjectives' },
];

export async function getWordsForLanguage(languageCode: string): Promise<Word[]> {
  return SPANISH_WORDS.filter(w => w.language_code === languageCode);
}
