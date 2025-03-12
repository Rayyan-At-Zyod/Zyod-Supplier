import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import NetInfo from "@react-native-community/netinfo";
import { processPendingActions } from "./storage.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadPendingMaterials } from "../functions/loadPendingMaterials";
import { store } from "../../store/store";

const BACKGROUND_SYNC_TASK = "background-sync";
let networkStateUnsubscribe = null;

// Define the background task
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const state = await NetInfo.fetch();
    const token = await AsyncStorage.getItem("userToken");
    if (state.isConnected) {
      console.error(">1. Background sync starts: Network available.");
      await processPendingActions(token);
      await loadPendingMaterials(store.dispatch);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      console.error(">2. Background sync: Device is offline, skipping sync");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (error) {
    console.error("Background sync failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Function to register the background fetch task
export const registerBackgroundSyncTask = async () => {
  try {
    // Register network state change listener with instant sync-er.
    if (!networkStateUnsubscribe) {
      networkStateUnsubscribe = NetInfo.addEventListener(
        handleNetworkStateChange
      );
    }

    // Register background fetch task.
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 2 * 60, // 2 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    // Initial network check...
    const netState = await NetInfo.fetch();
    handleNetworkStateChange(netState);
    console.error(">3. Background sync task & net listeners registered.");
  } catch (err) {
    console.error("Error registering background sync task:", err);
  }
};

// Function to clean up background sync resources
export const cleanupBackgroundSync = () => {
  if (networkStateUnsubscribe) {
    networkStateUnsubscribe();
    networkStateUnsubscribe = null;
  }
};

// Function to sync instantly to remove time gap between network change and task schedule...
const handleNetworkStateChange = async (state) => {
  if (state.isConnected) {
    console.error(">4. Net connected - triggering sync.");
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      await processPendingActions(token);
      await loadPendingMaterials(store.dispatch);
    }
  }
};
