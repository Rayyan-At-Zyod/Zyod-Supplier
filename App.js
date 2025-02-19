import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./components/context/AuthContext";
import AppNavigator from "./components/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
