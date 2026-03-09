import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as API from '../Api/api';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: false,
  error: null,
  otpSent: false,
  otpVerified: false,
  tempEmail: null,
  tempName: null,
  tempData: null,
};

// Registration Thunks
export const sendRegistrationOTP = createAsyncThunk(
  'auth/sendRegistrationOTP',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API.sendRegistrationOTP(userData);
      return { 
        message: response.data.message,
        email: userData.email,
        name: userData.name 
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to send OTP'
      );
    }
  }
);

export const verifyRegistrationOTP = createAsyncThunk(
  'auth/verifyRegistrationOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await API.verifyRegistrationOTP(otpData);
      // Store token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return {
        user: response.data.user,
        token: response.data.token,
        message: response.data.message
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to verify OTP'
      );
    }
  }
);

// Login Thunks
export const sendLoginOTP = createAsyncThunk(
  'auth/sendLoginOTP',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await API.sendLoginOTP(credentials);
      return { 
        message: response.data.message,
        email: credentials.email 
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to send login OTP'
      );
    }
  }
);

export const verifyLoginOTP = createAsyncThunk(
  'auth/verifyLoginOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await API.verifyLoginOTP(otpData);
      // Store token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return {
        user: response.data.user,
        token: response.data.token,
        message: response.data.message
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to verify OTP'
      );
    }
  }
);

// Password Reset Thunks
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await API.forgotPassword(email);
      return { message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to send reset email'
      );
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await API.resetPassword({ email, otp, newPassword });
      return { message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to reset password'
      );
    }
  }
);

// Token Management
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.refreshToken();
      return { token: response.data.token };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to refresh token'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await API.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      return {};
    }
  }
);

// User Profile Thunks
// Get Current User
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await API.getCurrentUser();
      console.log('API Response:', response.data); // Debug log
      
      // The response structure is: { status: "success", data: { user: {...} } }
      return { user: response.data.data.user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch user'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await API.updateProfile(profileData);
      return { user: response.data.user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to update profile'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await API.changePassword(passwordData);
      return { message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to change password'
      );
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.deleteAccount();
      localStorage.removeItem('token');
      return { message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to delete account'
      );
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOTPState: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.tempEmail = null;
      state.tempName = null;
      state.error = null;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Registration OTP
      .addCase(sendRegistrationOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendRegistrationOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.tempEmail = action.payload.email;
        state.tempName = action.payload.name;
        state.tempData = action.payload.userData;
        state.error = null;
      })
      .addCase(sendRegistrationOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Verify Registration OTP
      .addCase(verifyRegistrationOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRegistrationOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.otpVerified = true;
        state.otpSent = false;
        state.tempEmail = null;
        state.tempName = null;
        state.error = null;

        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(verifyRegistrationOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Send Login OTP
      .addCase(sendLoginOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendLoginOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.tempEmail = action.payload.email;
        state.error = null;
      })
      .addCase(sendLoginOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Verify Login OTP
      .addCase(verifyLoginOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyLoginOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.otpVerified = true;
        state.otpSent = false;
        state.tempEmail = null;
        state.error = null;

        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(verifyLoginOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If refresh fails, logout user
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.otpSent = false;
        state.otpVerified = false;
        state.tempEmail = null;
        state.tempName = null;
        state.error = null;
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If token is invalid, logout
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetOTPState, setAuthenticated } = authSlice.actions;

export default authSlice.reducer;