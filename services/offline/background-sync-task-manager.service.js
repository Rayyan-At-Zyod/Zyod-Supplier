import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Sentry from "@sentry/react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { processPendingActions } from "./process-storage";

const INTERNET_AVAILABILITY_TASK = "internet-availability-task";
const SYNC_LOCK_KEY = "sync_in_progress";
const LOCK_DURATION = 240000; // 4 minutes

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
      // Trigger a local notification to indicate the background task has started.
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Background Task Triggered",
          body: "Sync process is now running.",
        },
        trigger: null, // Immediately
      });

      // Process pending actions
      // step 1
      Sentry.captureMessage(`Step1: Start pending actions sync.`);
      await processPendingActions(token);
      Sentry.captureMessage(`Step1 finished.`);

      // step 2
      Sentry.captureMessage(`Step2: Change the timer.`);
      let time = await AsyncStorage.getItem("time");
      time = time ? parseInt(time) + 1 : 0;
      await AsyncStorage.setItem("time", time.toString());
      Sentry.captureMessage(`Step2 finished.`);

      return BackgroundFetch.BackgroundFetchResult.NewData;
    } finally {
      // step 3
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
    await BackgroundFetch.registerTaskAsync(INTERNET_AVAILABILITY_TASK, {
      minimumInterval: 15,
      stopOnTerminate: false,
      startOnBoot: true,
    });

    Sentry.addBreadcrumb({
      category: "internet-availability",
      message: "Task registered successfully",
      level: "info",
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Failed to register internet availability task:", error);
  }
}
