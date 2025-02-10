import { API_AUTH_SUIVI } from "@/config/constants";
import { decodeTokens } from "@/utils/tokendecod";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { deleteCookie, setCookie } from "cookies-next";

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
}

const initialState: AuthState = {
  accessToken: null,
  refresh_token: null,
  user: null,
  loading: false,
  error: null,
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
        localStorage.setItem("accessToken", response.data.data.acces_token);
      }
      if (response.data.data && response.data.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.data.refresh_token);
      }

      return response.data.data.acces_token;
    } catch (error: any) {
      console.error("Erreur lors de la connexion :", error);
      console.log(error);
      return rejectWithValue(
        error.response?.data || "Une erreur est survenue."
      );
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
      state.user = null; // Réinitialise les données utilisateur
      state.error = null;
      deleteCookie("accessToken");
      deleteCookie("refresh_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<string>) => {
        state.accessToken = action.payload;
        state.loading = false;

        // Décoder le token pour extraire les informations utilisateur
        const decodedUser = decodeTokens(action.payload);
        state.user = decodedUser;

        // Stocker le token dans les cookies
        setCookie("accessToken", action.payload, {
          secure: true,
          sameSite: "strict",
        });

        if (process.env.NODE_ENV === "development") {
          console.log("Token stocké et utilisateur décodé :", {
            token: action.payload,
            user: decodedUser,
          });
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
