"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Popup from "@/components/modalExpireToken"; // Le composant Popup
import { API_AUTH_SUIVI } from "@/config/constants";

const SessionHandler: React.FC = () => {
  const [isSessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    const refresh_token = localStorage.getItem("refreshToken");
    const payload = { refreshToken: refresh_token };

    try {
      const response = await axios.post(
        `${API_AUTH_SUIVI}/auth/logout`,
        payload
      );

      if (response.status === 201) {
        localStorage.removeItem("persist:suivi-encaissement");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("hasCheckedAlerts");
        router.push("/login"); // Redirige vers la page de connexion
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  // Ajouter un intercepteur global pour gérer les erreurs 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setSessionExpired(true); // Affiche la popup
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <>
      <Popup
        isOpen={isSessionExpired}
        message="Session expirée ou non autorisée. Déconnexion en cours..."
        onConfirm={handleLogout}
      />
    </>
  );
};

export default SessionHandler;
