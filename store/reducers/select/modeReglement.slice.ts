import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchmodeReglement = createAsyncThunk(
  "modeReglement/fetchmodeReglement",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_AUTH_SUIVI}/encaissements/mode-reglement`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Erreur lors du chargement des modeReglement"
      );
    }
  }
);

const modeReglementSlice = createSlice({
  name: "modeReglement",
  initialState: {
    data: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchmodeReglement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchmodeReglement.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchmodeReglement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default modeReglementSlice.reducer;
