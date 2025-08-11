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

export const useRejetesDetection = (pollingInterval: number = 5000) => {
  // Récupérer la valeur persistée pour éviter une fausse alerte au premier chargement
  const getPersistedCount = (): number => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem("encaissementsRejetesLastCount");
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const initialPersisted = getPersistedCount();

  const [state, setState] = useState<RejetesDetectionState>({
    currentCount: initialPersisted,
    previousCount: initialPersisted,
    hasIncreased: false,
    increaseAmount: 0,
    lastUpdate: null,
    hasNotified: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);
  const lastActivityRef = useRef<number>(Date.now());

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

    // Persister la nouvelle valeur pour les prochaines sessions/montages
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "encaissementsRejetesLastCount",
          String(newCount)
        );
      }
    } catch (e) {
      // Ignorer les erreurs de quota/localStorage
    }
  };

  // Initialisation
  useEffect(() => {
    if (!isInitialized.current) {
      updateCount();
      isInitialized.current = true;
    }
  }, []);

  // Polling intelligent avec détection d'activité
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Vérifier immédiatement quand l'utilisateur revient sur l'onglet
        updateCount();
        lastActivityRef.current = Date.now();
      }
    };

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Polling adaptatif
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Polling plus fréquent si l'utilisateur est actif
      const isUserActive = Date.now() - lastActivityRef.current < 30000; // 30 secondes
      const currentInterval = isUserActive ? 3000 : 10000; // 3s si actif, 10s sinon

      intervalRef.current = setInterval(() => {
        updateCount();
        // Ajuster l'intervalle selon l'activité
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        if (timeSinceActivity > 30000 && currentInterval === 3000) {
          startPolling(); // Redémarrer avec un intervalle plus long
        }
      }, currentInterval);
    };

    if (pollingInterval > 0) {
      startPolling();

      // Écouter les changements de visibilité
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Écouter l'activité utilisateur
      document.addEventListener("mousemove", handleUserActivity);
      document.addEventListener("keydown", handleUserActivity);
      document.addEventListener("click", handleUserActivity);
      document.addEventListener("scroll", handleUserActivity);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mousemove", handleUserActivity);
      document.removeEventListener("keydown", handleUserActivity);
      document.removeEventListener("click", handleUserActivity);
      document.removeEventListener("scroll", handleUserActivity);
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
      // On garde currentCount et previousCount intacts; on efface juste les flags
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

  // Fonction pour forcer la vérification après une action
  const checkAfterAction = () => {
    // Vérifier immédiatement
    updateCount();

    // Vérifier à nouveau après 2 secondes
    setTimeout(() => {
      updateCount();
    }, 2000);

    // Vérifier à nouveau après 5 secondes
    setTimeout(() => {
      updateCount();
    }, 5000);
  };

  return {
    ...state,
    refreshCount,
    resetIncreaseState,
    markAsNotified,
    checkAfterAction,
  };
};
