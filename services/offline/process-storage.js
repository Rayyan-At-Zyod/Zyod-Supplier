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

    // ppa step1 : load pending actions from cache
    Sentry.captureMessage(`Step1 step1: load pending actions from cache.`);
    const pendingActions = (await loadFromCache("pendingActions")) || [];

    // ppa step 2: loop over the actions
    Sentry.captureMessage(`Step1 step2: loop over the actions.`);
    for (let action of pendingActions) {
      Sentry.captureMessage(
        `1- Syncing action with name: ${action?.temporaryDisplay?.rmVariations[0].name}. Hitting API for its add.`
      );

      let res = null;
      if (action?.type === "ADD") {
        res = await addRawMaterial(action.payload, token);
      } else if (action?.type === "UPDATE") {
        res = await updateRM(action.payload, token);
      } else {
        throw new Error(
          "'2.1' - Invalid pending action type - neither ADD nor UPDATE"
        );
      }

      if (res) {
        const newPendingActions = (await loadFromCache("pendingActions")) || [];

        const updatedArray = newPendingActions.filter(
          (act) => act.id !== action.id
        );
        Sentry.captureMessage(
          `3- Pending actions loaded and action with name: ${action?.temporaryDisplay?.rmVariations[0].name} filtered.`
        );

        await saveToCache("pendingActions", updatedArray);
        Sentry.captureMessage(
          `4- Saved this new pending actions to offline cache.`
        );

        store.dispatch(setOfflineMaterials(updatedArray));
        Sentry.captureMessage(`5- Changed the offline materials UI.`);

        let oldCache = (await loadFromCache("cachedData")) || [];
        Sentry.captureMessage(`6- Old async storage cache loaded.`);

        const newCache = [...oldCache, action.temporaryDisplay];
        Sentry.captureMessage(`7- Added current item to old cache.`);

        await saveToCache("cachedData", newCache);
        Sentry.captureMessage(`8- Saved new cache for app-db.`);

        Sentry.captureMessage(
          `>> Finished current action: ${action?.temporaryDisplay?.rmVariations[0].name}`
        );
      } else {
        Sentry.captureMessage(
          `>> API hit failed for current action: ${action?.temporaryDisplay?.rmVariations[0].name}.`
        );
      }
    }
    Sentry.captureMessage("Pending actions loop over");
  } catch (err) {
    Sentry.captureException(`ERROR: ${err}`);
    throw err;
    // } finally {
    //   store.dispatch(setLoading(false));
    //   store.dispatch(setSyncing(false));
  }
};
