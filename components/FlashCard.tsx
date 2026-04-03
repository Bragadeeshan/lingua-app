import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Word, UserRating } from '../types';

interface FlashCardProps {
  word: Word;
  onRate: (rating: UserRating) => void;
}

export function FlashCard({ word, onRate }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));

  const flip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.9} onPress={flip} style={styles.cardContainer}>
        <Animated.View style={[styles.card, { transform: [{ rotateY: frontRotate }] }]}>
          <Text style={styles.word}>{word.word}</Text>
          {word.phonetic && <Text style={styles.phonetic}>[{word.phonetic}]</Text>}
          <Text style={styles.hint}>Tap to flip</Text>
        </Animated.View>

        <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }] }]}>
          <Text style={styles.translation}>{word.english_translation}</Text>
          {word.example_sentence && (
            <Text style={styles.example}>"{word.example_sentence}"</Text>
          )}
        </Animated.View>
      </TouchableOpacity>

      {isFlipped && (
        <View style={styles.ratings}>
          <Text style={styles.ratingTitle}>How well did you know this?</Text>
          <View style={styles.ratingButtons}>
            <TouchableOpacity style={[styles.ratingBtn, { backgroundColor: '#EF4444' }]} onPress={() => onRate('hard')}>
              <Text style={styles.ratingText}>Hard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ratingBtn, { backgroundColor: '#3B82F6' }]} onPress={() => onRate('good')}>
              <Text style={styles.ratingText}>Good</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ratingBtn, { backgroundColor: '#10B981' }]} onPress={() => onRate('easy')}>
              <Text style={styles.ratingText}>Easy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  cardContainer: { width: '100%', height: 280 },
  card: {
    position: 'absolute', width: '100%', height: '100%', borderRadius: 20,
    padding: 24, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFF', backfaceVisibility: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  cardBack: { backgroundColor: '#F0F9FF' },
  word: { fontSize: 36, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
  phonetic: { fontSize: 18, color: '#64748B', marginTop: 8, fontStyle: 'italic' },
  hint: { position: 'absolute', bottom: 20, fontSize: 14, color: '#94A3B8' },
  translation: { fontSize: 32, fontWeight: '600', color: '#1E293B', textAlign: 'center' },
  example: { fontSize: 16, color: '#64748B', marginTop: 16, textAlign: 'center', fontStyle: 'italic' },
  ratings: { marginTop: 24, alignItems: 'center', width: '100%' },
  ratingTitle: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  ratingButtons: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  ratingBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, minWidth: 90, alignItems: 'center' },
  ratingText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});
