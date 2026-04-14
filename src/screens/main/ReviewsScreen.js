import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { StarRatingDisplay } from '../../components/StarRating';
import { useProfile } from '../../context/ProfileContext';

const StatBox = ({ value, label }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const RatingBar = ({ star, count, total }) => (
  <View style={styles.barRow}>
    <Text style={styles.barStar}>{star}★</Text>
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { flex: total > 0 ? count / total : 0 }]} />
    </View>
    <Text style={styles.barCount}>{count}</Text>
  </View>
);

const ReviewCard = ({ review }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(review.reviewerName || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.reviewerName}>{review.reviewerName}</Text>
        <StarRatingDisplay value={review.rating} size={14} />
      </View>
      <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
    </View>
    {review.text ? <Text style={styles.reviewText}>{review.text}</Text> : null}
  </View>
);

export default function ReviewsScreen() {
  const { profile } = useProfile();
  const reviews = profile?.reviews || [];

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={reviews}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={
        <>
          <Text style={styles.heading}>My Reviews</Text>

          {reviews.length > 0 ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View style={styles.avgBlock}>
                  <Text style={styles.avgNumber}>{avg.toFixed(1)}</Text>
                  <StarRatingDisplay value={Math.round(avg)} size={18} />
                  <Text style={styles.totalText}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.barsBlock}>
                  {distribution.map(({ star, count }) => (
                    <RatingBar key={star} star={star} count={count} total={reviews.length} />
                  ))}
                </View>
              </View>

              <View style={styles.statsRow}>
                <StatBox value={`${Math.round(avg * 20)}%`} label="Positive" />
                <StatBox value={reviews.filter((r) => r.text).length} label="With Comments" />
                <StatBox value={reviews.length} label="Total" />
              </View>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptySub}>
                Exchange your card with others via Bluetooth. They can then leave you a review from their Collected tab.
              </Text>
            </View>
          )}

          {reviews.length > 0 && <Text style={styles.reviewsLabel}>All Reviews</Text>}
        </>
      }
      renderItem={({ item }) => <ReviewCard review={item} />}
      ListEmptyComponent={null}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  heading: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  summaryCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.lg,
    ...shadows.sm, borderWidth: 1, borderColor: colors.border,
  },
  summaryTop: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.lg },
  avgBlock: { alignItems: 'center', gap: 4 },
  avgNumber: { fontSize: 44, fontWeight: '700', color: colors.text, lineHeight: 48 },
  totalText: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  barsBlock: { flex: 1, justifyContent: 'center', gap: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barStar: { fontSize: 11, color: colors.textMuted, width: 20, textAlign: 'right' },
  barTrack: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: radius.full, flexDirection: 'row' },
  barFill: { height: 6, backgroundColor: colors.gold, borderRadius: radius.full },
  barCount: { fontSize: 11, color: colors.textMuted, width: 16, textAlign: 'right' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  reviewsLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  reviewCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    ...shadows.sm, borderWidth: 1, borderColor: colors.border,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  reviewerName: { fontSize: 14, fontWeight: '600', color: colors.text },
  reviewDate: { fontSize: 12, color: colors.textLight },
  reviewText: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 52, marginBottom: spacing.md },
  emptyTitle: { ...typography.h4, color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
