import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import { useProfile } from '../../context/ProfileContext';
import {
  DEFAULT_BACKEND_URL,
  chooseNearbyWinner,
  dealNextNearbyRound,
  fetchNearbyGame,
  joinNearbyGame,
  submitNearbyCards,
} from '../../config/api';

const DEFAULT_ROOM_CODE = 'nearby-demo';
const POLL_MS = 2000;

const PlayerBadge = ({ player }) => (
  <View style={[styles.playerBadge, player.is_me && styles.playerBadgeMe]}>
    <View style={styles.playerBadgeHeader}>
      <Text style={styles.playerBadgeName}>
        {player.name}
        {player.is_me ? ' (you)' : ''}
      </Text>
      <Text style={styles.playerBadgeRole}>
        {player.role === 'card_czar' ? 'Czar' : player.submitted ? 'Submitted' : 'Ready'}
      </Text>
    </View>
  </View>
);

const SubmissionCard = ({ submission, canPickWinner, onPickWinner }) => (
  <View style={[styles.answerCard, submission.is_winner && styles.answerCardWinner]}>
    <View style={styles.answerCardHeader}>
      <Text style={styles.answerCardTitle}>
        {submission.player_name || 'Anonymous Answer'}
      </Text>
      {submission.is_winner ? <Text style={styles.answerCardWinnerText}>Winner</Text> : null}
    </View>
    {submission.cards.map((card, index) => (
      <View key={`${submission.player_id}-${index}`} style={styles.answerLine}>
        <Text style={styles.answerLineText}>{card}</Text>
      </View>
    ))}
    {canPickWinner ? (
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => onPickWinner(submission.player_id)}
        activeOpacity={0.85}
      >
        <Text style={styles.secondaryButtonText}>Choose Winner</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const HandCard = ({ card, index, selected, disabled, onPress }) => (
  <TouchableOpacity
    style={[
      styles.handCard,
      selected && styles.handCardSelected,
      disabled && styles.handCardDisabled,
    ]}
    onPress={() => onPress(index)}
    activeOpacity={0.85}
    disabled={disabled}
  >
    <Text style={styles.handCardIndex}>{index + 1}</Text>
    <Text style={styles.handCardText}>{card}</Text>
  </TouchableOpacity>
);

export default function GameScreen({ route, navigation }) {
  const { profile } = useProfile();
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [roomCode, setRoomCode] = useState(route.params?.roomCode || DEFAULT_ROOM_CODE);
  const [session, setSession] = useState(null);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const autoJoinNonceRef = useRef(null);

  const joinGame = async () => {
    if (!profile?.id) {
      setError('Finish onboarding on each phone before joining the game.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const nextSession = await joinNearbyGame({
        backendUrl,
        roomCode,
        player: profile,
      });
      setSession(nextSession);
      setSelectedIndices([]);
    } catch (err) {
      setError(err.message || 'Unable to join the room right now.');
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async ({ silent = false } = {}) => {
    if (!profile?.id || !session?.room_code) return;
    if (!silent) setRefreshing(true);

    try {
      const nextSession = await fetchNearbyGame({
        backendUrl,
        roomCode: session.room_code,
        playerId: profile.id,
      });
      setSession(nextSession);
    } catch (err) {
      if (!silent) setError(err.message || 'Unable to refresh the room right now.');
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!session?.room_code || !profile?.id) return undefined;

    const timer = setInterval(() => {
      refreshSession({ silent: true });
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [backendUrl, profile?.id, session?.room_code]);

  useEffect(() => {
    setSelectedIndices([]);
  }, [session?.round_number, session?.status, session?.me?.has_submitted]);

  useEffect(() => {
    const nextRoomCode = route.params?.roomCode;
    if (nextRoomCode) {
      setRoomCode(nextRoomCode);
    }
  }, [route.params?.roomCode]);

  useEffect(() => {
    const autoJoinNonce = route.params?.joinNonce;
    if (!route.params?.autoJoin || !profile?.id || !autoJoinNonce) return;
    if (autoJoinNonceRef.current === autoJoinNonce) return;
    autoJoinNonceRef.current = autoJoinNonce;
    joinGame();
  }, [profile?.id, route.params?.autoJoin, route.params?.joinNonce, roomCode, backendUrl]);

  const toggleSelection = (index) => {
    if (session?.me?.has_submitted) return;

    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((value) => value !== index);
      }
      if (prev.length >= (session?.pick_count || 1)) {
        return prev;
      }
      return [...prev, index];
    });
  };

  const handleSubmit = async () => {
    if (!session?.room_code || !profile?.id) return;

    setLoading(true);
    setError('');
    try {
      const nextSession = await submitNearbyCards({
        backendUrl,
        roomCode: session.room_code,
        playerId: profile.id,
        selectedIndices,
      });
      setSession(nextSession);
    } catch (err) {
      setError(err.message || 'Unable to submit those cards.');
    } finally {
      setLoading(false);
    }
  };

  const handleChooseWinner = async (winnerPlayerId) => {
    if (!session?.room_code || !profile?.id) return;

    setLoading(true);
    setError('');
    try {
      const nextSession = await chooseNearbyWinner({
        backendUrl,
        roomCode: session.room_code,
        playerId: profile.id,
        winnerPlayerId,
      });
      setSession(nextSession);
    } catch (err) {
      setError(err.message || 'Unable to lock in the winner.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextRound = async () => {
    if (!session?.room_code || !profile?.id) return;

    setLoading(true);
    setError('');
    try {
      const nextSession = await dealNextNearbyRound({
        backendUrl,
        roomCode: session.room_code,
        playerId: profile.id,
      });
      setSession(nextSession);
    } catch (err) {
      setError(err.message || 'Unable to deal the next round.');
    } finally {
      setLoading(false);
    }
  };

  const launchFromNearby = () => {
    navigation.navigate('Discover');
    Alert.alert(
      'Nearby Mode',
      'Use Discover to trigger the fake nearby match toast, then jump back here to join the shared game room.'
    );
  };

  const isJoined = !!session?.room_code;
  const isCzar = session?.me?.role === 'card_czar';
  const canSubmit =
    session?.status === 'playing'
    && !isCzar
    && !session?.me?.has_submitted
    && selectedIndices.length === session?.pick_count;
  const canJudge = session?.status === 'judging' && isCzar;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <LinearGradient colors={['#0F172A', '#1D4ED8']} style={styles.hero}>
        <Text style={styles.eyebrow}>Nearby Game</Text>
        <Text style={styles.heroTitle}>Three phones, one fake nearby table, real CAH-style rounds.</Text>
        <Text style={styles.heroSub}>
          Open this same Expo QR code on three devices, finish onboarding, and have each player join the same room.
        </Text>
      </LinearGradient>

      <View style={styles.panel}>
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

        <Text style={styles.label}>Room Code</Text>
        <TextInput
          style={styles.input}
          value={roomCode}
          onChangeText={setRoomCode}
          placeholder={DEFAULT_ROOM_CODE}
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={joinGame}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Join Nearby Table</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={launchFromNearby}
          activeOpacity={0.85}
        >
          <Text style={styles.ghostButtonText}>Use Fake Nearby Toast</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {isJoined ? (
        <>
          <View style={styles.panel}>
            <View style={styles.sessionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Room {session.room_code}</Text>
                <Text style={styles.sectionSub}>
                  {session.player_count}/{session.max_players} players joined
                  {session.round_number ? ` · Round ${session.round_number}` : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => refreshSession({ silent: false })}
                activeOpacity={0.85}
                disabled={refreshing}
              >
                <Text style={styles.refreshButtonText}>{refreshing ? 'Refreshing…' : 'Refresh'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.playerList}>
              {session.players.map((player) => (
                <PlayerBadge key={player.id} player={player} />
              ))}
            </View>
          </View>

          {session.status === 'lobby' ? (
            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>Waiting For Players</Text>
              <Text style={styles.sectionSub}>
                Share room code <Text style={styles.inlineCode}>{session.room_code}</Text> with two more people using the same Expo QR.
              </Text>
              <View style={styles.waitingBox}>
                <Text style={styles.waitingTitle}>What happens next?</Text>
                <Text style={styles.waitingText}>As soon as player three joins, the backend deals a round automatically.</Text>
                <Text style={styles.waitingText}>The Card Czar rotates each round, so everyone gets a turn to judge.</Text>
              </View>
            </View>
          ) : null}

          {session.black_card ? (
            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>Black Card</Text>
              <View style={styles.blackCard}>
                <Text style={styles.blackCardText}>{session.black_card.text}</Text>
                <Text style={styles.blackCardPick}>Pick {session.pick_count}</Text>
              </View>
            </View>
          ) : null}

          {session.status !== 'lobby' ? (
            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>
                {isCzar ? 'You are the Card Czar' : 'Your Hand'}
              </Text>
              <Text style={styles.sectionSub}>
                {isCzar
                  ? 'Wait for both answers, then choose the winner.'
                  : session.me.has_submitted
                    ? 'Your answer is locked in.'
                    : `Choose ${session.pick_count} card${session.pick_count > 1 ? 's' : ''} to answer the prompt.`}
              </Text>

              {isCzar ? (
                <View style={styles.waitingBox}>
                  <Text style={styles.waitingTitle}>
                    {session.status === 'playing'
                      ? `Waiting for ${Math.max(0, 2 - session.submission_count)} player${session.submission_count === 1 ? '' : 's'}`
                      : session.status === 'judging'
                        ? 'Answers are in'
                        : `Winner: ${session.winner_name}`}
                  </Text>
                  <Text style={styles.waitingText}>
                    {session.status === 'playing'
                      ? 'The submitted cards will appear here once both players have answered.'
                      : session.status === 'judging'
                        ? 'Tap the funniest answer set to crown the round winner.'
                        : 'Deal another round whenever your table is ready.'}
                  </Text>
                </View>
              ) : (
                <View style={styles.handGrid}>
                  {session.me.hand.map((card, index) => (
                    <HandCard
                      key={`${session.me.id}-${index}`}
                      card={card}
                      index={index}
                      selected={selectedIndices.includes(index)}
                      disabled={session.me.has_submitted || session.status !== 'playing'}
                      onPress={toggleSelection}
                    />
                  ))}
                </View>
              )}

              {!isCzar ? (
                <TouchableOpacity
                  style={[styles.primaryButton, !canSubmit && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                  disabled={!canSubmit || loading}
                >
                  <Text style={styles.primaryButtonText}>
                    {session.me.has_submitted ? 'Answer Submitted' : 'Submit Answer'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {session.judging_submissions?.length ? (
            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>
                {session.status === 'completed' ? 'Round Results' : 'Submitted Answers'}
              </Text>
              <Text style={styles.sectionSub}>
                {session.status === 'completed'
                  ? `${session.winner_name} won this round.`
                  : 'The Card Czar sees answers anonymously until the winner is chosen.'}
              </Text>
              <View style={styles.answerList}>
                {session.judging_submissions.map((submission) => (
                  <SubmissionCard
                    key={submission.player_id}
                    submission={submission}
                    canPickWinner={canJudge}
                    onPickWinner={handleChooseWinner}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {session.status === 'completed' ? (
            <TouchableOpacity
              style={[styles.primaryButton, styles.footerButton, loading && styles.buttonDisabled]}
              onPress={handleNextRound}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>Deal Next Round</Text>
            </TouchableOpacity>
          ) : null}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Ready to test on three phones?</Text>
          <Text style={styles.emptySub}>
            1. Start your FastAPI server.
          </Text>
          <Text style={styles.emptySub}>
            2. Open the Expo QR on three devices.
          </Text>
          <Text style={styles.emptySub}>
            3. Join the same room code here and let the backend deal the round.
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
  panel: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButton: {
    marginHorizontal: spacing.lg,
  },
  secondaryButton: {
    marginTop: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  ghostButton: {
    marginTop: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  refreshButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: '#EDE9FE',
  },
  refreshButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSub: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  inlineCode: {
    fontWeight: '700',
    color: colors.text,
  },
  playerList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  playerBadge: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  playerBadgeMe: {
    borderColor: colors.primary,
    backgroundColor: '#F5F3FF',
  },
  playerBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playerBadgeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  playerBadgeRole: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  waitingBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#EFF6FF',
  },
  waitingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: spacing.xs,
  },
  waitingText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1D4ED8',
    marginTop: 2,
  },
  blackCard: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: '#111827',
    padding: spacing.lg,
    minHeight: 170,
    justifyContent: 'space-between',
  },
  blackCardText: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
    color: '#fff',
  },
  blackCardPick: {
    marginTop: spacing.md,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
  },
  handGrid: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  handCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 100,
  },
  handCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F5F3FF',
  },
  handCardDisabled: {
    opacity: 0.72,
  },
  handCardIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  handCardText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.text,
  },
  answerList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  answerCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  answerCardWinner: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  answerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  answerCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  answerCardWinnerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
    textTransform: 'uppercase',
  },
  answerLine: {
    borderRadius: radius.md,
    backgroundColor: '#fff',
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  answerLineText: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  emptyState: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySub: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginTop: 4,
  },
});
