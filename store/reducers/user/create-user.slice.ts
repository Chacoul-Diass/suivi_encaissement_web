import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axios";
import { API_AUTH_SUIVI } from "@/config/constants";

export const addUser = createAsyncThunk(
  "user/addUser",
  async (
    {
      email,
      firstname,
      lastname,
      matricule,
      phoneNumber,
      profileId,
      directionRegionales,
      secteurs,
      poste,
    }: {
      email: string;
      firstname: string;
      lastname: string;
      matricule: string;
      phoneNumber: string;
      profileId: number;
      directionRegionales: number[];
      secteurs: number[];
      poste: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        `${API_AUTH_SUIVI}/auth/sign-up`,
        {
          email,
          firstname,
          lastname,
          matricule,
          phoneNumber,
          profileId,
          directionRegionales,
          secteurs,
          poste,
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Erreur lors de l'ajout de l'utilisateur"
      );
    }
  }
);

const userAddSlice = createSlice({
  name: "useradd",
  initialState: {
    data: null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default userAddSlice.reducer;
