import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./components/navigation/AppNavigator";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./store/store";

export default function App() {
  return (
    <StoreProvider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <PaperProvider>
            <AppNavigator />
          </PaperProvider>
        </NavigationContainer>
      </AuthProvider>
    </StoreProvider>
  );
}
