import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axios";
import { API_AUTH_SUIVI } from "@/config/constants";

// Thunk pour mettre à jour un utilisateur
export const fetchupdateUser = createAsyncThunk(
  "usersupdate/updateUser",
  async (
    { userId, userData }: { userId: number; userData: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `${API_AUTH_SUIVI}/users/${userId}`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Erreur lors de la mise à jour de l'utilisateur"
      );
    }
  }
);

// Création du slice
const UserSUpdateSlice = createSlice({
  name: "usersUpdate",
  initialState: {
    data: [] as any[],
    loading: false,
    error: null as string | null,
    success: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchupdateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchupdateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const updatedUser = action.payload.data;
        state.data = state.data.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        );
      })
      .addCase(fetchupdateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default UserSUpdateSlice.reducer;
