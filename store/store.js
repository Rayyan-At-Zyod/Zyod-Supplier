import { configureStore } from '@reduxjs/toolkit';
import rawMaterialsReducer from './rawMaterialsSlice';

export const store = configureStore({
  reducer: {
    rawMaterials: rawMaterialsReducer
  }
}); 