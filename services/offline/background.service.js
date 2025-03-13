import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import NetInfo from "@react-native-community/netinfo";
import { processPendingActions } from "./storage.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadPendingMaterials } from "../functions/loadPendingMaterials";
import { store } from "../../store/store";
import { loadRawMaterials } from "../functions/loadRMs";
import { setLoading, setSyncing } from "../../store/rawMaterialsSlice";

const BACKGROUND_SYNC_TASK = "background-sync";
const SYNC_LOCK_KEY = "sync_in_progress";
let networkStateUnsubscribe = null;

// Helper function to manage sync lock
const acquireSyncLock = async () => {
  const lastLock = await AsyncStorage.getItem(SYNC_LOCK_KEY);
  if (lastLock) {
    const lockTime = parseInt(lastLock);
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
    return;
  }

  try {
    store.dispatch(setSyncing(true));
    store.dispatch(setLoading(true));

    Sentry.addBreadcrumb({
      category: 'sync',
      message: 'Starting background sync',
      level: Sentry.Severity.Info,
    });
    

    await processPendingActions(token);
    await loadPendingMaterials(store.dispatch);
    console.log("Sync completed successfully");

    store.dispatch(setSyncing(false));
    store.dispatch(setLoading(false));
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
      return BackgroundFetch.Result.NewData;
    } else {
      console.log("Background sync: Device is offline, skipping sync");
      return BackgroundFetch.Result.NoData;
    }
  } catch (error) {
    console.error("Background sync failed:", error);
    return BackgroundFetch.Result.Failed;
  }
});

// To handle network state changes
const handleNetworkStateChange = async (state) => {
  if (state.isConnected) {
    const token = await AsyncStorage.getItem("userToken");
    await performSync(token);
  }
};

// Register background task and network listener
export const registerBackgroundSyncTask = async () => {
  try {
    // if networkState listener is null, start the listener
    if (!networkStateUnsubscribe) {
      networkStateUnsubscribe = NetInfo.addEventListener(
        handleNetworkStateChange
      );
    }

    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_SYNC_TASK
    );
    if (!isRegistered) {
      // Register the background fetch task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 2 * 60, // 2 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }

    // Initial network check
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      const token = await AsyncStorage.getItem("userToken");
      await performSync(token);
    }

    console.log("Background sync task and network listeners registered");
  } catch (err) {
    console.error("Error registering background sync task:", err);
  }
};

// Cleanup function
export const cleanupBackgroundSync = async () => {
  try {
    if (networkStateUnsubscribe) {
      networkStateUnsubscribe();
      networkStateUnsubscribe = null;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_SYNC_TASK
    );
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    }
  } catch (error) {
    console.error("Error cleaning up background sync:", error);
  }
};
