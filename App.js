gimport React, { useEffect } from "react";
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
import { useNetworkStatus } from "./hooks/useNetworkStatus";

Sentry.init({
  dsn: "https://b964b86e7db7bf5d4f1fed35e7194041@o4508969385852928.ingest.de.sentry.io/4508969386377296",
  tracesSampleRate: 1.0,
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
        console.log("the db timer form async store is", dbTimer);
        const initialTime =
          dbTimer !== null && !isNaN(dbTimer) ? parseInt(dbTimer) : 1;
        if (isNaN(dbTimer)) await AsyncStorage.setItem("time", "1");
        dispatch(setTime(initialTime));
      } catch (err) {
        console.error("Error while initialising time", err);
      }
    };
    loadTimeFromDb();
  }, [dispatch]);

  // This timer updates every second when the app is in the foreground.
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(addTime(1));
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Update AsyncStorage whenever 'time' changes.
  useEffect(() => {
    const setTimeInDb = async () => {
      try {
        await AsyncStorage.setItem("time", time.toString());
      } catch (error) {
        console.error("Error setting time in AsyncStorage", error);
      }
    };
    setTimeInDb();
  }, [time]);

  // For display purposes, read the current AsyncStorage value.
  useEffect(() => {
    const getTimeFromDb = async () => {
      try {
        const value = await AsyncStorage.getItem("time");
        setStoredTime(value);
      } catch (error) {
        console.error("Error getting time from AsyncStorage", error);
      }
    };
    getTimeFromDb();
  }, [time]);

  return (
    <View>
      <Text style={{ textAlign: "center", padding: 5 }}>
        Stored Time: {storedTime}
      </Text>
      <Text style={{ textAlign: "center", padding: 5 }}>
        Redux Time: {time}
      </Text>
    </View>
  );
}

export default function App() {
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
