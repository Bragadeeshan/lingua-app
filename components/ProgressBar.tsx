import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: string;
}

export function ProgressBar({ current, total, label, color = '#3B82F6' }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.percentage}>{current}/{total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  label: { fontSize: 14, fontWeight: '500', color: '#64748B', marginBottom: 6 },
  barContainer: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 4 },
  percentage: { fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'right' },
});
