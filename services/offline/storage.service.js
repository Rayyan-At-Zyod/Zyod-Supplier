import AsyncStorage from "@react-native-async-storage/async-storage";
import { addRawMaterial } from "../api/addRawMaterial.service";
import { loadRawMaterials } from "../functions/loadRMs";
import {
  addOfflineMaterial,
  setMaterials,
  setSyncing,
  updateOfflineMaterials,
} from "../../store/rawMaterialsSlice";
import { v4 as uuidv4 } from "uuid";
import { store } from "../../store/store";
import { updateRM } from "../api/updateRmStock.service";

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
    } else if (actionToProcess.type === "UPDATE") {
      // Use the existing addRawMaterial service
      const response = await updateRM(actionToProcess.payload, token);

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

export const updateAnOnlineMaterialAction = async (
  theGreigeId,
  theRmVariationId,
  theNewQuantity,
  operationType,
  quantityToBeChanged,
  item,
  warehouseId
) => {
  try {
    // The app is offline right now.
    // Load cached data
    const cachedData = (await loadFromCache("cachedData")) || [];

    // 1. Find the online item with that greigeId
    const onlineItem = cachedData.find((item) => item.greigeId === theGreigeId);
    if (!onlineItem) throw new Error("Item not found in cache.");

    // 2. Find the object with the corresponding rmVariationId
    const variationObject = onlineItem.rmVariations.find(
      (rmv) => rmv.rmVariationId == theRmVariationId
    );
    if (!variationObject) throw new Error("Variation not found.");

    // 3. Create the temporaryDisplay format for offline storage
    const temporaryDisplay = {
      ...onlineItem,
      rmVariations: onlineItem.rmVariations.map((v) => {
        if (v.rmVariationId === theRmVariationId)
          return { ...v, availableQuantity: theNewQuantity.toString() };
        return v;
      }),
    };

    // 4. Create a corresponding pendingAction with the API payload format
    const pendingAction = {
      type: "UPDATE",
      temporaryDisplay,
      payload: {
        warehouseId,
        reason: "Stock adjustment",
        itemDetailsArray: [
          {
            itemId: theRmVariationId, // important
            itemCode: variationObject.newCode || variationObject.rmCode,
            itemType: "Fabric",
            itemUnit: variationObject.unitCode,
            operationType, // important
            quantityChange: quantityToBeChanged, // important
            oldStockQuantity: variationObject.availableQuantity, // important Store old quantity for conflict detection
          },
        ],
      },
    };

    // Add the pending action to the queue
    await queuePendingAction(pendingAction);

    // Update cached data
    const updatedCachedData = cachedData.filter(
      (item) => item.greigeId !== theGreigeId
    );
    await saveToCache("cachedData", updatedCachedData);

    // Update Redux store
    store.dispatch(setMaterials(updatedCachedData)); // Remove from online items
  } catch (err) {
    console.error("Error updating online material in offline mode:", err);
    throw err;
  }
};

export const updateAnOfflineMaterialAction = async (
  theRmVariationId,
  newQuantity
) => {
  try {
    const pendingActions = await loadFromCache("pendingActions");
    const updatedPendingActions = pendingActions.map((action) => {
      // First find the variation in temporaryDisplay to get its index
      const variationIndex = action.temporaryDisplay.rmVariations.findIndex(
        (variation) => variation.rmVariationId === theRmVariationId
      );
      if (variationIndex === -1) return action;
      // Update temporaryDisplay part
      const updatedVariations = action.temporaryDisplay.rmVariations.map(
        (variation) => {
          if (variation.rmVariationId === theRmVariationId) {
            return { ...variation, availableQuantity: newQuantity };
          }
          return variation;
        }
      );
      // Update payload part - RMsData needs to be updated at the same index
      const updatedRMsData = action.payload.skuDetails.RMsData.map(
        (rmData, index) => {
          if (index === variationIndex) {
            return {
              ...rmData,
              RMInventoryDetails: rmData.RMInventoryDetails.map((detail) => ({
                ...detail,
                CurrentStock: String(newQuantity), // Convert to string to match the format
              })),
            };
          }
          return rmData;
        }
      );
      return {
        ...action,
        temporaryDisplay: {
          ...action.temporaryDisplay,
          rmVariations: updatedVariations,
        },
        payload: {
          ...action.payload,
          skuDetails: {
            ...action.payload.skuDetails,
            RMsData: updatedRMsData,
          },
        },
      };
    });

    await saveToCache("pendingActions", updatedPendingActions);
    store.dispatch(
      updateOfflineMaterials({
        itemId: theRmVariationId,
        newQuantity,
      })
    );
  } catch (err) {
    console.error("Error updating offline action:", err);
    throw err;
  }
};
