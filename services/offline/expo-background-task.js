import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Sentry from "@sentry/react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { processPendingActions } from './process-storage';
import NetInfo from "@react-native-community/netinfo";

// Define the task name
const BACKGROUND_SYNC_TASK = 'background-sync-task';
const SYNC_LOCK_KEY = 'sync_in_progress';
const LOCK_DURATION = 240000; // 4 minutes (same as original)

// Helper to manage sync lock (reusing same logic)
export const checkForSyncLockAvailibility = async () => {
  try {
    const lastLock = await AsyncStorage.getItem(SYNC_LOCK_KEY);
    if (lastLock && Date.now() - parseInt(lastLock) < LOCK_DURATION) {
      return false;
    }
    await AsyncStorage.setItem(SYNC_LOCK_KEY, Date.now().toString());
    return true;
  } catch (error) {
    Sentry.captureException("Error checking for sync lock key", error);
    return false;
  }
};

export const clearSyncLock = async () => {
  try {
    await AsyncStorage.removeItem(SYNC_LOCK_KEY);
  } catch (error) {
    Sentry.captureException("Error removing sync lock key from db", error);
  }
};

// Define the task that will be executed in the background
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    Sentry.captureMessage("Background sync task started");
    
    // Check for network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Sentry.captureMessage("Background task: No internet connection detected");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    // Check for authentication token
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      Sentry.captureMessage("Background task: No user token available");
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
    
    // Check for sync lock
    if (!(await checkForSyncLockAvailibility())) {
      Sentry.captureMessage("Background task: Sync already in progress");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    try {
      // Show notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Background Sync",
          body: "Syncing your data in the background...",
        },
        trigger: null, // Immediate notification
      });
      
      // Process pending actions
      Sentry.captureMessage("Background task: Starting pending actions sync");
      await processPendingActions(token);
      Sentry.captureMessage("Background task: Pending actions sync completed");
      
      // Update time value
      let time = await AsyncStorage.getItem("time");
      time = time ? parseInt(time) + 1 : 0;
      await AsyncStorage.setItem("time", time.toString());
      Sentry.captureMessage(`Background task: Updated time to ${time}`);
      
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } finally {
      await clearSyncLock();
    }
  } catch (error) {
    await clearSyncLock();
    Sentry.captureException(`Background task error: ${error.toString()}`);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background fetch task
export async function registerBackgroundSync(minimumInterval = 15) {
  try {
    // Request permissions first if needed
    await BackgroundFetch.getStatusAsync();
    
    // Register the task
    const status = await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval, // in minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    
    Sentry.captureMessage(`Background sync registered with status: ${status}`);
    return true;
  } catch (error) {
    Sentry.captureException(`Failed to register background sync: ${error.toString()}`);
    console.error("Error registering background task:", error);
    return false;
  }
}

// Unregister the background fetch task
export async function unregisterBackgroundSync() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    Sentry.captureMessage("Background sync unregistered");
    return true;
  } catch (error) {
    Sentry.captureException(`Failed to unregister background sync: ${error.toString()}`);
    console.error("Error unregistering background task:", error);
    return false;
  }
}

// Check if the task is registered
export async function isBackgroundSyncRegistered() {
  const tasks = await TaskManager.getRegisteredTasksAsync();
  return tasks.some(task => task.taskName === BACKGROUND_SYNC_TASK);
} 