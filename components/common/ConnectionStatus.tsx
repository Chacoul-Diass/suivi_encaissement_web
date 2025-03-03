"use client";

import React, { useEffect, useState, useCallback } from "react";
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

  useEffect(() => {
    setIsClient(true);
  }, []);

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

      setIsConnectionWeak(duration > 1000);
    } catch (error: any) {
      if (error.name === "AbortError") {
        setIsConnectionWeak(true);
      }
      // Ne pas mettre à jour l'état si l'erreur est due à la fermeture du composant
      if (!error.message?.includes("unmounted")) {
        setIsConnectionWeak(true);
      }
    }
  }, [isClient]);

  const checkConnection = useCallback(() => {
    if (!isClient) return;

    const wasOffline = isOffline;
    const newOfflineStatus = !navigator.onLine;
    setIsOffline(newOfflineStatus);

    if (wasOffline && !newOfflineStatus) {
      setShowReconnected(true);
      const timeoutId = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [isOffline, isClient]);

  useEffect(() => {
    if (!isClient) return;

    checkConnection();
    checkConnectionSpeed();

    const onlineHandler = () => {
      checkConnection();
      checkConnectionSpeed();
    };

    const offlineHandler = () => {
      checkConnection();
    };

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    const intervalId = setInterval(checkConnectionSpeed, 30000);

    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
      clearInterval(intervalId);
    };
  }, [checkConnection, checkConnectionSpeed, isClient]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    const timeoutId = setTimeout(() => setIsVisible(true), 60000);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!isClient) return null;

  const baseClasses =
    "fixed left-1/2 -translate-x-1/2 top-2 z-[60] w-auto min-w-[200px] max-w-[400px]";
  const containerClasses = "rounded-full shadow-md px-3 py-1.5";
  const contentClasses = "flex items-center justify-between gap-2";
  const iconClasses = "h-3.5 w-3.5 text-white";
  const textClasses = "text-xs font-medium text-white whitespace-nowrap";
  const buttonClasses =
    "rounded-full p-0.5 text-white opacity-80 hover:opacity-100 transition-opacity";

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {showReconnected && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={baseClasses}
            >
              <div
                className={`${containerClasses} bg-gradient-to-r from-green-500 to-green-600`}
              >
                <div className={contentClasses}>
                  <div className="flex items-center gap-1.5">
                    <IconCheck className={iconClasses} />
                    <span className={textClasses}>Connexion rétablie</span>
                  </div>
                  <button
                    onClick={() => setShowReconnected(false)}
                    className={buttonClasses}
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
                </div>
              </div>
            </motion.div>
          )}

          {isOffline && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={baseClasses}
            >
              <div
                className={`${containerClasses} bg-gradient-to-r from-red-500 to-red-600`}
              >
                <div className={contentClasses}>
                  <div className="flex items-center gap-1.5">
                    <IconWifiOff className={iconClasses} />
                    <span className={textClasses}>Hors ligne</span>
                  </div>
                  <button onClick={handleDismiss} className={buttonClasses}>
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
                </div>
              </div>
            </motion.div>
          )}

          {isConnectionWeak && !isOffline && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={baseClasses}
            >
              <div
                className={`${containerClasses} bg-gradient-to-r from-yellow-400 to-yellow-500`}
              >
                <div className={contentClasses}>
                  <div className="flex items-center gap-1.5">
                    <IconWifi className={iconClasses} />
                    <span className={textClasses}>Connexion faible</span>
                  </div>
                  <button onClick={handleDismiss} className={buttonClasses}>
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
