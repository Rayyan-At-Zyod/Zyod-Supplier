import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { processPendingActions } from "../services/offline/storage.service";

export const useNetworkStatus = (onOnline, token, dispatch) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netInfoState) => {
      console.error("X == useNetworkStatus effect == X");
      const wasOffline = !isOnline;
      setIsOnline(netInfoState.isConnected);

      // Trigger the callback if we were offline and now online
      if (wasOffline && netInfoState.isConnected) {
        if (onOnline) {
          onOnline();
        }
        processPendingActions(token, dispatch); // Process pending actions
      }
    });

    return () => unsubscribe();
  }, [isOnline, onOnline, token, dispatch]);

  return { isOnline };
};
