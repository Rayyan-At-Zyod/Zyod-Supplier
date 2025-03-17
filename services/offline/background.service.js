import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import NetInfo from "@react-native-community/netinfo";
import * as Sentry from "@sentry/react-native";
import { processPendingActions } from "./storage.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadPendingMaterials } from "../functions/loadPendingMaterials";
import { store } from "../../store/store";
import { Platform } from "react-native";

const BACKGROUND_SYNC_TASK = "background-sync";
const SYNC_LOCK_KEY = "sync_in_progress";
const LAST_SYNC_ATTEMPT_KEY = "last_sync_attempt";
const SYNC_RETRY_INTERVAL = 60000; // 1 minute
let networkStateUnsubscribe = null;
let syncInProgress = false;

// Helper function to manage sync lock with improved reliability
const acquireSyncLock = async () => {
  // If we already have a sync in progress in memory, don't allow another
  if (syncInProgress) {
    return false;
  }
  
  try {
    const lastLock = await AsyncStorage.getItem(SYNC_LOCK_KEY);
    if (lastLock) {
      const lockTime = parseInt(lastLock);
      // If lock is less than 2 minutes old, consider it active
      if (Date.now() - lockTime < 120000) {
        return false;
      }
    }
    
    // Set both in-memory flag and persistent storage
    syncInProgress = true;
    await AsyncStorage.setItem(SYNC_LOCK_KEY, Date.now().toString());
    return true;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
};

const releaseSyncLock = async () => {
  try {
    syncInProgress = false;
    await AsyncStorage.removeItem(SYNC_LOCK_KEY);
  } catch (error) {
    Sentry.captureException(error);
  }
};

// Check if we should attempt a sync based on last attempt time
const shouldAttemptSync = async () => {
  try {
    const lastAttempt = await AsyncStorage.getItem(LAST_SYNC_ATTEMPT_KEY);
    if (!lastAttempt) return true;
    
    const lastAttemptTime = parseInt(lastAttempt);
    return Date.now() - lastAttemptTime > SYNC_RETRY_INTERVAL;
  } catch (error) {
    Sentry.captureException(error);
    return true;
  }
};

// Record a sync attempt
const recordSyncAttempt = async () => {
  try {
    await AsyncStorage.setItem(LAST_SYNC_ATTEMPT_KEY, Date.now().toString());
  } catch (error) {
    Sentry.captureException(error);
  }
};

// Check if there are pending actions to sync
const hasPendingActions = async () => {
  try {
    const pendingActions = await AsyncStorage.getItem("pendingActions");
    return pendingActions && JSON.parse(pendingActions).length > 0;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
};

const performSync = async (token) => {
  if (!token) return;

  // Check if we should attempt a sync
  const shouldSync = await shouldAttemptSync();
  if (!shouldSync) {
    Sentry.captureMessage("Skipping sync due to recent attempt", "info");
    return;
  }
  
  // Check if there are pending actions
  const hasPending = await hasPendingActions();
  if (!hasPending) {
    Sentry.captureMessage("No pending actions to sync", "info");
    return;
  }

  // Capture message for timeline
  Sentry.captureMessage("Performing sync operation", "info");
  await recordSyncAttempt();

  const lockAcquired = await acquireSyncLock();
  if (!lockAcquired) {
    Sentry.captureMessage("Sync operation skipped due to active lock", "info");
    return;
  }

  try {
    // Verify network connection before attempting sync
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      Sentry.captureMessage("Network unavailable during sync attempt", "info");
      return;
    }
    
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

// Define the background task with improved error handling
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

// To handle network state changes with debounce
let networkChangeTimeout = null;
const handleNetworkStateChange = async (state) => {
  if (state.isConnected) {
    // Debounce network changes to prevent multiple syncs
    if (networkChangeTimeout) {
      clearTimeout(networkChangeTimeout);
    }
    
    networkChangeTimeout = setTimeout(async () => {
      Sentry.captureMessage("Network state changed to connected", "info");
      const token = await AsyncStorage.getItem("userToken");
      await performSync(token);
      networkChangeTimeout = null;
    }, 2000); // 2 second debounce
  }
};

// Register background task and network listener with platform-specific settings
export const registerBackgroundSyncTask = async () => {
  try {
    Sentry.captureMessage("Registering background sync task and network listener", "info");
    
    // Set up network listener if not already set
    if (!networkStateUnsubscribe) {
      networkStateUnsubscribe = NetInfo.addEventListener(handleNetworkStateChange);
    }
    
    // Register background task if not already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
      // Configure background fetch with platform-specific settings
      const options = {
        minimumInterval: Platform.OS === 'ios' ? 15 * 60 : 2 * 60, // 15 minutes for iOS, 2 minutes for Android
        stopOnTerminate: false,
        startOnBoot: true,
      };
      
      // Add iOS-specific settings
      if (Platform.OS === 'ios') {
        options.ios = {
          backgroundFetchPriority: BackgroundFetch.BackgroundFetchPriority.High,
        };
      }
      
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, options);
      Sentry.captureMessage("Background sync task registered", "info");
    }
    
    // Perform initial sync if online
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

// Foreground sync function - call this when app comes to foreground
export const performForegroundSync = async () => {
  try {
    Sentry.captureMessage("Performing foreground sync", "info");
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      const token = await AsyncStorage.getItem("userToken");
      await performSync(token);
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("Foreground sync failed:", error);
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
    
    if (networkChangeTimeout) {
      clearTimeout(networkChangeTimeout);
      networkChangeTimeout = null;
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
