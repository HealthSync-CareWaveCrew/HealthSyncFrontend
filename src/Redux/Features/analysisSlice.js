import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as API from '../Api/api';

//////////////////////////////Analysis Thunks //////////////////////////////
export const analyzeImageData = createAsyncThunk(
  'analysis/analyzeImage',
  async ({ diseaseId,file, diseaseType }, { rejectWithValue }) => {
    try {
      const response = await API.analyzeImage(diseaseId,file, diseaseType);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.message ||
        'Error analyzing image'
      );
    }
  }
);

export const analyzeClinicalDataThunk = createAsyncThunk(
  'analysis/analyzeClinicalData',
  async ({ diseaseType, formData, diseaseId }, { rejectWithValue }) => {
    try {
      const response = await API.analyzeClinicalData(diseaseType, formData, diseaseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.message ||
        'Error analyzing clinical data'
      );
    }
  }
);

const initialState = {
  mode: 'image', // 'image' or 'clinical'
  diseaseType: '',
  selectedDisease: null,
  uploadedFile: null,
  previewUrl: null,
  results: null,
  loading: false,
  error: null,
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload;
      state.results = null;
      state.error = null;
    },
    setDiseaseType: (state, action) => {
      state.diseaseType = action.payload;
    },
    setSelectedDisease: (state, action) => {
      state.selectedDisease = action.payload;
    },
    setUploadedFile: (state, action) => {
      state.uploadedFile = action.payload.file;
      state.previewUrl = action.payload.url;
    },
    clearUploadedFile: (state) => {
      state.uploadedFile = null;
      state.previewUrl = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAnalysis: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Image Analysis
      .addCase(analyzeImageData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeImageData.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.error = null;
      })
      .addCase(analyzeImageData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Clinical Data Analysis
      .addCase(analyzeClinicalDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeClinicalDataThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.error = null;
      })
      .addCase(analyzeClinicalDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const {
  setMode,
  setDiseaseType,
  setSelectedDisease,
  setUploadedFile,
  clearUploadedFile,
  clearError,
  resetAnalysis,
} = analysisSlice.actions;

export default analysisSlice.reducer;
