import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./components/navigation/AppNavigator";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./store/store";
import * as Sentry from "@sentry/react-native";
import * as Notifications from "expo-notifications";
import { registerInternetAvailabilitySyncingTask } from "./services/offline/background-task-manager.service";

Sentry.init({
  dsn: "https://0948c8e8eb6e162346e86654eb054a21@o4509047927603200.ingest.de.sentry.io/4509047939203152",
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});

// Configure notification handling (for both foreground and background)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function App() {
  useEffect(() => {
    (async () => {
      const settings = await Notifications.getPermissionsAsync();
      if (!settings.granted) {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  useEffect(() => {
    registerInternetAvailabilitySyncingTask();
  }, []);

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

export default Sentry.wrap(App);
