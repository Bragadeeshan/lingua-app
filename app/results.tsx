import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const wordsLearned = parseInt(params.wordsLearned as string) || 0;
  const wordsReviewed = parseInt(params.wordsReviewed as string) || 0;
  const gameScore = parseInt(params.gameScore as string) || 0;
  const gameTotal = parseInt(params.gameTotal as string) || 0;
  const accuracy = parseInt(params.accuracy as string) || 0;

  const getEmoji = () => {
    if (accuracy >= 90) return '🏆';
    if (accuracy >= 70) return '🌟';
    if (accuracy >= 50) return '👍';
    return '💪';
  };

  const getMessage = () => {
    if (accuracy >= 90) return 'Outstanding!';
    if (accuracy >= 70) return 'Great job!';
    if (accuracy >= 50) return 'Good effort!';
    return 'Keep practicing!';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.resultCard}>
        <Text style={styles.emoji}>{getEmoji()}</Text>
        <Text style={styles.message}>{getMessage()}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{wordsLearned}</Text>
          <Text style={styles.statLabel}>New Words</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{wordsReviewed}</Text>
          <Text style={styles.statLabel}>Reviewed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{gameScore}/{gameTotal}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: accuracy >= 70 ? '#10B981' : '#EF4444' }]}>
            {accuracy}%
          </Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </View>

      <View style={styles.nextSteps}>
        <Text style={styles.nextTitle}>What happens next?</Text>
        
        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review Scheduled</Text>
            <Text style={styles.stepDesc}>Words you got right will be reviewed later. Words you struggled with will appear sooner.</Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Come Back Tomorrow</Text>
            <Text style={styles.stepDesc}>Your daily lesson will have new words plus any due reviews.</Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Keep Your Streak</Text>
            <Text style={styles.stepDesc}>Practice every day to build your streak.</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.primaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 32 },
  resultCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  emoji: { fontSize: 64, marginBottom: 16 },
  message: { fontSize: 28, fontWeight: '700', color: '#1E293B' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  nextSteps: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  nextTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 16 },
  step: { flexDirection: 'row', marginBottom: 16 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepNumText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  stepDesc: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  actions: { gap: 12 },
  primaryBtn: { backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
});
