import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Optional: For adding icons to tabs

import HomeScreen from "./components/screens/home-screen";
import ProfileScreen from "./components/screens/profile-screen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "black", // Tab is active
          tabBarInactiveTintColor: "gray", // Tab is inactive
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        {/* <Tab.Screen name="Profile" component={ProfileScreen} /> */}
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerTitle: "My Profile",
            headerRight: () => (
              <TouchableOpacity
                onPress={() => console.log("Menu Clicked")}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="ellipsis-vertical" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
