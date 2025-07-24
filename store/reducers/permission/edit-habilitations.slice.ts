import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface Permission {
  objectId: number;
  permissionId: number;
}

interface Role {
  id?: number; // Peut être optionnel si l'ID est généré par l'API
  name: string;
  description: string;
  permissions: Permission[];
}

export const fetchUpdateRole = createAsyncThunk(
  "roles/updateRole",
  async (
    {
      roleData,
      id,
    }: {
      roleData: { name: string; description: string; permissions: any[] };
      id: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `${API_AUTH_SUIVI}/profile/${id}`, // Utilisation de l'ID dans l'URL
        JSON.stringify(roleData), // Envoi des données de rôle
        {
          headers: {
            "Content-Type": "application/json",
          },
          maxBodyLength: Infinity,
        }
      );
      return response.data; // Retourne les données de la réponse
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Slice pour gérer les rôles
const roleSlice = createSlice({
  name: "roles",
  initialState: {
    roles: [] as Role[],
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpdateRole.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUpdateRole.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.roles.push(action.payload as Role);
        state.error = null;
      })
      .addCase(fetchUpdateRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string | null;
      });
  },
});

export default roleSlice.reducer;
