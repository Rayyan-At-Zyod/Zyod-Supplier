import { Platform } from 'react-native';
import * as Sentry from "@sentry/react-native";
import { processPendingActions } from "./process-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkForSyncLockAvailibility, clearSyncLock } from "./background-task-manager.service";
import ForegroundService from 'react-native-foreground-service';

const SYNC_NOTIFICATION_ID = 144;

export const startForegroundSync = async (token) => {
  if (Platform.OS !== 'android') {
    console.log('Foreground service is only supported on Android');
    return;
  }

  try {
    // Start the foreground service with a notification
    await ForegroundService.startService({
      id: SYNC_NOTIFICATION_ID,
      title: 'Syncing Data',
      message: 'Processing pending actions in the background',
      icon: 'ic_notification',
      importance: 'high',
    });

    // Update Redux state to reflect background work
    store.dispatch(setLoading(true));
    store.dispatch(setSyncing(true));

    // Run the pending actions process
    Sentry.captureMessage('Foreground Service: Starting pending actions sync.');
    await processPendingActions(token);
    Sentry.captureMessage('Foreground Service: Finished pending actions sync.');

  } catch (error) {
    Sentry.captureException(`Foreground Service error: ${error}`);
    console.error('Error in foreground sync service:', error);
  } finally {
    // Update Redux state and stop the foreground service
    store.dispatch(setLoading(false));
    store.dispatch(setSyncing(false));
    await stopForegroundSync();
  }
};

export const stopForegroundSync = async () => {
  if (Platform.OS !== 'android') return;
  
  try {
    await ForegroundService.stopService();
  } catch (error) {
    Sentry.captureException(`Error stopping foreground service: ${error}`);
  }
}; 