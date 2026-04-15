import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';

const AUTO_DISMISS_MS = 5500;

const initialsOf = (name) => {
  const parts = (name || '?').trim().split(/\s+/);
  return (parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2)
  ).toUpperCase();
};

export const MatchToast = ({ match, onPress, onDismiss }) => {
  // match: { id, name, jobTitle, company, score, blurb, loading }
  const translateY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (!match) return;
    clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    timerRef.current = setTimeout(() => hide(), AUTO_DISMISS_MS);
    return () => clearTimeout(timerRef.current);
    // re-run whenever the shown match changes
  }, [match?.id]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -160, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss?.());
  };

  if (!match) return null;

  const pct = Math.round((match.score || 0) * 100);
  const subtitle = match.jobTitle
    ? `${match.jobTitle}${match.company ? ' · ' + match.company : ''}`
    : 'Nearby now';

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { transform: [{ translateY }], opacity }]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => { onPress?.(match); hide(); }}
        style={styles.touch}
      >
        <LinearGradient
          colors={['#4C1D95', '#1D4ED8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsOf(match.name)}</Text>
            </View>
            <View style={styles.body}>
              <View style={styles.topLine}>
                <Text style={styles.eyebrow}>NEW MATCH · {pct}%</Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>{match.name}</Text>
              <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text>
              <Text style={styles.blurb} numberOfLines={2}>
                {match.loading
                  ? 'Finding a reason to connect…'
                  : match.blurb || 'Strong alignment with your profile — worth saying hi.'}
              </Text>
            </View>
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={hide}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 28,
    left: spacing.md,
    right: spacing.md,
    zIndex: 100,
    elevation: 20,
  },
  touch: { borderRadius: radius.lg },
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  body: { flex: 1 },
  topLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  eyebrow: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1,
    color: '#C4B5FD',
  },
  name: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  blurb: {
    marginTop: 6, fontSize: 13, lineHeight: 18,
    color: 'rgba(255,255,255,0.92)',
  },
  closeBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeText: { color: '#fff', fontSize: 18, lineHeight: 18, fontWeight: '600' },
});

export default MatchToast;
