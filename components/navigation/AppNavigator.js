import React, { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../../context/AuthContext";
import ViewRMScreen from "../screens/raw-material/ViewRM";
import AddRMScreen from "../screens/raw-material/AddRM";
import SignInScreen from "../screens/auth/SignInScreen";
import HomeNavigatorScreen from "./HomeNavigator";
import LoadingModal from "../util/LoadingModal";
import SignUpScreen from "../screens/auth/SignUpScreen";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useDispatch } from "react-redux";
import * as Sentry from "@sentry/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addTime, setLoading, setSyncing } from "../../store/rawMaterialsSlice";
import {
  checkForSyncLockAvailibility,
  clearSyncLock,
} from "../../services/offline/background-sync-task-manager.service";
import { processPendingActions } from "../../services/offline/process-storage";
import { loadRawMaterials } from "../../services/functions/loadRMs";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { token } = useAuth();
  const { isOnline } = useNetworkStatus();
  const isOnlineRef = useRef(isOnline);
  const dispatch = useDispatch();

  // // This processPendingActions is for when app is in the foreground.
  // useEffect(() => {
  //   isOnlineRef.current = isOnline;
  //   if (isOnline) {
  //     processActions();
  //   }
  // }, [isOnline]);

  // Set up an interval that runs every 2 minutes.
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (isOnline) processActions();
    }, 120 * 1000); // 2 minutes

    if (isOnline) {
      processActions();
    }

    return () => clearInterval(syncInterval);
  }, [isOnline]);

  const processActions = async () => {
    if (isOnline) {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (await checkForSyncLockAvailibility()) {
          Sentry.addBreadcrumb({
            category: "foreground-sync",
            message: "Processing pending actions",
            level: "info",
          });
          const pendActsString = await AsyncStorage.getItem("pendingActions");
          const pendingActions = pendActsString
            ? JSON.parse(pendActsString)
            : [];
          if (pendingActions.length > 0) {
            // dispatch(setSyncing(true));
            // dispatch(setLoading(true));
            await processPendingActions(token);
            await loadRawMaterials(token, true, dispatch);
            // dispatch(setLoading(false));
            // dispatch(setSyncing(false));
          }
          await clearSyncLock();
        }
      } catch (error) {
        Sentry.captureException(error);
        console.error(`Foreground sync failed: ${error}`);
      }
    }
  };

  return (
    <>
      <LoadingModal />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen
              name="MainApp"
              component={HomeNavigatorScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ViewRawMaterial"
              component={ViewRMScreen}
              options={{
                headerShown: true,
                headerTitle: "View Material",
                headerTintColor: "black",
                headerTitleAlign: "center",
                headerStyle: {
                  backgroundColor: "white",
                },
                headerBackVisible: true,
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="AddRawMaterial"
              component={AddRMScreen}
              options={{
                headerShown: true,
                headerTitle: "Add Raw Material",
                headerTintColor: "black",
                headerTitleAlign: "center",
                headerStyle: {
                  backgroundColor: "white",
                },
                headerBackVisible: true,
                headerBackTitle: "Back",
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
