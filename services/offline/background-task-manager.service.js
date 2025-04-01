import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Sentry from "@sentry/react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { processPendingActions } from "./process-storage";
import * as Notifications from "expo-notifications";
import { Platform } from 'react-native';
import BackgroundActions from 'react-native-background-actions';

const INTERNET_AVAILABILITY_TASK = "internet-availability-task";
const SYNC_LOCK_KEY = "sync_in_progress";
const LOCK_DURATION = 240000; // 4 minutes
const SYNC_NOTIFICATION_ID = "sync-notification";

// Configure notification channel for Android
const configureNotifications = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('sync-channel', {
        name: 'Sync Status',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  } catch (error) {
    Sentry.captureException("Failed to configure notifications", error);
  }
};

const backgroundOptions = {
  taskName: 'SyncTask',
  taskTitle: 'Data Sync',
  taskDesc: 'Processing pending actions',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourScheme://chat/jane',
  parameters: {
    delay: 1000,
  },
};

// Helper to manage sync lock
export const checkForSyncLockAvailibility = async () => {
  try {
    const lastLock = await AsyncStorage.getItem(SYNC_LOCK_KEY);
    if (lastLock && Date.now() - parseInt(lastLock) < LOCK_DURATION) {
      return false;
    }
    await AsyncStorage.setItem(SYNC_LOCK_KEY, Date.now().toString());
    return true;
  } catch (error) {
    Sentry.captureException("error checking for sync lock key.", error);
    return false;
  }
};

export const clearSyncLock = async () => {
  try {
    await AsyncStorage.removeItem(SYNC_LOCK_KEY);
  } catch (error) {
    Sentry.captureException("error removing sync lock key from db.", error);
  }
};

const showSyncNotification = async (status, message) => {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: SYNC_NOTIFICATION_ID,
      content: {
        title: `Sync ${status}`,
        body: message,
        priority: 'high',
        sticky: true,
        autoCancel: false,
      },
      trigger: null,
    });
  } catch (error) {
    Sentry.captureException(`Failed to show notification: ${error}`);
  }
};

const removeSyncNotification = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync(SYNC_NOTIFICATION_ID);
  } catch (error) {
    Sentry.captureException(`Failed to remove notification: ${error}`);
  }
};

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const backgroundTask = async (taskDataArguments) => {
  const { delay } = taskDataArguments;
  
  try {
    // Check network first
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      await BackgroundActions.stop();
      return;
    }

    // Check token
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      await BackgroundActions.stop();
      return;
    }

    // Check lock
    if (!(await checkForSyncLockAvailibility())) {
      await BackgroundActions.stop();
      return;
    }

    try {
      // Get pending actions count
      const pendingActions = await AsyncStorage.getItem("pendingActions");
      const actions = pendingActions ? JSON.parse(pendingActions) : [];
      
      if (actions.length === 0) {
        await BackgroundActions.stop();
        return;
      }

      // Process the actions
      await processPendingActions(token);
      await sleep(delay);
      
    } finally {
      await clearSyncLock();
    }
  } catch (error) {
    await clearSyncLock();
    Sentry.captureException(`Error in background task: ${error.toString()}`);
  }
};

// Define the background task
TaskManager.defineTask(INTERNET_AVAILABILITY_TASK, async () => {
  try {
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;

    if (!isConnected) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    if (!(await checkForSyncLockAvailibility())) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    try {
      // Start background action
      await BackgroundActions.start(backgroundTask, backgroundOptions);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } finally {
      await clearSyncLock();
    }
  } catch (error) {
    await clearSyncLock();
    Sentry.captureException(`Error in bg task: ${error.toString()}`);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerInternetAvailabilitySyncingTask() {
  try {
    // Configure notifications first
    await configureNotifications();

    // Unregister any existing task first
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(INTERNET_AVAILABILITY_TASK);
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(INTERNET_AVAILABILITY_TASK);
      }
    } catch (e) {
      Sentry.captureException(`Error checking task registration: ${e}`);
    }

    // Register the task with more aggressive settings
    await BackgroundFetch.registerTaskAsync(INTERNET_AVAILABILITY_TASK, {
      minimumInterval: 900, // 15 minutes in seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });

    Sentry.addBreadcrumb({
      category: "internet-availability",
      message: "Task registered successfully",
      level: "info",
    });

    // Start the background task immediately
    try {
      await BackgroundActions.start(backgroundTask, backgroundOptions);
    } catch (error) {
      Sentry.captureException(`Error starting initial background task: ${error}`);
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("Failed to register internet availability task:", error);
    throw error; // Re-throw to be caught by App.js
  }
}
