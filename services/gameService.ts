import { GamePair } from '../types';

export function createGamePairs(words: any[]): { pairs: GamePair[]; meanings: string[] } {
  const pairs: GamePair[] = words.slice(0, 8).map(w => ({
    word_id: w.word_id || w.word?.id,
    word: w.word?.word || w.word,
    meaning: w.word?.english_translation || w.english_translation,
  }));

  const meanings = shuffle([...pairs].map(p => p.meaning));

  return { pairs, meanings };
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function validateMatch(word: GamePair, meaning: string): boolean {
  return word.meaning === meaning;
}
