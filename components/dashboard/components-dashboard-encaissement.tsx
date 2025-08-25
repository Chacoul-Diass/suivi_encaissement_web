"use client";

import React, { useState } from "react";
import { useDashboardData } from "../../hooks/useDashboardData";
import DashboardFilters from "./DashboardFilters";
import KPICard from "./KPICard";
import HistogramChart from "./HistogramChart";
import WeeklyHistogramChart from "./WeeklyHistogramChart";
import TopAgenciesChart from "./TopAgenciesChart";
import RegionalClosureRateChart from "./RegionalClosureRateChart";
import ErrorRatePieChart from "./ErrorRatePieChart";
import BankPositionChart from "./BankPositionChart";

const DashboardEncaissement: React.FC = () => {
  // États pour les filtres appliqués
  const [selectedDRNames, setSelectedDRNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Utiliser le hook pour les données du dashboard avec les filtres appliqués
  const {
    kpiData,
    histogramData,
    weeklyHistogramData,
    topAgenciesData,
    regionalData,
    errorRateData,
    bankData,
    isLoading,
    kpiLoading,
    histogramLoading,
    weeklyHistogramLoading,
    topAgenciesLoading,
    regionalLoading,
    errorRateLoading,
    bankLoading,
    error,
    refreshAllData
  } = useDashboardData(selectedYear, selectedDRNames, startDate, endDate);

  const handleApplyFilters = (filters: {
    selectedYear: number;
    selectedDRNames: string[];
    startDate: string;
    endDate: string;
  }) => {
    setSelectedYear(filters.selectedYear);
    setSelectedDRNames(filters.selectedDRNames);
    setStartDate(filters.startDate);
    setEndDate(filters.endDate);
    refreshAllData();
  };

  const handleRefresh = () => {
    refreshAllData();
  };


  return (
    <div className="space-y-6 ml-6 mr-6">
      <div>
        {/* Filtres du dashboard */}
        <DashboardFilters
          onApplyFilters={handleApplyFilters}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          currentYear={selectedYear}
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Dashboard avec affichage séquentiel des données */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-6 gap-6">
        {/* KPIs */}
        <div className="xl:col-span-6">
          <KPICard data={kpiData || undefined} loading={kpiLoading} />
        </div>

        {/* Histogramme mensuel */}
        <div className="xl:col-span-3">
          <HistogramChart
            data={histogramData || undefined}
            loading={histogramLoading}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        {/* Histogramme hebdomadaire */}
        <div className="xl:col-span-3">
          <WeeklyHistogramChart
            data={weeklyHistogramData || undefined}
            loading={weeklyHistogramLoading}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        {/* Top 5 Agences */}
        <div className="xl:col-span-3">
          <TopAgenciesChart
            data={topAgenciesData || undefined}
            loading={topAgenciesLoading}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        {/* Évolution de la performance par région */}
        <div className="xl:col-span-3">
          <RegionalClosureRateChart
            data={regionalData || undefined}
            loading={regionalLoading}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        {/* Taux d'erreurs détectées */}
        <div className="xl:col-span-3">
          <ErrorRatePieChart
            data={errorRateData || undefined}
            loading={errorRateLoading}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        {/* Rapport encaissement - Positionnement banque */}
        <div className="xl:col-span-3">
          <BankPositionChart
            data={bankData || undefined}
            loading={bankLoading}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardEncaissement;
