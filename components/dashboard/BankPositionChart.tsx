import React, { useState } from "react";
import IconBank from "../icon/icon-bank";
import { createPortal } from "react-dom";

interface BankData {
    bank: string;
    encaissements: number;
    position: number; // position dans le classement
    evolution: number; // % d'évolution par rapport à la période précédente
}

interface BankPositionChartProps {
    data?: BankData[];
    loading?: boolean;
    selectedYear?: number;
    onYearChange?: (year: number) => void;
}

const BankPositionChart: React.FC<BankPositionChartProps> = ({
    data,
    loading = false,
    selectedYear: propSelectedYear,
    onYearChange
}) => {
    const [selectedYear, setSelectedYear] = useState<number>(propSelectedYear || new Date().getFullYear());
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [hoveredBank, setHoveredBank] = useState<string | null>(null);

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

    const bankData = data || [];
    const availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

    // Trier par nombre d'encaissements décroissant
    const sortedData = [...bankData].sort((a, b) => b.encaissements - a.encaissements);
    const maxEncaissements = Math.max(...sortedData.map(bank => bank.encaissements));

    // Couleurs pour les banques
    const colors = [
        "#8B0000", // rouge sombre
        "#006666", // vert sombre
        "#1E3A8A", // bleu sombre
        "#065F46", // vert émeraude sombre
        "#92400E", // orange sombre
        "#7C2D12", // brun sombre
        "#1F2937", // gris sombre
        "#581C87"  // violet sombre
    ];

    const getEvolutionIcon = (evolution: number) => {
        if (evolution > 0) {
            return <span className="text-green-500 text-sm">↗ +{evolution}%</span>;
        } else if (evolution < 0) {
            return <span className="text-red-500 text-sm">↘ {evolution}%</span>;
        } else {
            return <span className="text-gray-500 text-sm">→ 0%</span>;
        }
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
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    const renderHistogramContent = () => (
        <div className="relative">
            {/* Histogramme horizontal */}
            <div className="space-y-2">
                {sortedData.slice(0, 6).map((bank, index) => {
                    const width = (bank.encaissements / maxEncaissements) * 100;
                    const isHighest = index === 0;
                    const isSecond = index === 1;

                    let barColor;
                    if (isHighest) {
                        barColor = "bg-red-500"; // rouge
                    } else if (isSecond) {
                        barColor = "bg-warning"; // orange
                    } else {
                        barColor = "bg-success"; // vert
                    }

                    return (
                        <div key={bank.bank} className="flex items-center gap-3 group h-[54px]">
                            {/* Nom de la banque */}
                            <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                {bank.bank}
                            </div>

                            {/* Barre horizontale */}
                            <div className="flex-1 relative">
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4">
                                    <div
                                        className={`h-4 rounded-full transition-all duration-500 relative ${barColor}`}
                                        style={{
                                            width: `${width}%`,
                                            minWidth: '20px'
                                        }}
                                        onMouseEnter={() => setHoveredBank(bank.bank)}
                                        onMouseLeave={() => setHoveredBank(null)}
                                    >
                                        {/* Effet de brillance */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"></div>

                                        {/* Tooltip */}
                                        {hoveredBank === bank.bank && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
                                                <div className="font-bold">{bank.bank}</div>
                                                <div>Encaissements: {bank.encaissements.toLocaleString()}</div>
                                                <div>Position: #{bank.position}</div>
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Valeurs */}
                            <div className="text-right min-w-[100px]">
                                <div className="text-base font-bold text-gray-800 dark:text-white">
                                    {bank.encaissements.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Légende en bas */}
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">1er</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">2ème</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Autres</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <IconBank className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Rapport encaissement - Positionnement banque
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

            {renderHistogramContent()}

            {/* Modal Plein Écran */}
            {isFullScreen && typeof window !== 'undefined' && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-75 z-[999999] flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 w-full h-full overflow-hidden flex flex-col">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <IconBank className="h-8 w-8 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        Rapport encaissement - Positionnement banque
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
                            {/* Histogramme horizontal - Toutes les banques */}
                            <div className="space-y-3">
                                {sortedData.map((bank, index) => {
                                    const width = (bank.encaissements / maxEncaissements) * 100;
                                    const isHighest = index === 0;
                                    const isSecond = index === 1;

                                    let barColor;
                                    if (isHighest) {
                                        barColor = "bg-red-500"; // rouge
                                    } else if (isSecond) {
                                        barColor = "bg-warning"; // orange
                                    } else {
                                        barColor = "bg-success"; // vert
                                    }

                                    return (
                                        <div key={bank.bank} className="flex items-center gap-4 group h-16">
                                            {/* Nom de la banque */}
                                            <div className="w-32 text-base font-medium text-gray-700 dark:text-gray-300 truncate">
                                                {bank.bank}
                                            </div>

                                            {/* Barre horizontale */}
                                            <div className="flex-1 relative">
                                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4">
                                                    <div
                                                        className={`h-4 rounded-full transition-all duration-500 relative ${barColor}`}
                                                        style={{
                                                            width: `${width}%`,
                                                            minWidth: '20px'
                                                        }}
                                                        onMouseEnter={() => setHoveredBank(bank.bank)}
                                                        onMouseLeave={() => setHoveredBank(null)}
                                                    >
                                                        {/* Effet de brillance */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"></div>

                                                        {/* Tooltip */}
                                                        {hoveredBank === bank.bank && (
                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
                                                                <div className="font-bold">{bank.bank}</div>
                                                                <div>Encaissements: {bank.encaissements.toLocaleString()}</div>
                                                                <div>Position: #{bank.position}</div>
                                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Valeurs */}
                                            <div className="text-right min-w-[140px]">
                                                <div className="text-xl font-bold text-gray-800 dark:text-white">
                                                    {bank.encaissements.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Légende en bas du modal */}
                            <div className="flex items-center justify-center gap-6 mt-6 text-base">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-400">1er</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-warning rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-400">2ème</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-success rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Autres</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default BankPositionChart;
