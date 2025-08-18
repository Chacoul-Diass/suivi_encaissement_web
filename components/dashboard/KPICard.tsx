"use client";

import React from "react";
import IconCheckCircle from "../icon/icon-check-circle";
import IconXCircle from "../icon/icon-x-circle";
import IconInbox from "../icon/icon-inbox";
import IconClipboardCheck from "../icon/icon-clipboard-check";
import IconAlertTriangle from "../icon/icon-alert-triangle";

interface KPIData {
    traites: { total: number; rejetes: number };
    valides: { total: number; rejetes: number };
    charges: { total: number; rejetes: number };
    verifies: { total: number; rejetes: number };
    rejetes: { total: number; rejetes: number };
    reclamations: { total: number; rejetes: number };
}

interface KPICardProps {
    data?: KPIData;
    loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ data, loading = false }) => {
    const formatNumber = (num: number) => {
        return num.toLocaleString("fr-FR");
    };

    const getPercentage = (total: number, rejetes: number): number => {
        if (total === 0) return 0;
        return (rejetes / total) * 100;
    };

    const kpiItems = [
        {
            title: "Encaissements Chargés",
            total: data?.charges.total || 0,
            rejetes: data?.charges.rejetes || 0,
            icon: IconInbox,
            color: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
        },
        {
            title: "Encaissements Vérifiés",
            total: data?.verifies.total || 0,
            rejetes: data?.verifies.rejetes || 0,
            icon: IconClipboardCheck,
            color: "text-purple-500",
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
        },
        {
            title: "Encaissements Traités",
            total: data?.traites.total || 0,
            rejetes: data?.traites.rejetes || 0,
            icon: IconCheckCircle,
            color: "text-success",
            bgColor: "bg-success/10",
        },
        {
            title: "Encaissements Validés",
            total: data?.valides.total || 0,
            rejetes: data?.valides.rejetes || 0,
            icon: IconCheckCircle,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        },
        {
            title: "Encaissements Rejetés",
            total: data?.rejetes.total || 0,
            rejetes: data?.rejetes.rejetes || 0,
            icon: IconXCircle,
            color: "text-danger",
            bgColor: "bg-danger/10",
        },
        {
            title: "Encaissements en Réclamation",
            total: data?.reclamations.total || 0,
            rejetes: data?.reclamations.rejetes || 0,
            icon: IconAlertTriangle,
            color: "text-white",
            bgColor: "bg-primary",
        },
    ];

    const getColorClasses = (color: string) => {
        switch (color) {
            case "primary":
                return "bg-primary/10 text-primary border-primary/20";
            case "success":
                return "bg-success/10 text-success border-success/20";
            case "warning":
                return "bg-warning/10 text-warning border-warning/20";
            case "info":
                return "bg-info/10 text-info border-info/20";
            default:
                return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                                <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            </div>
                            <div className="text-right">
                                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {kpiItems.map((item, index) => (
                <div
                    key={index}
                    className={`rounded-lg border p-6 hover:shadow-lg transition-shadow duration-300 ${item.title === "Encaissements en Réclamation"
                        ? "bg-primary border-primary text-white"
                        : item.title === "Encaissements Chargés"
                            ? "bg-gradient-to-br from-[#0E1726] via-[#162236] to-[#1a2941] border-gray-700 text-white"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${item.title === "Encaissements en Réclamation"
                            ? "bg-white/20"
                            : item.title === "Encaissements Chargés"
                                ? "bg-white/10"
                                : item.bgColor
                            }`}>
                            <item.icon className={`h-6 w-6 ${item.title === "Encaissements en Réclamation" || item.title === "Encaissements Chargés"
                                ? "text-white"
                                : item.color
                                }`} />
                        </div>
                        <div className="text-right">
                            <div className={`text-2xl font-bold ${item.title === "Encaissements en Réclamation" || item.title === "Encaissements Chargés"
                                ? "text-white"
                                : "text-gray-900 dark:text-white"
                                }`}>
                                {formatNumber(item.total)}
                            </div>
                            <div className={`text-sm ${item.title === "Encaissements en Réclamation" || item.title === "Encaissements Chargés"
                                ? "text-white/80"
                                : "text-gray-500 dark:text-gray-400"
                                }`}>
                                Total
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h3 className={`text-sm font-semibold ${item.title === "Encaissements en Réclamation" || item.title === "Encaissements Chargés"
                            ? "text-white"
                            : "text-gray-800 dark:text-white"
                            }`}>
                            {item.title}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KPICard;
