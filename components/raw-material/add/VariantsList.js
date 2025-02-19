import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VariantItem from './VariantItem';
import PrimaryButton from '../../shared/buttons/PrimaryButton';

function VariantsList({ variants, onAddVariant, onRemoveVariant, onVariantChange }) {
  return (
    <View>
      <Text style={styles.subHeading}>Add Variants</Text>
      {variants.map((variant, index) => (
        <VariantItem
          key={index}
          variant={variant}
          index={index}
          onRemove={() => onRemoveVariant(index)}
          onChange={(field, value) => onVariantChange(index, field, value)}
        />
      ))}
      <PrimaryButton
        title="+ Add Variant"
        onPress={onAddVariant}
        style={styles.addVariantButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  subHeading: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 8,
  },
  addVariantButton: {
    backgroundColor: "#efefef",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  addVariantText: {
    fontSize: 16,
    fontWeight: "500",
  }
});

export default VariantsList; 