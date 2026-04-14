import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { StepIndicator } from '../../components/StepIndicator';

const INDUSTRIES = [
  'Technology', 'Design', 'Finance', 'Healthcare', 'Education',
  'Marketing', 'Legal', 'Engineering', 'Media', 'Research', 'Consulting', 'Other',
];

export default function ProfessionalScreen({ navigation, route }) {
  const prev = route.params?.profile || {};
  const [jobTitle, setJobTitle] = useState(prev.jobTitle || '');
  const [company, setCompany] = useState(prev.company || '');
  const [industry, setIndustry] = useState(prev.industry || '');

  const next = () => {
    if (!jobTitle.trim()) { Alert.alert('', 'Please add your job title.'); return; }
    navigation.navigate('Bio', { profile: { ...prev, jobTitle: jobTitle.trim(), company: company.trim(), industry } });
  };

  const Field = ({ label, value, onChange, placeholder, hint }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        returnKeyType="next"
      />
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <StepIndicator total={6} current={1} />
          <Text style={styles.title}>What do you do?</Text>
          <Text style={styles.sub}>This is the headline of your card.</Text>
        </View>

        <Field label="Job Title *" value={jobTitle} onChange={setJobTitle} placeholder="e.g. Senior Product Designer" />
        <Field label="Company / Organization" value={company} onChange={setCompany} placeholder="e.g. Figma" hint="Leave blank if freelance or student." />

        <View style={styles.field}>
          <Text style={styles.label}>Industry</Text>
          <View style={styles.chips}>
            {INDUSTRIES.map((ind) => (
              <TouchableOpacity
                key={ind}
                onPress={() => setIndustry(ind === industry ? '' : ind)}
                style={[styles.chip, industry === ind && styles.chipSelected]}
              >
                <Text style={[styles.chipText, industry === ind && styles.chipTextSelected]}>{ind}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, !jobTitle.trim() && styles.nextBtnDisabled]}
          onPress={next} activeOpacity={0.85}
        >
          <Text style={styles.nextText}>Continue</Text>
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
  field: { marginBottom: spacing.lg },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    fontSize: 16, color: colors.text, ...shadows.sm,
  },
  hint: { fontSize: 12, color: colors.textLight, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
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
  nextBtnDisabled: { opacity: 0.4 },
  nextText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
