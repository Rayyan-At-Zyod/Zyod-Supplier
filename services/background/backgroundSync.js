import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { processPendingActions } from '../offline/storage.service';
import NetInfo from '@react-native-community/netinfo';

const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';

// Define the task first
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    // Check if we have pending actions to sync
    const pendingActions = await AsyncStorage.getItem('pendingActions');
    if (!pendingActions) {
      console.log('[BackgroundFetch] No pending actions to sync');
      return BackgroundFetch.Result.NoData;
    }
    
    // Check network status
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      console.log('[BackgroundFetch] No internet connection, skipping sync');
      return BackgroundFetch.Result.Failed;
    }
    
    // Get auth token from storage
    const authData = await AsyncStorage.getItem('authData');
    if (!authData) {
      console.log('[BackgroundFetch] No auth token available, skipping sync');
      return BackgroundFetch.Result.Failed;
    }
    
    const { token } = JSON.parse(authData);
    
    // Perform sync
    console.log('[BackgroundFetch] Starting background sync');
    await processPendingActions(token);
    console.log('[BackgroundFetch] Background sync completed successfully');
    
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.error('[BackgroundFetch] Background sync failed:', error);
    return BackgroundFetch.Result.Failed;
  }
});

/**
 * Configure background fetch to sync offline data when the app is in the background
 */
export const configureBackgroundSync = async () => {
  try {
    // Check if the task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
      console.log('[BackgroundFetch] Registering task');
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,   // android only,
        startOnBoot: true,        // android only
      });
    }
    
    // Get task status
    const status = await BackgroundFetch.getStatusAsync();
    
    // If background fetch is disabled, try to enable it
    if (status === BackgroundFetch.Status.Disabled) {
      console.log('[BackgroundFetch] Background fetch is disabled, requesting permissions');
      await BackgroundFetch.requestPermissionsAsync();
    }
    
    console.log('[BackgroundFetch] Configuration status:', status);
  } catch (error) {
    console.error('[BackgroundFetch] Configuration error:', error);
  }
};

/**
 * Start a one-time background task to sync data
 */
export const startBackgroundSync = async () => {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.Status.Available) {
      // Trigger an immediate background fetch
      await BackgroundFetch.setMinimumIntervalAsync(1); // Set to minimum possible interval
      await configureBackgroundSync();
      // Reset the interval back to 15 minutes after a short delay
      setTimeout(async () => {
        await BackgroundFetch.setMinimumIntervalAsync(15 * 60);
      }, 5000);
    } else {
      console.log('[BackgroundFetch] Background fetch is not available');
    }
  } catch (error) {
    console.error('[BackgroundFetch] Failed to start background sync:', error);
  }
}; 