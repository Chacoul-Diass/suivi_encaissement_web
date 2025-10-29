import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axios";
import { API_AUTH_SUIVI } from "@/config/constants";

export const fetchDataRapprochementjade = createAsyncThunk(
  "data/fetchDataRapprochementjade-saphir",
  async (
    {
      directionRegional,
      codeExploitation,
      years,
    }: {
      directionRegional?: string[];
      codeExploitation?: string[];
      years?: number[];
    },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();

      if (directionRegional?.length) {
        params.append('directionRegional', JSON.stringify(directionRegional));
      }
      
      if (codeExploitation?.length) {
        params.append('codeExploitation', JSON.stringify(codeExploitation));
      }

      if (years?.length) {
        params.append('years', years.join(','));
      }

      const baseURL = `${API_AUTH_SUIVI}/rapprochements/jade-saphir?${params.toString()}`;
      const response = await axiosInstance.get(baseURL);
      return response.data;
    } catch (error: any) {
      console.error("Erreur API:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || "Erreur lors du chargement des données"
      );
    }
  }
);

// Slice Redux Toolkit
const dataRapprochementJadeSlice = createSlice({
  name: "dataRapprochementJade",
  initialState: {
    data: null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataRapprochementjade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataRapprochementjade.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDataRapprochementjade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dataRapprochementJadeSlice.reducer;
