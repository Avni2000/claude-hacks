import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export const StepIndicator = ({ total, current }) => (
  <View style={styles.row}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          i < current && styles.dotDone,
          i === current && styles.dotActive,
        ]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.border },
  dotDone: { width: 20, backgroundColor: colors.primaryLight },
  dotActive: { width: 20, backgroundColor: colors.primary },
});
