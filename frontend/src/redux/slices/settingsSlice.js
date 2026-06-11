import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchConfig = createAsyncThunk('settings/fetchConfig', async () => {
  const response = await api.get('/config');
  return response.data;
});

export const saveConfig = createAsyncThunk('settings/saveConfig', async (config) => {
  const response = await api.post('/config', config);
  return response.data.config;
});

export const fetchStats = createAsyncThunk('settings/fetchStats', async () => {
  const response = await api.get('/stats');
  return response.data;
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    embeddingModel: 'BAAI/bge-small-en-v1.5',
    reranker: 'BAAI/bge-reranker-base',
    llm: 'openai/gpt-oss-20b',
    searchScope: 'Selected Documents',
    semanticCount: 10,
    rerankerCount: 3,
    darkMode: true,
    stats: {
        total_documents: 0,
        indexed_chunks: 0,
        last_upload_time: 0
    }
  },
  reducers: {
    setSetting: (state, action) => {
      const { key, value } = action.payload;
      if (key in state) {
        state[key] = value;
      }
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    }
  },
  extraReducers: (builder) => {
      builder
        .addCase(fetchConfig.fulfilled, (state, action) => {
            state.semanticCount = action.payload.semantic_count || 10;
            state.rerankerCount = action.payload.reranker_count || 3;
            state.embeddingModel = action.payload.embedding_model || 'BAAI/bge-small-en-v1.5';
            state.llm = action.payload.language_model || 'openai/gpt-oss-20b';
        })
        .addCase(saveConfig.fulfilled, (state, action) => {
            state.semanticCount = action.payload.semantic_count || 10;
            state.rerankerCount = action.payload.reranker_count || 3;
            state.embeddingModel = action.payload.embedding_model || 'BAAI/bge-small-en-v1.5';
            state.llm = action.payload.language_model || 'openai/gpt-oss-20b';
        })
        .addCase(fetchStats.fulfilled, (state, action) => {
            state.stats = action.payload;
        });
  }
});

export const { setSetting, toggleDarkMode } = settingsSlice.actions;
export default settingsSlice.reducer;
