import React, { useEffect, useState } from "react";

interface SessionExpiredModalProps {
    isOpen: boolean;
    onConfirm: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
    isOpen,
    onConfirm,
}) => {
    const [timeRemaining, setTimeRemaining] = useState(30);
    const [progress, setProgress] = useState(100); // Pour la barre de progression

    useEffect(() => {
        if (!isOpen) return;

        // Démarrer le compte à rebours
        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onConfirm(); // Déconnexion automatique quand le temps est écoulé
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Nettoyer l'intervalle lors du démontage
        return () => clearInterval(interval);
    }, [isOpen, onConfirm]);

    // Mettre à jour la barre de progression
    useEffect(() => {
        setProgress((timeRemaining / 120) * 100);
    }, [timeRemaining]);

    // Formater le temps restant en MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="w-[400px] overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 dark:bg-gray-800">
                {/* Header avec dégradé */}
                <div className="bg-gradient-to-r from-red-600 to-red-500 p-5">
                    <div className="flex justify-center">
                        <div className="animate-pulse flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                            <svg
                                className="h-10 w-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Corps du modal */}
                <div className="p-6">
                    <h3 className="mb-3 text-center text-2xl font-bold text-gray-800 dark:text-white">
                        Session expirée
                    </h3>
                    <p className="mb-4 text-center text-gray-600 dark:text-gray-300">
                        Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter pour continuer.
                    </p>

                    {/* Compte à rebours */}
                    <div className="mb-5 mt-6 text-center">
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            Déconnexion automatique dans
                        </p>
                        <div className="flex items-center justify-center">
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-gray-200 dark:border-gray-700">
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: `conic-gradient(#ef4444 ${progress}%, transparent ${progress}%)`,
                                        clipPath: 'circle(50% at 50% 50%)'
                                    }}
                                ></div>
                                <div className="relative z-10 text-xl font-bold text-gray-800 dark:text-white">
                                    {formatTime(timeRemaining)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bouton */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => {
                                localStorage.removeItem('hasCheckedAlerts');
                                onConfirm();
                            }}
                            className="group relative overflow-hidden rounded-lg bg-red-500 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:bg-red-600 hover:shadow-red-300/30"
                        >
                            <span className="relative z-10 flex items-center font-medium">
                                <svg
                                    className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    ></path>
                                </svg>
                                Se reconnecter maintenant
                            </span>
                            <div className="absolute left-0 top-0 h-full w-full translate-x-[-100%] transform bg-white/10 transition-transform duration-300 group-hover:translate-x-[100%]"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredModal; 