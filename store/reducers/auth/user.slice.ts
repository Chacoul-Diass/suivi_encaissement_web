import { API_AUTH_SUIVI } from "@/config/constants";
import { decodeTokens } from "@/utils/tokendecod";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { TokenService } from "@/services/tokenService";
import { handleApiError } from "@/utils/apiErrorHandler";
import { toast } from "react-toastify";

// Typage de la réponse de l'API et de l'état d'authentification
interface AuthResponse {
  acces_token: string;
  refresh_token: string;
}

interface AuthState {
  accessToken: string | null;
  refresh_token: string | null;
  user: any | null; // Stocke les informations utilisateur décodées
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refresh_token: null,
  user: null,
  loading: false,
  error: null,
  success: false,
};

// Nouvelle interface pour credentials acceptant un champ "credential" et "password"
interface Credentials {
  credential: string;
  password: string;
}

// Thunk pour la connexion
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: Credentials, { rejectWithValue }) => {
    try {
      const loginPayload = {
        login: credentials.credential,
        password: credentials.password,
      };

      const response: any = await axios.post<AuthResponse>(
        `${API_AUTH_SUIVI}/auth/sign-in`,
        loginPayload
      );

      if (response.data.data && response.data.data.acces_token) {
        // Store tokens
        const tokens = {
          accessToken: response.data.data.acces_token,
          refreshToken: response.data.data.refresh_token,
        };
        return tokens;
      }
      throw new Error("Tokens non reçus du serveur");
    } catch (error: any) {
      const errorMessage = handleApiError(error); // Utilisation de la fonction
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data);
    }
  }
);

// Slice d'authentification
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.accessToken = null;
      state.refresh_token = null;
      state.user = null;
      state.error = null;
      state.success = false;
      state.loading = false;

      // Nettoyer tous les tokens
      TokenService.clearAllTokens();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (
          state,
          action: PayloadAction<{ accessToken: string; refreshToken: string }>
        ) => {
          state.accessToken = action.payload.accessToken;
          state.refresh_token = action.payload.refreshToken;
          state.loading = false;
          state.success = true;

          // Stocker les tokens
          TokenService.setAccessToken(action.payload.accessToken);
          TokenService.setRefreshToken(action.payload.refreshToken);

          // Décoder le token pour extraire les informations utilisateur
          const decodedUser = decodeTokens(action.payload.accessToken);
          state.user = decodedUser;

          if (process.env.NODE_ENV === "development") {
            console.log("Tokens stockés et utilisateur décodé :", {
              tokens: action.payload,
              user: decodedUser,
            });
          }
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
