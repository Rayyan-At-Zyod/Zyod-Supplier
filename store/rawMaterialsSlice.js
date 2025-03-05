import { createSlice } from "@reduxjs/toolkit";

const rawMaterialsSlice = createSlice({
  name: "rawMaterials",
  initialState: {
    items: [],
    offlineItems: [],
    loading: false,
    syncing: false,
  },
  reducers: {
    setLoading: (state, action) => {
      // console.log("📢 setLoading called:", action.payload);
      state.loading = action.payload;
    },
    setSyncing: (state, action) => {
      // console.log("📢 setSyncing called:", action.payload);
      state.syncing = action.payload;
    },
    addMaterial: (state, action) => {
      // console.log("📢 addMaterial called:", action.payload);
      state.items = [action.payload, ...state.items]; // Ensure a new reference
    },
    setMaterials: (state, action) => {
      // console.log("📢 setMaterials called with:",
      //   action.payload.length, "items");

      state.items = action.payload;
    },
    updateItems: (state, action) => {
      const { itemId, newQuantity } = action.payload;
      state.items = state.items.map((item) => {
        const updatedRmVariations = item.rmVariations?.map((rmVariation) => {
          if (rmVariation.rmVariationId === itemId) {
            return {
              ...rmVariation,
              availableQuantity: newQuantity,
            };
          } else {
            return rmVariation;
          }
        });
        console.log("hey:", {
          ...item,
          rmVariations: updatedRmVariations || item.rmVariations,
        });
        return {
          ...item,
          rmVariations: updatedRmVariations || item.rmVariations,
        };
      });
    },
    addOfflineMaterial: (state, action) => {
      // console.log("📢 addOfflineMaterial called:", action.payload);
      state.offlineItems = [action.payload, ...state.items];
    },
    setOfflineMaterials: (state, action) => {
      // console.log(
      //   "📢 setOfflineMaterials called with:",
      //   action.payload.length, "items");

      state.offlineItems = action.payload;
    },
  },
});

export const {
  addMaterial,
  setMaterials,
  addOfflineMaterial,
  setOfflineMaterials,
  setLoading,
  setSyncing,
  updateItems,
} = rawMaterialsSlice.actions;
export default rawMaterialsSlice.reducer;
