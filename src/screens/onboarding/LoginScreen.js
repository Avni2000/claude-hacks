import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
  Animated, Dimensions,
} from 'react-native';
import { useProfile } from '../../context/ProfileContext';

const { width } = Dimensions.get('window');

const C = {
  bg: '#080808',
  lime: '#CCFF00',
  white: '#F2F2F2',
  muted: '#555',
  border: '#1E1E1E',
  inputLine: '#2A2A2A',
  chipBorder: '#2E2E2E',
  chipActiveBg: '#CCFF00',
  chipActiveText: '#080808',
  customChipBg: '#1A1A1A',
};

const INTERESTS = [
  'AI / ML', 'Web Dev', 'Mobile', 'Data Science', 'Cybersecurity',
  'Design', 'Finance', 'Research', 'Entrepreneurship', 'Gaming',
  'Healthcare', 'Music', 'Sports', 'Art', 'Writing', 'Photography',
];

function useFadeIn(delay = 0) {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 420, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity: anim, transform: [{ translateY: slide }] };
}

export default function LoginScreen() {
  const { updateProfile } = useProfile();
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [selected, setSelected] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [majorFocused, setMajorFocused] = useState(false);
  const [customFocused, setCustomFocused] = useState(false);

  const headerAnim = useFadeIn(0);
  const field1Anim = useFadeIn(120);
  const field2Anim = useFadeIn(210);
  const field3Anim = useFadeIn(300);
  const btnAnim = useFadeIn(390);

  const toggleInterest = (item) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomInterest = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed]);
    }
    setCustomInput('');
  };

  const removeInterest = (item) => {
    setSelected((prev) => prev.filter((i) => i !== item));
  };

  const handleGetStarted = async () => {
    if (!name.trim()) { Alert.alert('', 'Please enter your name.'); return; }
    if (!major.trim()) { Alert.alert('', 'Please enter your major.'); return; }
    await updateProfile({
      id: Date.now().toString(),
      name: name.trim(),
      major: major.trim(),
      interests: selected,
    });
  };

  const canSubmit = name.trim() && major.trim();

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Accent stripe */}
      <View style={styles.stripe} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnim]}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>CFH</Text>
            </View>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>Card for Humanity</Text>
          </View>
          <Text style={styles.headline}>Who{'\n'}are you?</Text>
          <Text style={styles.sub}>Build your card in under a minute.</Text>
        </Animated.View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Field 01 — Name */}
        <Animated.View style={[styles.section, field1Anim]}>
          <Text style={styles.sectionNum}>01</Text>
          <Text style={styles.sectionLabel}>Full Name</Text>
          <TextInput
            style={[styles.input, nameFocused && styles.inputFocused]}
            value={name}
            onChangeText={setName}
            placeholder="Alex Johnson"
            placeholderTextColor={C.muted}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            autoFocus
            returnKeyType="next"
          />
        </Animated.View>

        <View style={styles.divider} />

        {/* Field 02 — Major */}
        <Animated.View style={[styles.section, field2Anim]}>
          <Text style={styles.sectionNum}>02</Text>
          <Text style={styles.sectionLabel}>Major</Text>
          <TextInput
            style={[styles.input, majorFocused && styles.inputFocused]}
            value={major}
            onChangeText={setMajor}
            placeholder="Computer Science"
            placeholderTextColor={C.muted}
            onFocus={() => setMajorFocused(true)}
            onBlur={() => setMajorFocused(false)}
            returnKeyType="done"
          />
        </Animated.View>

        <View style={styles.divider} />

        {/* Field 03 — Interests */}
        <Animated.View style={[styles.section, field3Anim]}>
          <Text style={styles.sectionNum}>03</Text>
          <Text style={styles.sectionLabel}>Interests</Text>
          <Text style={styles.sectionHint}>Tap to select · Type to add your own</Text>

          {/* Custom input */}
          <View style={[styles.customRow, customFocused && styles.customRowFocused]}>
            <TextInput
              style={styles.customInput}
              value={customInput}
              onChangeText={setCustomInput}
              placeholder="Add interest..."
              placeholderTextColor={C.muted}
              onFocus={() => setCustomFocused(true)}
              onBlur={() => setCustomFocused(false)}
              returnKeyType="done"
              onSubmitEditing={addCustomInterest}
            />
            <TouchableOpacity
              style={[styles.addBtn, !customInput.trim() && styles.addBtnOff]}
              onPress={addCustomInterest}
              disabled={!customInput.trim()}
              activeOpacity={0.75}
            >
              <Text style={[styles.addBtnText, !customInput.trim() && styles.addBtnTextOff]}>
                + ADD
              </Text>
            </TouchableOpacity>
          </View>

          {/* Preset chips */}
          <View style={styles.chips}>
            {INTERESTS.map((item) => {
              const active = selected.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggleInterest(item)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Custom chips */}
            {selected
              .filter((item) => !INTERESTS.includes(item))
              .map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => removeInterest(item)}
                  style={styles.chipCustom}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipCustomText}>{item}</Text>
                  <Text style={styles.chipX}> ×</Text>
                </TouchableOpacity>
              ))}
          </View>

          {selected.length > 0 && (
            <Text style={styles.selectedCount}>
              {selected.length} selected
            </Text>
          )}
        </Animated.View>

        <View style={styles.divider} />

        {/* CTA */}
        <Animated.View style={btnAnim}>
          <TouchableOpacity
            style={[styles.btn, !canSubmit && styles.btnOff]}
            onPress={handleGetStarted}
            activeOpacity={0.85}
            disabled={!canSubmit}
          >
            <Text style={[styles.btnText, !canSubmit && styles.btnTextOff]}>
              Get Started →
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  stripe: {
    position: 'absolute',
    top: 0, right: 0,
    width: 3,
    height: '100%',
    backgroundColor: C.lime,
  },

  scroll: {
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 56,
  },

  // Header
  header: { marginBottom: 32 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  badge: {
    borderWidth: 1, borderColor: C.lime,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: C.lime, letterSpacing: 2 },
  liveIndicator: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: C.lime,
  },
  liveText: { fontSize: 12, color: C.muted, letterSpacing: 0.5 },

  headline: {
    fontSize: 56,
    fontWeight: '900',
    color: C.white,
    lineHeight: 58,
    letterSpacing: -2,
    marginBottom: 12,
  },
  sub: { fontSize: 14, color: C.muted, letterSpacing: 0.3 },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 24 },

  // Sections
  section: { paddingVertical: 4 },
  sectionNum: {
    fontSize: 11,
    fontWeight: '800',
    color: C.lime,
    letterSpacing: 2,
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: C.white,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sectionHint: { fontSize: 12, color: C.muted, marginBottom: 14, letterSpacing: 0.2 },

  // Inputs
  input: {
    fontSize: 20,
    fontWeight: '500',
    color: C.white,
    borderBottomWidth: 1.5,
    borderBottomColor: C.inputLine,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  inputFocused: { borderBottomColor: C.lime },

  // Custom interest row
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.chipBorder,
    marginBottom: 16,
  },
  customRowFocused: { borderColor: C.lime },
  customInput: {
    flex: 1,
    fontSize: 14,
    color: C.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.lime,
  },
  addBtnOff: { backgroundColor: '#111' },
  addBtnText: { fontSize: 11, fontWeight: '900', color: C.bg, letterSpacing: 1.5 },
  addBtnTextOff: { color: C.muted },

  // Chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: C.chipBorder,
  },
  chipActive: { backgroundColor: C.lime, borderColor: C.lime },
  chipText: { fontSize: 12, fontWeight: '600', color: C.muted, letterSpacing: 0.3 },
  chipTextActive: { color: C.bg },

  chipCustom: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: C.lime,
    backgroundColor: 'rgba(204,255,0,0.06)',
  },
  chipCustomText: { fontSize: 12, fontWeight: '600', color: C.lime, letterSpacing: 0.3 },
  chipX: { fontSize: 14, color: C.lime, fontWeight: '300' },

  selectedCount: {
    fontSize: 11, color: C.lime, letterSpacing: 1, fontWeight: '700',
    marginTop: 14,
  },

  // CTA Button
  btn: {
    marginTop: 8,
    backgroundColor: C.lime,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnOff: { backgroundColor: '#111' },
  btnText: { fontSize: 15, fontWeight: '900', color: C.bg, letterSpacing: 2 },
  btnTextOff: { color: C.muted },
});
