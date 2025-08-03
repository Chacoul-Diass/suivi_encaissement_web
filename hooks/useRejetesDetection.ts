import { useState, useEffect, useRef } from "react";
import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";

interface RejetesDetectionState {
  currentCount: number;
  previousCount: number;
  hasIncreased: boolean;
  increaseAmount: number;
  lastUpdate: Date | null;
  hasNotified: boolean; // Pour éviter les notifications répétitives
}

export const useRejetesDetection = (pollingInterval: number = 30000) => {
  const [state, setState] = useState<RejetesDetectionState>({
    currentCount: 0,
    previousCount: 0,
    hasIncreased: false,
    increaseAmount: 0,
    lastUpdate: null,
    hasNotified: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Fonction pour récupérer le nombre d'encaissements rejetés
  const fetchRejetesCount = async (): Promise<number> => {
    try {
      const response = await axiosInstance.get(
        `${API_AUTH_SUIVI}/encaissements/1?page=1&limit=1`
      );
      if (response?.data?.pagination?.totalCount) {
        return response.data.pagination.totalCount;
      }
      return 0;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération du nombre d'encaissements rejetés:",
        error
      );
      return 0;
    }
  };

  // Fonction pour mettre à jour les données
  const updateCount = async () => {
    const newCount = await fetchRejetesCount();

    setState((prevState) => {
      const hasIncreased = newCount > prevState.currentCount;
      const increaseAmount = hasIncreased
        ? newCount - prevState.currentCount
        : 0;

      return {
        currentCount: newCount,
        previousCount: prevState.currentCount,
        hasIncreased,
        increaseAmount,
        lastUpdate: new Date(),
        hasNotified: false, // Réinitialiser pour permettre une nouvelle notification
      };
    });
  };

  // Initialisation
  useEffect(() => {
    if (!isInitialized.current) {
      updateCount();
      isInitialized.current = true;
    }
  }, []);

  // Polling pour les mises à jour
  useEffect(() => {
    if (pollingInterval > 0) {
      intervalRef.current = setInterval(updateCount, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pollingInterval]);

  // Fonction pour forcer une mise à jour
  const refreshCount = () => {
    updateCount();
  };

  // Fonction pour réinitialiser l'état d'augmentation
  const resetIncreaseState = () => {
    setState((prevState) => ({
      ...prevState,
      hasIncreased: false,
      increaseAmount: 0,
      hasNotified: false,
    }));
  };

  // Fonction pour marquer comme notifié
  const markAsNotified = () => {
    setState((prevState) => ({
      ...prevState,
      hasNotified: true,
    }));
  };

  return {
    ...state,
    refreshCount,
    resetIncreaseState,
    markAsNotified,
  };
};
