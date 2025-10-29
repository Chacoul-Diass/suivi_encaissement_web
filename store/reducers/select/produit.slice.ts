import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchProduit = createAsyncThunk(
  "produit/fetchProduit",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_AUTH_SUIVI}/encaissements/produits`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Erreur lors du chargement des produit"
      );
    }
  }
);

const produitSlice = createSlice({
  name: "produit",
  initialState: {
    data: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProduit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduit.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProduit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default produitSlice.reducer;
