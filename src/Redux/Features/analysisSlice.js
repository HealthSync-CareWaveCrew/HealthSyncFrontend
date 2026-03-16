import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as API from '../Api/api';
import { toast } from "react-toastify";

//////////////////////////////Analysis Thunks //////////////////////////////
export const analyzeImageData = createAsyncThunk(
  'analysis/analyzeImage',
  async ({ diseaseId,file, diseaseType }, { rejectWithValue }) => {
    try {
      const response = await API.analyzeImage(diseaseId,file, diseaseType);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
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
      console.error('Clinical data analysis error1111:', error.response?.data?.message);
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Error analyzing clinical data'
      );
    }
  }
);

export const fetchAnalysisHistoryThunk = createAsyncThunk(
  'analysis/fetchHistory',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await API.getAnalysisHistoryAPI(filters);
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to load analysis history.'
      );
    }
  }
);

export const fetchAnalysisByIdThunk = createAsyncThunk(
  'analysis/fetchById',
  async (analysisId, { rejectWithValue }) => {
    try {
      const response = await API.getAnalysisByIdAPI(analysisId);
      return response.data?.data || null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to load analysis details.'
      );
    }
  }
);

export const deleteAnalysisThunk = createAsyncThunk(
  'analysis/deleteAnalysis',
  async (analysisId, { rejectWithValue }) => {
    try {
      await API.deleteAnalysisAPI(analysisId);
      return analysisId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to delete analysis.'
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
  // Analysis History
  historyList: [],
  historyLoading: false,
  historyError: null,
  deleteLoading: false,
  deleteError: null,
  selectedAnalysis: null,
  selectedAnalysisLoading: false,
  selectedAnalysisError: null,
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
    clearHistoryError: (state) => {
      state.historyError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearSelectedAnalysis: (state) => {
      state.selectedAnalysis = null;
      state.selectedAnalysisError = null;
      state.selectedAnalysisLoading = false;
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
        state.error = action.payload;
        toast.error(action.payload || 'Image analysis failed.');
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
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch Analysis History
      .addCase(fetchAnalysisHistoryThunk.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchAnalysisHistoryThunk.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyList = action.payload;
        state.historyError = null;
      })
      .addCase(fetchAnalysisHistoryThunk.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
        state.historyList = [];
      })
      // Delete analysis
      .addCase(deleteAnalysisThunk.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteAnalysisThunk.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        state.historyList = state.historyList.filter(
          (analysis) => analysis._id !== action.payload
        );
      })
      .addCase(deleteAnalysisThunk.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
        toast.error(action.payload || 'Failed to delete analysis.');
      })
      // Fetch single analysis details
      .addCase(fetchAnalysisByIdThunk.pending, (state) => {
        state.selectedAnalysisLoading = true;
        state.selectedAnalysisError = null;
      })
      .addCase(fetchAnalysisByIdThunk.fulfilled, (state, action) => {
        state.selectedAnalysisLoading = false;
        state.selectedAnalysis = action.payload;
        state.selectedAnalysisError = null;
      })
      .addCase(fetchAnalysisByIdThunk.rejected, (state, action) => {
        state.selectedAnalysisLoading = false;
        state.selectedAnalysisError = action.payload;
        state.selectedAnalysis = null;
        toast.error(action.payload || 'Failed to load analysis details.');
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
  clearHistoryError,
  clearDeleteError,
  clearSelectedAnalysis,
  resetAnalysis,
} = analysisSlice.actions;

export default analysisSlice.reducer;
