import React from "react";
import { View, Text, Image, StyleSheet, StatusBar } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import ArchivedScreen from "./ArchivedScreen";
import CurrentScreen from "./CurrentScreen";
import ZYOD from "../../../assets/ZYOD.jpg";

// Create Top Tab Navigator
const TopTab = createMaterialTopTabNavigator();

function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Header with Image */}
      <View style={styles.header}>
        <Image source={ZYOD} style={styles.headerImage} />
      </View>

      {/* Nested Top Tab Navigator */}
      <TopTab.Navigator
        initialRouteName="Current"
        screenOptions={{
          tabBarActiveTintColor: "black",
          tabBarInactiveTintColor: "gray",
          tabBarIndicatorStyle: { backgroundColor: "black" },
        }}
      >
        <TopTab.Screen name="Current" component={CurrentScreen} />
        <TopTab.Screen name="Archived" component={ArchivedScreen} />
      </TopTab.Navigator>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 200, // Adjust height as needed
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  tabContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
