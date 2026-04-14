import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, radius } from '../../theme';
import { ProfileCard } from '../../components/ProfileCard';
import { StepIndicator } from '../../components/StepIndicator';
import { useProfile } from '../../context/ProfileContext';
import { setOnboarded } from '../../utils/storage';
import 'react-native-get-random-values';

// Simple UUID fallback that works without crypto module
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

const LinkItem = ({ icon, label, value }) =>
  value ? (
    <View style={styles.linkItem}>
      <Text style={styles.linkIcon}>{icon}</Text>
      <Text style={styles.linkValue} numberOfLines={1}>{value}</Text>
    </View>
  ) : null;

export default function PreviewScreen({ navigation, route }) {
  const { updateProfile } = useProfile();
  const profile = route.params?.profile || {};

  const handleFinish = async () => {
    const fullProfile = {
      ...profile,
      id: generateId(),
      reviews: [],
      createdAt: new Date().toISOString(),
    };
    await updateProfile(fullProfile);
    await setOnboarded();
    // Navigate to main app (handled by AppNavigator watching profile state)
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const { links = {} } = profile;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <StepIndicator total={6} current={5} />
        <Text style={styles.title}>Your Card</Text>
        <Text style={styles.sub}>This is how you'll appear to others.</Text>
      </View>

      <View style={styles.cardWrap}>
        <ProfileCard card={profile} />
      </View>

      {/* Links preview */}
      {Object.values(links).some(Boolean) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links on your card</Text>
          <View style={styles.linksGrid}>
            <LinkItem icon="✉️" label="Email" value={links.email} />
            <LinkItem icon="📱" label="Phone" value={links.phone} />
            <LinkItem icon="💼" label="LinkedIn" value={links.linkedin} />
            <LinkItem icon="🐙" label="GitHub" value={links.github} />
            <LinkItem icon="🐦" label="Twitter" value={links.twitter} />
            <LinkItem icon="🌐" label="Website" value={links.website} />
          </View>
        </View>
      )}

      <View style={styles.tip}>
        <Text style={styles.tipText}>
          💡 You can edit your card anytime from the My Card tab.
        </Text>
      </View>

      <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} activeOpacity={0.85}>
        <Text style={styles.finishText}>Launch My Card 🚀</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.editText}>← Edit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 60 },
  header: { marginBottom: spacing.xl },
  title: { ...typography.h2, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  sub: { fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  cardWrap: { alignItems: 'center', marginBottom: spacing.xl },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  linksGrid: { gap: 8 },
  linkItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  linkIcon: { fontSize: 16, width: 24 },
  linkValue: { fontSize: 14, color: colors.text, flex: 1 },
  tip: { backgroundColor: '#EFF6FF', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.xl },
  tipText: { fontSize: 14, color: '#1E40AF', lineHeight: 20 },
  finishBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingVertical: 18, alignItems: 'center', marginBottom: spacing.md,
  },
  finishText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  editBtn: { alignItems: 'center', paddingVertical: spacing.md },
  editText: { fontSize: 15, color: colors.textMuted, fontWeight: '500' },
});
