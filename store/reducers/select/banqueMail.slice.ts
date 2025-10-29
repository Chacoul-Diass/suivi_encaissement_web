import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBanquesMail = createAsyncThunk(
  "BanquesMail/fetchBanquesMail",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_AUTH_SUIVI}/email-receiver/banques`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Erreur lors du chargement des Banques"
      );
    }
  }
);

const BanquesMailSlice = createSlice({
  name: "BanquesMail",
  initialState: {
    data: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanquesMail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanquesMail.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBanquesMail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default BanquesMailSlice.reducer;
