import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { StepIndicator } from '../../components/StepIndicator';

const MAX = 180;

const SUGGESTIONS = [
  'Passionate about building products people love.',
  'Bridging the gap between design and engineering.',
  'Making complex systems simple and human.',
  'Turning data into decisions that matter.',
  'Building the future, one commit at a time.',
];

export default function BioScreen({ navigation, route }) {
  const prev = route.params?.profile || {};
  const [bio, setBio] = useState(prev.bio || '');

  const next = () => {
    navigation.navigate('Skills', { profile: { ...prev, bio: bio.trim() } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <StepIndicator total={6} current={2} />
          <Text style={styles.title}>Tell your story</Text>
          <Text style={styles.sub}>A short tagline that appears on your card. What drives you?</Text>
        </View>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.textarea}
            value={bio}
            onChangeText={(t) => setBio(t.slice(0, MAX))}
            placeholder="What makes you, you?"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />
          <Text style={[styles.counter, bio.length > MAX * 0.85 && styles.counterWarn]}>
            {bio.length}/{MAX}
          </Text>
        </View>

        <View style={styles.suggestSection}>
          <Text style={styles.suggestLabel}>Need inspiration?</Text>
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity key={s} style={styles.suggestion} onPress={() => setBio(s)} activeOpacity={0.7}>
              <Text style={styles.suggestionText}>"{s}"</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.85}>
          <Text style={styles.nextText}>{bio.trim() ? 'Continue' : 'Skip for now'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 100 },
  header: { marginBottom: spacing.xl },
  title: { ...typography.h2, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  sub: { fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  inputWrap: { position: 'relative', marginBottom: spacing.xl },
  textarea: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 16, color: colors.text, minHeight: 120, ...shadows.sm,
  },
  counter: { position: 'absolute', bottom: 8, right: 12, fontSize: 12, color: colors.textLight },
  counterWarn: { color: colors.warning },
  suggestSection: { gap: spacing.sm },
  suggestLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  suggestion: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  suggestionText: { fontSize: 14, color: colors.textMuted, fontStyle: 'italic', lineHeight: 20 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, backgroundColor: colors.background,
    borderTopWidth: 1, borderTopColor: colors.border,
    flexDirection: 'row', gap: spacing.sm,
  },
  backBtn: {
    borderRadius: radius.full, paddingVertical: 16, paddingHorizontal: spacing.xl,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  backText: { fontSize: 17, fontWeight: '600', color: colors.textMuted },
  nextBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center' },
  nextText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
