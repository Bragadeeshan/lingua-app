import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getProfile, saveLesson, saveProgress, SPANISH_WORDS, generateUUID } from '../../services/localStore';
import { FlashCard } from '../../components/FlashCard';
import { MatchGame } from '../../components/MatchGame';
import { Word, Lesson, GamePair } from '../../types';

type Phase = 'loading' | 'flashcards' | 'game' | 'complete';

export default function LearnScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gamePairs, setGamePairs] = useState<GamePair[]>([]);
  const [gameMeanings, setGameMeanings] = useState<string[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    loadLesson();
  }, []);

  async function loadLesson() {
    try {
      const profile = await getProfile();
      if (!profile?.target_language) {
        router.replace('/onboarding');
        return;
      }

      const allWords = SPANISH_WORDS.filter(w => w.language_code === profile.target_language);
      
      // Get words not yet learned
      const learnedWords: string[] = [];
      
      // Create lesson with words
      const lessonWords: any[] = allWords.slice(0, profile.daily_goal || 10).map((w, i) => ({
        id: generateUUID(),
        word_id: w.id,
        position: i,
        word_type: 'new' as const,
        word: w,
      }));

      const newLesson: Lesson = {
        id: generateUUID(),
        user_id: profile.id,
        lesson_date: new Date().toISOString().split('T')[0],
        total_words: lessonWords.length,
        words_completed: 0,
        game_score: null,
        game_total: null,
        status: 'in_progress',
        lesson_words: lessonWords,
      };

      await saveLesson(newLesson);
      setLesson(newLesson);
      setWords(lessonWords);
      setPhase('flashcards');
    } catch (error) {
      console.error('Error loading lesson:', error);
    }
  }

  const handleRating = async (rating: string) => {
    if (!lesson || !words[currentIndex]) return;

    const currentWord = words[currentIndex];
    
    // Save progress
    await saveProgress(currentWord.word.id, {
      status: rating === 'hard' || rating === 'wrong' ? 'learning' : 'review',
      last_rating: rating,
      last_reviewed: new Date().toISOString(),
    });

    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Start game
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      const pairs: GamePair[] = shuffled.map(w => ({
        word_id: w.word.id,
        word: w.word.word,
        meaning: w.word.english_translation,
      }));
      const meanings = [...pairs].sort(() => Math.random() - 0.5).map(p => p.meaning);
      
      setGamePairs(pairs);
      setGameMeanings(meanings);
      setPhase('game');
    }
  };

  const handleGameComplete = async (correct: number, total: number) => {
    if (!lesson) return;

    const updatedLesson = {
      ...lesson,
      status: 'completed' as const,
      words_completed: lesson.total_words,
      game_score: correct,
      game_total: total,
    };
    
    await saveLesson(updatedLesson);

    router.replace({
      pathname: '/results',
      params: {
        wordsLearned: lesson.total_words,
        wordsReviewed: 0,
        gameScore: correct,
        gameTotal: total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      },
    });
  };

  if (phase === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Preparing your lesson...</Text>
      </View>
    );
  }

  if (phase === 'complete') {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.completeTitle}>All Caught Up!</Text>
        <Text style={styles.completeText}>
          You've completed all available words. Check back tomorrow!
        </Text>
      </View>
    );
  }

  if (phase === 'game') {
    return (
      <View style={styles.gameContainer}>
        <View style={styles.gameHeader}>
          <Text style={styles.gameTitle}>Matching Game</Text>
          <Text style={styles.gameSubtitle}>Match words to their meanings</Text>
        </View>
        <MatchGame
          pairs={gamePairs}
          meanings={gameMeanings}
          onComplete={handleGameComplete}
        />
      </View>
    );
  }

  const currentWord = words[currentIndex]?.word;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>
          Word {currentIndex + 1} of {words.length}
        </Text>
        <View style={[styles.badge, styles.newBadge]}>
          <Text style={styles.badgeText}>📖 New Word</Text>
        </View>
      </View>

      {currentWord && (
        <FlashCard word={currentWord} onRate={handleRating} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748B' },
  emoji: { fontSize: 64, marginBottom: 16 },
  completeTitle: { fontSize: 24, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  completeText: { fontSize: 16, color: '#64748B', textAlign: 'center' },
  header: { padding: 16, alignItems: 'center' },
  progressText: { fontSize: 16, color: '#64748B', marginBottom: 12 },
  badge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  newBadge: { backgroundColor: '#DBEAFE' },
  badgeText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  gameContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  gameHeader: { padding: 16, paddingBottom: 8, alignItems: 'center' },
  gameTitle: { fontSize: 20, fontWeight: '600', color: '#1E293B' },
  gameSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
});
