import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function FormDropdown({ label, value, options, onChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}: </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          const currentIndex = options.indexOf(value);
          const nextIndex = (currentIndex + 1) % options.length;
          onChange(options[nextIndex]);
        }}
      >
        <Text>{value}</Text>
        <Ionicons name="chevron-down" size={16} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginRight: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    minWidth: 100,
    justifyContent: 'space-between',
  },
});

export default FormDropdown; 