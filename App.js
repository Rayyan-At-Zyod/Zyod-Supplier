import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Text, TextInput, Platform } from "react-native";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./components/navigation/AppNavigator";
import { Provider as PaperProvider, configureFonts } from "react-native-paper";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./store/store";
import { registerBackgroundSyncTask } from "./services/offline/background.service";

export default function App() {
  useEffect(() => {
    // Register the background sync task when the app starts
    registerBackgroundSyncTask();
    console.log("We have registered the background task.")
  }, []);

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

// // Disable font scaling globally for all Text components
// if (Text.defaultProps == null) {
//   Text.defaultProps = {};
// }
// Text.defaultProps.allowFontScaling = false;

// // Disable font scaling for TextInput components
// if (TextInput.defaultProps == null) {
//   TextInput.defaultProps = {};
// }
// TextInput.defaultProps.allowFontScaling = false;

// Configure react-native-paper theme to disable font scaling
const theme = {
  fonts: configureFonts({
    config: {
      ios: {
        regular: {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
          fontWeight: '400',
          allowFontScaling: false,
        },
        medium: {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
          fontWeight: '500',
          allowFontScaling: false,
        },
        light: {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
          fontWeight: '300',
          allowFontScaling: false,
        },
        thin: {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
          fontWeight: '200',
          allowFontScaling: false,
        },
      },
      android: {
        regular: {
          fontFamily: 'normal',
          fontWeight: '400',
          allowFontScaling: false,
        },
        medium: {
          fontFamily: 'normal',
          fontWeight: '500',
          allowFontScaling: false,
        },
        light: {
          fontFamily: 'normal',
          fontWeight: '300',
          allowFontScaling: false,
        },
        thin: {
          fontFamily: 'normal',
          fontWeight: '200',
          allowFontScaling: false,
        },
      }
    }
  })
};
