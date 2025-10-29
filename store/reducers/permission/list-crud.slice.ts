import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchpermissions = createAsyncThunk(
  "permissions/fetchpermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_AUTH_SUIVI}/permissions`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data ||
          "Erreur lors du chargement des directions régionales"
      );
    }
  }
);

const permissionsSlice = createSlice({
  name: "permissions",
  initialState: {
    data: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchpermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchpermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchpermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default permissionsSlice.reducer;
