import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllDiseases, getDiseasesByType, getDiseaseById, createDiseaseAPI, updateDiseaseAPI, deleteDiseaseAPI } from '../Api/api';

// Async thunks
export const fetchAllDiseases = createAsyncThunk(
  'disease/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllDiseases();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch diseases');
    }
  }
);

export const fetchDiseasesByType = createAsyncThunk(
  'disease/fetchByType',
  async (type, { rejectWithValue }) => {
    try {
      const response = await getDiseasesByType(type);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch diseases');
    }
  }
);

export const fetchDiseaseById = createAsyncThunk(
  'disease/fetchById',
  async (diseaseId, { rejectWithValue }) => {
    try {
      const response = await getDiseaseById(diseaseId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch disease');
    }
  }
);

export const createDisease = createAsyncThunk(
  'disease/create',
  async (diseaseData, { rejectWithValue }) => {
    try {
      const response = await createDiseaseAPI(diseaseData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create disease');
    }
  }
);

export const updateDisease = createAsyncThunk(
  'disease/update',
  async ({ diseaseId, diseaseData }, { rejectWithValue }) => {
    try {
      const response = await updateDiseaseAPI(diseaseId, diseaseData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update disease');
    }
  }
);

export const deleteDisease = createAsyncThunk(
  'disease/delete',
  async (diseaseId, { rejectWithValue }) => {
    try {
      const response = await deleteDiseaseAPI(diseaseId);
      return diseaseId; // Return the ID to remove from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete disease');
    }
  }
);

const diseaseSlice = createSlice({
  name: 'disease',
  initialState: {
    diseases: [],
    imageDiseases: [],
    textDiseases: [],
    selectedDisease: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    setSelectedDisease: (state, action) => {
      state.selectedDisease = action.payload;
    },
    clearSelectedDisease: (state) => {
      state.selectedDisease = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all diseases
      .addCase(fetchAllDiseases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDiseases.fulfilled, (state, action) => {
        state.loading = false;
        state.diseases = action.payload;
        state.imageDiseases = action.payload.filter(d => d.predictionType === 'image');
        state.textDiseases = action.payload.filter(d => d.predictionType === 'text');
      })
      .addCase(fetchAllDiseases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch diseases by type
      .addCase(fetchDiseasesByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiseasesByType.fulfilled, (state, action) => {
        state.loading = false;
        state.diseases = action.payload;
        // Also update the specific type arrays
        if (action.payload.length > 0) {
          const type = action.payload[0].predictionType;
          if (type === 'image') {
            state.imageDiseases = action.payload;
          } else if (type === 'text') {
            state.textDiseases = action.payload;
          }
        }
      })
      .addCase(fetchDiseasesByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch disease by ID
      .addCase(fetchDiseaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiseaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDisease = action.payload;
      })
      .addCase(fetchDiseaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create disease
      .addCase(createDisease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDisease.fulfilled, (state, action) => {
        state.loading = false;
        state.diseases.push(action.payload);
        // Update type-specific arrays
        if (action.payload.predictionType === 'image') {
          state.imageDiseases.push(action.payload);
        } else if (action.payload.predictionType === 'text') {
          state.textDiseases.push(action.payload);
        }
        state.success = 'Disease created successfully!';
      })
      .addCase(createDisease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update disease
      .addCase(updateDisease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDisease.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.diseases.findIndex(d => d.diseaseId === action.payload.diseaseId);
        if (index !== -1) {
          state.diseases[index] = action.payload;
          // Update type-specific arrays
          state.imageDiseases = state.diseases.filter(d => d.predictionType === 'image');
          state.textDiseases = state.diseases.filter(d => d.predictionType === 'text');
        }
        state.success = 'Disease updated successfully!';
      })
      .addCase(updateDisease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete disease
      .addCase(deleteDisease.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDisease.fulfilled, (state, action) => {
        state.loading = false;
        state.diseases = state.diseases.filter(d => d.diseaseId !== action.payload);
        state.imageDiseases = state.imageDiseases.filter(d => d.diseaseId !== action.payload);
        state.textDiseases = state.textDiseases.filter(d => d.diseaseId !== action.payload);
        state.success = 'Disease deleted successfully!';
      })
      .addCase(deleteDisease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedDisease, clearSelectedDisease, clearError, clearSuccess } = diseaseSlice.actions;

export default diseaseSlice.reducer;
