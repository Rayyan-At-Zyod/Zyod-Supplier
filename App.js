import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";
import { SyncProvider } from "./context/SyncContext";
import AppNavigator from "./components/navigation/AppNavigator";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./store/store";
import { configureBackgroundSync } from "./services/background/backgroundSync";

export default function App() {
  // Initialize background sync when the app starts
  useEffect(() => {
    configureBackgroundSync().catch(error => {
      console.error("Failed to configure background sync:", error);
    });
  }, []);

  return (
    <StoreProvider store={store}>
      <AuthProvider>
        <SyncProvider>
          <NavigationContainer>
            <PaperProvider>
              <AppNavigator />
            </PaperProvider>
          </NavigationContainer>
        </SyncProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
