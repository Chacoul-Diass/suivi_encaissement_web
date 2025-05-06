// utils/axiosInstance.ts

import store from "@/store";
import { logout } from "@/store/reducers/auth/user.slice";
import axios from "axios";
import { deleteCookie } from "cookies-next";
import React from "react";
import { createRoot } from "react-dom/client";
import SessionExpiredModal from "@/components/modales/SessionExpiredModal";

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

// Fonction pour afficher le modal
const showSessionExpiredModal = () => {
  // Créer un div pour le modal
  const modalContainer = document.createElement("div");
  modalContainer.id = "session-expired-modal";
  document.body.appendChild(modalContainer);

  const handleLogout = () => {
    store.dispatch(logout());
    localStorage.removeItem("persist:suivi-encaissement");
    localStorage.removeItem("refresh_token");
    deleteCookie("accessToken");
    deleteCookie("refresh_token");
    window.location.href = "/login";

    // Nettoyer le DOM après la redirection
    if (modalContainer) {
      document.body.removeChild(modalContainer);
    }
  };

  // Créer une racine React pour le rendu
  const root = createRoot(modalContainer);
  root.render(
    React.createElement(SessionExpiredModal, {
      isOpen: true,
      onConfirm: handleLogout,
    })
  );
};

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !isAlertShown) {
      isAlertShown = true;

      // Afficher un modal amélioré
      showSessionExpiredModal();

      setTimeout(() => {
        isAlertShown = false;
      }, 5000);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;