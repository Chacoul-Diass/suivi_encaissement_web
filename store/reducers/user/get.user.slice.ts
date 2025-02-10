import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axios"; // Assure-toi que ce chemin est correct
import { API_AUTH_SUIVI } from "@/config/constants"; // Assure-toi que le constant est défini correctement

// Thunk pour récupérer les utilisateurs
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_AUTH_SUIVI}/users`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Erreur lors du chargement des utilisateurs"
      );
    }
  }
);

// Création du slice
const UserSlice = createSlice({
  name: "users",
  initialState: {
    data: [] as any[], // Typiquement, ce serait un tableau d'objets User
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default UserSlice.reducer;
