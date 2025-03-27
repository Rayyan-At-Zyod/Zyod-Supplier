// loadRawMaterials.js (Send the specific parameters)
import {
  setLoading,
  setMaterials,
  appendMaterials,
} from "../../store/rawMaterialsSlice";
import { fetchRawMaterials } from "../api/fetchRawMaterial.service";
import { loadFromCache, saveToCache } from "../offline/storage.service";
import * as Sentry from "@sentry/react-native";

export const loadRawMaterials = async (
  token,
  isOnline,
  dispatch,
  page = 1,
  size = 10,
  shouldAppend = false
) => {
  if (isOnline) {
    try {
      if (!shouldAppend) dispatch(setLoading(true));
      const data = await fetchRawMaterials(token, page, size);

      // If this is the first page, save to cache
      if (page === 1) {
        await saveToCache("cachedData", data.data);
      } else if (shouldAppend) {
        // if loading more data, get existing cache data & join it.
        const existingCache = (await loadFromCache("cachedData")) || [];
        const newCache = [...existingCache, ...data.data];
        await saveToCache("cachedData", newCache);
      }

      // Dispatch action based on whether we're appending or replacing
      if (shouldAppend) {
        dispatch(appendMaterials(data.data));
      } else {
        dispatch(setMaterials(data.data));
      }

      // Return data for the caller to check if there are more items
      return data;
    } catch (error) {
      Sentry.captureException(
        `❌ Online but error fetching materials: ${error}`
      );
      const cachedData = await loadFromCache("cachedData");
      if (cachedData) {
        dispatch(setMaterials(cachedData));
      }
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  } else {
    // Sentry.captureMessage("❌✅ Offline. Loading from cache...");
    const cachedData = await loadFromCache("cachedData");
    if (cachedData) {
      dispatch(setMaterials(cachedData));
    }
    return null;
  }
};
