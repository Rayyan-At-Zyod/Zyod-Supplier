import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { performForegroundSync } from '../services/offline/background.service';
import * as Sentry from "@sentry/react-native";

/**
 * Hook to handle app state changes and trigger syncs when the app comes to the foreground
 * This mimics WhatsApp's behavior of syncing when the app is brought to the foreground
 */
export const useAppStateSync = () => {
  const appState = useRef(AppState.currentState);
  const { token } = useAuth();
  
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      // For iOS, we need to check for 'active' state
      // For Android, we need to check for 'active' or 'foreground'
      const isComingToForeground = 
        (Platform.OS === 'ios' && nextAppState === 'active') ||
        (Platform.OS === 'android' && 
          (nextAppState === 'active' || 
           (appState.current === 'background' && nextAppState === 'foreground')));
      
      // If the app is coming to the foreground and we have a token
      if (isComingToForeground && token) {
        Sentry.captureMessage("App coming to foreground, triggering sync", "info");
        try {
          // Trigger a sync
          await performForegroundSync();
        } catch (error) {
          Sentry.captureException(error);
          console.error("Error syncing on app state change:", error);
        }
      }
      
      // Update the app state reference
      appState.current = nextAppState;
    };
    
    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Clean up the subscription when the component unmounts
    return () => {
      subscription.remove();
    };
  }, [token]);
}; 