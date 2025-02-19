import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../../shared/forms/FormInput';
import FormDropdown from '../../shared/forms/FormDropdown';

function VariantItem({ variant, index, onRemove, onChange }) {
  return (
    <View style={styles.variantContainer}>
      <TouchableOpacity
        style={styles.removeIcon}
        onPress={onRemove}
      >
        <Ionicons name="close-circle" size={24} color="red" />
      </TouchableOpacity>

      <FormInput
        placeholder="Name"
        value={variant.name}
        onChangeText={(text) => onChange('name', text)}
      />

      <FormInput
        placeholder="Description"
        value={variant.description}
        onChangeText={(text) => onChange('description', text)}
      />

      <FormDropdown
        label="Select Type"
        value={variant.type}
        options={['Solids', 'Prints']}
        onChange={(value) => onChange('type', value)}
      />

      <View style={styles.row}>
        <FormInput
          style={styles.rowItem}
          placeholder="Price"
          value={variant.price}
          onChangeText={(text) => onChange('price', text)}
          keyboardType="numeric"
        />
        <FormInput
          style={styles.rowItem}
          placeholder="Quantity"
          value={variant.quantity}
          onChangeText={(text) => onChange('quantity', text)}
          keyboardType="numeric"
        />
      </View>

      <FormInput
        placeholder="Width"
        value={variant.width}
        onChangeText={(text) => onChange('width', text)}
        keyboardType="numeric"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  variantContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    paddingTop: 32,
    position: "relative",
  },
  removeIcon: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rowItem: {
    flex: 1,
    marginRight: 8,
  },
  uploadButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  variantImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  }
});

export default VariantItem; 