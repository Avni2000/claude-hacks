import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { StepIndicator } from '../../components/StepIndicator';

const LINK_FIELDS = [
  { key: 'email', label: 'Email', icon: '✉️', placeholder: 'you@example.com', keyboardType: 'email-address' },
  { key: 'phone', label: 'Phone', icon: '📱', placeholder: '+1 (555) 000-0000', keyboardType: 'phone-pad' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'linkedin.com/in/yourname', keyboardType: 'url' },
  { key: 'github', label: 'GitHub', icon: '🐙', placeholder: 'github.com/username', keyboardType: 'url' },
  { key: 'twitter', label: 'Twitter / X', icon: '🐦', placeholder: '@handle', keyboardType: 'twitter' },
  { key: 'website', label: 'Website', icon: '🌐', placeholder: 'yourwebsite.com', keyboardType: 'url' },
];

export default function LinksScreen({ navigation, route }) {
  const prev = route.params?.profile || {};
  const [links, setLinks] = useState(prev.links || {});

  const update = (key, val) => setLinks((l) => ({ ...l, [key]: val }));

  const next = () => {
    navigation.navigate('Preview', { profile: { ...prev, links } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <StepIndicator total={6} current={4} />
          <Text style={styles.title}>How can people reach you?</Text>
          <Text style={styles.sub}>Add the links you want to share on your card.</Text>
        </View>

        {LINK_FIELDS.map(({ key, label, icon, placeholder, keyboardType }) => (
          <View key={key} style={styles.field}>
            <Text style={styles.label}>
              <Text>{icon}  </Text>{label}
            </Text>
            <TextInput
              style={styles.input}
              value={links[key] || ''}
              onChangeText={(v) => update(key, v)}
              placeholder={placeholder}
              placeholderTextColor={colors.textLight}
              keyboardType={keyboardType}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.85}>
          <Text style={styles.nextText}>Preview Card</Text>
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
  field: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: 15, color: colors.text, ...shadows.sm,
  },
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
