import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

import ArchivedTab from "./ArchivedTab";
import CurrentTab from "./CurrentTab";
import ZYOD from "../../../assets/ZYOD.jpg";

// Create Top Tab Navigator
const TopTab = createMaterialTopTabNavigator();

function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Image */}
      <View style={styles.header}>
        <Image source={ZYOD} style={styles.headerImage} />
      </View>

      {/* Nested Top Tab Navigator */}
      <View style={{ flex: 1 }}>
        <TopTab.Navigator
          initialRouteName="Current"
          screenOptions={{
            tabBarActiveTintColor: "black",
            tabBarInactiveTintColor: "gray",
            tabBarIndicatorStyle: { backgroundColor: "black" },
          }}
        >
          <TopTab.Screen
            name="Current"
            options={{ title: "Current" }}
            component={CurrentTab}
          />
          <TopTab.Screen name="Archived" component={ArchivedTab} />
        </TopTab.Navigator>
      </View>

      <ExpoStatusBar style="auto" />
    </SafeAreaView>
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
