import React, { useState } from "react";
import IconAward from "../icon/icon-award";
import IconStar from "../icon/icon-star";

interface AgencyData {
    name: string;
    performance: number;
    encaissements: number;
    tauxReussite: number;
}

interface TopAgenciesChartProps {
    data?: AgencyData[];
    loading?: boolean;
    selectedYear?: number;
    onYearChange?: (year: number) => void;
}

const TopAgenciesChart: React.FC<TopAgenciesChartProps> = ({
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

    const agenciesData = data || [];
    const availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <IconStar className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <IconAward className="h-6 w-6 text-gray-400" />;
            case 3:
                return <IconAward className="h-6 w-6 text-amber-600" />;
            default:
                return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
        }
    };

    const getPerformanceColor = (performance: number) => {
        if (performance >= 90) return "text-green-600 bg-green-100 dark:bg-green-900/20";
        if (performance >= 80) return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
        if (performance >= 70) return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
    };

    if (loading) {
        return (
            <div className="panel">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                        <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
                            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            </div>
                            <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <IconAward className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Top 5 des agences performantes
                    </h3>
                </div>
            </div>

            <div className="space-y-4">
                {agenciesData.map((agency, index) => (
                    <div key={agency.name} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-center w-10 h-10">
                            {getRankIcon(index + 1)}
                        </div>

                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                {agency.name}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>{agency.encaissements.toLocaleString()} encaissements</span>
                                <span>•</span>
                                <span>{agency.tauxReussite}% taux de réussite</span>
                            </div>
                        </div>

                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceColor(agency.performance)}`}>
                            {agency.performance}%
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Excellente (90%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Bonne (80-89%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Moyenne (70-79%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Faible (&lt;70%)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopAgenciesChart;
