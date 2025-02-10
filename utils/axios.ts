// utils/axiosInstance.ts

import store from "@/store";
import { logout } from "@/store/reducers/auth/user.slice";
import axios from "axios";

import { deleteCookie } from "cookies-next";

const axiosInstance = axios.create({
  baseURL: "http://68.221.121.191:2402/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

let isAlertShown = false;

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !isAlertShown) {
      isAlertShown = true;
      alert("Session expirée. Déconnexion en cours...");
      store.dispatch(logout());
      localStorage.removeItem("persist:suivi-encaissement");
      localStorage.removeItem("refresh_token");
      deleteCookie("accessToken");
      deleteCookie("refresh_token");
      window.location.href = "/login";

      setTimeout(() => {
        isAlertShown = false;
      }, 5000);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
