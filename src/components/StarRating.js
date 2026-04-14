import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

export const StarRating = ({ value, onChange, size = 32 }) => (
  <View style={styles.row}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => onChange?.(star)} activeOpacity={0.7} disabled={!onChange}>
        <View style={[styles.star, { width: size, height: size }]}>
          <View style={[styles.starInner, { borderRadius: 2 }]}>
            {/* Simple star polygon using borders */}
          </View>
          {/* Unicode star */}
        </View>
        {/* Render as text star */}
      </TouchableOpacity>
    ))}
  </View>
);

import { Text } from 'react-native';

export const StarRatingDisplay = ({ value = 0, onChange, size = 28 }) => (
  <View style={styles.row}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => onChange?.(star)}
        activeOpacity={onChange ? 0.7 : 1}
        disabled={!onChange}
      >
        <Text style={{ fontSize: size, color: star <= value ? colors.gold : colors.border, marginRight: 2 }}>
          ★
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  star: { justifyContent: 'center', alignItems: 'center' },
  starInner: {},
});

export default StarRatingDisplay;
