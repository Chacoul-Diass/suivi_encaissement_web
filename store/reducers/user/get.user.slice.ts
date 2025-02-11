import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axios"; 
import { API_AUTH_SUIVI } from "@/config/constants"; 

interface FetchUsersParams {
  search?: string;
  page?: number;
  limit?: number;
  profile?: string | number;
}

interface UserState {
  data: {
    result: any[];
    pagination: {
      count: number;
      currentPage: number;
      nextPage: number | null;
      previousPage: number | null;
      totalCount: number;
      totalPages: number;
    };
  };
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  data: {
    result: [],
    pagination: {
      count: 0,
      currentPage: 1,
      nextPage: null,
      previousPage: null,
      totalCount: 0,
      totalPages: 0,
    },
  },
  loading: false,
  error: null,
};

// Thunk pour récupérer les utilisateurs
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params: FetchUsersParams = {}, { rejectWithValue }) => {
    try {
      const { search = "", page = 1, limit = 10, profile } = params;
      let url = `${API_AUTH_SUIVI}/users?page=${page}&limit=${limit}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (profile) {
        url += `&profile=${profile}`;
      }

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Une erreur est survenue");
    }
  }
);

// Création du slice
const UserSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default UserSlice.reducer;
