import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import NetInfo from "@react-native-community/netinfo";
import { processPendingActions } from "./storage.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadPendingMaterials } from "../functions/loadPendingMaterials";
import { store } from "../../store/store";

const BACKGROUND_SYNC_TASK = "background-sync";
const SYNC_LOCK_KEY = "sync_in_progress";
let networkStateUnsubscribe = null;

// Helper function to manage sync lock
const acquireSyncLock = async () => {
  const lastLock = await AsyncStorage.getItem(SYNC_LOCK_KEY);
  if (lastLock) {
    const lockTime = await AsyncStorage.getItem(SYNC_LOCK_KEY);
    // If lock is older than 2 minutes, its old.
    if (Date.now() - lockTime < 120000) {
      //  Less than 2 mins
      return false;
    }
  }
  await AsyncStorage.setItem(SYNC_LOCK_KEY, Date.now().toString());
  return true;
};

const releaseSyncLock = async () => {
  await AsyncStorage.removeItem(SYNC_LOCK_KEY);
};

// Function to perform the actual sync
const performSync = async (token) => {
  if (!token) return;

  const lockAcquired = await acquireSyncLock();
  if (!lockAcquired) {
    // console.log("Sync already in progress, skipping...");
    return;
  }

  try {
    // console.log("Starting sync process...");
    await processPendingActions(token);
    await loadPendingMaterials(store.dispatch);
    console.log("Sync completed successfully");
  } catch (error) {
    console.error("Sync failed:", error);
  } finally {
    await releaseSyncLock();
  }
};

// Define the background task
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const state = await NetInfo.fetch();
    const token = await AsyncStorage.getItem("userToken");

    if (state.isConnected) {
      await performSync(token);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      console.log("Background sync: Device is offline, skipping sync");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (error) {
    console.error("Background sync failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// To handle network state changes
const handleNetworkStateChange = async (state) => {
  if (state.isConnected) {
    const token = await AsyncStorage.getItem("userToken");
    await performSync(token);
  }
};

// Main task registry function
export const registerBackgroundSyncTask = async () => {
  try {
    // Register network state change listener
    if (!networkStateUnsubscribe) {
      networkStateUnsubscribe = NetInfo.addEventListener(
        handleNetworkStateChange
      );
    }

    // Register the task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 2 * 60, // 2 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    // Initial network check - is yes perform sync.
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      const token = await AsyncStorage.getItem("userToken");
      await performSync(token);
    }
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
