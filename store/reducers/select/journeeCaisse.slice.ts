import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchJourneeCaisse = createAsyncThunk(
  "journeeCaisse/fetchJourneeCaisse",
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
        `${API_AUTH_SUIVI}/encaissements/daily-caisse`,
        { params }
      );

      // La structure attendue est { data: [{ libelle: "01" }, { libelle: "02" }, ...] }
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data; // On retourne directement le tableau dans data
      } else if (Array.isArray(response.data)) {
        return response.data; // Si la réponse est directement un tableau
      } else {
        console.error(
          "Format de données journée caisse incorrect:",
          response.data
        );
        // Retourner un tableau par défaut avec le format attendu
        return Array.from({ length: 31 }, (_, i) => ({
          libelle: (i + 1).toString().padStart(2, "0"),
        }));
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des journées caisse:", error);
      return rejectWithValue(
        error.response?.data || "Erreur lors du chargement des journées caisse"
      );
    }
  }
);

const journeeCaisseSlice = createSlice({
  name: "journeeCaisse",
  initialState: {
    data: [] as { libelle: string }[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJourneeCaisse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJourneeCaisse.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchJourneeCaisse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default journeeCaisseSlice.reducer;
