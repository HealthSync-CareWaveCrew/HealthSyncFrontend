import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as API from '../Api/api';

// Get all users (admin only)
export const getAllUsers = createAsyncThunk(
  'admin/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.getAllUsers();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch users'
      );
    }
  }
);

// Create user by admin
export const createUserByAdmin = createAsyncThunk(
  'admin/createUserByAdmin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API.createUserByAdmin(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to create user'
      );
    }
  }
);

// Update user role
export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await API.updateUserRole(id, role);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to update user role'
      );
    }
  }
);

// Toggle user status
export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.toggleUserStatus(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to toggle user status'
      );
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.deleteUser(id);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to delete user'
      );
    }
  }
);

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  success: false,
  totalCount: 0
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ FIXED: handle both possible backend response structures
        state.users =
          action.payload.data?.users ||
          action.payload.users ||
          [];

        state.totalCount =
          action.payload.total ||
          // action.payload.data?.total ||
          state.users.length;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create User By Admin
      .addCase(createUserByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createUserByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload.user) {
          state.users.unshift(action.payload.user);
        }
      })
      .addCase(createUserByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update User Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(
          (u) => u._id === updatedUser._id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })

      // Toggle User Status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(
          (u) => u._id === updatedUser._id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })

      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (u) => u._id !== action.payload.id
        );
      });
  }
});

export const { clearError, clearSuccess, setSelectedUser } =
  adminSlice.actions;

export default adminSlice.reducer;