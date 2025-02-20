import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchDataReleve = createAsyncThunk(
  "data/fetchDataReleve",
  async (
    {
      id,
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
    }: {
      id: any;
      directionRegional?: string[];
      codeExpl?: string[];
      banque?: string[];
      caisse?: string[];
      produit?: string[];
      startDate?: string;
      endDate?: string;
      search?: any;
      modeReglement?: string[];
      page?: any;
      limit?: any;
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

      const params: Record<string, any> = {};
      if (directionRegional?.length)
        params["directionRegional"] = formatArray(directionRegional);
      if (codeExpl?.length) params["codeExpl"] = formatArray(codeExpl);
      if (startDate) params["startDate"] = formatDate(startDate);
      if (endDate) params["endDate"] = formatDate(endDate);
      if (banque) params["banque"] = formatArray(banque);
      if (caisse) params["caisse"] = formatArray(caisse);
      if (produit) params["produit"] = formatArray(produit);
      if (modeReglement) params["modeReglement"] = formatArray(modeReglement);

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const baseURL = `${API_AUTH_SUIVI}/encaissements/${id}?page=${page}&search=${search}&limit=${limit}`;

      const response = await axiosInstance.get(baseURL, { params });
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

const initialState = {
  data: {
    result: [],
    pagination: {},
    totalAmount: 0,
    totalCount: 0,
  },
  loading: true,
  error: null as string | null,
};

const dataReleveSlice = createSlice({
  name: "encaissementReleve",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataReleve.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataReleve.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDataReleve.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dataReleveSlice.reducer;
