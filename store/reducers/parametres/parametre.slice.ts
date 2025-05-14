import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface Parametre {
  id: number;
  email: string;
  description: string;
  banque?: string;
  createdAt: string;
  updatedAt: string;
}

interface ParametreResponse {
  error: boolean;
  statusCode: number;
  message: string;
  data: {
    pagination: {
      currentPage: number;
      previousPage: number | null;
      nextPage: number | null;
      count: number;
      totalCount: number;
      totalPages: number;
    };
    result: Parametre[];
  };
}

export const fetchParametres = createAsyncThunk(
  "parametres/fetchParametres",
  async (params: { page?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ParametreResponse>(
        `${API_AUTH_SUIVI}/email-receiver/list-paginate${
          params.page ? `?page=${params.page}` : ""
        }`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors du chargement des paramètres"
      );
    }
  }
);

export const createParametre = createAsyncThunk(
  "parametres/createParametre",
  async (
    parametre: { email: string; description: string; banque?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post<ParametreResponse>(
        `${API_AUTH_SUIVI}/email-receiver`,
        parametre
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la création du paramètre"
      );
    }
  }
);

export const updateParametre = createAsyncThunk(
  "parametres/updateParametre",
  async (
    { id, ...updateData }: Partial<Parametre> & { id: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch<ParametreResponse>(
        `${API_AUTH_SUIVI}/email-receiver/${id}`,
        updateData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du paramètre"
      );
    }
  }
);

export const deleteParametre = createAsyncThunk(
  "parametres/deleteParametre",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete<ParametreResponse>(
        `${API_AUTH_SUIVI}/email-receiver/${id}`
      );
      return { id, ...response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la suppression du paramètre"
      );
    }
  }
);

interface ParametreState {
  data: {
    pagination: {
      currentPage: number;
      previousPage: number | null;
      nextPage: number | null;
      count: number;
      totalCount: number;
      totalPages: number;
    };
    result: Parametre[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: ParametreState = {
  data: {
    pagination: {
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      count: 0,
      totalCount: 0,
      totalPages: 0,
    },
    result: [],
  },
  loading: false,
  error: null,
};

const parametreSlice = createSlice({
  name: "parametres",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParametres.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParametres.fulfilled, (state, action: any) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchParametres.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Parametre
      .addCase(createParametre.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createParametre.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createParametre.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Parametre
      .addCase(updateParametre.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateParametre.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateParametre.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Parametre
      .addCase(deleteParametre.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteParametre.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteParametre.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default parametreSlice.reducer;
