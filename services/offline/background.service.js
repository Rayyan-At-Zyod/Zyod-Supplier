import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import NetInfo from "@react-native-community/netinfo";
import * as Sentry from "@sentry/react-native";
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
    const lockTime = parseInt(lastLock);
    if (Date.now() - lockTime < 120000) {
      return false;
    }
  }
  await AsyncStorage.setItem(SYNC_LOCK_KEY, Date.now().toString());
  return true;
};

const releaseSyncLock = async () => {
  await AsyncStorage.removeItem(SYNC_LOCK_KEY);
};

const performSync = async (token) => {
  if (!token) return;

  // Capture message for timeline
  Sentry.captureMessage("Performing sync operation", "info");

  const lockAcquired = await acquireSyncLock();
  if (!lockAcquired) {
    Sentry.captureMessage("Sync operation skipped due to active lock", "info");
    return;
  }

  try {
    await processPendingActions(token);
    await loadPendingMaterials(store.dispatch);
    console.log("Sync completed successfully");
    Sentry.captureMessage("Sync completed successfully", "info");
  } catch (error) {
    Sentry.captureException(error);
    console.error("Sync failed:", error);
  } finally {
    await releaseSyncLock();
  }
};

// Define the background task
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  Sentry.captureMessage("Background sync task triggered", "info");
  try {
    const state = await NetInfo.fetch();
    const token = await AsyncStorage.getItem("userToken");

    if (state.isConnected) {
      await performSync(token);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      Sentry.captureMessage("Device offline - skipping background sync", "info");
      console.log("Background sync: Device is offline, skipping sync");
      return BackgroundFetch.Result.NoData;
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("Background sync failed:", error);
    return BackgroundFetch.Result.Failed;
  }
});

// To handle network state changes
const handleNetworkStateChange = async (state) => {
  if (state.isConnected) {
    Sentry.captureMessage("Network state changed to connected", "info");
    const token = await AsyncStorage.getItem("userToken");
    await performSync(token);
  }
};

// Register background task and network listener
export const registerBackgroundSyncTask = async () => {
  try {
    Sentry.captureMessage("Registering background sync task and network listener", "info");
    if (!networkStateUnsubscribe) {
      networkStateUnsubscribe = NetInfo.addEventListener(handleNetworkStateChange);
    }
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 2 * 60, // 2 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      Sentry.captureMessage("Background sync task registered", "info");
    }
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      const token = await AsyncStorage.getItem("userToken");
      await performSync(token);
    }
    console.log("Background sync task and network listeners registered");
    Sentry.captureMessage("Background sync task and network listeners registered", "info");
  } catch (err) {
    Sentry.captureException(err);
    console.error("Error registering background sync task:", err);
  }
};

// Cleanup function
export const cleanupBackgroundSync = async () => {
  try {
    Sentry.captureMessage("Cleaning up background sync task and network listener", "info");
    if (networkStateUnsubscribe) {
      networkStateUnsubscribe();
      networkStateUnsubscribe = null;
    }
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
      Sentry.captureMessage("Background sync task unregistered", "info");
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error cleaning up background sync:", error);
  }
};
