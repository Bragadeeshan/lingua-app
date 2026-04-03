import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GamePair } from '../types';

interface MatchGameProps {
  pairs: GamePair[];
  meanings: string[];
  onComplete: (correct: number, total: number) => void;
}

export function MatchGame({ pairs, meanings, onComplete }: MatchGameProps) {
  const [matches, setMatches] = useState<Set<string>>(new Set());
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<{ word: string; meaning: string } | null>(null);

  const correct = matches.size;
  const total = pairs.length;

  useEffect(() => {
    if (correct === total && total > 0) {
      setTimeout(() => onComplete(correct, total), 500);
    }
  }, [correct, total]);

  const handleWordPress = (wordId: string) => {
    if (matches.has(wordId)) return;
    setSelectedWord(wordId);
    setWrongPair(null);
  };

  const handleMeaningPress = (meaning: string) => {
    if (!selectedWord || matches.has(selectedWord)) return;
    if (Array.from(matches.values()).some(m => m === meaning)) return;

    const pair = pairs.find(p => p.word_id === selectedWord);
    if (!pair) return;

    if (pair.meaning === meaning) {
      const newMatches = new Set(matches);
      newMatches.add(selectedWord);
      setMatches(newMatches);
      setSelectedWord(null);
    } else {
      setWrongPair({ word: selectedWord, meaning });
      setTimeout(() => setWrongPair(null), 800);
    }
  };

  const isMatched = (id: string) => matches.has(id);
  const getMatchedMeaning = (wordId: string) => pairs.find(p => p.word_id === wordId)?.meaning;

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>{correct} / {total} matched</Text>

      <View style={styles.gameArea}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Words</Text>
          {pairs.map(pair => (
            <TouchableOpacity
              key={pair.word_id}
              style={[
                styles.item,
                isMatched(pair.word_id) && styles.matchedItem,
                selectedWord === pair.word_id && styles.selectedItem,
                wrongPair?.word === pair.word_id && styles.wrongItem,
              ]}
              onPress={() => handleWordPress(pair.word_id)}
              disabled={isMatched(pair.word_id)}
            >
              <Text style={[styles.itemText, isMatched(pair.word_id) && styles.matchedText]}>
                {pair.word}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>Meanings</Text>
          {meanings.map((meaning, i) => {
            const isThisMatched = Array.from(matches.entries()).some(([, m]) => m === meaning);
            const isThisSelected = selectedWord && pairs.find(p => p.word_id === selectedWord)?.meaning === meaning;
            const isThisWrong = wrongPair?.meaning === meaning;

            return (
              <TouchableOpacity
                key={`${meaning}-${i}`}
                style={[
                  styles.item,
                  isThisMatched && styles.matchedItem,
                  isThisSelected && styles.selectedItem,
                  isThisWrong && styles.wrongItem,
                ]}
                onPress={() => handleMeaningPress(meaning)}
                disabled={isThisMatched}
              >
                <Text style={[styles.itemText, styles.meaningText, isThisMatched && styles.matchedText]} numberOfLines={2}>
                  {meaning}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  progress: { fontSize: 20, fontWeight: '600', color: '#1E293B', textAlign: 'center', marginBottom: 24 },
  gameArea: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  column: { flex: 1, gap: 12 },
  columnTitle: { fontSize: 14, fontWeight: '600', color: '#64748B', textAlign: 'center', marginBottom: 8, textTransform: 'uppercase' },
  item: { width: '100%', minHeight: 50, backgroundColor: '#FFF', borderRadius: 12, padding: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
  matchedItem: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  selectedItem: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  wrongItem: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  itemText: { fontSize: 16, fontWeight: '600', color: '#1E293B', textAlign: 'center' },
  meaningText: { fontSize: 14 },
  matchedText: { color: '#065F46' },
});
