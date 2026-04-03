import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getProfile, saveProfile, getOrCreateUserId, generateUUID } from '../services/localStore';
import { LANGUAGES, DAILY_GOALS } from '../constants/languages';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'language' | 'goal'>('language');
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<number>(10);

  useEffect(() => {
    checkExistingUser();
  }, []);

  async function checkExistingUser() {
    try {
      const profile = await getProfile();
      if (profile?.target_language) {
        router.replace('/(tabs)');
      }
    } catch (e) {
      // Show onboarding
    }
  }

  const handleLanguageSelect = (code: string) => {
    setSelectedLang(code);
    setStep('goal');
  };

  const handleComplete = async () => {
    const userId = await getOrCreateUserId();
    
    await saveProfile({
      id: userId,
      target_language: selectedLang,
      daily_goal: selectedGoal,
      native_language: 'en',
      current_streak: 0,
      total_words_learned: 0,
    });

    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌍</Text>
        <Text style={styles.title}>Lingua</Text>
        <Text style={styles.subtitle}>
          {step === 'language' ? 'What language do you want to learn?' : 'How many words per day?'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {step === 'language' ? (
          <View style={styles.grid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.langCard}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <Text style={styles.flag}>{lang.flag_emoji}</Text>
                <Text style={styles.langName}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.goals}>
            {DAILY_GOALS.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[styles.goalCard, selectedGoal === goal && styles.goalSelected]}
                onPress={() => setSelectedGoal(goal)}
              >
                <Text style={[styles.goalNumber, selectedGoal === goal && styles.goalNumberSelected]}>
                  {goal}
                </Text>
                <Text style={[styles.goalLabel, selectedGoal === goal && styles.goalLabelSelected]}>
                  words/day
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.tip}>
              <Text style={styles.tipTitle}>💡 Tip</Text>
              <Text style={styles.tipText}>
                10 words a day is a great starting point. You can adjust later.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step === 'goal' && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep('language')}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.continueBtn, !selectedLang && styles.disabledBtn]}
          onPress={handleComplete}
          disabled={!selectedLang}
        >
          <Text style={styles.continueText}>
            {step === 'language' ? 'Choose a language' : 'Start Learning'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 32 },
  logo: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#64748B', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  langCard: { width: '48%', backgroundColor: '#FFF', borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  flag: { fontSize: 48, marginBottom: 12 },
  langName: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  goals: { gap: 12 },
  goalCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  goalSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  goalNumber: { fontSize: 32, fontWeight: '700', color: '#1E293B', marginRight: 16 },
  goalNumberSelected: { color: '#3B82F6' },
  goalLabel: { fontSize: 16, color: '#64748B' },
  goalLabelSelected: { color: '#3B82F6', fontWeight: '500' },
  tip: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, marginTop: 16 },
  tipTitle: { fontSize: 16, fontWeight: '600', color: '#92400E', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#78350F', lineHeight: 20 },
  footer: { padding: 16, paddingBottom: 32, gap: 12 },
  backBtn: { alignSelf: 'center', paddingVertical: 12 },
  backText: { fontSize: 16, color: '#64748B' },
  continueBtn: { backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#94A3B8' },
  continueText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
});
