import { createSlice } from '@reduxjs/toolkit';

const fileSlice = createSlice({
  name: 'file',
  initialState: {
    selectedFiles: []
  },
  reducers: {
    toggleFileSelection: (state, action) => {
      const fileId = action.payload; // Usually the file path
      const index = state.selectedFiles.indexOf(fileId);
      if (index > -1) {
        state.selectedFiles.splice(index, 1);
      } else {
        state.selectedFiles.push(fileId);
      }
    },
    selectAllFiles: (state, action) => {
      state.selectedFiles = action.payload;
    },
    clearSelection: (state) => {
      state.selectedFiles = [];
    }
  }
});

export const { toggleFileSelection, selectAllFiles, clearSelection } = fileSlice.actions;
export default fileSlice.reducer;
