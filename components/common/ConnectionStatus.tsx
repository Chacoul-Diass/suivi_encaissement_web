"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IconWifi from "../icon/icon-wifi";
import IconWifiOff from "../icon/icon-wifi-off";
import IconCheck from "../icon/icon-check";

const ConnectionStatus = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isConnectionWeak, setIsConnectionWeak] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastOnlineStatusRef = useRef<boolean | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Vérification ponctuelle de la vitesse de connexion
  const checkConnectionSpeed = useCallback(async () => {
    if (!isClient) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const startTime = performance.now();
      const response = await fetch("/api/ping", {
        signal: controller.signal,
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Mettre à jour seulement si l'état change
      const newConnectionWeakState = duration > 1000;
      if (newConnectionWeakState !== isConnectionWeak) {
        setIsConnectionWeak(newConnectionWeakState);

        // Ne démarrer le timer d'auto-masquage que si on détecte une connexion faible
        if (newConnectionWeakState) {
          startAutoHideTimer();
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError" || !error.message?.includes("unmounted")) {
        // Ne mettre à jour que si l'état change
        if (!isConnectionWeak) {
          setIsConnectionWeak(true);
          startAutoHideTimer();
        }
      }
    }
  }, [isClient, isConnectionWeak]);

  // Vérification de l'état de la connexion
  const checkConnection = useCallback(() => {
    if (!isClient) return;

    const isOnline = navigator.onLine;

    // Si c'est la première vérification, simplement enregistrer l'état
    if (lastOnlineStatusRef.current === null) {
      lastOnlineStatusRef.current = isOnline;
      setIsOffline(!isOnline);
      return;
    }

    // Ne mettre à jour que si l'état change
    if (isOnline !== lastOnlineStatusRef.current) {
      lastOnlineStatusRef.current = isOnline;

      if (isOnline) {
        // Connexion rétablie
        setIsOffline(false);
        setShowReconnected(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setShowReconnected(false), 3000);

        // Vérifier la qualité de la connexion après son rétablissement
        setTimeout(checkConnectionSpeed, 500);

        startAutoHideTimer();
      } else {
        // Connexion perdue
        setIsOffline(true);
        setIsConnectionWeak(false); // Réinitialiser l'état de connexion faible
        startAutoHideTimer();
      }
    }
  }, [isClient, checkConnectionSpeed]);

  const startAutoHideTimer = useCallback(() => {
    // Annuler tout timer d'auto-masquage précédent
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
    }

    // Rendre le composant visible
    setIsVisible(true);

    // Configurer le nouveau timer pour masquer après 7 secondes
    autoHideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 7000);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Vérification initiale
    checkConnection();

    // Écouter les événements de changement de connexion
    const onlineHandler = () => {
      checkConnection();
    };

    const offlineHandler = () => {
      checkConnection();
    };

    // Ajoute des écouteurs d'événements pour détecter les changements de connexion
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    // Événement personnalisé pour détecter les ralentissements réseau
    // basé sur la performance de chargement des ressources
    const connectionObserver = () => {
      // Vérifier seulement si on est en ligne et que la connexion n'est pas déjà marquée comme faible
      if (navigator.onLine && !isOffline && !isConnectionWeak) {
        checkConnectionSpeed();
      }
    };

    // Surveiller les performances de chargement des ressources
    window.addEventListener("load", connectionObserver);
    window.addEventListener("error", (e) => {
      // Vérifier si l'erreur est liée au réseau
      if (e.target instanceof HTMLImageElement ||
        e.target instanceof HTMLScriptElement ||
        e.target instanceof HTMLLinkElement) {
        connectionObserver();
      }
    }, true);

    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
      window.removeEventListener("load", connectionObserver);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
    };
  }, [checkConnection, checkConnectionSpeed, isClient, isOffline, isConnectionWeak]);

  if (!isClient) return null;

  const baseClasses =
    "fixed left-1/2 -translate-x-1/2 z-[60] top-0";
  const containerClasses = "px-4 py-1.5 rounded-b-xl shadow-lg";
  const contentClasses = "flex items-center justify-between gap-2";
  const iconClasses = "h-3.5 w-3.5 text-white";
  const textClasses = "text-xs font-medium text-white whitespace-nowrap";
  const buttonClasses =
    "rounded-full p-0.5 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200";

  const getStatusColor = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        return "bg-gradient-to-r from-emerald-500 to-green-500 border-b border-x border-emerald-400/30";
      case 'error':
        return "bg-gradient-to-r from-red-500 to-rose-500 border-b border-x border-red-400/30";
      case 'warning':
        return "bg-gradient-to-r from-amber-400 to-yellow-500 border-b border-x border-amber-400/30";
    }
  };

  const CloseButton = () => (
    <button
      onClick={handleDismiss}
      className={buttonClasses}
      aria-label="Fermer"
    >
      <svg
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );

  const animationProps = {
    initial: { y: -40, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -40, opacity: 0 },
    transition: { type: "spring", stiffness: 200, damping: 25 }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {showReconnected && (
            <motion.div
              {...animationProps}
              className={baseClasses}
            >
              <div
                className={`${containerClasses} ${getStatusColor('success')}`}
              >
                <div className={contentClasses}>
                  <div className="flex items-center gap-1.5">
                    <IconCheck className={iconClasses} />
                    <span className={textClasses}>Connexion rétablie</span>
                  </div>
                  <CloseButton />
                </div>
              </div>
            </motion.div>
          )}

          {isOffline && (
            <motion.div
              {...animationProps}
              className={baseClasses}
            >
              <div
                className={`${containerClasses} ${getStatusColor('error')}`}
              >
                <div className={contentClasses}>
                  <div className="flex items-center gap-1.5">
                    <IconWifiOff className={iconClasses} />
                    <span className={textClasses}>Hors ligne</span>
                  </div>
                  <CloseButton />
                </div>
              </div>
            </motion.div>
          )}

          {isConnectionWeak && !isOffline && (
            <motion.div
              {...animationProps}
              className={baseClasses}
            >
              <div
                className={`${containerClasses} ${getStatusColor('warning')}`}
              >
                <div className={contentClasses}>
                  <div className="flex items-center gap-1.5">
                    <IconWifi className={iconClasses} />
                    <span className={textClasses}>Connexion faible</span>
                  </div>
                  <CloseButton />
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
