import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import NetInfo from "@react-native-community/netinfo";
import { processPendingActions } from "./storage.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadPendingMaterials } from "../functions/loadPendingMaterials";
import { store } from "../../store/store";
import { Alert } from "react-native";

// Define the background task
TaskManager.defineTask("background-sync", async () => {
  try {
    const state = await NetInfo.fetch();
    const token = await AsyncStorage.getItem("userToken");
    if (state.isConnected) {
      Alert.alert("Hi RAYYN", "- Our background task is running.");
      // Replace `YOUR_TOKEN` with the appropriate token if needed
      await processPendingActions(token);
      Alert.alert("Hi RAYYN", "- All pending tasks done.");
      await loadPendingMaterials(store.dispatch);
      Alert.alert("Hi RAYYN", "- all pending actions cleared in UI.");
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      console.log("Device is offline, skipping background sync.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (error) {
    console.error("Background sync failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Function to register the background fetch task
export const registerBackgroundSyncTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync("background-sync", {
      //   minimumInterval: 15 * 60, // 15 minutes (minimum interval, actual timing is OS-managed)
      minimumInterval: 10, // 10 seconds (for testing, minimum interval, OS-managed)
      stopOnTerminate: false, // Continue running after app termination
      startOnBoot: true, // Start on device boot
    });
    console.log("Background sync task registered");
  } catch (error) {
    console.error("Error registering background sync task:", error);
  }
};
