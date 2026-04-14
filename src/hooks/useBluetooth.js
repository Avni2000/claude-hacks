import { useState, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';

// BLE Service UUID for Card for Humanity
const CFH_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';

// Try to load native BLE module; fall back to simulation in Expo Go
let BleManager = null;
try {
  const { BleManager: BM } = require('react-native-ble-plx');
  BleManager = BM;
} catch (_) {}

// Demo cards shown when BLE isn't available (Expo Go)
const DEMO_NEARBY = [
  {
    id: 'demo-1',
    name: 'Jordan Rivera',
    jobTitle: 'Product Designer',
    company: 'Figma',
    bio: 'Crafting human-centered digital experiences.',
    skills: ['UX Design', 'Figma', 'Prototyping', 'User Research'],
    links: { linkedin: 'linkedin.com/in/jrivera', email: 'jordan@figma.com' },
    reviews: [],
    avatar: null,
    rssi: -62,
  },
  {
    id: 'demo-2',
    name: 'Priya Nair',
    jobTitle: 'Software Engineer',
    company: 'Stripe',
    bio: 'Building reliable payment infrastructure at scale.',
    skills: ['Go', 'Distributed Systems', 'Payments', 'TypeScript'],
    links: { github: 'github.com/priya', email: 'priya@stripe.com' },
    reviews: [],
    avatar: null,
    rssi: -75,
  },
  {
    id: 'demo-3',
    name: 'Marcus Webb',
    jobTitle: 'Founder & CEO',
    company: 'Luminate AI',
    bio: 'Making AI accessible to every business.',
    skills: ['Startups', 'AI/ML', 'Fundraising', 'Strategy'],
    links: { linkedin: 'linkedin.com/in/mwebb', website: 'luminate.ai' },
    reviews: [],
    avatar: null,
    rssi: -81,
  },
];

export const useBluetooth = () => {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connecting, setConnecting] = useState(null);
  const [bleState, setBleState] = useState('unknown');
  const managerRef = useRef(null);
  const demoTimerRef = useRef(null);
  const isSimulated = !BleManager;

  const initManager = useCallback(() => {
    if (!BleManager || managerRef.current) return managerRef.current;
    const mgr = new BleManager();
    managerRef.current = mgr;
    mgr.onStateChange((state) => setBleState(state), true);
    return mgr;
  }, []);

  const startScan = useCallback(async () => {
    setDevices([]);
    setScanning(true);

    if (isSimulated) {
      // Simulate BLE discovery with demo cards
      let idx = 0;
      const addNext = () => {
        if (idx < DEMO_NEARBY.length) {
          setDevices((prev) => [...prev, DEMO_NEARBY[idx]]);
          idx++;
          demoTimerRef.current = setTimeout(addNext, 1200);
        } else {
          setScanning(false);
        }
      };
      demoTimerRef.current = setTimeout(addNext, 800);
      return;
    }

    try {
      const mgr = initManager();
      if (!mgr) return;

      if (Platform.OS === 'android' && Platform.Version >= 23) {
        // Request permissions handled by app.json plugin
      }

      mgr.startDeviceScan([CFH_SERVICE_UUID], { allowDuplicates: false }, (err, device) => {
        if (err) {
          console.warn('BLE scan error:', err);
          setScanning(false);
          return;
        }
        if (device) {
          setDevices((prev) => {
            const exists = prev.find((d) => d.id === device.id);
            if (exists) return prev;
            return [...prev, {
              id: device.id,
              name: device.localName || device.name || 'Unknown',
              rssi: device.rssi,
              // Card data read after connecting
            }];
          });
        }
      });

      // Stop scan after 10s
      demoTimerRef.current = setTimeout(() => stopScan(), 10000);
    } catch (err) {
      console.warn('BLE init error:', err);
      setScanning(false);
    }
  }, [isSimulated]);

  const stopScan = useCallback(() => {
    clearTimeout(demoTimerRef.current);
    setScanning(false);
    try { managerRef.current?.stopDeviceScan(); } catch (_) {}
  }, []);

  // Connect to a device and exchange cards
  const connectAndExchange = useCallback(async (device, myProfile) => {
    setConnecting(device.id);
    try {
      if (isSimulated) {
        await new Promise((r) => setTimeout(r, 1800));
        setConnecting(null);
        return device; // demo card is already full
      }

      const mgr = initManager();
      const connected = await mgr.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      // In a real app: read card characteristic from CFH_SERVICE_UUID
      // const char = await connected.readCharacteristicForService(CFH_SERVICE_UUID, CARD_CHAR_UUID);
      // const cardData = JSON.parse(Buffer.from(char.value, 'base64').toString());
      await mgr.cancelDeviceConnection(device.id);
      setConnecting(null);
      return device;
    } catch (err) {
      setConnecting(null);
      Alert.alert('Connection Failed', 'Could not exchange cards. Try moving closer.');
      return null;
    }
  }, [isSimulated]);

  const destroy = useCallback(() => {
    stopScan();
    managerRef.current?.destroy();
    managerRef.current = null;
  }, [stopScan]);

  return { scanning, devices, connecting, bleState, isSimulated, startScan, stopScan, connectAndExchange, destroy };
};
