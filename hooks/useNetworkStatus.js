import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { processPendingActions } from "../services/offline/storage.service";

export const useNetworkStatus = (onOnline, token, dispatch) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (netInfoState) => {
      const wasOffline = !isOnline;
      setIsOnline(netInfoState.isConnected);

      // Trigger the callback if we were offline and now online
      if (wasOffline && netInfoState.isConnected) {
        if (onOnline) {
          onOnline();
        }
        await processPendingActions(token, dispatch); // Process pending actions
      }
    });

    return () => unsubscribe();
    // }, [isOnline, onOnline, token, dispatch]);
  }, [isOnline]);

  return { isOnline };
};
