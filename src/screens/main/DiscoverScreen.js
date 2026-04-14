import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Animated, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { ProfileCard } from '../../components/ProfileCard';
import { useBluetooth } from '../../hooks/useBluetooth';
import { useProfile } from '../../context/ProfileContext';

const PulseRing = ({ delay = 0 }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 2.5, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.pulseRing, { transform: [{ scale }], opacity }]}
    />
  );
};

const DeviceRow = ({ device, onConnect, connecting }) => {
  const isConnecting = connecting === device.id;
  return (
    <TouchableOpacity style={styles.deviceRow} onPress={() => onConnect(device)} activeOpacity={0.8} disabled={!!connecting}>
      <View style={styles.deviceAvatar}>
        <Text style={styles.deviceAvatarText}>
          {(device.name || '?').trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
        </Text>
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <Text style={styles.deviceSub}>
          {device.jobTitle ? `${device.jobTitle}${device.company ? ` · ${device.company}` : ''}` : 'Tap to exchange cards'}
        </Text>
      </View>
      {isConnecting
        ? <ActivityIndicator color={colors.primary} />
        : (
          <View style={styles.exchangeBtn}>
            <Text style={styles.exchangeIcon}>📡</Text>
          </View>
        )}
    </TouchableOpacity>
  );
};

export default function DiscoverScreen({ navigation }) {
  const { scanning, devices, connecting, isSimulated, startScan, stopScan, connectAndExchange } = useBluetooth();
  const { profile, addCollected } = useProfile();

  const handleConnect = async (device) => {
    const card = await connectAndExchange(device, profile);
    if (!card) return;
    await addCollected(card);
    Alert.alert(
      '🎉 Cards Exchanged!',
      `You now have ${card.name}'s card. Head to Collected to review them!`,
      [
        { text: 'View Card', onPress: () => navigation.navigate('Collected') },
        { text: 'Keep Scanning' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Radar header */}
      <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.radar}>
        <View style={styles.radarCenter}>
          {scanning && (
            <>
              <PulseRing delay={0} />
              <PulseRing delay={500} />
              <PulseRing delay={1000} />
            </>
          )}
          <View style={styles.radarCore}>
            <Text style={styles.radarIcon}>📡</Text>
          </View>
        </View>

        <Text style={styles.radarTitle}>
          {scanning ? `Scanning nearby...` : 'Find people nearby'}
        </Text>
        <Text style={styles.radarSub}>
          {isSimulated
            ? '(Demo mode — real BLE needs a dev build)'
            : 'Bluetooth scans for Card for Humanity users'}
        </Text>

        <TouchableOpacity
          style={[styles.scanBtn, scanning && styles.scanBtnStop]}
          onPress={scanning ? stopScan : startScan}
          activeOpacity={0.85}
        >
          <Text style={styles.scanBtnText}>{scanning ? 'Stop Scan' : 'Start Scanning'}</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Devices list */}
      <FlatList
        data={devices}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          devices.length > 0
            ? <Text style={styles.listHeader}>{devices.length} {devices.length === 1 ? 'person' : 'people'} nearby</Text>
            : null
        }
        ListEmptyComponent={
          !scanning ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No one found yet</Text>
              <Text style={styles.emptySub}>Tap Start Scanning to discover nearby Card for Humanity users.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <DeviceRow device={item} onConnect={handleConnect} connecting={connecting} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  radar: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg },
  radarCenter: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
  pulseRing: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    borderWidth: 1.5, borderColor: 'rgba(124, 58, 237, 0.5)',
  },
  radarCore: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderWidth: 2, borderColor: 'rgba(124, 58, 237, 0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  radarIcon: { fontSize: 28 },
  radarTitle: { ...typography.h3, color: '#fff', marginBottom: 6, textAlign: 'center' },
  radarSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: spacing.lg },
  scanBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingVertical: 14, paddingHorizontal: spacing.xl,
  },
  scanBtnStop: { backgroundColor: colors.error },
  scanBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  list: { padding: spacing.lg, paddingBottom: 100 },
  listHeader: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  deviceRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    ...shadows.sm, borderWidth: 1, borderColor: colors.border,
  },
  deviceAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  deviceAvatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 16, fontWeight: '600', color: colors.text },
  deviceSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  exchangeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
  exchangeIcon: { fontSize: 18 },
  empty: { alignItems: 'center', paddingTop: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.h4, color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
