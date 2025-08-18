import React, { useState } from "react";
import IconAlertTriangle from "../icon/icon-alert-triangle";
import IconCheckCircle from "../icon/icon-check-circle";
import { createPortal } from "react-dom";

interface ErrorRateData {
    region: string;
    encaissementsValides: number;
    encaissementsRejetes: number;
    tauxErreur: number;
}

interface ErrorRatePieChartProps {
    data?: ErrorRateData[];
    loading?: boolean;
    selectedYear?: number;
    onYearChange?: (year: number) => void;
}

const ErrorRatePieChart: React.FC<ErrorRatePieChartProps> = ({
    data,
    loading = false,
    selectedYear: propSelectedYear,
    onYearChange
}) => {
    const [selectedYear, setSelectedYear] = useState<number>(propSelectedYear || new Date().getFullYear());
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showAll, setShowAll] = useState(false);

    // Synchroniser avec la prop externe
    React.useEffect(() => {
        if (propSelectedYear !== undefined && propSelectedYear !== selectedYear) {
            setSelectedYear(propSelectedYear);
        }
    }, [propSelectedYear]);

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        if (onYearChange) {
            onYearChange(year);
        }
    };

    const errorRateData = data || [];
    const displayedData = showAll ? errorRateData : errorRateData.slice(0, 3);
    const availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

    // Calculer le total pour le camembert
    const totalValides = errorRateData.reduce((sum, item) => sum + item.encaissementsValides, 0);
    const totalRejetes = errorRateData.reduce((sum, item) => sum + item.encaissementsRejetes, 0);
    const tauxErreurGlobal = totalValides > 0 ? (totalRejetes / totalValides) * 100 : 0;

    // Couleurs pour les régions (couleurs sombres avec effet miroir)
    const colors = [
        "#8B0000", // rouge sombre
        "#006666", // vert sombre
        "#1E3A8A", // bleu sombre
        "#065F46", // vert émeraude sombre
        "#92400E", // orange sombre
        "#7C2D12", // brun sombre
        "#1F2937", // gris sombre
        "#581C87", // violet sombre
        "#374151", // gris foncé
        "#059669", // vert sombre
        "#DC2626", // rouge vif
        "#2563EB", // bleu vif
        "#7C3AED", // violet vif
        "#EA580C", // orange vif
        "#16A34A", // vert vif
        "#0891B2"  // cyan sombre
    ];

    const getErrorRateColor = (taux: number) => {
        if (taux <= 5) return "text-green-600 bg-green-100 dark:bg-green-900/20";
        if (taux <= 10) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
        if (taux <= 15) return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
    };

    if (loading) {
        return (
            <div className="panel">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                        <div className="h-6 w-48 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <IconAlertTriangle className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Taux d'erreurs détectées
                    </h3>
                </div>
                <button
                    onClick={() => setIsFullScreen(true)}
                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    title="Afficher en plein écran"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </button>
            </div>

            {/* Taux d'erreur global dans un graphique circulaire */}
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Cercle de fond */}
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                        />

                        {/* Cercle de progression */}
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - tauxErreurGlobal / 100)}`}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>

                    {/* Contenu central */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-800 dark:text-white mb-1">
                                {tauxErreurGlobal.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                Taux d'erreur
                            </div>
                        </div>
                    </div>
                </div>

                {/* Détails à côté */}
                <div className="ml-8 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <div>
                            <div className="text-lg font-bold text-gray-800 dark:text-white">
                                {totalValides.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Encaissements validés
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <div>
                            <div className="text-lg font-bold text-gray-800 dark:text-white">
                                {totalRejetes.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Encaissements rejetés
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total: {(totalValides + totalRejetes).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistiques par région */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {displayedData.map((item, index) => (
                    <div key={item.region} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 group">
                        {/* Header sobre */}
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                                    {item.region}
                                </h4>
                                <div className="text-right">
                                    <div className="text-lg font-bold" style={{ color: colors[index] }}>
                                        {item.tauxErreur}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contenu compact */}
                        <div className="p-3">
                            {/* Statistiques compactes */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded border border-green-200 dark:border-green-800">
                                    <div className="text-sm font-bold text-green-700 dark:text-green-400">
                                        {item.encaissementsValides.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-green-600 dark:text-green-300">Validés</div>
                                </div>
                                <div className="text-center p-2 bg-red-50 dark:bg-red-900/10 rounded border border-red-200 dark:border-red-800">
                                    <div className="text-sm font-bold text-red-700 dark:text-red-400">
                                        {item.encaissementsRejetes.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-red-600 dark:text-red-300">Rejetés</div>
                                </div>
                            </div>

                            {/* Indicateur de performance simple */}
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400">Performance:</span>
                                <span className={`font-medium ${item.tauxErreur <= 5 ? 'text-green-600' :
                                    item.tauxErreur <= 10 ? 'text-yellow-600' :
                                        item.tauxErreur <= 15 ? 'text-orange-600' : 'text-red-600'
                                    }`}>
                                    {item.tauxErreur <= 5 ? 'Excellent' :
                                        item.tauxErreur <= 10 ? 'Bon' :
                                            item.tauxErreur <= 15 ? 'Moyen' : 'Faible'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Plein Écran */}
            {isFullScreen && typeof window !== 'undefined' && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-75 z-[999999] flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full h-full overflow-hidden flex flex-col">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <IconAlertTriangle className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        Taux d'erreurs détectées
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Vue détaillée en plein écran
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsFullScreen(false)}
                                className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                title="Fermer"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenu Modal */}
                        <div className="flex-1 p-6 overflow-auto">
                            {/* Taux d'erreur global */}
                            <div className="flex items-center justify-center mb-8">
                                <div className="relative w-64 h-64">
                                    <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="8"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#ef4444"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 40}`}
                                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - tauxErreurGlobal / 100)}`}
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
                                                {tauxErreurGlobal.toFixed(1)}%
                                            </div>
                                            <div className="text-lg text-gray-600 dark:text-gray-400 font-semibold">
                                                Taux d'erreur global
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Détails globaux à côté */}
                                <div className="ml-12 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                                {totalValides.toLocaleString()}
                                            </div>
                                            <div className="text-lg text-gray-600 dark:text-gray-400">
                                                Encaissements validés
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                                {totalRejetes.toLocaleString()}
                                            </div>
                                            <div className="text-lg text-gray-600 dark:text-gray-400">
                                                Encaissements rejetés
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-xl font-bold text-gray-800 dark:text-white">
                                            Total: {(totalValides + totalRejetes).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Toutes les DR en grille */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {errorRateData.map((item, index) => (
                                    <div key={item.region} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 group">
                                        {/* Header sobre */}
                                        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                                                    {item.region}
                                                </h4>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold" style={{ color: colors[index] }}>
                                                        {item.tauxErreur}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contenu compact */}
                                        <div className="p-3">
                                            {/* Statistiques compactes */}
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded border border-green-200 dark:border-green-800">
                                                    <div className="text-sm font-bold text-green-700 dark:text-green-400">
                                                        {item.encaissementsValides.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-green-600 dark:text-green-300">Validés</div>
                                                </div>
                                                <div className="text-center p-2 bg-red-50 dark:bg-red-900/10 rounded border border-red-200 dark:border-red-800">
                                                    <div className="text-sm font-bold text-red-700 dark:text-red-400">
                                                        {item.encaissementsRejetes.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-red-600 dark:text-red-300">Rejetés</div>
                                                </div>
                                            </div>

                                            {/* Indicateur de performance simple */}
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">Performance:</span>
                                                <span className={`font-medium ${item.tauxErreur <= 5 ? 'text-green-600' :
                                                    item.tauxErreur <= 10 ? 'text-yellow-600' :
                                                        item.tauxErreur <= 15 ? 'text-orange-600' : 'text-red-600'
                                                    }`}>
                                                    {item.tauxErreur <= 5 ? 'Excellent' :
                                                        item.tauxErreur <= 10 ? 'Bon' :
                                                            item.tauxErreur <= 15 ? 'Moyen' : 'Faible'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ErrorRatePieChart;
