// loadRawMaterials.js
// (Send the specific parameters)

import { setLoading, setMaterials } from "../../store/rawMaterialsSlice";
import { fetchRawMaterials } from "../api/fetchRawMaterial.service";
import { loadFromCache, saveToCache } from "../offline/storage.service";

export const loadRawMaterials = async (token, isOnline, dispatch) => {
  if (isOnline) {
    try {
      dispatch(setLoading(true));
      const data = await fetchRawMaterials(token);
      console.log(
        "✅ Fetched raw materials: (length)",
        JSON.stringify(data.data, null, 2)
      );
      dispatch(setMaterials(data.data));
      // Optionally, update the cache:
      await saveToCache("cachedData", data.data);
    } catch (error) {
      console.error("❌ Online but error fetching materials:", error);
      const cachedData = await loadFromCache("cachedData");
      console.log("Loaded from cache.\n", cachedData);
      if (cachedData) {
        dispatch(setMaterials(cachedData));
      }
    } finally {
      dispatch(setLoading(false));
    }
  } else {
    console.error("❌✅ Offline. Loading from cache...");
    const cachedData = await loadFromCache("cachedData");
    console.error("🔐 Using cached data, which is\n", cachedData);
    if (cachedData) {
      dispatch(setMaterials(cachedData));
    }
  }
};
