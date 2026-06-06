import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import toast from 'react-hot-toast';

// ─── Demo users (no backend needed) ─────────────────────────────────────────
export const DEMO_USERS = {
  'admin@demo.com': {
    _id: 'demo-admin-001',
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'admin@demo.com',
    role: 'admin',
    employeeId: 'EMP00001',
    position: 'HR Director',
    department: { name: 'Human Resources', _id: 'dept-hr' },
    avatar: null,
    isActive: true,
    dateOfJoining: '2021-01-15',
    lastLogin: new Date().toISOString(),
    preferences: { theme: 'dark', notifications: true, language: 'en' },
  },
  'manager@demo.com': {
    _id: 'demo-mgr-002',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'manager@demo.com',
    role: 'senior_manager',
    employeeId: 'EMP00002',
    position: 'Senior Engineering Manager',
    department: { name: 'Engineering', _id: 'dept-eng' },
    avatar: null,
    isActive: true,
    dateOfJoining: '2020-06-01',
    lastLogin: new Date().toISOString(),
    preferences: { theme: 'dark', notifications: true, language: 'en' },
  },
  'hr@demo.com': {
    _id: 'demo-hr-003',
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'hr@demo.com',
    role: 'hr_recruiter',
    employeeId: 'EMP00003',
    position: 'HR Recruiter',
    department: { name: 'Human Resources', _id: 'dept-hr' },
    avatar: null,
    isActive: true,
    dateOfJoining: '2022-03-10',
    lastLogin: new Date().toISOString(),
    preferences: { theme: 'dark', notifications: true, language: 'en' },
  },
  'employee@demo.com': {
    _id: 'demo-emp-004',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'employee@demo.com',
    role: 'employee',
    employeeId: 'EMP00042',
    position: 'Frontend Developer',
    department: { name: 'Engineering', _id: 'dept-eng' },
    avatar: null,
    isActive: true,
    dateOfJoining: '2023-07-20',
    lastLogin: new Date().toISOString(),
    preferences: { theme: 'dark', notifications: true, language: 'en' },
  },
};

const DEMO_PASSWORD = 'demo';
const DEMO_TOKEN = 'demo-mode-token';

// ─── Thunks ──────────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  const { email, password } = credentials;

  // Demo mode: bypass backend
  const demoUser = DEMO_USERS[email?.toLowerCase()];
  if (demoUser && password === DEMO_PASSWORD) {
    localStorage.setItem('accessToken', DEMO_TOKEN);
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    return { user: demoUser, accessToken: DEMO_TOKEN, isDemo: true };
  }

  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed. Try demo accounts below.');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  const token = localStorage.getItem('accessToken');
  const isDemo = token === DEMO_TOKEN;
  if (!isDemo && token) {
    try {
      await api.post('/auth/logout', {}, { timeout: 3000 });
    } catch (err) {
      console.warn('Logout API call failed or timed out:', err.message);
    }
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('demoUser');
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  // Demo mode restore
  const token = localStorage.getItem('accessToken');
  if (token === DEMO_TOKEN) {
    const saved = localStorage.getItem('demoUser');
    if (saved) return JSON.parse(saved);
    localStorage.removeItem('accessToken');
    return rejectWithValue('Demo session expired');
  }
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const refreshToken = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  if (localStorage.getItem('accessToken') === DEMO_TOKEN) {
    return { accessToken: DEMO_TOKEN };
  }
  try {
    const { data } = await api.post('/auth/refresh-token');
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  } catch (err) {
    localStorage.removeItem('accessToken');
    return rejectWithValue(err.response?.data?.message);
  }
});

// ─── Slice ───────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    isInitializing: true,
    isDemo: localStorage.getItem('accessToken') === DEMO_TOKEN,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setInitialized: (state) => { state.isInitializing = false; },
    updateUserPreferences: (state, action) => {
      if (state.user) state.user.preferences = { ...state.user.preferences, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isDemo = !!action.payload.isDemo;
        toast.success(`Welcome${action.payload.isDemo ? ' (Demo Mode)' : ' back'}, ${action.payload.user.firstName}! 👋`);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Login failed');
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isDemo = false;
        toast.success('Logged out successfully');
      })
      .addCase(fetchCurrentUser.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitializing = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isInitializing = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('demoUser');
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isDemo = false;
      });
  },
});

export const { clearError, setInitialized, updateUserPreferences } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectIsDemo = (state) => state.auth.isDemo;

export default authSlice.reducer;
