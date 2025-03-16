import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
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
import { Alert } from "react-native";

export const saveToCache = async (key, data) => {
  try {
    Sentry.captureMessage(`Saving some data to cache for key: ${key}`, "info");
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    Sentry.captureException(error);
    console.error(`Failed to save to cache (${key}):`, error);
  }
};

export const loadFromCache = async (key) => {
  try {
    Sentry.captureMessage(`Loading from cache for key: ${key}`, "info");
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    Sentry.captureException(error);
    console.error(`Failed to load from cache (${key}):`, error);
    return null;
  }
};

export const queuePendingAction = async (action) => {
  try {
    Sentry.captureMessage("Queueing pending action", "info");
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
    Sentry.captureException(error);
    console.error("Error queuing pending action:", error);
    throw error;
  }
};

export const clearPendingActions = async () => {
  Sentry.captureMessage("Clearing pending actions from cache", "info");
  try {
    console.log("looks like ev worked.");
    await AsyncStorage.removeItem("pendingActions");
  } catch (error) {
    Sentry.captureException(error);
    console.error("Failed to clear pending actions:", error);
  }
};

/**
 * Process a single pending action by its id
 */
export const processCurrentAction = async (id, token) => {
  Sentry.captureMessage(`Processing current action with id: ${id}`, "info");
  try {
    store.dispatch(setSyncing(true));
    const pendingActions = (await loadFromCache("pendingActions")) || [];
    const actionToProcess = pendingActions.find((action) => action.id === id);

    if (!actionToProcess) {
      const error = new Error(`No pending action found with id: ${id}`);
      Sentry.captureException(error);
      console.error(error);
      return;
    }

    if (actionToProcess.type === "ADD") {
      Sentry.captureMessage("Processing ADD action", "info");
      const response = await addRawMaterial(actionToProcess.payload, token);
      if (response) {
        doIfSuccess(pendingActions, id, token);
      }
    } else if (actionToProcess.type === "UPDATE") {
      Sentry.captureMessage("Processing UPDATE action", "info");
      const response = await updateRM(actionToProcess.payload, token);
      if (response) {
        doIfSuccess(pendingActions, id, token);
      }
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error processing single action:", error);
    Alert.alert(
      "An error occurred while syncing your offline action",
      error.message
    );
    throw error;
  } finally {
    store.dispatch(setSyncing(false));
  }
};

const doIfSuccess = async (pendingActions, id, token) => {
  Sentry.captureMessage(
    `Action ${id} succeeded, processing success flow`,
    "info"
  );
  try {
    const updatedPendingActions = pendingActions.filter(
      (action) => action.id !== id
    );
    await saveToCache("pendingActions", updatedPendingActions);
    // Reload the materials to update the UI
    await loadRawMaterials(token, true, store.dispatch);
  } catch (err) {
    Sentry.captureException(err);
    throw err;
  }
};

/**
 * Process all pending actions
 */
export const processPendingActions = async (token) => {
  Sentry.captureMessage("Processing all pending actions", "info");
  try {
    store.dispatch(setSyncing(true));
    const pendingActions = (await loadFromCache("pendingActions")) || [];
    for (const action of pendingActions) {
      try {
        await processCurrentAction(action.id, token);
      } catch (error) {
        Sentry.captureException(error);
        console.error(`Failed to process action ${action.id}:`, error);
      }
    }
  } catch (error) {
    Sentry.captureException(error);
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
  warehouseId,
  nonSelectedRmVariationIds,
  nonSelectedRmVariationQuantities
) => {
  Sentry.captureMessage(
    `Updating online material action for greigeId: ${theGreigeId}`,
    "info"
  );
  try {
    const cachedData = (await loadFromCache("cachedData")) || [];
    const onlineItem = cachedData.find((item) => item.greigeId === theGreigeId);
    if (!onlineItem) throw new Error("Item not found in cache.");

    const variationObject = onlineItem.rmVariations.find(
      (rmv) => rmv.rmVariationId == theRmVariationId
    );
    if (!variationObject) throw new Error("Variation not found.");

    const temporaryDisplay = {
      ...onlineItem,
      rmVariations: onlineItem.rmVariations.map((v) => {
        if (v.rmVariationId === theRmVariationId)
          return { ...v, availableQuantity: theNewQuantity.toString() };
        return v;
      }),
    };

    const pendingAction = {
      type: "UPDATE",
      temporaryDisplay,
      payload: {
        warehouseId,
        reason: "Stock adjustment",
        itemDetailsArray: [
          {
            itemId: theRmVariationId,
            itemCode: variationObject.newCode || variationObject.rmCode,
            itemType: "Fabric",
            itemUnit: variationObject.unitCode,
            operationType,
            quantityChange: quantityToBeChanged,
            oldStockQuantity: variationObject.availableQuantity,
          },
          ...nonSelectedRmVariationIds.map((id, index) => ({
            itemId: id,
            itemCode: variationObject.newCode || variationObject.rmCode,
            itemType: "Fabric",
            itemUnit: variationObject.unitCode,
            operationType,
            quantityChange: 0,
            oldStockQuantity: nonSelectedRmVariationQuantities[index],
          })),
        ],
      },
    };

    await queuePendingAction(pendingAction);
    const updatedCachedData = cachedData.filter(
      (item) => item.greigeId !== theGreigeId
    );
    await saveToCache("cachedData", updatedCachedData);
    store.dispatch(setMaterials(updatedCachedData));
  } catch (err) {
    Sentry.captureException(err);
    console.error("Error updating online material in offline mode:", err);
    throw err;
  }
};

export const updateAnOfflineMaterialAction = async (
  theRmVariationId,
  newQuantity
) => {
  Sentry.captureMessage(
    `Updating offline material action for variationId: ${theRmVariationId}`,
    "info"
  );
  try {
    const pendingActions = await loadFromCache("pendingActions");
    const updatedPendingActions = pendingActions.map((action) => {
      const variationIndex = action.temporaryDisplay.rmVariations.findIndex(
        (variation) => variation.rmVariationId === theRmVariationId
      );
      if (variationIndex === -1) return action;
      const updatedVariations = action.temporaryDisplay.rmVariations.map(
        (variation) =>
          variation.rmVariationId === theRmVariationId
            ? { ...variation, availableQuantity: newQuantity }
            : variation
      );
      if (action.type === "ADD") {
        const updatedRMsData = action.payload.skuDetails.RMsData.map(
          (rmData, index) => {
            if (index === variationIndex) {
              return {
                ...rmData,
                RMInventoryDetails: rmData.RMInventoryDetails.map((detail) => ({
                  ...detail,
                  CurrentStock: String(newQuantity),
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
      } else if (action.type === "UPDATE") {
        const variationIndex = action.payload.itemDetailsArray.findIndex(
          (variation) => variation.itemId === theRmVariationId
        );
        if (variationIndex === -1) return action;
        const updatedItemDetailsArray = action.payload.itemDetailsArray.map(
          (variation) => {
            if (variation.itemId === theRmVariationId) {
              const oldStockQuantity = Number.parseInt(
                action.payload.itemDetailsArray[variationIndex].oldStockQuantity
              );
              const newOperationType =
                newQuantity - oldStockQuantity >= 0 ? "STOCK IN" : "STOCK OUT";
              const newQtyChange = newQuantity - oldStockQuantity;
              return {
                ...variation,
                quantityChange: newQtyChange,
                operationType: newOperationType,
              };
            }
            return variation;
          }
        );
        const newAction = {
          ...action,
          temporaryDisplay: {
            ...action.temporaryDisplay,
            rmVariations: updatedVariations,
          },
          payload: {
            ...action.payload,
            itemDetailsArray: updatedItemDetailsArray,
          },
        };
        console.error(
          "action correct place",
          JSON.stringify(newAction, null, 2)
        );
        return newAction;
      }
    });
    await saveToCache("pendingActions", updatedPendingActions);
    store.dispatch(
      updateOfflineMaterials({
        itemId: theRmVariationId,
        newQuantity,
      })
    );
  } catch (err) {
    Sentry.captureException(err);
    console.error("Error updating offline action:", err);
    throw err;
  }
};
