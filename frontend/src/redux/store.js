import { configureStore } from '@reduxjs/toolkit';
import healthReducer from './slices/healthSlice';
import folderReducer from './slices/folderSlice';
import fileReducer from './slices/fileSlice';
import chatReducer from './slices/chatSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    health: healthReducer,
    folder: folderReducer,
    file: fileReducer,
    chat: chatReducer,
    settings: settingsReducer
  }
});
