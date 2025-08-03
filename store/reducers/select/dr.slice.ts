import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchDirectionRegionales = createAsyncThunk(
  "directionRegionales/fetchDirectionRegionales",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_AUTH_SUIVI}/direction-regionale`
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur API DR:", error);
      return rejectWithValue(
        error.response?.data ||
          "Erreur lors du chargement des directions régionales"
      );
    }
  }
);

const directionRegionalesSlice = createSlice({
  name: "directionRegionales",
  initialState: {
    data: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDirectionRegionales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDirectionRegionales.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDirectionRegionales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default directionRegionalesSlice.reducer;
