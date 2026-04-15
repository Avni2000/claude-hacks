import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { useProfile } from '../../context/ProfileContext';

const INTERESTS = [
  'AI / ML', 'Web Dev', 'Mobile', 'Data Science', 'Cybersecurity',
  'Design', 'Finance', 'Research', 'Entrepreneurship', 'Gaming',
  'Healthcare', 'Music', 'Sports', 'Art', 'Writing', 'Photography',
];

export default function LoginScreen() {
  const { updateProfile } = useProfile();
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [selected, setSelected] = useState([]);
  const [customInput, setCustomInput] = useState('');

  const toggleInterest = (item) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomInterest = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed]);
    }
    setCustomInput('');
  };

  const removeInterest = (item) => {
    setSelected((prev) => prev.filter((i) => i !== item));
  };

  const handleGetStarted = async () => {
    if (!name.trim()) {
      Alert.alert('', 'Please enter your name.');
      return;
    }
    if (!major.trim()) {
      Alert.alert('', 'Please enter your major.');
      return;
    }
    await updateProfile({
      id: Date.now().toString(),
      name: name.trim(),
      major: major.trim(),
      interests: selected,
    });
  };

  const canSubmit = name.trim() && major.trim();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#3B0764', '#1E3A8A', '#0F172A']} style={styles.gradient}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>💼</Text>
          </View>
          <Text style={styles.appName}>Card for Humanity</Text>
        </View>

        <Text style={styles.headline}>Create your card</Text>
        <Text style={styles.sub}>Tell us a bit about yourself to get started.</Text>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Alex Johnson"
              placeholderTextColor={colors.textLight}
              autoFocus
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Major *</Text>
            <TextInput
              style={styles.input}
              value={major}
              onChangeText={setMajor}
              placeholder="e.g. Computer Science"
              placeholderTextColor={colors.textLight}
              returnKeyType="done"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Interests</Text>
            <Text style={styles.hint}>Pick from the list or type your own</Text>

            <View style={styles.customRow}>
              <TextInput
                style={styles.customInput}
                value={customInput}
                onChangeText={setCustomInput}
                placeholder="Add your own..."
                placeholderTextColor={colors.textLight}
                returnKeyType="done"
                onSubmitEditing={addCustomInterest}
              />
              <TouchableOpacity
                style={[styles.addBtn, !customInput.trim() && styles.addBtnDisabled]}
                onPress={addCustomInterest}
                disabled={!customInput.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chips}>
              {INTERESTS.map((item) => {
                const active = selected.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => toggleInterest(item)}
                    style={[styles.chip, active && styles.chipSelected]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {selected
                .filter((item) => !INTERESTS.includes(item))
                .map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => removeInterest(item)}
                    style={[styles.chip, styles.chipCustom]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, styles.chipTextSelected]}>{item}</Text>
                    <Text style={styles.chipRemove}> ✕</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, !canSubmit && styles.btnDisabled]}
          onPress={handleGetStarted}
          activeOpacity={0.85}
          disabled={!canSubmit}
        >
          <Text style={styles.btnText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  blob1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(124, 58, 237, 0.25)', top: -80, right: -80,
  },
  blob2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(6, 182, 212, 0.12)', bottom: 200, left: -60,
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoBox: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoEmoji: { fontSize: 20 },
  appName: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headline: { ...typography.h2, color: '#fff', marginBottom: spacing.sm },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: spacing.xl, lineHeight: 22 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  field: { marginBottom: spacing.lg },
  label: {
    fontSize: 12, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.sm,
  },
  hint: { fontSize: 13, color: colors.textLight, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  customRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  customInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.35 },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipCustom: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  chipTextSelected: { color: '#fff' },
  chipRemove: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  btn: {
    backgroundColor: '#fff',
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 17, fontWeight: '700', color: colors.primary },
});
