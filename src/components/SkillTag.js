import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export const SkillTag = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.tag, selected && styles.tagSelected]}
  >
    <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginBottom: 8,
  },
  tagSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  text: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  textSelected: { color: '#fff' },
});
