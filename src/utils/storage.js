import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROFILE: '@cfh_profile',
  COLLECTED: '@cfh_collected',
  ONBOARDED: '@cfh_onboarded',
};

export const saveProfile = async (profile) => {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const loadProfile = async () => {
  const raw = await AsyncStorage.getItem(KEYS.PROFILE);
  return raw ? JSON.parse(raw) : null;
};

export const saveCollected = async (cards) => {
  await AsyncStorage.setItem(KEYS.COLLECTED, JSON.stringify(cards));
};

export const loadCollected = async () => {
  const raw = await AsyncStorage.getItem(KEYS.COLLECTED);
  return raw ? JSON.parse(raw) : [];
};

export const setOnboarded = async () => {
  await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
};

export const isOnboarded = async () => {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDED);
  return val === 'true';
};

export const clearAll = async () => {
  await AsyncStorage.multiRemove(Object.values(KEYS));
};
