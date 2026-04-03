import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getWordsForReview, getProfile } from '../../services/localStore';
import { createGamePairs } from '../../services/gameService';
import { MatchGame } from '../../components/MatchGame';
import { GamePair } from '../../types';

export default function ReviewScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviewWords, setReviewWords] = useState<any[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePairs, setGamePairs] = useState<GamePair[]>([]);
  const [gameMeanings, setGameMeanings] = useState<string[]>([]);

  useEffect(() => {
    loadReview();
  }, []);

  async function loadReview() {
    try {
      const profile = await getProfile();
      if (!profile?.target_language) {
        router.replace('/onboarding');
        return;
      }

      const words = await getWordsForReview();
      setReviewWords(words);
    } catch (error) {
      console.error('Error loading review:', error);
    } finally {
      setLoading(false);
    }
  }

  const startGame = () => {
    const { pairs, meanings } = createGamePairs(reviewWords);
    setGamePairs(pairs);
    setGameMeanings(meanings);
    setGameStarted(true);
  };

  const handleGameComplete = (correct: number, total: number) => {
    router.replace({
      pathname: '/results',
      params: {
        wordsLearned: 0,
        wordsReviewed: reviewWords.length,
        gameScore: correct,
        gameTotal: total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (reviewWords.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>No Words Due</Text>
        <Text style={styles.subtitle}>
          Great job! You've reviewed all your due words.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (gameStarted) {
    return (
      <MatchGame pairs={gamePairs} meanings={gameMeanings} onComplete={handleGameComplete} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Review</Text>
        <Text style={styles.subtitle}>Practice with a matching game</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.countLabel}>Words to review</Text>
        <Text style={styles.count}>{reviewWords.length}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Start Review Game</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.skipText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center' },
  button: { backgroundColor: '#8B5CF6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 24 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  header: { marginBottom: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  countLabel: { fontSize: 16, color: '#64748B' },
  count: { fontSize: 48, fontWeight: '700', color: '#8B5CF6', marginTop: 8 },
  footer: { marginTop: 'auto', gap: 12 },
  startButton: { backgroundColor: '#8B5CF6', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  startButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  skipText: { color: '#64748B', fontSize: 16, textAlign: 'center', paddingVertical: 12 },
});
