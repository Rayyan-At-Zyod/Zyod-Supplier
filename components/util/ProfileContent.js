import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const ProfileContent = ({ icon, label, value }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.field}>
      <Ionicons name={icon} size={20} color="black" />
      <Text style={styles.fieldValue}>{value || "N/A"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 15,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  fieldLabel: {
    fontSize: 18,
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default ProfileContent; 