import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { ProfileCard } from '../../components/ProfileCard';
import { StarRatingDisplay } from '../../components/StarRating';
import { useProfile } from '../../context/ProfileContext';

const generateId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

const ReviewModal = ({ card, visible, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  const submit = () => {
    if (rating === 0) { Alert.alert('', 'Please select a star rating.'); return; }
    onSubmit({ rating, text: text.trim() });
    setRating(0);
    setText('');
    onClose();
  };

  if (!card) return null;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={modal.container}>
          <View style={modal.header}>
            <Text style={modal.title}>Review {card.name}</Text>
            <TouchableOpacity onPress={onClose}><Text style={modal.close}>✕</Text></TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modal.scroll} keyboardShouldPersistTaps="handled">
            <ProfileCard card={card} compact />

            <View style={modal.section}>
              <Text style={modal.label}>Overall Rating *</Text>
              <StarRatingDisplay value={rating} onChange={setRating} size={36} />
            </View>

            <View style={modal.section}>
              <Text style={modal.label}>Write a Review (optional)</Text>
              <TextInput
                style={modal.input}
                value={text}
                onChangeText={setText}
                placeholder={`What stands out about ${card.name}?`}
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>
          </ScrollView>

          <View style={modal.footer}>
            <TouchableOpacity style={modal.submitBtn} onPress={submit} activeOpacity={0.85}>
              <Text style={modal.submitText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const CardRow = ({ card, onReview }) => {
  const avgRating = card.reviews?.length
    ? card.reviews.reduce((s, r) => s + r.rating, 0) / card.reviews.length
    : null;
  const hasReviewed = card.reviews?.some((r) => r.isMe);

  return (
    <View style={styles.card}>
      <ProfileCard card={card} compact />
      <View style={styles.cardFooter}>
        {avgRating !== null && (
          <View style={styles.ratingRow}>
            <StarRatingDisplay value={Math.round(avgRating)} size={14} />
            <Text style={styles.ratingText}>{avgRating.toFixed(1)} avg</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.reviewBtn, hasReviewed && styles.reviewBtnDone]}
          onPress={() => onReview(card)}
          activeOpacity={0.8}
          disabled={hasReviewed}
        >
          <Text style={[styles.reviewBtnText, hasReviewed && styles.reviewBtnDoneText]}>
            {hasReviewed ? '✓ Reviewed' : '⭐ Review'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function CollectedScreen() {
  const { collected, profile, addReview, updateMyReviews } = useProfile();
  const [reviewTarget, setReviewTarget] = useState(null);

  const handleSubmit = async ({ rating, text }) => {
    if (!reviewTarget) return;
    const review = {
      id: generateId(),
      reviewerId: profile.id,
      reviewerName: profile.name,
      reviewerAvatar: profile.avatar,
      rating,
      text,
      isMe: true,
      createdAt: new Date().toISOString(),
    };
    await addReview(reviewTarget.id, review);
    // Also add to "my profile" reviews so they show up on MyCard
    const incomingReview = {
      ...review,
      id: generateId(),
      isMe: false,
    };
    await updateMyReviews(incomingReview);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={collected}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.heading}>
            Collected ({collected.length})
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>No cards yet</Text>
            <Text style={styles.emptySub}>Exchange cards with people on the Discover tab to build your collection.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <CardRow card={item} onReview={setReviewTarget} />
        )}
      />

      <ReviewModal
        card={reviewTarget}
        visible={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: 100 },
  heading: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadows.sm, borderWidth: 1, borderColor: colors.border },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, paddingTop: spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  reviewBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 7, paddingHorizontal: 14 },
  reviewBtnDone: { backgroundColor: '#D1FAE5' },
  reviewBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  reviewBtnDoneText: { color: '#065F46' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 52, marginBottom: spacing.md },
  emptyTitle: { ...typography.h4, color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { ...typography.h3, color: colors.text },
  close: { fontSize: 20, color: colors.textMuted, fontWeight: '300' },
  scroll: { padding: spacing.lg, paddingBottom: 100 },
  section: { marginTop: spacing.xl },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.md },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 15, color: colors.text, minHeight: 100,
  },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center' },
  submitText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
