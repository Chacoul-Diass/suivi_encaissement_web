// src/store/reducers/auth/resetPassword.slice.ts

import { API_AUTH_SUIVI } from "@/config/constants";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Définir le type des données de réinitialisation du mot de passe
interface ResetPasswordState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ResetPasswordState = {
  isLoading: false,
  error: null,
  success: false,
};

// Créer un thunk pour effectuer la requête de réinitialisation du mot de passe
export const OTPresetPassword: any = createAsyncThunk(
  "auth/OTPresetPassword",
  async (
    {
      otpCode,
      password,
      confirmPassword,
    }: { otpCode: string; password: string; confirmPassword: string },
    { rejectWithValue }
  ) => {
    const data = JSON.stringify({
      otpCode,
      password,
      confirmPassword,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${API_AUTH_SUIVI}/auth/reset-password`, // Assurez-vous que l'URL est correcte
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const response = await axios(config);
      return response.data; // Retourner la réponse de l'API
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur inconnue"
      );
    }
  }
);

// Créer un slice avec les actions et le réducteur
const resetPasswordOtpSlice = createSlice({
  name: "OTPresetPassword",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(OTPresetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(OTPresetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(OTPresetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload as string; // Récupérer l'erreur du rejet
      });
  },
});

export default resetPasswordOtpSlice.reducer;
