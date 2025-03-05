import { setOfflineMaterials } from "../../store/rawMaterialsSlice";
import { loadFromCache } from "../offline/storage.service";

export const loadPendingMaterials = async (dispatch) => {
  try {
    const pendingActions = (await loadFromCache("pendingActions")) || [];
    // Filter only ADD actions and transform them into displayable format
    const pendingAdds = pendingActions.filter(
      (action) => action.type === "ADD"
    );
    dispatch(setOfflineMaterials(pendingAdds));
  } catch (error) {
    console.error("Error loading pending materials:", error);
  }
}; 