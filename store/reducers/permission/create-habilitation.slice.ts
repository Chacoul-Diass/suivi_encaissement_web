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

export const fetchAddRole = createAsyncThunk(
  "roles/addRole",
  async (
    roleData: { name: string; description: string; permissions: any[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        `${API_AUTH_SUIVI}/profile`,
        JSON.stringify(roleData),
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
      .addCase(fetchAddRole.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAddRole.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.roles.push(action.payload as Role);
        state.error = null;
      })
      .addCase(fetchAddRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string | null;
      });
  },
});

export default roleSlice.reducer;
