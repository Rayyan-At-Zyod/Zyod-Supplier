import AsyncStorage from "@react-native-async-storage/async-storage";
import { addRawMaterial } from "../api/addRawMaterial.service";
import { loadRawMaterials } from "../helpers/functions/loadRMs";

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
    console.error("pendingActions after loading from cache", pendingActions);
    console.error("action to be push on pendingActions", action);
    pendingActions.push(action);
    await saveToCache("pendingActions", pendingActions);
    console.error("pendingActions after save", pendingActions);
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
    const pendingActions = await loadFromCache("pendingActions");
    if (pendingActions && pendingActions.length > 0) {
      for (const action of pendingActions) {
        if (action.type === "ADD") {
          console.log("Processing action payload:", action.payload);
          await addRawMaterial(action.payload, token);
        }
      }
      await clearPendingActions();
      loadRawMaterials(token, true, dispatch); // Reload materials from the server
    }
  } catch (error) {
    console.error("Failed to process pending actions:", error);
  }
};
