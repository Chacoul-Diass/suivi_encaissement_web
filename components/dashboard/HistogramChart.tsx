"use client";

import React, { useState } from "react";
import IconBarChart from "../icon/icon-bar-chart";
import IconCalendar from "../icon/icon-calendar";

interface HistogramData {
    [year: number]: {
        janvier: number;
        fevrier: number;
        mars: number;
        avril: number;
        mai: number;
        juin: number;
        juillet: number;
        aout: number;
        septembre: number;
        octobre: number;
        novembre: number;
        decembre: number;
    };
}

interface HistogramChartProps {
    data?: HistogramData;
    loading?: boolean;
    selectedYear?: number;
    onYearChange?: (year: number) => void;
}

const HistogramChart: React.FC<HistogramChartProps> = ({
    data,
    loading = false,
    selectedYear: propSelectedYear,
    onYearChange
}) => {
    const [selectedYear, setSelectedYear] = useState<number>(propSelectedYear || new Date().getFullYear());

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

    const formatNumber = (num: number) => {
        return num.toLocaleString("fr-FR");
    };

    const getMaxValue = () => {
        if (!data || !data[selectedYear]) return 100;
        const yearData = data[selectedYear];
        const displayValues = displayMonths.map(month => yearData[month.key as keyof typeof yearData] || 0);
        return Math.max(...displayValues);
    };

    const getBarHeight = (value: number) => {
        const maxValue = getMaxValue();
        if (maxValue === 0) return 50; // Hauteur minimale de 50px
        const height = (value / maxValue) * 200; // Hauteur maximale de 200px
        return Math.max(height, 50); // Minimum 50px de hauteur
    };

    const getBarColor = (value: number) => {
        if (!data || !data[selectedYear]) return "bg-success";

        const yearData = data[selectedYear];
        const displayValues = displayMonths.map(month => yearData[month.key as keyof typeof yearData] || 0);
        const values = displayValues.sort((a, b) => b - a);
        const maxValue = values[0];
        const secondMaxValue = values[1];

        if (value === maxValue) return "bg-red-500";
        if (value === secondMaxValue) return "bg-warning";
        return "bg-success";
    };

    // Générer les années disponibles (année courante et 4 années précédentes)
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const months = [
        { key: "janvier", label: "Jan", color: "bg-blue-500" },
        { key: "fevrier", label: "Fév", color: "bg-blue-500" },
        { key: "mars", label: "Mar", color: "bg-blue-500" },
        { key: "avril", label: "Avr", color: "bg-blue-500" },
        { key: "mai", label: "Mai", color: "bg-blue-500" },
        { key: "juin", label: "Juin", color: "bg-blue-500" },
        { key: "juillet", label: "Juil", color: "bg-blue-500" },
        { key: "aout", label: "Août", color: "bg-blue-500" },
        { key: "septembre", label: "Sep", color: "bg-blue-500" },
        { key: "octobre", label: "Oct", color: "bg-blue-500" },
        { key: "novembre", label: "Nov", color: "bg-blue-500" },
        { key: "decembre", label: "Déc", color: "bg-blue-500" },
    ];

    // Filtrer les mois pour l'année courante
    const currentMonth = new Date().getMonth(); // 0-11
    const displayMonths = selectedYear === currentYear
        ? months.slice(0, currentMonth + 1)
        : months;

    if (loading) {
        return (
            <div className="panel">
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <IconBarChart className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Total de tous les encaissements par mois
                    </h3>
                </div>
            </div>

            <div className="h-80 flex items-end justify-between gap-4 px-8">
                {displayMonths.map((month) => {
                    const value = data?.[selectedYear]?.[month.key as keyof HistogramData[number]] || 0;
                    const barHeight = getBarHeight(value);
                    const barColor = getBarColor(value);

                    return (
                        <div key={month.key} className="flex flex-col items-center flex-1">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                {formatNumber(value)}
                            </div>
                            <div
                                className={`w-3 rounded-t-lg transition-all duration-500 ${barColor} border border-gray-300 dark:border-gray-600 shadow-sm cursor-pointer group relative`}
                                style={{ height: `${barHeight}px` }}
                                title={`${month.label}: ${formatNumber(value)} encaissements`}
                            >
                                <div className="h-full w-full bg-gradient-to-t from-black/20 to-transparent rounded-t-lg"></div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[99999]">
                                    <div className="font-semibold mb-1">{month.key.charAt(0).toUpperCase() + month.key.slice(1)}</div>
                                    <div className="space-y-1">
                                        <div>• En attente: {formatNumber(Math.floor(value * 0.25))}</div>
                                        <div>• Traités: {formatNumber(Math.floor(value * 0.20))}</div>
                                        <div>• Validés: {formatNumber(Math.floor(value * 0.15))}</div>
                                        <div>• Rejetés: {formatNumber(Math.floor(value * 0.10))}</div>
                                        <div>• Clôturés: {formatNumber(Math.floor(value * 0.20))}</div>
                                        <div>• Réclamations: {formatNumber(Math.floor(value * 0.10))}</div>
                                    </div>
                                    <div className="mt-1 pt-1 border-t border-gray-700">
                                        <div className="font-semibold">Total: {formatNumber(value)}</div>
                                    </div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                {month.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Légende */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Plus haut pic</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-warning rounded"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Deuxième pic</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-success rounded"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Autres valeurs</span>
                </div>
            </div>
        </div>
    );
};

export default HistogramChart;
