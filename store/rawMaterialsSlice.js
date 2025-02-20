import { createSlice } from '@reduxjs/toolkit';

const rawMaterialsSlice = createSlice({
  name: 'rawMaterials',
  initialState: {
    items: [],
  },
  reducers: {
    addMaterial: (state, action) => {
      state.items.push(action.payload);
    },
    setMaterials: (state, action) => {
      state.items = action.payload;
    },
  }
});

export const { addMaterial, setMaterials } = rawMaterialsSlice.actions;
export default rawMaterialsSlice.reducer; 