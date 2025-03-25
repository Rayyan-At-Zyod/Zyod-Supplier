import { setOfflineMaterials } from "../../store/rawMaterialsSlice";
import { loadFromCache } from "../offline/storage.service";

export const loadPendingMaterials = async (dispatch) => {
  try {
    const pendingActions = (await loadFromCache("pendingActions")) || [];
    dispatch(setOfflineMaterials(pendingActions));
  } catch (error) {
    console.error("Error loading pending materials:", error);
  }
};
