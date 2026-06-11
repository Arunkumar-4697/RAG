import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { sendChat as sendChatApi } from '../../services/chatApi';

export const fetchConversations = createAsyncThunk('chat/fetchConversations', async () => {
  const res = await api.get('/conversations');
  return res.data;
});

export const loadConversation = createAsyncThunk('chat/loadConversation', async (convoId) => {
  const res = await api.get(`/conversations/${convoId}`);
  return res.data;
});

export const deleteConversation = createAsyncThunk('chat/deleteConversation', async (convoId) => {
  await api.delete(`/conversations/${convoId}`);
  return convoId;
});

export const sendChat = createAsyncThunk('chat/sendChat', async ({ question, folders, files, conversationId, searchMode }, { rejectWithValue }) => {
  try {
    return await sendChatApi(question, folders, files, conversationId, searchMode);
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    conversations: [],
    activeConversationId: null,
    loading: false,
    error: null
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ role: 'user', content: action.payload, timestamp: new Date().toISOString() });
    },
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.activeConversationId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChat.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendChat.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          role: 'assistant',
          content: action.payload.answer,
          sources: action.payload.sources,
          timestamp: new Date().toISOString()
        });
        if (action.payload.conversation_id && !state.activeConversationId) {
            state.activeConversationId = action.payload.conversation_id;
        }
      })
      .addCase(sendChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.messages.push({ role: 'assistant', content: 'Sorry, an error occurred.' });
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(loadConversation.fulfilled, (state, action) => {
        state.messages = action.payload.messages || [];
        state.activeConversationId = action.payload.id;
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
        if (state.activeConversationId === action.payload) {
          state.messages = [];
          state.activeConversationId = null;
        }
      });
  }
});

export const { addUserMessage, setActiveConversation, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
