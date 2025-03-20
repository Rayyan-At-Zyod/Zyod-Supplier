// internet-availability.task.js

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import NetInfo from "@react-native-community/netinfo";
import { store } from "../../../store/store";
import { addTime } from "../../../store/rawMaterialsSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { processPendingActions } from "../storage.service";
import * as Sentry from "@sentry/react-native";
import { loadRawMaterials } from "../../functions/loadRMs";

const INTERNET_AVAILABILITY_TASK = "internet-availability-task";
const SYNC_LOCK_KEY = "sync_in_progress";

// This flag tracks whether the device was previously offline.
let wasOffline = false;

//Helper to manage sync lock
const checkForSyncLockAvailibility = async () => {
  const lastLock = await AsyncStorage.getItem(SYNC_LOCK_KEY);
  if (lastLock && Date.now() - parseInt(lastLock) < 30000) {
    return false;
  }
  await AsyncStorage.setItem(SYNC_LOCK_KEY, Date.now().toString());
  return true;
};

TaskManager.defineTask(INTERNET_AVAILABILITY_TASK, async () => {
  try {
    Sentry.addBreadcrumb({
      category: "internet-availability",
      message: "Task triggered",
      level: "info",
    });
    console.log("Task triggered: checking internet availability...");
    console.log("-0-0-0-0-0-0-0-0-0");
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;
    if (isConnected) {
      Sentry.addBreadcrumb({
        category: "internet-availability",
        message: "Device is online",
        level: "info",
      });
      const token = await AsyncStorage.getItem("userToken");
      if (wasOffline) {
        // The device was offline, and now it's online: add 1000 to the Redux state.
        const previousTime = store.getState().rawMaterials.time;
        store.dispatch(addTime(1000));
        Sentry.captureMessage("adding 1000 to time.");
        // Add 1000 to the Async Storage db.
        await AsyncStorage.setItem("time", (previousTime + 1000).toString());
        // Reset the flag
        wasOffline = false;
      }
      store.dispatch(addTime(500));
      Sentry.captureMessage("added 500 to time... processing all actions...");
      if (await checkForSyncLockAvailibility()) {
        Sentry.addBreadcrumb({
          category: "internet-availability",
          message: "Processing pending actions after the minute. . .",
          level: "info",
        });
        await processPendingActions(token);
      }
    } else {
      // Mark that the device is offline.
      wasOffline = true;
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error in internet availability task:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerInternetAvailabilitySyncingTask() {
  try {
    await BackgroundFetch.registerTaskAsync(INTERNET_AVAILABILITY_TASK, {
      minimumInterval: 60, // Minimum interval in seconds between task runs.
      stopOnTerminate: false, // (Android only) Continue running after app is terminated.
      startOnBoot: true, // (Android only) Start task on device boot.
    });
    console.log("Internet availability task registered successfully");
    Sentry.addBreadcrumb({
      category: "internet-availability",
      message: "Task registered successfully",
      level: "info",
    });
  } catch (error) {
    console.error("Failed to register internet availability task", error);
  }
}
