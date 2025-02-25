import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

export const useNetworkStatus = (onOnline) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netInfoState) => {
      const wasOffline = !isOnline;
      setIsOnline(netInfoState.isConnected);

      // Trigger the callback if we were offline and now online
      if (wasOffline && netInfoState.isConnected && onOnline) {
        onOnline();
      }
    });

    return () => unsubscribe();
  }, [isOnline, onOnline]);

  return { isOnline };
};
