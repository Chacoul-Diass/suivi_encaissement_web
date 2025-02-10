import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axios";
import { API_AUTH_SUIVI } from "@/config/constants";

// Thunk pour soumettre les données d'encaissement
export const submitEncaissementValidation = createAsyncThunk(
  "encaissements/submitValidation",
  async (
    {
      encaissementId,
      observationCaisse,
      observationReleve,
      observationReclamation,
      ecartReleve,
      montantReleve,
      statutValidation,
      files,
      observationRejete,
    }: {
      encaissementId?: number;
      observationCaisse?: string;
      observationReleve?: string;
      observationRejete?: string;
      observationReclamation?: string;
      ecartReleve?: number;
      montantReleve?: number;
      statutValidation?: number;
      files?: File[];
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();

      // Ajout des champs au formData avec conversion en string si nécessaire
      if (encaissementId !== undefined) {
        formData.append("encaissementId", encaissementId.toString());
      }
      if (observationCaisse !== undefined) {
        formData.append("observationCaisse", observationCaisse);
      }
      if (observationReleve !== undefined) {
        formData.append("observationReleve", observationReleve);
      }
      if (observationReclamation !== undefined) {
        formData.append("observationReclamation", observationReclamation);
      }
      if (observationRejete !== undefined) {
        formData.append("observationRejete", observationRejete);
      }
      if (ecartReleve !== undefined) {
        formData.append("ecartReleve", ecartReleve.toString());
      }
      if (montantReleve !== undefined) {
        formData.append("montantReleve", montantReleve.toString());
      }
      if (statutValidation !== undefined) {
        formData.append("statutValidation", statutValidation.toString());
      }

      // Ajout des fichiers
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      // Envoi de la requête avec le bon Content-Type
      const response = await axiosInstance.post(
        `${API_AUTH_SUIVI}/encaissements/validation`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.message || "Erreur inconnue");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Erreur lors de la validation de l'encaissement"
      );
    }
  }
);

// Slice Redux Toolkit
const encaissementValidationSlice = createSlice({
  name: "encaissementsValidation",
  initialState: {
    loading: false,
    error: null as string | null,
    success: false,
    data: null as any, // Ajout d'un champ pour stocker la réponse en cas de succès
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitEncaissementValidation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.data = null;
      })
      .addCase(submitEncaissementValidation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload; // Stocke la réponse réussie
      })
      .addCase(submitEncaissementValidation.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

export default encaissementValidationSlice.reducer;
