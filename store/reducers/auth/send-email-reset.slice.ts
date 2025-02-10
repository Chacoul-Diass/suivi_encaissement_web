import { API_AUTH_SUIVI } from "@/config/constants";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

type ResetEmailState = {
  loading: boolean;
  success: boolean;
  error: string | null;
};

const initialState: ResetEmailState = {
  loading: false,
  success: false,
  error: null,
};

// AsyncThunk pour envoyer un e-mail de réinitialisation
export const sendResetEmail: any = createAsyncThunk<
  any, // Type de retour
  { email: string }, // Payload envoyé à l'API
  { rejectValue: string } // Type d'erreur rejetée
>("mail/sendResetEmail", async ({ email }, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${API_AUTH_SUIVI}/auth/request-reset-password`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Une erreur est survenue"
    );
  }
});

// Slice Redux
const resetPasswordSlice = createSlice({
  name: "mail",
  initialState,
  reducers: {
    clearState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendResetEmail.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(sendResetEmail.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendResetEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearState } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;
