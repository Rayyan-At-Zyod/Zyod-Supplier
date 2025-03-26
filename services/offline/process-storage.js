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
    // store.dispatch(setLoading(true));
    // store.dispatch(setSyncing(true));
    const pendingActions = (await loadFromCache("pendingActions")) || [];
    for (let action of pendingActions) {
      Sentry.captureMessage(
        `Started individual action. ${action?.temporaryDisplay?.rmVariations[0].name}`
      );
      let res = null;
      if (action?.type === "ADD") {
        res = await addRawMaterial(action.payload, token);
      } else if (action?.type === "UPDATE") {
        res = await updateRM(action.payload, token);
      } else {
        throw new Error("Invalid pending action type - neither ADD nor UPDATE");
      }
      Sentry.captureMessage(`API hit.`);
      if (res) {
        const newPendingActions = (await loadFromCache("pendingActions")) || [];
        const updatedArray = newPendingActions.filter(
          (act) => act.id !== action.id
        );
        // Sentry.captureMessage(`pendingactions aray updated.`);
        await saveToCache("pendingActions", updatedArray);
        store.dispatch(setOfflineMaterials(updatedArray));
        Sentry.captureMessage(`saved new pending actions & ui changed.`);

        let oldCache = (await loadFromCache("cachedData")) || [];
        // Sentry.captureMessage(`API hit.`);
        const newCache = [...oldCache, action.temporaryDisplay];
        // Sentry.captureMessage(`API hit.`);
        await saveToCache("cachedData", newCache);
        // Sentry.captureMessage(`API hit.`);
        Sentry.captureMessage(
          `Done individual action. ${action?.temporaryDisplay?.rmVariations[0].name}`
        );
      } else {
        Sentry.captureMessage(`API hit failed.`);
      }
    }
    Sentry.captureMessage("Checked all..");
  } catch (err) {
    Sentry.captureException(`ERROR: ${err}`);
    throw err;
  // } finally {
  //   store.dispatch(setLoading(false));
  //   store.dispatch(setSyncing(false));
  }
};
