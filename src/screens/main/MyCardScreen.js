import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Animated,
} from 'react-native';
import { useProfile } from '../../context/ProfileContext';
import { clearAll } from '../../utils/storage';

const C = {
  bg: '#080808',
  lime: '#CCFF00',
  white: '#F2F2F2',
  muted: '#555',
  mutedLight: '#777',
  border: '#1E1E1E',
  cardBorder: '#2A2A2A',
  chipBg: '#141414',
  limeFaint: 'rgba(204,255,0,0.08)',
};

function useFadeIn(delay = 0) {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 420, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity: anim, transform: [{ translateY: slide }] };
}

export default function MyCardScreen({ navigation }) {
  const { profile, collected } = useProfile();

  const headerAnim = useFadeIn(0);
  const cardAnim = useFadeIn(100);
  const actionsAnim = useFadeIn(200);
  const matchesAnim = useFadeIn(300);

  const myInterests = profile?.interests || [];

  const matches = useMemo(() => {
    return (collected || [])
      .map((card) => {
        const cardInterests = card.interests || [];
        const shared = cardInterests.filter((i) => myInterests.includes(i));
        return { card, shared };
      })
      .filter((m) => m.shared.length > 0)
      .sort((a, b) => b.shared.length - a.shared.length);
  }, [collected, profile?.interests]);

  if (!profile) return null;

  const initials = (profile.name || '?')
    .trim()
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleReset = () => {
    Alert.alert('Reset Card', 'This clears your card and restarts onboarding.', [
      { text: 'Cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => { await clearAll(); } },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.stripe} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnim]}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>CFH</Text>
            </View>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>Card · Active</Text>
          </View>
          <Text style={styles.pageTitle}>Your{'\n'}Card</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View style={[styles.card, cardAnim]}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerBR} />

          <View style={styles.cardTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.cardTag}>ID · {profile.id?.slice(-6).toUpperCase()}</Text>
          </View>

          <Text style={styles.cardName}>{profile.name}</Text>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>MAJOR</Text>
            <Text style={styles.cardValue}>{profile.major}</Text>
          </View>

          <View style={styles.cardInterests}>
            <View style={styles.labelRow}>
              <Text style={styles.cardLabel}>INTERESTS</Text>
              <Text style={styles.cardLabelCount}>· {myInterests.length}</Text>
            </View>
            <View style={styles.chips}>
              {myInterests.length > 0 ? (
                myInterests.map((item) => (
                  <View key={item} style={styles.chip}>
                    <Text style={styles.chipText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyNote}>None added</Text>
              )}
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>CARD FOR HUMANITY</Text>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.actions, actionsAnim]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Discover')}
            activeOpacity={0.75}
          >
            <Text style={styles.actionNum}>01</Text>
            <Text style={styles.actionLabel}>Discover</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Game')}
            activeOpacity={0.75}
          >
            <Text style={styles.actionNum}>02</Text>
            <Text style={styles.actionLabel}>Game</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleReset}
            activeOpacity={0.75}
          >
            <Text style={styles.actionNum}>03</Text>
            <Text style={styles.actionLabel}>Reset</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Matches */}
        <Animated.View style={[styles.section, matchesAnim]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionArrow}>›</Text>
            <Text style={styles.sectionTitle}>Matching Interests</Text>
            <Text style={styles.sectionCount}>{matches.length}</Text>
          </View>

          {matches.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No matches yet</Text>
              <Text style={styles.emptySub}>
                Collect cards from people who share your interests.
              </Text>
            </View>
          ) : (
            matches.map(({ card, shared }) => (
              <View key={card.id} style={styles.matchRow}>
                <View style={styles.matchHeader}>
                  <View style={styles.matchAvatar}>
                    <Text style={styles.matchAvatarText}>
                      {(card.name || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchName}>{card.name}</Text>
                    {card.major ? (
                      <Text style={styles.matchMajor}>{card.major}</Text>
                    ) : null}
                  </View>
                  <View style={styles.matchScore}>
                    <Text style={styles.matchScoreNum}>{shared.length}</Text>
                    <Text style={styles.matchScoreLabel}>MATCH</Text>
                  </View>
                </View>
                <View style={styles.matchChips}>
                  {shared.map((interest) => (
                    <View key={interest} style={styles.matchChip}>
                      <Text style={styles.matchChipText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  stripe: {
    position: 'absolute', top: 0, right: 0,
    width: 3, height: '100%',
    backgroundColor: C.lime,
  },
  scroll: { padding: 28, paddingTop: 56, paddingBottom: 140 },

  // Header
  header: { marginBottom: 28 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 },
  badge: {
    borderWidth: 1, borderColor: C.lime,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: C.lime, letterSpacing: 2 },
  liveIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  liveText: { fontSize: 12, color: C.muted, letterSpacing: 0.5 },
  pageTitle: {
    fontSize: 48, fontWeight: '900', color: C.white,
    lineHeight: 50, letterSpacing: -1.5,
  },

  // Card
  card: {
    borderWidth: 1.5, borderColor: C.cardBorder,
    padding: 22,
    marginBottom: 26,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute', top: 0, left: 0,
    width: 18, height: 18,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderColor: C.lime,
  },
  cornerBR: {
    position: 'absolute', bottom: 0, right: 0,
    width: 18, height: 18,
    borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: C.lime,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 52, height: 52,
    borderWidth: 1.5, borderColor: C.lime,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: {
    fontSize: 18, fontWeight: '900', color: C.lime, letterSpacing: 1,
  },
  cardTag: {
    fontSize: 10, color: C.muted, letterSpacing: 1.5, fontWeight: '700',
  },
  cardName: {
    fontSize: 34, fontWeight: '900', color: C.white,
    letterSpacing: -1, marginBottom: 16, lineHeight: 36,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 16,
    paddingTop: 14,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  cardLabel: {
    fontSize: 10, fontWeight: '800',
    color: C.lime, letterSpacing: 1.5,
  },
  cardLabelCount: {
    fontSize: 10, fontWeight: '700',
    color: C.muted, letterSpacing: 1,
  },
  cardValue: {
    fontSize: 14, color: C.white, fontWeight: '500', flex: 1,
  },
  cardInterests: {
    paddingTop: 14,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  chip: {
    borderWidth: 1, borderColor: C.cardBorder,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: C.chipBg,
  },
  chipText: { fontSize: 11, fontWeight: '600', color: C.mutedLight },
  emptyNote: {
    fontSize: 12, color: C.muted, fontStyle: 'italic',
  },
  cardFooter: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  cardFooterText: {
    fontSize: 9, color: C.muted, letterSpacing: 2, fontWeight: '700',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 34,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1, borderColor: C.cardBorder,
    padding: 14,
  },
  actionNum: {
    fontSize: 10, fontWeight: '800', color: C.lime,
    letterSpacing: 1.5, marginBottom: 4,
  },
  actionLabel: {
    fontSize: 13, fontWeight: '700', color: C.white,
  },

  // Section
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  sectionArrow: {
    fontSize: 20, color: C.lime, fontWeight: '900', marginTop: -2,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '800', color: C.white,
    letterSpacing: -0.2, flex: 1,
  },
  sectionCount: {
    fontSize: 11, color: C.lime, fontWeight: '800', letterSpacing: 1,
  },

  // Matches
  empty: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14, fontWeight: '700', color: C.white,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12, color: C.muted, textAlign: 'center',
    lineHeight: 18, paddingHorizontal: 24,
  },
  matchRow: {
    borderWidth: 1, borderColor: C.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  matchHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 12,
  },
  matchAvatar: {
    width: 36, height: 36,
    borderWidth: 1, borderColor: C.lime,
    justifyContent: 'center', alignItems: 'center',
  },
  matchAvatarText: {
    fontSize: 14, fontWeight: '900', color: C.lime,
  },
  matchInfo: { flex: 1 },
  matchName: {
    fontSize: 15, fontWeight: '700', color: C.white,
  },
  matchMajor: {
    fontSize: 11, color: C.muted, marginTop: 2,
  },
  matchScore: {
    alignItems: 'flex-end',
  },
  matchScoreNum: {
    fontSize: 22, fontWeight: '900', color: C.lime, lineHeight: 24,
  },
  matchScoreLabel: {
    fontSize: 9, color: C.lime, letterSpacing: 1, fontWeight: '800',
  },
  matchChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  matchChip: {
    borderWidth: 1, borderColor: C.lime,
    backgroundColor: C.limeFaint,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  matchChipText: {
    fontSize: 10, fontWeight: '700', color: C.lime, letterSpacing: 0.3,
  },
});
