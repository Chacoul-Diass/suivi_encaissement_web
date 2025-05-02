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

let isModalShown = false;

// Fonction pour afficher une modal personnalisée au lieu d'une alerte
const showSessionExpiredModal = () => {
  // Créer un élément div pour la modal
  const modalContainer = document.createElement("div");
  modalContainer.className =
    "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50";

  // Créer le contenu de la modal
  const modalContent = document.createElement("div");
  modalContent.className =
    "w-[300px] rounded-lg bg-white p-6 text-center shadow-lg";

  // Message
  const messageElement = document.createElement("p");
  messageElement.className = "mb-4 text-lg text-black";
  messageElement.textContent = "Session expirée. Déconnexion en cours...";

  // Bouton OK
  const confirmButton = document.createElement("button");
  confirmButton.className =
    "hover:bg-primary-dark rounded-md bg-primary px-4 py-2 text-white";
  confirmButton.textContent = "OK";

  // Assembler la modal
  modalContent.appendChild(messageElement);
  modalContent.appendChild(confirmButton);
  modalContainer.appendChild(modalContent);

  // Ajouter la modal au document
  document.body.appendChild(modalContainer);

  // Gérer le clic sur le bouton
  confirmButton.addEventListener("click", () => {
    // Supprimer la modal
    document.body.removeChild(modalContainer);

    // Gérer la déconnexion
    store.dispatch(logout());
    localStorage.removeItem("persist:suivi-encaissement");
    localStorage.removeItem("refresh_token");
    deleteCookie("accessToken");
    deleteCookie("refresh_token");
    window.location.href = "/login";

    setTimeout(() => {
      isModalShown = false;
    }, 5000);
  });
};

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
    if (error.response?.status === 401 && !isModalShown) {
      isModalShown = true;
      showSessionExpiredModal();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
