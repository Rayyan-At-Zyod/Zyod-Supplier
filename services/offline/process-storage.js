import {
  setLoading,
  setOfflineMaterials,
  setSyncing,
} from "../../store/rawMaterialsSlice";
import { store } from "../../store/store";
import { addRawMaterial } from "../api/addRawMaterial.service";
import { updateRM } from "../api/updateRmStock.service";
import { loadFromCache, saveToCache } from "./storage.service";
import * as Sentry from "@sentry/react-native";

export const processPendingActions = async (token) => {
  try {
    store.dispatch(setSyncing(true));
    store.dispatch(setLoading(true));
    const pendingActions = (await loadFromCache("pendingActions")) || [];
    for (let action of pendingActions) {
      Sentry.captureMessage(
        `1.1: Started individual action. ${action?.temporaryDisplay?.rmVariations[0].name}`
      );
      let res = null;
      if (action?.type === "ADD") {
        Sentry.captureException(`1.2: Trying add`);
        res = await addRawMaterial(action.payload, token);
      } else if (action?.type === "UPDATE") {
        res = await updateRM(action.payload, token);
      } else {
        throw new Error(
          "1.2: Invalid pending action type - neither ADD nor UPDATE"
        );
      }
      Sentry.captureMessage(`1.3: API hit.`);
      if (res) {
        Sentry.captureException(`1.4: Trying to delete from cache.`);
        const newPendingActions = (await loadFromCache("pendingActions")) || [];
        const updatedArray = newPendingActions.filter(
          (act) => act.id !== action.id
        );
        Sentry.captureException(`1.5: Deleted action from cache`);
        await saveToCache("pendingActions", updatedArray);
        Sentry.captureException(
          `1.6: Updated the cache for deleted action from cache for:  ${action?.temporaryDisplay?.rmVariations[0].name}`
        );
        store.dispatch(setOfflineMaterials(updatedArray));
        Sentry.captureMessage(
          `1.7: Updated the store with new pending actions.`
        );

        Sentry.captureMessage(`1.8: Loading cache data.`);
        let oldCache = (await loadFromCache("cachedData")) || [];
        const newCache = [...oldCache, action.temporaryDisplay];
        Sentry.captureMessage(`1.9: Created cached data.`);
        await saveToCache("cachedData", newCache);
        Sentry.captureMessage(
          `1.10: Updated cached data for: ${action?.temporaryDisplay?.rmVariations[0].name}.`
        );
      } else {
        Sentry.captureMessage(`API hit failed.`);
      }
    }
    Sentry.captureMessage("Checked all..");
  } catch (err) {
    Sentry.captureException(`ERROR: ${err}`);
    throw err;
  } finally {
    store.dispatch(setLoading(false));
    store.dispatch(setSyncing(false));
  }
};
