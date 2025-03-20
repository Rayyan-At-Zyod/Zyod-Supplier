import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { store } from "../../../store/store";
import { addTime } from "../../../store/rawMaterialsSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const BACKGROUND_TASK = "background-task";

// This flag tracks whether the device was previously offline.
let wasOffline = false;

TaskManager.defineTask(BACKGROUND_TASK, async () => {
  try {
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;
    console.log(
      "Internet availability task running. isConnected:",
      isConnected,
      "at",
      new Date().toISOString()
    );
    console.log("60s bg-task running at:", new Date().toISOString());

    if (isConnected) {
      // For example, add 60 seconds to your timer each time this task runs.
      const previousTime = store.getState().rawMaterials.time;
      store.dispatch(addTime(60));
      await AsyncStorage.setItem("time", (previousTime + 60).toString());

      // Reset the flag
      wasOffline = false;
    } else {
      // Mark that the device is offline.
      wasOffline = true;
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Error in background task:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundTask() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
      minimumInterval: 60, // minimum interval in seconds between invocations
      stopOnTerminate: false, // continue running after app is terminated (Android only)
      startOnBoot: true, // start on device boot (Android only)
    });
    console.log("Background task registered successfully");
  } catch (error) {
    console.error("Failed to register background task", error);
  }
}
