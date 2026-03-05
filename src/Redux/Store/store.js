import { configureStore } from '@reduxjs/toolkit';
import analysisReducer from '../Features/analysisSlice';
import chatReducer from '../Features/chatSlice';
import authReducer from '../Features/authSlice';

export const store = configureStore({
  reducer: {
    analysis: analysisReducer,
    chat: chatReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['analysis/setUploadedFile'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.file'],
        // Ignore these paths in the state
        ignoredPaths: ['analysis.uploadedFile'],
      },
    }),
});
