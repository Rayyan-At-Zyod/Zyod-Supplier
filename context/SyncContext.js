import React, { createContext, useContext } from 'react';
import { useSyncManager } from '../hooks/useSyncManager';

// Create the context
const SyncContext = createContext(null);

// Create the provider component
export const SyncProvider = ({ children }) => {
  const syncManager = useSyncManager();
  
  return (
    <SyncContext.Provider value={syncManager}>
      {children}
    </SyncContext.Provider>
  );
};

// Create a custom hook to use the sync context
export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === null) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}; 