import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchDashbord = createAsyncThunk(
  "Dashbord/fetchDashbord",
  async (
    {
      directionRegional,
      codeExpl,
    }: { directionRegional?: string[]; codeExpl?: string[] },
    { rejectWithValue }
  ) => {
    try {
      const cleanArray = (arr: string[] | undefined) =>
        arr?.map((item) => item.trim()).filter(Boolean) || [];
      const formatArray = (arr: string[] | undefined) => {
        const cleaned = cleanArray(arr);
        return cleaned.length ? JSON.stringify(cleaned) : undefined;
      };

      const params: Record<string, any> = {};
      if (directionRegional?.length)
        params["directionRegional"] = formatArray(directionRegional);
      if (codeExpl?.length) params["codeExpl"] = formatArray(codeExpl);

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axiosInstance.get(
        `${API_AUTH_SUIVI}/dashboard/get-dashboard-data`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Erreur lors du chargement des Dashbord"
      );
    }
  }
);

const DashbordSlice = createSlice({
  name: "Dashbord",
  initialState: {
    data: {
      caisses: {},
      banques: [],
      completionRate: {},
      ecart: {},
      graph: {},
    },
    loading: true,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashbord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashbord.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashbord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default DashbordSlice.reducer;
