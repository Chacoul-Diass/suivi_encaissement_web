import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBanques = createAsyncThunk(
  "Banques/fetchBanques",
  async (
    filters: { directionRegional?: string[]; codeExpl?: string[] } = {},
    { rejectWithValue }
  ) => {
    try {
      const params: any = {};

      if (filters?.directionRegional && filters.directionRegional.length > 0) {
        params.directionRegional = JSON.stringify(filters.directionRegional);
      }

      if (filters?.codeExpl && filters.codeExpl.length > 0) {
        params.codeExpl = JSON.stringify(filters.codeExpl);
      }

      const response = await axiosInstance.get(
        `${API_AUTH_SUIVI}/encaissements/banques`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Erreur lors du chargement des Banques"
      );
    }
  }
);

const BanquesSlice = createSlice({
  name: "Banques",
  initialState: {
    data: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanques.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanques.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBanques.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default BanquesSlice.reducer;
