import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Sentry from "@sentry/react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { processPendingActions } from "./process-storage";
import * as Notifications from "expo-notifications";
import { Platform } from 'react-native';
// import { foregroundService } from './foreground.service';

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

// // Define the background task
// TaskManager.defineTask(INTERNET_AVAILABILITY_TASK, async () => {
//   try {
//     const netInfo = await NetInfo.fetch();
//     if (!netInfo.isConnected) {
//       return BackgroundFetch.BackgroundFetchResult.NoData;
//     }

//     const token = await AsyncStorage.getItem("userToken");
//     if (!token) {
//       return BackgroundFetch.BackgroundFetchResult.Failed;
//     }

//     if (!(await checkForSyncLockAvailibility())) {
//       return BackgroundFetch.BackgroundFetchResult.NoData;
//     }

//     try {
//       // Start foreground service for Android
//       if (Platform.OS === 'android') {
//         await foregroundService.startService();
//       }

//       // Get pending actions
//       const pendingActions = await AsyncStorage.getItem("pendingActions");
//       const actions = pendingActions ? JSON.parse(pendingActions) : [];
      
//       if (actions.length === 0) {
//         await foregroundService.stopService();
//         return BackgroundFetch.BackgroundFetchResult.NoData;
//       }

//       // Process actions with progress updates
//       let processed = 0;
//       for (const action of actions) {
//         await processPendingActions(token);
//         processed++;
        
//         // Update progress
//         const progress = Math.round((processed / actions.length) * 100);
//         await foregroundService.updateNotification(progress);
//       }

//       return BackgroundFetch.BackgroundFetchResult.NewData;
//     } finally {
//       await clearSyncLock();
//       if (Platform.OS === 'android') {
//         await foregroundService.stopService();
//       }
//     }
//   } catch (error) {
//     await clearSyncLock();
//     if (Platform.OS === 'android') {
//       await foregroundService.stopService();
//     }
//     Sentry.captureException(`Error in background task: ${error.toString()}`);
//     return BackgroundFetch.BackgroundFetchResult.Failed;
//   }
// });

// export async function registerInternetAvailabilitySyncingTask() {
//   try {
//     // Unregister any existing task first
//     try {
//       const isRegistered = await TaskManager.isTaskRegisteredAsync(INTERNET_AVAILABILITY_TASK);
//       if (isRegistered) {
//         await BackgroundFetch.unregisterTaskAsync(INTERNET_AVAILABILITY_TASK);
//       }
//     } catch (e) {
//       Sentry.captureException(`Error checking task registration: ${e}`);
//     }

//     // Register the task with more aggressive settings
//     await BackgroundFetch.registerTaskAsync(INTERNET_AVAILABILITY_TASK, {
//       minimumInterval: 120, // 2 minutes in seconds
//       stopOnTerminate: false,
//       startOnBoot: true,
//     });

//     Sentry.addBreadcrumb({
//       category: "internet-availability",
//       message: "Task registered successfully",
//       level: "info",
//     });

//     // Trigger an initial check
//     await BackgroundFetch.scheduleTaskAsync(INTERNET_AVAILABILITY_TASK, {
//       minimumInterval: 1,
//       stopOnTerminate: false,
//       startOnBoot: true,
//     });
//   } catch (error) {
//     Sentry.captureException(error);
//     console.error("Failed to register internet availability task:", error);
//     throw error;
//   }
// }
