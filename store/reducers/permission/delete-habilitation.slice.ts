import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Typage des données du profil
interface Profile {
  id: number;
  name: string;
  description: string | null;
}

interface ProfileState {
  data: Profile[];
  loading: boolean;
  error: string | null;
}

// Action asynchrone pour supprimer un profil
export const deleteProfile = createAsyncThunk<
  any,
  number,
  { rejectValue: string }
>("profile/deleteProfile", async (profileId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(
      `${API_AUTH_SUIVI}/profile/${profileId}`,
      {
        maxBodyLength: Infinity,
      }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "An error occurred");
  }
});

// Initial state
const initialState: ProfileState = {
  data: [],
  loading: false,
  error: null,
};

// Slice
const deleteProfileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteProfile.fulfilled,
        (state, action: PayloadAction<any, string, { arg: number }>) => {
          state.loading = false;
          state.data = state.data.filter(
            (profile) => profile.id !== action.meta.arg
          );
        }
      )
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete profile";
      });
  },
});

export default deleteProfileSlice.reducer;
