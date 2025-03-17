import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Text, TextInput, Platform } from "react-native";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./components/navigation/AppNavigator";
import { Provider as PaperProvider, configureFonts } from "react-native-paper";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./store/store";
import {
  registerBackgroundSyncTask,
  cleanupBackgroundSync,
} from "./services/offline/background.service";
// import { saveToCache } from "./services/offline/storage.service";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://b964b86e7db7bf5d4f1fed35e7194041@o4508969385852928.ingest.de.sentry.io/4508969386377296", // Replace with your DSN
  tracesSampleRate: 1.0,
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default function App() {
  // useEffect(() => {
  //   // Register the background sync task when the app starts
  //   registerBackgroundSyncTask();

  //   // Cleanup when the app is unmounted
  //   return () => {
  //     cleanupBackgroundSync();
  //   };
  // }, []);

  return (
    <StoreProvider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <PaperProvider theme={theme}>
            <AppNavigator />
          </PaperProvider>
        </NavigationContainer>
      </AuthProvider>
    </StoreProvider>
  );
}

const theme = {
  fonts: configureFonts({
    config: {
      ios: {
        regular: {
          fontFamily: Platform.OS === "ios" ? "System" : "normal",
          fontWeight: "400",
          allowFontScaling: false,
        },
        medium: {
          fontFamily: Platform.OS === "ios" ? "System" : "normal",
          fontWeight: "500",
          allowFontScaling: false,
        },
        light: {
          fontFamily: Platform.OS === "ios" ? "System" : "normal",
          fontWeight: "300",
          allowFontScaling: false,
        },
        thin: {
          fontFamily: Platform.OS === "ios" ? "System" : "normal",
          fontWeight: "200",
          allowFontScaling: false,
        },
      },
      android: {
        regular: {
          fontFamily: "normal",
          fontWeight: "400",
          allowFontScaling: false,
        },
        medium: {
          fontFamily: "normal",
          fontWeight: "500",
          allowFontScaling: false,
        },
        light: {
          fontFamily: "normal",
          fontWeight: "300",
          allowFontScaling: false,
        },
        thin: {
          fontFamily: "normal",
          fontWeight: "200",
          allowFontScaling: false,
        },
      },
    },
  }),
};
