import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchEtatEncaissements = createAsyncThunk(
  "etat/fetchEtatEncaissements",
  async (
    {
      directionRegional,
      codeExpl,
      banque,
      caisse,
      produit,
      startDate,
      endDate,
      modeReglement,
      search,
      page,
      limit,
      dailyCaisse,
      codeCaisse,
      noCaisse,
      status,
    }: {
      directionRegional?: string[];
      codeExpl?: string[];
      banque?: string[];
      caisse?: string[];
      produit?: string[];
      startDate?: string;
      endDate?: string;
      search?: string;
      modeReglement?: string[];
      page?: number;
      limit?: number;
      dailyCaisse?: string[];
      codeCaisse?: string[];
      noCaisse?: string[];
      status?: number[];
    },
    { rejectWithValue }
  ) => {
    try {
      const cleanArray = (arr: string[] | undefined) =>
        arr?.map((item) => item.trim()) || [];

      const formatArray = (arr: string[] | undefined) =>
        JSON.stringify(cleanArray(arr));

      const formatDate = (date: string | undefined) => {
        if (!date) return undefined;
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
      };

      // Construire les paramètres
      const params: Record<string, any> = {};
      if (directionRegional?.length)
        params["directionRegional"] = formatArray(directionRegional);
      if (codeExpl?.length) params["codeExpl"] = formatArray(codeExpl);
      if (startDate) params["startDate"] = formatDate(startDate);
      if (endDate) params["endDate"] = formatDate(endDate);
      if (banque?.length) params["banque"] = formatArray(banque);
      if (caisse?.length) params["caisse"] = formatArray(caisse);
      if (produit?.length) params["produit"] = formatArray(produit);
      if (modeReglement?.length)
        params["modeReglement"] = formatArray(modeReglement);
      if (dailyCaisse?.length) params["dailyCaisse"] = formatArray(dailyCaisse);
      if (codeCaisse?.length) params["codeCaisse"] = formatArray(codeCaisse);
      if (noCaisse?.length) params["noCaisse"] = formatArray(noCaisse);
      if (status && status.length > 0) params["status"] = status.join(",");

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      // Construction de l'URL
      const baseURL = `${API_AUTH_SUIVI}/encaissements`;

      // Ajout des paramètres de requête dans l'URL
      const queryParams = new URLSearchParams();
      if (page) queryParams.append("page", page.toString());
      if (search) queryParams.append("search", search);
      if (limit) queryParams.append("limit", limit.toString());

      const queryString = queryParams.toString();
      const url = queryString ? `${baseURL}?${queryString}` : baseURL;

      // Exécution de la requête
      const response = await axiosInstance.get(url, { params });

      return response.data;
    } catch (error: any) {
      console.error("Erreur API détaillée:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      return rejectWithValue(
        error.response?.data || "Erreur lors du chargement des données"
      );
    }
  }
);

// Structure du state pour les états d'encaissement
interface EtatEncaissementState {
  data: {
    result: any[];
    pagination: {
      currentPage: number;
      previousPage: number | null;
      nextPage: number | null;
      count: number;
      totalCount: number;
      totalPages: number;
    };
  };
  loading: boolean;
  error: string | null;
}

const initialState: EtatEncaissementState = {
  data: {
    result: [],
    pagination: {
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      count: 0,
      totalCount: 0,
      totalPages: 0,
    },
  },
  loading: false,
  error: null,
};

const etatEncaissementSlice = createSlice({
  name: "etatEncaissement",
  initialState,
  reducers: {
    clearEtatData: (state) => {
      state.data.result = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEtatEncaissements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEtatEncaissements.fulfilled, (state, action) => {
        state.loading = false;

        // Vérifier les différentes structures possibles de réponse
        if (action.payload && action.payload.data) {
          // Format {data: {pagination, result}}

          state.data = action.payload.data;
        } else if (
          action.payload &&
          action.payload.result &&
          action.payload.pagination
        ) {
          state.data = action.payload;
        } else if (action.payload && Array.isArray(action.payload)) {
          // Format tableau direct

          state.data = {
            result: action.payload,
            pagination: {
              currentPage: 1,
              previousPage: null,
              nextPage: null,
              count: action.payload.length,
              totalCount: action.payload.length,
              totalPages: 1,
            },
          };
        } else {
          console.error("Format de réponse inattendu:", action.payload);
          state.error = "Format de réponse inattendu";
        }
      })
      .addCase(fetchEtatEncaissements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEtatData } = etatEncaissementSlice.actions;
export default etatEncaissementSlice.reducer;
