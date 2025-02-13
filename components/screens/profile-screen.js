import { View, Text, StatusBar, StyleSheet } from "react-native";
import React from "react";

// Profile Screen Component
function ProfileScreen() {
  return (
    <View style={styles.tabView}>
      {console.log("profile screen")}
      <Text style={styles.tabContent}>Profile Screen</Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  tabView: {
    backgroundColor: "red",
    fontSize: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    borderWidth: 1,
    borderColor: "blue",
  },
});
