import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '../../context/ProfileContext';
import { clearAll } from '../../utils/storage';

const C = {
  bg: '#F8F9FB',
  surface: '#FFFFFF',
  surfaceHi: '#F5F7FB',
  border: 'rgba(0,0,0,0.06)',
  borderHi: 'rgba(0,0,0,0.08)',
  text: '#0F172A',
  textMuted: '#64748B',
  textFaint: '#94A3B8',
  accent: '#6366F1',
  accentSoft: 'rgba(99, 102, 241, 0.08)',
  accentBorder: 'rgba(99, 102, 241, 0.2)',
  accentText: '#4F46E5',
};

function useEntrance(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY: translate }] };
}

export default function MyCardScreen({ navigation }) {
  const { profile, collected } = useProfile();

  const headerAnim = useEntrance(0);
  const cardAnim = useEntrance(80);
  const actionsAnim = useEntrance(180);
  const interestsAnim = useEntrance(260);
  const matchesAnim = useEntrance(340);

  const myInterests = profile?.interests || [];

  const matches = useMemo(() => {
    return (collected || [])
      .map((card) => {
        const shared = (card.interests || []).filter((i) => myInterests.includes(i));
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

  const firstName = (profile.name || '').trim().split(' ')[0];

  const handleReset = () => {
    Alert.alert('Reset Card', 'This will clear your card and restart onboarding.', [
      { text: 'Cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => { await clearAll(); } },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* Ambient background glows */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnim]}>
          <View>
            <Text style={styles.hello}>Welcome back</Text>
            <Text style={styles.headerName}>{firstName}</Text>
          </View>
          <View style={styles.avatarSm}>
            <Text style={styles.avatarSmText}>{initials}</Text>
          </View>
        </Animated.View>

        {/* Business Card */}
        <Animated.View style={[styles.cardWrap, cardAnim]}>
          <LinearGradient
            colors={['#EEF2FF', '#F0F9FF', '#F0FDFA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.blob1} />
            <View style={styles.blob2} />

            <View style={styles.cardBrand}>
              <View style={styles.brandDot} />
              <Text style={styles.brandText}>CARD FOR HUMANITY</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{profile.name}</Text>
              <Text style={styles.cardMajor}>{profile.major}</Text>
            </View>

            {myInterests.length > 0 && (
              <View style={styles.cardTags}>
                {myInterests.slice(0, 3).map((i) => (
                  <View key={i} style={styles.cardTag}>
                    <Text style={styles.cardTagText}>{i}</Text>
                  </View>
                ))}
                {myInterests.length > 3 && (
                  <View style={styles.cardTag}>
                    <Text style={styles.cardTagText}>+{myInterests.length - 3}</Text>
                  </View>
                )}
              </View>
            )}

            <Text style={styles.cardId}>#{profile.id?.slice(-6).toUpperCase()}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.actions, actionsAnim]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Discover')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📡</Text>
            </View>
            <Text style={styles.actionLabel}>Discover</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Game')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>🃏</Text>
            </View>
            <Text style={styles.actionLabel}>Game</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>✏️</Text>
            </View>
            <Text style={styles.actionLabel}>Reset</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Your Interests */}
        <Animated.View style={[styles.panel, interestsAnim]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Your Interests</Text>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{myInterests.length}</Text>
            </View>
          </View>
          {myInterests.length > 0 ? (
            <View style={styles.chips}>
              {myInterests.map((item) => (
                <View key={item} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyInline}>No interests added yet</Text>
          )}
        </Animated.View>

        {/* Shared Interests (Matches) */}
        <Animated.View style={[styles.panel, matchesAnim]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Shared Interests</Text>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{matches.length}</Text>
            </View>
          </View>

          {matches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyTitle}>No matches yet</Text>
              <Text style={styles.emptyText}>
                Collect cards from people who share your interests.
              </Text>
            </View>
          ) : (
            matches.map(({ card, shared }, idx) => (
              <View
                key={card.id}
                style={[styles.matchRow, idx > 0 && styles.matchRowDivider]}
              >
                <View style={styles.matchAvatar}>
                  <Text style={styles.matchAvatarText}>
                    {(card.name || '?')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchName} numberOfLines={1}>{card.name}</Text>
                  {card.major ? (
                    <Text style={styles.matchMajor} numberOfLines={1}>{card.major}</Text>
                  ) : null}
                  <View style={styles.matchChips}>
                    {shared.slice(0, 3).map((i) => (
                      <View key={i} style={styles.matchChip}>
                        <Text style={styles.matchChipText}>{i}</Text>
                      </View>
                    ))}
                    {shared.length > 3 && (
                      <Text style={styles.matchMore}>+{shared.length - 3}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchBadgeNum}>{shared.length}</Text>
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

  // Ambient glows
  glow1: {
    position: 'absolute',
    top: -120, right: -100,
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  glow2: {
    position: 'absolute',
    top: 200, left: -140,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
  },

  scroll: { padding: 22, paddingTop: 60, paddingBottom: 140 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  hello: {
    fontSize: 14,
    color: C.textMuted,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  headerName: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.5,
  },
  avatarSm: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.surfaceHi,
    borderWidth: 1, borderColor: C.borderHi,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarSmText: {
    fontSize: 14, fontWeight: '700', color: C.text, letterSpacing: 0.5,
  },

  // Card
  cardWrap: {
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  card: {
    borderRadius: 24,
    padding: 26,
    minHeight: 230,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  blob1: {
    position: 'absolute',
    top: -60, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  blob2: {
    position: 'absolute',
    bottom: -50, left: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 34,
  },
  brandDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#6366F1', opacity: 0.8,
  },
  brandText: {
    fontSize: 10, fontWeight: '700', color: '#6366F1',
    opacity: 0.6, letterSpacing: 2,
  },
  cardBody: { marginBottom: 18 },
  cardName: {
    fontSize: 30, fontWeight: '700', color: '#0F172A',
    letterSpacing: -0.8, lineHeight: 34, marginBottom: 6,
  },
  cardMajor: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  cardTags: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  cardTag: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  cardTagText: {
    fontSize: 11, color: '#4F46E5', fontWeight: '600',
  },
  cardId: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 1.5,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  actionIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.surfaceHi,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  actionIconText: { fontSize: 18 },
  actionLabel: {
    fontSize: 12, fontWeight: '600', color: C.text,
  },

  // Panels
  panel: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.2,
  },
  countPill: {
    backgroundColor: C.surfaceHi,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    minWidth: 26,
    alignItems: 'center',
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
  },

  // Interest chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: C.surfaceHi,
    borderWidth: 1,
    borderColor: C.borderHi,
  },
  chipText: {
    fontSize: 12, fontWeight: '600', color: C.text,
  },

  emptyInline: {
    fontSize: 13, color: C.textFaint, fontStyle: 'italic',
  },

  // Empty state
  emptyState: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 26, marginBottom: 10 },
  emptyTitle: {
    fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 4,
  },
  emptyText: {
    fontSize: 12, color: C.textMuted, textAlign: 'center',
    paddingHorizontal: 20, lineHeight: 18,
  },

  // Match rows
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  matchRowDivider: {
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  matchAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.surfaceHi,
    borderWidth: 1,
    borderColor: C.borderHi,
    justifyContent: 'center', alignItems: 'center',
  },
  matchAvatarText: {
    fontSize: 15, fontWeight: '700', color: C.text,
  },
  matchInfo: { flex: 1 },
  matchName: {
    fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 2,
  },
  matchMajor: {
    fontSize: 11, color: C.textMuted, marginBottom: 6,
  },
  matchChips: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  matchChip: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accentBorder,
  },
  matchChipText: {
    fontSize: 10, fontWeight: '600', color: C.accentText,
  },
  matchMore: {
    fontSize: 10, fontWeight: '700', color: C.textMuted, marginLeft: 2,
  },
  matchBadge: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accentBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  matchBadgeNum: {
    fontSize: 13, fontWeight: '800', color: C.accentText,
  },
});
