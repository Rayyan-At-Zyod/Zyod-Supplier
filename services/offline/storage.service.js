import AsyncStorage from "@react-native-async-storage/async-storage";
import { addRawMaterial } from "../api/addRawMaterial.service";
import { loadRawMaterials } from "../helpers/functions/loadRMs";
import { setLoading, setSyncing } from "../../store/rawMaterialsSlice";

export const saveToCache = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to cache (${key}):`, error);
  }
};

export const loadFromCache = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Failed to load from cache (${key}):`, error);
    return null;
  }
};

export const queuePendingAction = async (action) => {
  try {
    const pendingActions = (await loadFromCache("pendingActions")) || [];
    pendingActions.push(action);
    await saveToCache("pendingActions", pendingActions);
  } catch (error) {
    console.error("Failed to queue new pending action:", error);
  }
};

// Add a helper function to clear pending actions
export const clearPendingActions = async () => {
  console.log("looks like ev worked.");
  try {
    await AsyncStorage.removeItem("pendingActions");
  } catch (error) {
    console.error("Failed to clear pending actions:", error);
  }
};

export const processPendingActions = async (token, dispatch) => {
  try {
    dispatch(setLoading(true));
    const pendingActions = await loadFromCache("pendingActions");
    if (
      pendingActions &&
      pendingActions !== "" &&
      Array.isArray(pendingActions) &&
      pendingActions.length > 0
    ) {
      dispatch(setSyncing(true));
      
      // Process each action individually with error handling
      for (const action of pendingActions) {
        try {
          if (action.type === "ADD") {
            await addRawMaterial(action.payload, token);
            // Remove this specific action from pending queue after success
            const remainingActions = pendingActions.filter(a => a !== action);
            await saveToCache("pendingActions", remainingActions);
          }
        } catch (error) {
          console.error(`Failed to process action:`, error);
          // Keep the failed action in queue
          continue;
        }
      }
      
      dispatch(setSyncing(false));
      // Reload materials only after all actions are processed
      await loadRawMaterials(token, true, dispatch);
    }
  } catch (error) {
    console.error("Failed to process pending actions:", error);
  } finally {
    dispatch(setLoading(false));
  }
};
