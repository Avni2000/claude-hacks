import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { StepIndicator } from '../../components/StepIndicator';
import { SkillTag } from '../../components/SkillTag';

const SUGGESTED = {
  Technology: ['React', 'Node.js', 'Python', 'TypeScript', 'Go', 'Kubernetes', 'AWS', 'Machine Learning', 'iOS', 'Android'],
  Design: ['Figma', 'UX Research', 'Prototyping', 'Motion Design', 'Branding', 'Illustration', 'Accessibility'],
  Business: ['Strategy', 'Product Management', 'Agile', 'Fundraising', 'Leadership', 'Growth', 'Analytics'],
  Creative: ['Writing', 'Video', 'Photography', 'Storytelling', 'Podcasting'],
};

export default function SkillsScreen({ navigation, route }) {
  const prev = route.params?.profile || {};
  const [selected, setSelected] = useState(prev.skills || []);
  const [custom, setCustom] = useState('');

  const toggle = (skill) => {
    setSelected((s) =>
      s.includes(skill) ? s.filter((x) => x !== skill) : s.length < 12 ? [...s, skill] : s
    );
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (!trimmed || selected.includes(trimmed) || selected.length >= 12) return;
    setSelected((s) => [...s, trimmed]);
    setCustom('');
  };

  const next = () => {
    navigation.navigate('Links', { profile: { ...prev, skills: selected } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <StepIndicator total={6} current={3} />
          <Text style={styles.title}>Your skills</Text>
          <Text style={styles.sub}>Pick up to 12 skills that define your expertise.</Text>
        </View>

        {selected.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionLabel}>Selected ({selected.length}/12)</Text>
            <View style={styles.tagRow}>
              {selected.map((s) => (
                <SkillTag key={s} label={s} selected onPress={() => toggle(s)} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            value={custom}
            onChangeText={setCustom}
            placeholder="Add a custom skill..."
            placeholderTextColor={colors.textLight}
            onSubmitEditing={addCustom}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addCustom} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {Object.entries(SUGGESTED).map(([category, skills]) => (
          <View key={category} style={styles.category}>
            <Text style={styles.sectionLabel}>{category}</Text>
            <View style={styles.tagRow}>
              {skills.map((s) => (
                <SkillTag key={s} label={s} selected={selected.includes(s)} onPress={() => toggle(s)} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.85}>
          <Text style={styles.nextText}>{selected.length > 0 ? 'Continue' : 'Skip for now'}</Text>
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
  selectedSection: { marginBottom: spacing.lg },
  category: { marginBottom: spacing.lg },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  customRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  customInput: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: 15, color: colors.text, ...shadows.sm,
  },
  addBtn: { backgroundColor: colors.primaryLight, borderRadius: radius.md, paddingHorizontal: spacing.md, justifyContent: 'center' },
  addBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
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
