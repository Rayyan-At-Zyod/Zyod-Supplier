import AsyncStorage from "@react-native-async-storage/async-storage";
import { addRawMaterial } from "../api/addRawMaterial.service";
import { loadRawMaterials } from "../functions/loadRMs";
import {
  addOfflineMaterial,
  setLoading,
  setOfflineMaterials,
  setSyncing,
  updateOfflineMaterials,
} from "../../store/rawMaterialsSlice";
import { v4 as uuidv4 } from "uuid";
import { store } from "../../store/store";

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

    const actionWithId = {
      ...action,
      id: uuidv4(), // Using 'id' instead of 'appDbId'
      timestamp: Date.now(),
    };

    await saveToCache("pendingActions", [...pendingActions, actionWithId]);
    store.dispatch(addOfflineMaterial(actionWithId));
    return actionWithId.id;
  } catch (error) {
    console.error("Error queuing pending action:", error);
    throw error;
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

/**
 * Process a single pending action by its id
 * @param {string} id - The unique identifier for the pending action
 * @param {string} token - The authentication token
 * @returns {Promise<void>}
 */
export const processCurrentAction = async (id, token) => {
  try {
    store.dispatch(setSyncing(true));

    const pendingActions = (await loadFromCache("pendingActions")) || [];
    const actionToProcess = pendingActions.find((action) => action.id === id);

    if (!actionToProcess) {
      console.error(`No pending action found with id: ${id}`);
      cu;
      return;
    }

    if (actionToProcess.type === "ADD") {
      // Use the existing addRawMaterial service
      const response = await addRawMaterial(actionToProcess.payload, token);

      if (response) {
        // Remove the processed action from pending actions
        const updatedPendingActions = pendingActions.filter(
          (action) => action.id !== id
        );
        await saveToCache("pendingActions", updatedPendingActions);

        // Reload the materials to update the UI
        await loadRawMaterials(token, true, store.dispatch);
      }
    }
  } catch (error) {
    console.error("Error processing single action:", error);
    throw error;
  } finally {
    store.dispatch(setSyncing(false));
  }
};

/**
 * Process all pending actions
 * @param {string} token - The authentication token
 * @returns {Promise<void>}
 */
export const processPendingActions = async (token) => {
  try {
    store.dispatch(setSyncing(true));
    const pendingActions = (await loadFromCache("pendingActions")) || [];

    for (const action of pendingActions) {
      try {
        await processCurrentAction(action.id, token);
      } catch (error) {
        console.error(`Failed to process action ${action.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error processing pending actions:", error);
    throw error;
  } finally {
    store.dispatch(setSyncing(false));
  }
};

export const updateAnOfflineMaterialAction = async (
  theRmVariationId,
  newQuantity
) => {
  try {
    const pendingActions = await loadFromCache("pendingActions");
    const updatedPendingActions = pendingActions.map((action) => {
      const hasTargetVariation = action.temporaryDisplay.rmVariations?.some(
        (variation) => variation.rmVariationId === theRmVariationId
      );
      if (!hasTargetVariation) return action;
      // Create new temporary display with updated quantity
      const updatedVariations = action.temporaryDisplay.rmVariations.map(
        (variation) => {
          if (variation.rmVariationId === theRmVariationId) {
            return { ...variation, availableQuantity: newQuantity };
          }
          return variation;
        }
      );
      // const updatedVariationsInPayload = action.payload.skuDetails.RMsData.rmVariations.map(variation => {
      //   if(variation.rmVariationId === id) {
      //     return {...variation, availableQuantity: newQuantity}
      //   }
      //   return variation;
      // });
      return {
        ...action,
        temporaryDisplay: {
          ...action.temporaryDisplay,
          rmVariations: updatedVariations,
        },
      };
    });

    await saveToCache("pendingActions", updatedPendingActions);
    store.dispatch(updateOfflineMaterials({ theRmVariationId, newQuantity }));
  } catch (err) {
    console.error("Error updating offline action:", err);
    throw err;
  }
};
