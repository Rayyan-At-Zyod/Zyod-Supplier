import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { processPendingActions } from "../services/offline/storage.service";

export const useNetworkStatus = (onOnline, token, dispatch) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (netInfoState) => {
      const wasOffline = !isOnline;
      const nowOnline = netInfoState.isConnected;
      
      setIsOnline(nowOnline);

      // Only trigger sync when transitioning from offline to online
      if (wasOffline && nowOnline) {
        if (onOnline) {
          onOnline();
        }
        try {
          await processPendingActions(token, dispatch);
        } catch (error) {
          console.error("Failed to process pending actions:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [isOnline, onOnline, token, dispatch]);

  return { isOnline };
};
