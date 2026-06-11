import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkHealth as checkHealthApi } from '../../services/healthApi';

export const checkHealth = createAsyncThunk(
  'health/checkHealth',
  async (_, { rejectWithValue }) => {
    try {
      const data = await checkHealthApi();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const healthSlice = createSlice({
  name: 'health',
  initialState: {
    backend: false,
    qdrant: false,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.backend = action.payload.backend;
        state.qdrant = action.payload.qdrant;
      })
      .addCase(checkHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.backend = false;
        state.qdrant = false;
      });
  }
});

export default healthSlice.reducer;
