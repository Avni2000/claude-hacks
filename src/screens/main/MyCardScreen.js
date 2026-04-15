import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Share, Alert, Linking,
} from 'react-native';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { ProfileCard } from '../../components/ProfileCard';
import { StarRatingDisplay } from '../../components/StarRating';
import { useProfile } from '../../context/ProfileContext';
import { clearAll } from '../../utils/storage';

const LinkButton = ({ icon, label, value, onPress }) =>
  value ? (
    <TouchableOpacity style={styles.linkBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.linkIcon}>{icon}</Text>
      <Text style={styles.linkLabel}>{label}</Text>
    </TouchableOpacity>
  ) : null;

const ReviewItem = ({ review }) => (
  <View style={styles.reviewItem}>
    <View style={styles.reviewHeader}>
      <Text style={styles.reviewerName}>{review.reviewerName}</Text>
      <StarRatingDisplay value={review.rating} size={14} />
    </View>
    {review.text ? <Text style={styles.reviewText}>{review.text}</Text> : null}
    <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
  </View>
);

export default function MyCardScreen({ navigation }) {
  const { profile } = useProfile();

  if (!profile) return null;

  const avgRating = profile.reviews?.length
    ? (profile.reviews.reduce((sum, r) => sum + r.rating, 0) / profile.reviews.length).toFixed(1)
    : null;

  const shareCard = async () => {
    try {
      await Share.share({
        message: `${profile.name} — ${profile.jobTitle}${profile.company ? ` @ ${profile.company}` : ''}\n${profile.bio || ''}\n\nShared via Card for Humanity`,
        title: `${profile.name}'s Card`,
      });
    } catch (_) {}
  };

  const openLink = (url) => {
    if (!url) return;
    const full = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(full).catch(() => {});
  };

  const { links = {} } = profile;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.greeting}>Your Card</Text>
        {avgRating && (
          <View style={styles.ratingBadge}>
            <StarRatingDisplay value={Math.round(Number(avgRating))} size={12} />
            <Text style={styles.ratingNum}>{avgRating}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardWrap}>
        <ProfileCard card={profile} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={shareCard} activeOpacity={0.8}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Discover')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>📡</Text>
          <Text style={styles.actionLabel}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Game')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>🃏</Text>
          <Text style={styles.actionLabel}>Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert('Edit Card', 'Edit coming soon — tap Back to re-do onboarding.', [
            { text: 'Cancel' },
            { text: 'Reset & Edit', style: 'destructive', onPress: async () => { await clearAll(); } },
          ])}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionLabel}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Links */}
      {Object.values(links).some(Boolean) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links</Text>
          <View style={styles.linksRow}>
            <LinkButton icon="✉️" label="Email" value={links.email} onPress={() => Linking.openURL(`mailto:${links.email}`)} />
            <LinkButton icon="📱" label="Phone" value={links.phone} onPress={() => Linking.openURL(`tel:${links.phone}`)} />
            <LinkButton icon="💼" label="LinkedIn" value={links.linkedin} onPress={() => openLink(links.linkedin)} />
            <LinkButton icon="🐙" label="GitHub" value={links.github} onPress={() => openLink(links.github)} />
            <LinkButton icon="🐦" label="Twitter" value={links.twitter} onPress={() => openLink(links.twitter)} />
            <LinkButton icon="🌐" label="Website" value={links.website} onPress={() => openLink(links.website)} />
          </View>
        </View>
      )}

      {/* Reviews */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Reviews {profile.reviews?.length ? `(${profile.reviews.length})` : ''}
        </Text>
        {profile.reviews?.length > 0 ? (
          profile.reviews.map((r) => <ReviewItem key={r.id} review={r} />)
        ) : (
          <View style={styles.emptyReviews}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyText}>No reviews yet.</Text>
            <Text style={styles.emptySub}>Exchange cards with someone and ask them to leave a review!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 100 },
  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: 0 },
  greeting: { ...typography.h3, color: colors.text },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  ratingNum: { fontSize: 13, fontWeight: '700', color: colors.warning },
  cardWrap: { alignItems: 'center', padding: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  actionBtn: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center', ...shadows.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  linksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.background, borderRadius: radius.full, paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border },
  linkIcon: { fontSize: 14 },
  linkLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  reviewItem: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.md },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: colors.text },
  reviewText: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 4 },
  reviewDate: { fontSize: 12, color: colors.textLight },
  emptyReviews: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyIcon: { fontSize: 32, marginBottom: spacing.sm },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
