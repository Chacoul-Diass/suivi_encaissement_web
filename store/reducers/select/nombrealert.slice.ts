import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchNombreAlert = createAsyncThunk(
  "nombreAlert/fetchNombreAlert",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_AUTH_SUIVI}/encaissements/alerts-count`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data ||
          "Erreur lors du chargement des directions régionales"
      );
    }
  }
);

const nombreAlertSlice = createSlice({
  name: "nombreAlert",
  initialState: {
    data: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNombreAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNombreAlert.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchNombreAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default nombreAlertSlice.reducer;
