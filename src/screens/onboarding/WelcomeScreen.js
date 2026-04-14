import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, radius } from '../../theme';

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient colors={['#3B0764', '#1E3A8A', '#0F172A']} style={styles.container}>
      {/* Decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <View style={styles.content}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>💼</Text>
        </View>

        <Text style={styles.appName}>Card for Humanity</Text>
        <Text style={styles.tagline}>Your professional identity,{'\n'}exchanged in seconds.</Text>

        <View style={styles.features}>
          {[
            ['📡', 'Exchange cards instantly via Bluetooth'],
            ['⭐', 'Get real reviews from real connections'],
            ['🔗', 'Your skills, links & story in one card'],
          ].map(([icon, text]) => (
            <View key={text} style={styles.feature}>
              <Text style={styles.featureIcon}>{icon}</Text>
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('NamePhoto')} activeOpacity={0.85}>
          <Text style={styles.btnText}>Create My Card</Text>
        </TouchableOpacity>
        <Text style={styles.sub}>Takes about 2 minutes</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blob1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(124, 58, 237, 0.2)', top: -80, right: -80,
  },
  blob2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(6, 182, 212, 0.1)', bottom: 100, left: -60,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  logoBox: {
    width: 80, height: 80, borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoEmoji: { fontSize: 36 },
  appName: { ...typography.h2, color: '#fff', marginBottom: spacing.sm, textAlign: 'center' },
  tagline: { fontSize: 18, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 26, marginBottom: spacing.xl },
  features: { width: '100%', gap: spacing.md },
  feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIcon: { fontSize: 22, width: 36 },
  featureText: { fontSize: 15, color: 'rgba(255,255,255,0.8)', flex: 1, lineHeight: 22 },
  footer: { padding: spacing.xl, gap: spacing.sm },
  btn: {
    backgroundColor: colors.white, borderRadius: radius.full,
    paddingVertical: 16, alignItems: 'center',
  },
  btnText: { fontSize: 17, fontWeight: '700', color: colors.primary },
  sub: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 },
});
