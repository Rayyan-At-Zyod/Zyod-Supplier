import { createSlice } from '@reduxjs/toolkit';

const rawMaterialsSlice = createSlice({
  name: 'rawMaterials',
  initialState: {
    items: [],
    loading: false
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    addMaterial: (state, action) => {
      state.items.push(action.payload);
    },
    setMaterials: (state, action) => {
      state.items = action.payload;
    },
  }
});

export const { addMaterial, setMaterials, setLoading } = rawMaterialsSlice.actions;
export default rawMaterialsSlice.reducer; 