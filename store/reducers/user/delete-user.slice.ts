import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axios"; // Assure-toi que ce chemin est correct
import { API_AUTH_SUIVI } from "@/config/constants"; // Assure-toi que le constant est défini correctement

// Thunk pour récupérer les utilisateurs
export const fetchUserDelete = createAsyncThunk(
  "users/fetchUserDelete",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `${API_AUTH_SUIVI}/users/${userId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Erreur lors du chargement des utilisateurs"
      );
    }
  }
);

// Création du slice
const UserDeleteSlice = createSlice({
  name: "users",
  initialState: {
    data: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDelete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDelete.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserDelete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default UserDeleteSlice.reducer;
