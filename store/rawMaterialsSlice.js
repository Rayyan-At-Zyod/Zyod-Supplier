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
      console.log("📢 setLoading called:", action.payload);
      state.loading = action.payload;
    },
    setSyncing: (state, action) => {
      console.log("📢 setSyncing called:", action.payload);
      state.syncing = action.payload;
    },
    addMaterial: (state, action) => {
      console.log("📢 addMaterial called:", action.payload);
      state.items = [action.payload, ...state.items]; // Ensure a new reference
    },
    setMaterials: (state, action) => {
      console.log(
        "📢 setMaterials called with:",
        action.payload.length,
        "items"
      );
      state.items = action.payload;
    },
    updateMaterials: (state, action) => {
      const { itemId, newQuantity } = action.payload;
      // Create a new array reference for items
      state.items = state.items.map((item) => {
        // Check if this item has the variation we're updating
        const hasTargetVariation = item.rmVariations?.some(
          (variation) => variation.rmVariationId === itemId
        );

        if (!hasTargetVariation) {
          return item;
        }

        // Create a new array reference for rmVariations
        const updatedRmVariations = item.rmVariations.map((rmVariation) => {
          if (rmVariation.rmVariationId === itemId) {
            return {
              ...rmVariation,
              availableQuantity: newQuantity,
            };
          }
          return rmVariation;
        });

        // Return new item object with updated variations
        return {
          ...item,
          rmVariations: updatedRmVariations,
        };
      });
    },
    addOfflineMaterial: (state, action) => {
      console.log("📢 addOfflineMaterial called:", action.payload);
      state.offlineItems = [action.payload, ...state.offlineItems];
    },
    updateOfflineMaterials: (state, action) => {
      const { itemId, newQuantity } = action.payload;
      state.offlineItems = state.offlineItems.map((item) => {
        const hasTargetVariation = item.temporaryDisplay.rmVariations?.some(
          (variation) => variation.rmVariationId === itemId
        );

        if (!hasTargetVariation) {
          return item;
        }

        // Create a new array reference for rmVariations
        const updatedRmVariations = item.temporaryDisplay.rmVariations.map(
          (rmVariation) => {
            if (rmVariation.rmVariationId === itemId) {
              return {
                ...rmVariation,
                availableQuantity: newQuantity,
              };
            }
            return rmVariation;
          }
        );

        // Return new item object with updated variations
        return {
          ...item,
          temporaryDisplay: {
            ...item.temporaryDisplay,
            rmVariations: updatedRmVariations,
          },
        };
      });
    },
    setOfflineMaterials: (state, action) => {
      console.log(
        "📢 setOfflineMaterials called with:",
        action.payload.length,
        "items"
      );

      state.offlineItems = action.payload;
    },
  },
});

export const {
  addMaterial,
  setMaterials,
  addOfflineMaterial,
  setOfflineMaterials,
  updateOfflineMaterials,
  setLoading,
  setSyncing,
  updateMaterials,
} = rawMaterialsSlice.actions;
export default rawMaterialsSlice.reducer;
