import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";
import { API_ENDPOINTS } from "../../services/api/endpoints";

const OverflowMenu = () => {
  const [visible, setVisible] = useState(false);

  const toggleMenu = () => setVisible(!visible);

  const handleOptionPress = (url) => {
    Linking.openURL(url);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleMenu}>
        <Ionicons name="ellipsis-vertical" size={24} color="white" />
      </TouchableOpacity>
      {visible && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            onPress={() => handleOptionPress(API_ENDPOINTS.PRIVACY_POLICY)}
          >
            <Text style={styles.menuItem}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOptionPress(API_ENDPOINTS.TERMS_CONDITIONS)}
          >
            <Text style={styles.menuItem}>Terms & Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOptionPress(API_ENDPOINTS.LOGOUT)}
          >
            <Text style={styles.menuItem}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOptionPress(API_ENDPOINTS.DELETE_ACCOUNT)}
          >
            <Text style={styles.menuItem}>Delete My Account</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginRight: 15 },
  menuContainer: {
    position: "absolute",
    top: 30, // Adjust as needed for your header height
    right: 0,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  menuItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: "black",
  },
});

export default OverflowMenu;
