import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, StatusBar } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import ArchivedTab from "./ArchivedTab";
import CurrentTab from "./CurrentTab";
import ZYOD from "../../../assets/ZYOD.jpg";
import { useAuth } from "../../context/AuthContext";
import LoadingModal from "../../util/LoadingModal";

// Create Top Tab Navigator
const TopTab = createMaterialTopTabNavigator();

function HomeScreen() {
  const { token, userData } = useAuth();
  const [rawMaterials, setRawMaterials] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRawMaterials();
  }, []);

  const loadRawMaterials = async () => {
    console.log("=== Raw materials load attempt. ===");
    setLoading(true);
    try {
      const response = await fetch(
        "https://dev-api.zyod.com/v1/rawMaterial/groupedRmVariations?page=1&size=10",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.toString()}`,
          },
        }
      );

      console.log("Response status", response.status);
      console.log("Response OK", response.ok);

      const data = await response.json();
      console.log(
        JSON.stringify(data, null, 2),
        "\n=== Result array above ==="
      );

      if (!response.ok || !data.success) {
        console.log("API request failed:", data);
        throw new Error(data.message || "Raw material fetch failed");
      }

      setRawMaterials(data.data);
    } catch (err) {
      console.error("=== Raw Materials Fetch Error ===");
      console.error("Error type:", err.constructor.name);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      setError(err.message || "An error occurred during sign in");
    } finally {
      console.log("Raw materials load attempt complete.");
      setLoading(false);
    }
  };

  if (loading) return <LoadingModal />;
  else
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
          <TopTab.Screen
            name="Current"
            options={{ title: "Current" }}
            component={CurrentTab}
            initialParams={{
              rawMaterials,
              setRawMaterials,
              loadRawMaterials,
            }}
          />
          <TopTab.Screen name="Archived" component={ArchivedTab} />
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
