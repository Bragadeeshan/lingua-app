import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getUserStats } from '../../services/localStore';
import { UserStats } from '../types';

export default function StatsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const userStats = await getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const totalWords = (stats?.new_words || 0) + (stats?.learning || 0) + 
                     (stats?.review || 0) + (stats?.mastered || 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Overview */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Progress</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridNumber}>{stats?.current_streak || 0}</Text>
            <Text style={styles.gridLabel}>Day Streak</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridNumber}>{totalWords}</Text>
            <Text style={styles.gridLabel}>Total Words</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridNumber}>{stats?.total_words_learned || 0}</Text>
            <Text style={styles.gridLabel}>Learned</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridNumber}>{stats?.mastered || 0}</Text>
            <Text style={styles.gridLabel}>Mastered</Text>
          </View>
        </View>
      </View>

      {/* Word Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Word Status</Text>
        
        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.statusLabel}>New</Text>
          </View>
          <Text style={styles.statusCount}>{stats?.new_words || 0}</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statusLabel}>Learning</Text>
          </View>
          <Text style={styles.statusCount}>{stats?.learning || 0}</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <View style={[styles.dot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.statusLabel}>Review</Text>
          </View>
          <Text style={styles.statusCount}>{stats?.review || 0}</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusLabel}>Mastered</Text>
          </View>
          <Text style={styles.statusCount}>{stats?.mastered || 0}</Text>
        </View>
      </View>

      {/* Today */}
      <View style={styles.dueCard}>
        <Text style={styles.cardTitle}>Today</Text>
        <View style={styles.dueInfo}>
          <Text style={styles.dueNumber}>{stats?.due_today || 0}</Text>
          <Text style={styles.dueLabel}>words due for review</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 16 },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  gridItem: { alignItems: 'center' },
  gridNumber: { fontSize: 28, fontWeight: '700', color: '#1E293B' },
  gridLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 14, color: '#64748B' },
  statusCount: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  dueCard: { backgroundColor: '#FEF3C7', borderRadius: 16, padding: 20 },
  dueInfo: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  dueNumber: { fontSize: 36, fontWeight: '700', color: '#D97706' },
  dueLabel: { fontSize: 16, color: '#92400E' },
});
