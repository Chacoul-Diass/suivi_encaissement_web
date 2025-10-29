import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchProfile = createAsyncThunk(
  "Profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_AUTH_SUIVI}/profile`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data ||
          "Erreur lors du chargement des directions régionales"
      );
    }
  }
);

const ProfileSlice = createSlice({
  name: "Profile",
  initialState: {
    data: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default ProfileSlice.reducer;
