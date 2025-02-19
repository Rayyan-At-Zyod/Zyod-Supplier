import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import FormDropdown from '../../shared/forms/FormDropdown';
import FormInput from '../../shared/forms/FormInput';

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rowItem: {
    flex: 1,
    marginRight: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dropdownLabel: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  }
});

function BasicDetailsForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View>
      <FormInput
        placeholder="Name"
        value={data.name}
        onChangeText={(text) => handleChange('name', text)}
      />
      
      <View style={styles.row}>
        <FormInput
          style={styles.rowItem}
          placeholder="GSM"
          value={data.gsm}
          onChangeText={(text) => handleChange('gsm', text)}
          keyboardType="numeric"
        />
        <FormInput
          style={styles.rowItem}
          placeholder="Width"
          value={data.width}
          onChangeText={(text) => handleChange('width', text)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.row}>
        <FormInput
          style={styles.rowItem}
          placeholder="Price (Rs.)"
          value={data.price}
          onChangeText={(text) => handleChange('price', text)}
          keyboardType="numeric"
        />
        <FormInput
          style={styles.rowItem}
          placeholder="Quantity"
          value={data.quantity}
          onChangeText={(text) => handleChange('quantity', text)}
          keyboardType="numeric"
        />
      </View>

      <FormDropdown
        label="Select Type"
        value={data.type}
        options={['Solids', 'Prints']}
        onChange={(value) => handleChange('type', value)}
      />

      <FormInput
        placeholder="Count / Construction / Print"
        value={data.constructionOrPrint}
        onChangeText={(text) => handleChange('constructionOrPrint', text)}
      />
    </View>
  );
}

export default BasicDetailsForm; 