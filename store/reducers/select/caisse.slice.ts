import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface FilterParams {
  directionRegional?: string[];
  codeExpl?: string[];
}

export const fetchcaisses = createAsyncThunk(
  "caisses/fetchcaisses",
  async (params: FilterParams = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.directionRegional?.length) {
        queryParams.append(
          "directionRegional",
          JSON.stringify(params.directionRegional)
        );
      }

      if (params.codeExpl?.length) {
        queryParams.append("codeExpl", JSON.stringify(params.codeExpl));
      }

      const queryString = queryParams.toString();
      const url = `${API_AUTH_SUIVI}/encaissements/no-caisses${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axiosInstance.get(url);
      return response?.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Erreur lors du chargement des caisses"
      );
    }
  }
);

const caissesSlice = createSlice({
  name: "caisses",
  initialState: {
    data: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchcaisses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchcaisses.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchcaisses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default caissesSlice.reducer;
