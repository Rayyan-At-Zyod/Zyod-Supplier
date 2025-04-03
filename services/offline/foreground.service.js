import ForegroundService from 'react-native-foreground-service';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { processPendingActions } from './process-storage';
import NetInfo from '@react-native-community/netinfo';

class ForegroundServiceManager {
  static instance = null;
  isRunning = false;
  processingInterval = null;

  static getInstance() {
    if (!ForegroundServiceManager.instance) {
      ForegroundServiceManager.instance = new ForegroundServiceManager();
    }
    return ForegroundServiceManager.instance;
  }

  async startService() {
    if (Platform.OS !== 'android') {
      console.log('Foreground service is only supported on Android');
      return;
    }

    try {
      if (this.isRunning) {
        console.log('Service is already running');
        return;
      }

      // Start the service
      await ForegroundService.startService({
        id: 144,
        title: 'Zyod Supplier',
        message: 'Processing pending actions in background',
        icon: 'ic_notification',
        importance: 'high',
        vibration: false,
        visibility: 'public',
        progress: {
          max: 100,
          current: 0
        }
      });

      this.isRunning = true;
      console.log('Foreground service started successfully');

      // Start processing pending actions
      this.startProcessingPendingActions();
    } catch (error) {
      Sentry.captureException(`failed to start foreground service: ${error}`);
      console.error('Failed to start foreground service:', error);
    }
  }

  async stopService() {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      if (!this.isRunning) {
        console.log('Service is not running');
        return;
      }

      // Stop the processing interval
      if (this.processingInterval) {
        clearInterval(this.processingInterval);
        this.processingInterval = null;
      }

      await ForegroundService.stopService();
      this.isRunning = false;
      console.log('Foreground service stopped successfully');
    } catch (error) {
      Sentry.captureException(`Failed to stop foreground service: ${error}`);
      console.error('Failed to stop foreground service:', error);
    }
  }

  async updateNotification(progress) {
    if (Platform.OS !== 'android' || !this.isRunning) {
      return;
    }

    try {
      await ForegroundService.update({
        id: 144,
        title: 'Zyod Supplier',
        message: `Processing: ${progress}% complete`,
        icon: 'ic_notification',
        importance: 'high',
        vibration: false,
        visibility: 'public',
        progress: {
          max: 100,
          current: progress
        }
      });
    } catch (error) {
      Sentry.captureException(`Failed to update notification: ${error}`);
      console.error('Failed to update notification:', error);
    }
  }

  async startProcessingPendingActions() {
    // Process every 5 minutes
    this.processingInterval = setInterval(async () => {
      try {
        // Check internet connection
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          console.log('No internet connection, skipping processing');
          return;
        }

        // Get pending actions
        const pendingActions = await AsyncStorage.getItem('pendingActions');
        if (!pendingActions) {
          return;
        }

        const actions = JSON.parse(pendingActions);
        if (actions.length === 0) {
          return;
        }

        // Process actions with progress updates
        let processed = 0;
        for (const action of actions) {
          await processPendingActions(action);
          processed++;
          
          // Update progress
          const progress = Math.round((processed / actions.length) * 100);
          await this.updateNotification(progress);
        }

        // Clear processed actions
        await AsyncStorage.setItem('pendingActions', JSON.stringify([]));
        await this.updateNotification(0);

      } catch (error) {
        Sentry.captureException(`Error processing pending actions: ${error}`);
        console.error('Error processing pending actions:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

export const foregroundService = ForegroundServiceManager.getInstance(); 