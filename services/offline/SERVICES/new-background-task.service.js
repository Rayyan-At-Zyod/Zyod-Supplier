import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { processPendingActions } from "../storage.service";
import * as Sentry from "@sentry/react-native";

const INTERNET_AVAILABILITY_TASK = "internet-availability-task";
const SYNC_LOCK_KEY = "sync_in_progress";
const LOCK_DURATION = 240000; // 4 times the background task interval = 4 minutes. ...

// Helper to manage sync lock
const checkForSyncLockAvailibility = async () => {
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

const clearSyncLock = async () => {
  try {
    await AsyncStorage.removeItem(SYNC_LOCK_KEY);
  } catch (error) {
    Sentry.captureException("error removing sync lock key from db.", error);
  }
};

TaskManager.defineTask(INTERNET_AVAILABILITY_TASK, async () => {
  try {
    Sentry.addBreadcrumb({
      category: "internet-availability",
      message: "Task triggered",
      level: "info",
    });

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
      // Process pending actions
      Sentry.captureMessage("processing pending actions.");
      await processPendingActions(token);

      // Store the time update to be applied when app becomes active
      const previousTime = await AsyncStorage.getItem("time");
      const newTime = (parseInt(previousTime || "0") + 1500).toString();
      await AsyncStorage.setItem("time", newTime);
      await AsyncStorage.setItem("pending_time_update", "true");

      Sentry.addBreadcrumb({
        category: "internet-availability",
        message: "Successfully processed pending actions",
        level: "info",
      });

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
    await BackgroundFetch.registerTaskAsync(INTERNET_AVAILABILITY_TASK, {
      minimumInterval: 60,
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
