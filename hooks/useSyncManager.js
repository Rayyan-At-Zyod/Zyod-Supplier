import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { processPendingActions } from '../services/offline/storage.service';
import { loadPendingMaterials } from '../services/functions/loadPendingMaterials';
import { loadRawMaterials } from '../services/functions/loadRMs';
import { setSyncing } from '../store/rawMaterialsSlice';
import NetInfo from '@react-native-community/netinfo';
import { startBackgroundSync } from '../services/background/backgroundSync';

export const useSyncManager = () => {
  const dispatch = useDispatch();
  const { token } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const offlineItems = useSelector((state) => state.rawMaterials.offlineItems);
  
  // Function to perform the sync operation
  const syncOfflineData = async () => {
    if (!token || !isOnline || isSyncing || offlineItems.length === 0) return;
    
    try {
      setIsSyncing(true);
      dispatch(setSyncing(true));
      
      // Process all pending actions
      await processPendingActions(token);
      
      // Reload pending materials to update the UI
      await loadPendingMaterials(dispatch);
      
      // Reload online materials to reflect changes
      await loadRawMaterials(token, true, dispatch);
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now.toISOString());
      
      console.log('Background sync completed successfully at', now.toLocaleTimeString());
    } catch (error) {
      console.error('Background sync failed:', error);
    } finally {
      setIsSyncing(false);
      dispatch(setSyncing(false));
    }
  };
  
  // Monitor network status changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const newOnlineStatus = state.isConnected && state.isInternetReachable;
      const wasOffline = !isOnline;
      setIsOnline(newOnlineStatus);
      
      // If we just came back online and have pending items, trigger a sync
      if (newOnlineStatus && wasOffline && offlineItems.length > 0) {
        console.log('Network connection restored. Starting background sync...');
        
        // Trigger immediate sync in the app
        syncOfflineData();
        
        // Also schedule a background sync task in case the app goes to background
        startBackgroundSync().catch(error => {
          console.error('Failed to start background sync:', error);
        });
      }
    });
    
    return () => unsubscribe();
  }, [isOnline, offlineItems.length]);
  
  // Periodically check for pending items to sync when online
  useEffect(() => {
    if (!isOnline || offlineItems.length === 0) return;
    
    // Set up a periodic sync every 5 minutes if we're online and have pending items
    const syncInterval = setInterval(() => {
      console.log('Periodic sync check...');
      syncOfflineData();
      
      // Also schedule a background sync task
      startBackgroundSync().catch(error => {
        console.error('Failed to start background sync:', error);
      });
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(syncInterval);
  }, [isOnline, offlineItems.length]);
  
  // Initial sync when the app starts and we're online
  useEffect(() => {
    if (isOnline && offlineItems.length > 0 && token) {
      console.log('Initial sync check on app start...');
      syncOfflineData();
      
      // Also schedule a background sync task
      startBackgroundSync().catch(error => {
        console.error('Failed to start background sync:', error);
      });
    }
  }, []);
  
  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncOfflineData,
    hasPendingItems: offlineItems.length > 0
  };
}; 