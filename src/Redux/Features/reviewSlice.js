import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createReviewAPI, 
  getAllReviewsAPI, 
  getReviewsByUserAPI, 
  updateReviewAPI, 
  deleteReviewAPI,
  getReviewStatsAPI,
  getAllReviewsAdminAPI,
  toggleReviewVisibilityAPI,
  toggleReviewApprovalAPI
} from '../Api/reviewApi';

// Async thunks
export const fetchAllReviews = createAsyncThunk(
  'review/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getAllReviewsAPI(filters);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch reviews');
    }
  }
);

export const fetchReviewStats = createAsyncThunk(
  'review/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getReviewStatsAPI();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch stats');
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'review/fetchUserReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getReviewsByUserAPI();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user reviews');
    }
  }
);

export const fetchAllReviewsAdmin = createAsyncThunk(
  'review/fetchAllAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllReviewsAdminAPI();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch all reviews');
    }
  }
);

export const createReview = createAsyncThunk(
  'review/create',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await createReviewAPI(reviewData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'review/update',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await updateReviewAPI(id, updateData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/delete',
  async ({ id, userEmail }, { rejectWithValue }) => {
    try {
      await deleteReviewAPI(id, userEmail);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete review');
    }
  }
);

export const toggleVisibility = createAsyncThunk(
  'review/toggleVisibility',
  async ({ id, isVisible }, { rejectWithValue }) => {
    try {
      const response = await toggleReviewVisibilityAPI(id, isVisible);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle visibility');
    }
  }
);

export const toggleApproval = createAsyncThunk(
  'review/toggleApproval',
  async ({ id, isApproved }, { rejectWithValue }) => {
    try {
      const response = await toggleReviewApprovalAPI(id, isApproved);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle approval');
    }
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    reviews: [],
    userReviews: [],
    stats: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reviews
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch review stats
      .addCase(fetchReviewStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchReviewStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch user reviews
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all reviews admin
      .addCase(fetchAllReviewsAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviewsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchAllReviewsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
        
        // Update stats immediately
        if (state.stats) {
          const newRating = action.payload.rating;
          const oldTotal = state.stats.totalReviews;
          const oldAverage = state.stats.averageRating;
          
          state.stats.totalReviews = oldTotal + 1;
          state.stats.averageRating = ((oldAverage * oldTotal) + newRating) / (oldTotal + 1);
          
          // Update rating distribution
          const starKey = 
            newRating === 5 ? 'fiveStar' :
            newRating === 4 ? 'fourStar' :
            newRating === 3 ? 'threeStar' :
            newRating === 2 ? 'twoStar' : 'oneStar';
          
          state.stats.ratingDistribution[starKey] = (state.stats.ratingDistribution[starKey] || 0) + 1;
        }
        
        state.success = 'Review submitted successfully!';
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const oldReview = state.reviews.find(r => r._id === action.payload._id);
        
        // Update stats if rating changed
        if (state.stats && oldReview && oldReview.rating !== action.payload.rating) {
          const oldRating = oldReview.rating;
          const newRating = action.payload.rating;
          const total = state.stats.totalReviews;
          const oldAverage = state.stats.averageRating;
          
          // Recalculate average rating
          state.stats.averageRating = ((oldAverage * total) - oldRating + newRating) / total;
          
          // Update rating distribution
          const oldStarKey = 
            oldRating === 5 ? 'fiveStar' :
            oldRating === 4 ? 'fourStar' :
            oldRating === 3 ? 'threeStar' :
            oldRating === 2 ? 'twoStar' : 'oneStar';
          
          const newStarKey = 
            newRating === 5 ? 'fiveStar' :
            newRating === 4 ? 'fourStar' :
            newRating === 3 ? 'threeStar' :
            newRating === 2 ? 'twoStar' : 'oneStar';
          
          if (state.stats.ratingDistribution[oldStarKey] > 0) {
            state.stats.ratingDistribution[oldStarKey] -= 1;
          }
          state.stats.ratingDistribution[newStarKey] = (state.stats.ratingDistribution[newStarKey] || 0) + 1;
        }
        
        const index = state.reviews.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        const userIndex = state.userReviews.findIndex(r => r._id === action.payload._id);
        if (userIndex !== -1) {
          state.userReviews[userIndex] = action.payload;
        }
        state.success = 'Review updated successfully!';
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        const deletedReview = state.reviews.find(r => r._id === action.payload);
        
        // Update stats immediately if review was found
        if (state.stats && deletedReview) {
          const deletedRating = deletedReview.rating;
          const oldTotal = state.stats.totalReviews;
          
          if (oldTotal > 1) {
            const oldAverage = state.stats.averageRating;
            state.stats.totalReviews = oldTotal - 1;
            state.stats.averageRating = ((oldAverage * oldTotal) - deletedRating) / (oldTotal - 1);
          } else {
            // If this was the last review, reset stats
            state.stats.totalReviews = 0;
            state.stats.averageRating = 0;
          }
          
          // Update rating distribution
          const starKey = 
            deletedRating === 5 ? 'fiveStar' :
            deletedRating === 4 ? 'fourStar' :
            deletedRating === 3 ? 'threeStar' :
            deletedRating === 2 ? 'twoStar' : 'oneStar';
          
          if (state.stats.ratingDistribution[starKey] > 0) {
            state.stats.ratingDistribution[starKey] -= 1;
          }
        }
        
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
        state.userReviews = state.userReviews.filter(r => r._id !== action.payload);
        state.success = 'Review deleted successfully!';
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle visibility
      .addCase(toggleVisibility.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        state.success = 'Visibility updated successfully!';
      })
      
      // Toggle approval
      .addCase(toggleApproval.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        state.success = 'Approval status updated successfully!';
      });
  },
});

export const { clearError, clearSuccess } = reviewSlice.actions;
export default reviewSlice.reducer;
