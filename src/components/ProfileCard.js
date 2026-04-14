import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadows } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.lg * 2;
const CARD_HEIGHT = CARD_WIDTH * 0.58;

const Initials = ({ name, size = 52 }) => {
  const parts = (name || '?').trim().split(' ');
  const initials = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return (
    <View style={[styles.initialsBox, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initialsText, { fontSize: size * 0.38 }]}>{initials.toUpperCase()}</Text>
    </View>
  );
};

const SignalDot = ({ rssi }) => {
  if (!rssi) return null;
  const strength = rssi > -60 ? 3 : rssi > -75 ? 2 : 1;
  return (
    <View style={styles.signalRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.signalBar, { height: 4 + i * 3, opacity: i <= strength ? 1 : 0.25 }]} />
      ))}
    </View>
  );
};

export const ProfileCard = ({ card, compact = false, style }) => {
  if (!card) return null;
  const { name, jobTitle, company, bio, skills = [], avatar, rssi } = card;

  return (
    <LinearGradient
      colors={['#5B21B6', '#1D4ED8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, compact && styles.cardCompact, shadows.lg, style]}
    >
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.topRow}>
        {avatar
          ? <Image source={{ uri: avatar }} style={styles.avatar} />
          : <Initials name={name} size={compact ? 40 : 52} />}
        <View style={styles.nameBlock}>
          <Text style={[styles.name, compact && { fontSize: 16 }]} numberOfLines={1}>{name || 'Your Name'}</Text>
          <Text style={styles.role} numberOfLines={1}>
            {jobTitle || 'Job Title'}{company ? ` · ${company}` : ''}
          </Text>
        </View>
        {rssi && <SignalDot rssi={rssi} />}
      </View>

      {!compact && bio ? (
        <Text style={styles.bio} numberOfLines={2}>{bio}</Text>
      ) : null}

      {skills.length > 0 && (
        <View style={styles.skillsRow}>
          {skills.slice(0, compact ? 2 : 4).map((s) => (
            <View key={s} style={styles.skillChip}>
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))}
          {skills.length > (compact ? 2 : 4) && (
            <View style={styles.skillChip}>
              <Text style={styles.skillText}>+{skills.length - (compact ? 2 : 4)}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.appName}>Card for Humanity</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    borderRadius: radius.card,
    padding: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  cardCompact: {
    width: '100%',
    minHeight: 0,
    padding: spacing.md,
  },
  circle1: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -40, right: -30,
  },
  circle2: {
    position: 'absolute', width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: 20,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  initialsBox: { backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  initialsText: { color: '#fff', fontWeight: '700' },
  nameBlock: { flex: 1, marginLeft: spacing.md },
  name: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  role: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  bio: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 19, marginBottom: spacing.sm },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  skillChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  skillText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  footer: { marginTop: spacing.xs },
  appName: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  signalRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  signalBar: { width: 3, backgroundColor: '#fff', borderRadius: 2 },
});

export default ProfileCard;
