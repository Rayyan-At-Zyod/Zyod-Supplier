import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Alert, Text, View } from "react-native";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./components/navigation/AppNavigator";
import { Provider as PaperProvider } from "react-native-paper";
import {
  Provider as StoreProvider,
  useDispatch,
  useSelector,
} from "react-redux";
import { store } from "./store/store";
import * as Sentry from "@sentry/react-native";
import { addTime, setTime } from "./store/rawMaterialsSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerInternetAvailabilitySyncingTask } from "./services/offline/SERVICES/new-background-task.service";
import { AppState } from "react-native";

import * as Notifications from "expo-notifications";

Sentry.init({
  dsn: "https://0948c8e8eb6e162346e86654eb054a21@o4509047927603200.ingest.de.sentry.io/4509047939203152",
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});

function Timer() {
  const dispatch = useDispatch();
  const time = useSelector((state) => state.rawMaterials.time);
  const [storedTime, setStoredTime] = React.useState(null);

  // On mount, load the persisted timer from AsyncStorage.
  useEffect(() => {
    const loadTimeFromDb = async () => {
      try {
        const dbTimer = await AsyncStorage.getItem("time");
        const initialTime =
          dbTimer !== null && !isNaN(dbTimer) ? parseInt(dbTimer) : 1;
        if (isNaN(dbTimer)) await AsyncStorage.setItem("time", "1000");
        dispatch(setTime(initialTime));
      } catch (err) {
        console.error("Error while initialising time", err);
      }
    };
    loadTimeFromDb();
  }, [dispatch]);

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const value = await AsyncStorage.getItem("time");
        setStoredTime(value);
      } catch (error) {
        console.error("Error getting time from AsyncStorage", error);
      }
    };

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active") {
        fetchTime();
      }
    };

    AppState.addEventListener("change", handleAppStateChange);
    fetchTime(); // Initial fetch

    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  return (
    <View>
      <Text style={{ textAlign: "center", padding: 5 }}>
        Stored Time: {storedTime}
      </Text>
    </View>
  );
}

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
            {/* <Timer /> */}
            <AppNavigator />
          </PaperProvider>
        </NavigationContainer>
      </AuthProvider>
    </StoreProvider>
  );
}

export default Sentry.wrap(App)