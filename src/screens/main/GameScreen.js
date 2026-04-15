import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { DEFAULT_BACKEND_URL, createClaudeRound } from '../../config/api';

const HandCard = ({ card, index, accentColor }) => (
  <View style={[styles.whiteCard, { borderColor: accentColor }]}>
    <Text style={styles.whiteCardIndex}>{index + 1}</Text>
    <Text style={styles.whiteCardText}>{card}</Text>
  </View>
);

const PlayerSection = ({ title, subtitle, cards, accentColor }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={[styles.sectionBadge, { color: accentColor }]}>{cards.length} cards</Text>
    </View>
    <Text style={styles.sectionSub}>{subtitle}</Text>
    <View style={styles.handGrid}>
      {cards.map((card, index) => (
        <HandCard key={`${title}-${index}`} card={card} index={index} accentColor={accentColor} />
      ))}
    </View>
  </View>
);

export default function GameScreen() {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [seed, setSeed] = useState('');
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRound = async () => {
    setLoading(true);
    setError('');

    try {
      const parsedSeed = seed.trim() ? Number(seed.trim()) : null;
      const nextRound = await createClaudeRound({
        backendUrl,
        seed: Number.isFinite(parsedSeed) ? parsedSeed : null,
      });
      setRound(nextRound);
    } catch (err) {
      setError(err.message || 'Unable to generate a round right now.');
    } finally {
      setLoading(false);
    }
  };

  const blackCard = round?.player1?.black_card;
  const playerTwoCards = round?.player2?.hand || [];
  const playerThreeCards = round?.player3?.hand || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <LinearGradient colors={['#3B0764', '#1D4ED8']} style={styles.hero}>
        <Text style={styles.eyebrow}>Claude Round Generator</Text>
        <Text style={styles.heroTitle}>Deal a fresh CAH-style round from your backend.</Text>
        <Text style={styles.heroSub}>
          Player 1 is the Card Czar and sees the black card plus both hands. Players 2 and 3 each get 10 white cards.
        </Text>
      </LinearGradient>

      <View style={styles.controls}>
        <Text style={styles.label}>Backend URL</Text>
        <TextInput
          style={styles.input}
          value={backendUrl}
          onChangeText={setBackendUrl}
          placeholder={DEFAULT_BACKEND_URL}
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Seed (optional)</Text>
        <TextInput
          style={styles.input}
          value={seed}
          onChangeText={setSeed}
          placeholder="42"
          placeholderTextColor={colors.textLight}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={generateRound}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate Round</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {blackCard ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Player 1 · Card Czar</Text>
            <Text style={styles.sectionSub}>Receives the new black prompt card and can see both players&apos; hands.</Text>
            <View style={styles.blackCard}>
              <Text style={styles.blackCardLabel}>Black Card</Text>
              <Text style={styles.blackCardText}>{blackCard.text}</Text>
              <Text style={styles.blackCardPick}>Pick {blackCard.pick}</Text>
            </View>
          </View>

          <PlayerSection
            title="Player 2"
            subtitle="10 white answer cards"
            cards={playerTwoCards}
            accentColor={colors.primary}
          />

          <PlayerSection
            title="Player 3"
            subtitle="10 white answer cards"
            cards={playerThreeCards}
            accentColor={colors.accent}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prompt Preview</Text>
            <Text style={styles.sectionSub}>This is the few-shot prompt body your backend sent to Claude.</Text>
            <View style={styles.promptBox}>
              <Text style={styles.promptText}>{round.prompt_preview}</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🃏</Text>
          <Text style={styles.emptyTitle}>No round yet</Text>
          <Text style={styles.emptySub}>
            Start the FastAPI backend, add your Claude key to `backend/.env`, then tap Generate Round.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 120 },
  hero: {
    margin: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.72)',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    ...typography.h2,
    color: '#fff',
    marginBottom: spacing.sm,
  },
  heroSub: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.82)',
  },
  controls: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  errorText: {
    marginTop: spacing.sm,
    color: colors.error,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  blackCard: {
    backgroundColor: '#111827',
    borderRadius: radius.card,
    padding: spacing.lg,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  blackCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.5)',
  },
  blackCardText: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    color: '#fff',
    marginVertical: spacing.md,
  },
  blackCardPick: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FBBF24',
  },
  handGrid: {
    gap: spacing.sm,
  },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    minHeight: 90,
  },
  whiteCardIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  whiteCardText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.text,
  },
  promptBox: {
    backgroundColor: '#0F172A',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  promptText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#CBD5E1',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySub: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
