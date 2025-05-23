import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axios";
import { API_AUTH_SUIVI } from "@/config/constants";

// Thunk pour récupérer les données
export const fetchDataRapprochementSmart = createAsyncThunk(
    "data/fetchDataRapprochementSmart",
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

            const baseURL = `${API_AUTH_SUIVI}/rapprochements/jade-smart?${params.toString()}`;
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
const dataRapprochementSmartSlice = createSlice({
    name: "dataRapprochementSmart",
    initialState: {
        data: null,
        loading: false,
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDataRapprochementSmart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDataRapprochementSmart.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDataRapprochementSmart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default dataRapprochementSmartSlice.reducer;
