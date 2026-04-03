import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getProfile, getUserStats, getTodayLesson } from '../../services/localStore';
import { UserStats, Lesson } from '../types';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [todayLesson, setTodayLesson] = useState<Lesson | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const profileData = await getProfile();
      
      if (!profileData?.target_language) {
        router.replace('/onboarding');
        return;
      }
      
      setProfile(profileData);
      
      const [userStats, lesson] = await Promise.all([
        getUserStats(),
        getTodayLesson(),
      ]);
      
      setStats(userStats);
      setTodayLesson(lesson);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const isCompleted = todayLesson?.status === 'completed';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Streak Card */}
      <View style={styles.streakCard}>
        <View style={styles.streakLeft}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakNumber}>{stats?.current_streak || 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
        <View style={styles.streakRight}>
          <Text style={styles.statNumber}>{stats?.total_words_learned || 0}</Text>
          <Text style={styles.statLabel}>Words Learned</Text>
        </View>
      </View>

      {/* Today's Lesson */}
      <View style={styles.lessonCard}>
        <Text style={styles.cardTitle}>Today's Lesson</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </Text>

        {isCompleted ? (
          <View style={styles.completed}>
            <Text style={styles.completedEmoji}>✅</Text>
            <Text style={styles.completedText}>Lesson Complete!</Text>
            <Text style={styles.completedSub}>
              {todayLesson?.game_score}/{todayLesson?.game_total} matches
            </Text>
          </View>
        ) : todayLesson ? (
          <View style={styles.progressSection}>
            <Text style={styles.wordCount}>
              {todayLesson.total_words - (todayLesson.words_completed || 0)} words left
            </Text>
          </View>
        ) : (
          <Text style={styles.wordCount}>{profile?.daily_goal || 10} words to learn</Text>
        )}

        <TouchableOpacity
          style={[styles.button, isCompleted && styles.reviewBtn]}
          onPress={() => router.push('/(tabs)/learn')}
        >
          <Text style={styles.buttonText}>
            {isCompleted ? 'Practice Again' : todayLesson ? 'Continue' : 'Start Lesson'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={[styles.gridNumber, { color: '#3B82F6' }]}>{stats?.new_words || 0}</Text>
          <Text style={styles.gridLabel}>New</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.gridNumber, { color: '#F59E0B' }]}>{stats?.learning || 0}</Text>
          <Text style={styles.gridLabel}>Learning</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.gridNumber, { color: '#8B5CF6' }]}>{stats?.due_today || 0}</Text>
          <Text style={styles.gridLabel}>Due</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.gridNumber, { color: '#10B981' }]}>{stats?.mastered || 0}</Text>
          <Text style={styles.gridLabel}>Mastered</Text>
        </View>
      </View>

      {/* Due Today */}
      {(stats?.due_today || 0) > 0 && !isCompleted && (
        <View style={styles.dueCard}>
          <Text style={styles.dueText}>{(stats?.due_today || 0)} words due for review</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/review')}>
            <Text style={styles.dueLink}>Start Review →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  button: { backgroundColor: '#3B82F6', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  streakCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakEmoji: { fontSize: 40 },
  streakNumber: { fontSize: 32, fontWeight: '700', color: '#1E293B' },
  streakLabel: { fontSize: 14, color: '#64748B' },
  streakRight: { alignItems: 'flex-end' },
  statNumber: { fontSize: 24, fontWeight: '600', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#64748B' },
  lessonCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: '600', color: '#1E293B' },
  date: { fontSize: 14, color: '#64748B', marginTop: 2, marginBottom: 16 },
  completed: { alignItems: 'center', paddingVertical: 16 },
  completedEmoji: { fontSize: 40, marginBottom: 8 },
  completedText: { fontSize: 18, fontWeight: '600', color: '#10B981' },
  completedSub: { fontSize: 14, color: '#64748B', marginTop: 4 },
  progressSection: { marginBottom: 16 },
  wordCount: { fontSize: 24, fontWeight: '600', color: '#1E293B', marginBottom: 16 },
  reviewBtn: { backgroundColor: '#8B5CF6' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  gridNumber: { fontSize: 24, fontWeight: '700' },
  gridLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  dueCard: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dueText: { fontSize: 14, color: '#92400E', flex: 1 },
  dueLink: { fontSize: 14, fontWeight: '600', color: '#D97706' },
});
