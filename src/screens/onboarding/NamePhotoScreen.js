import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Image, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, radius, shadows } from '../../theme';
import { StepIndicator } from '../../components/StepIndicator';

export default function NamePhotoScreen({ navigation, route }) {
  const prev = route.params?.profile || {};
  const [name, setName] = useState(prev.name || '');
  const [avatar, setAvatar] = useState(prev.avatar || null);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to add a profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const next = () => {
    if (!name.trim()) { Alert.alert('', 'Please enter your name.'); return; }
    navigation.navigate('Professional', { profile: { ...prev, name: name.trim(), avatar } });
  };

  const initials = name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <StepIndicator total={6} current={0} />
          <Text style={styles.title}>Let's start with you</Text>
          <Text style={styles.sub}>Add a photo and your name so people know who you are.</Text>
        </View>

        <TouchableOpacity style={styles.avatarWrap} onPress={pickPhoto} activeOpacity={0.8}>
          {avatar
            ? <Image source={{ uri: avatar }} style={styles.avatar} />
            : (
              <View style={styles.avatarPlaceholder}>
                {initials
                  ? <Text style={styles.initials}>{initials}</Text>
                  : <Text style={styles.cameraIcon}>📷</Text>}
              </View>
            )}
          <View style={styles.editBadge}><Text style={{ color: '#fff', fontSize: 12 }}>✏️</Text></View>
        </TouchableOpacity>

        <View style={styles.photoActions}>
          <TouchableOpacity onPress={pickPhoto} style={styles.photoBtn}>
            <Text style={styles.photoBtnText}>Choose from Library</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={takePhoto} style={[styles.photoBtn, styles.photoBtnSecondary]}>
            <Text style={[styles.photoBtnText, { color: colors.textMuted }]}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Alex Johnson"
            placeholderTextColor={colors.textLight}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={next}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.nextBtn, !name.trim() && styles.nextBtnDisabled]} onPress={next} activeOpacity={0.85}>
          <Text style={styles.nextText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 100 },
  header: { marginBottom: spacing.xl },
  title: { ...typography.h2, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  sub: { fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  avatarWrap: { alignSelf: 'center', marginBottom: spacing.md, position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  initials: { fontSize: 36, fontWeight: '700', color: '#fff' },
  cameraIcon: { fontSize: 36 },
  editBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
  photoActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.xl },
  photoBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, backgroundColor: colors.primary,
  },
  photoBtnSecondary: { backgroundColor: colors.border },
  photoBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  field: { marginBottom: spacing.lg },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    fontSize: 16, color: colors.text, ...shadows.sm,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, backgroundColor: colors.background,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  nextBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.4 },
  nextText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
