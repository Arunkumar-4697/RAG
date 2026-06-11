import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFolders as getFoldersApi, createFolder as createFolderApi, deleteFolder as deleteFolderApi } from '../../services/folderApi';
import { uploadFile as uploadFileApi, deleteFile as deleteFileApi } from '../../services/fileApi';

export const fetchFolders = createAsyncThunk('folder/fetchFolders', async (_, { rejectWithValue }) => {
  try {
    return await getFoldersApi();
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const createFolder = createAsyncThunk('folder/createFolder', async (folderPath, { dispatch, rejectWithValue }) => {
  try {
    const res = await createFolderApi(folderPath);
    dispatch(fetchFolders());
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteFolder = createAsyncThunk('folder/deleteFolder', async (folderPath, { dispatch, rejectWithValue }) => {
  try {
    const res = await deleteFolderApi(folderPath);
    dispatch(fetchFolders());
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const uploadFile = createAsyncThunk('file/uploadFile', async ({ folderPath, file }, { dispatch, rejectWithValue }) => {
  try {
    const res = await uploadFileApi(folderPath, file);
    dispatch(fetchFolders()); // refreshing tree
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteFile = createAsyncThunk('file/deleteFile', async (filePath, { dispatch, rejectWithValue }) => {
  try {
    const res = await deleteFileApi(filePath);
    dispatch(fetchFolders()); // refreshing tree
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const folderSlice = createSlice({
  name: 'folder',
  initialState: {
    tree: [],
    loading: false,
    error: null,
    uploading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFolders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFolders.fulfilled, (state, action) => { state.loading = false; state.tree = action.payload; })
      .addCase(fetchFolders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(uploadFile.pending, (state) => { state.uploading = true; })
      .addCase(uploadFile.fulfilled, (state) => { state.uploading = false; })
      .addCase(uploadFile.rejected, (state) => { state.uploading = false; });
  }
});

export default folderSlice.reducer;
