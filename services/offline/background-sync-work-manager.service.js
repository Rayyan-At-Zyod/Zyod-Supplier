import { NativeEventEmitter, NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { processPendingActions } from "./process-storage";

const { SyncWorkerModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(SyncWorkerModule);

export function startBackgroundSyncWorker(intervalMinutes = 2) {
  try {
    SyncWorkerModule.startSyncWorker(intervalMinutes);
    Sentry.captureMessage(
      `Background sync started with interval: ${intervalMinutes} minutes`
    );
  } catch (err) {
    Sentry.captureException(`Backrgound sync start error: ${err.message}`);
  }
}

export const stopBackgroundSyncWorker = () => {
  try {
    SyncWorkerModule.stopSyncWorker();
    Sentry.captureMessage("Background sync stopped");
  } catch (error) {
    Sentry.captureException(error);
  }
};

// Listen for sync events from native side
export function setupSyncListenerForWorker() {
  eventEmitter.addListener("syncBackground", async () => {
    try {
      Sentry.captureMessage("Sync triggered from WorkManager");
      const token = await AsyncStorage.getItem("token");
      if (token) {
        await processPendingActions(token);
        let time = await AsyncStorage.getItem("time");
        time = time ? parseInt(time) + 1 : 0;
        await AsyncStorage.setItem("time", time.toString());
        Sentry.captureMessage("Background sync completed successfully.");
      }
    } catch (err) {
      Sentry.captureException(`Background sync error: ${err.message}`);
    }
  });
}
