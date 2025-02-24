import { createSlice } from "@reduxjs/toolkit";

const rawMaterialsSlice = createSlice({
  name: "rawMaterials",
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {
    setLoading: (state, action) => {
      // console.log("📢 setLoading called:", action.payload);

      state.loading = action.payload;
    },
    addMaterial: (state, action) => {
      // console.log("📢 addMaterial called:", action.payload);
      state.items = [action.payload, ...state.items]; // Ensure a new reference
    },
    setMaterials: (state, action) => {
      // console.log(
      //   "📢 setMaterials called with:",
      //   action.payload.length,
      //   "items"
      // );

      state.items = action.payload;
    },
  },
});

export const { addMaterial, setMaterials, setLoading } =
  rawMaterialsSlice.actions;
export default rawMaterialsSlice.reducer;
