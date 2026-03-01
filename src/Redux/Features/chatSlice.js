import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as API from '../Api/api';

//////////////////////////////Chat Thunks //////////////////////////////
export const sendChatMessageThunk = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, history, systemInstruction }, { rejectWithValue }) => {
    try {
      const response = await API.sendChatMessage(message, history, systemInstruction);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.message ||
        'Error sending chat message'
      );
    }
  }
);

const initialState = {
  messages: [],
  loading: false,
  systemInstruction: '',
  isChatEnabled: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setSystemInstruction: (state, action) => {
      state.systemInstruction = action.payload;
    },
    enableChat: (state) => {
      state.isChatEnabled = true;
    },
    disableChat: (state) => {
      state.isChatEnabled = false;
      state.messages = [];
      state.systemInstruction = '';
    },
    clearChat: (state) => {
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessageThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessageThunk.fulfilled, (state, action) => {
        state.loading = false;
        const aiMessage = {
          role: 'model',
          parts: [{ text: action.payload.data.text }],
        };
        state.messages.push(aiMessage);
      })
      .addCase(sendChatMessageThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        const errorMessage = {
          role: 'model',
          parts: [{ text: `Error: ${action.payload.message}` }],
        };
        state.messages.push(errorMessage);
      });
  },
});

export const {
  addMessage,
  setSystemInstruction,
  enableChat,
  disableChat,
  clearChat,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
