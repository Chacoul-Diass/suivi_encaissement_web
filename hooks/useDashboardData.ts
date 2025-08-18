import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TAppDispatch, TRootState } from "../store";
import { dashboardService } from "../services/dashboardService";
import {
  KPIData,
  HistogramData,
  WeeklyHistogramData,
  AgencyData,
  RegionalData,
  ErrorRateData,
  BankData,
} from "../types/dashboard.types";

export const useDashboardData = (
  selectedDRNames?: string[],
  startDate?: string,
  endDate?: string
) => {
  const dispatch = useDispatch<TAppDispatch>();
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour les données
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [histogramData, setHistogramData] = useState<HistogramData | null>(
    null
  );
  const [weeklyHistogramData, setWeeklyHistogramData] =
    useState<WeeklyHistogramData | null>(null);
  const [topAgenciesData, setTopAgenciesData] = useState<AgencyData[] | null>(
    null
  );
  const [regionalData, setRegionalData] = useState<RegionalData[] | null>(null);
  const [errorRateData, setErrorRateData] = useState<ErrorRateData[] | null>(
    null
  );
  const [bankData, setBankData] = useState<BankData[] | null>(null);

  // États de chargement individuels
  const [kpiLoading, setKpiLoading] = useState(false);
  const [histogramLoading, setHistogramLoading] = useState(false);
  const [weeklyHistogramLoading, setWeeklyHistogramLoading] = useState(false);
  const [topAgenciesLoading, setTopAgenciesLoading] = useState(false);
  const [regionalLoading, setRegionalLoading] = useState(false);
  const [errorRateLoading, setErrorRateLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);

  // Fonction pour charger les KPIs
  const loadKPIs = async () => {
    try {
      setKpiLoading(true);
      setError(null);
      const data = await dashboardService.getKPIs(
        selectedYear,
        selectedDRNames,
        startDate,
        endDate
      );
      setKpiData(data);
    } catch (err) {
      setError("Erreur lors du chargement des KPIs");
      console.error("Erreur KPIs:", err);
      // Mettre à 0 en cas d'échec
      setKpiData({
        charges: { total: 0, rejetes: 0 },
        verifies: { total: 0, rejetes: 0 },
        traites: { total: 0, rejetes: 0 },
        valides: { total: 0, rejetes: 0 },
        rejetes: { total: 0, rejetes: 0 },
        reclamations: { total: 0, rejetes: 0 },
      });
    } finally {
      setKpiLoading(false);
    }
  };

  // Fonction pour charger l'histogramme mensuel
  const loadMonthlyHistogram = async () => {
    try {
      setHistogramLoading(true);
      setError(null);
      const data = await dashboardService.getMonthlyHistogram(
        selectedYear,
        selectedDRNames,
        startDate,
        endDate
      );
      setHistogramData(data);
    } catch (err) {
      setError("Erreur lors du chargement de l'histogramme mensuel");
      console.error("Erreur histogramme mensuel:", err);
      // Mettre à 0 en cas d'échec
      setHistogramData({
        [selectedYear]: {
          janvier: 0,
          fevrier: 0,
          mars: 0,
          avril: 0,
          mai: 0,
          juin: 0,
          juillet: 0,
          aout: 0,
          septembre: 0,
          octobre: 0,
          novembre: 0,
          decembre: 0,
        },
      });
    } finally {
      setHistogramLoading(false);
    }
  };

  // Fonction pour charger l'histogramme hebdomadaire
  const loadWeeklyHistogram = async () => {
    try {
      setWeeklyHistogramLoading(true);
      setError(null);
      const data = await dashboardService.getWeeklyHistogram(
        selectedYear,
        selectedDRNames,
        startDate,
        endDate
      );
      setWeeklyHistogramData(data);
    } catch (err) {
      setError("Erreur lors du chargement de l'histogramme hebdomadaire");
      console.error("Erreur histogramme hebdomadaire:", err);
      // Mettre à 0 en cas d'échec
      const weeks: any = {};
      for (let i = 1; i <= 52; i++) {
        weeks[`semaine${i}`] = 0;
      }
      setWeeklyHistogramData({ [selectedYear]: weeks });
    } finally {
      setWeeklyHistogramLoading(false);
    }
  };

  // Fonction pour charger les top agences
  const loadTopAgencies = async () => {
    try {
      setTopAgenciesLoading(true);
      setError(null);
      const data = await dashboardService.getTopAgencies(
        selectedYear,
        5,
        selectedDRNames,
        startDate,
        endDate
      );
      setTopAgenciesData(data);
    } catch (err) {
      setError("Erreur lors du chargement des top agences");
      console.error("Erreur top agences:", err);
      // Mettre à 0 en cas d'échec
      setTopAgenciesData([]);
    } finally {
      setTopAgenciesLoading(false);
    }
  };

  // Fonction pour charger la performance par région
  const loadRegionalPerformance = async () => {
    try {
      setRegionalLoading(true);
      setError(null);
      const data = await dashboardService.getRegionalPerformance(
        selectedYear,
        selectedDRNames,
        startDate,
        endDate
      );
      setRegionalData(data);
    } catch (err) {
      setError("Erreur lors du chargement de la performance par région");
      console.error("Erreur performance régions:", err);
      // Mettre à 0 en cas d'échec
      setRegionalData([]);
    } finally {
      setRegionalLoading(false);
    }
  };

  // Fonction pour charger les taux d'erreurs
  const loadErrorRates = async () => {
    try {
      setErrorRateLoading(true);
      setError(null);
      const data = await dashboardService.getErrorRates(
        selectedYear,
        selectedDRNames,
        startDate,
        endDate
      );
      setErrorRateData(data);
    } catch (err) {
      setError("Erreur lors du chargement des taux d'erreurs");
      console.error("Erreur taux d'erreurs:", err);
      // Mettre à 0 en cas d'échec
      setErrorRateData([]);
    } finally {
      setErrorRateLoading(false);
    }
  };

  // Fonction pour charger le positionnement des banques
  const loadBankPositioning = async () => {
    try {
      setBankLoading(true);
      setError(null);
      const data = await dashboardService.getBankPositioning(
        selectedYear,
        selectedDRNames,
        startDate,
        endDate
      );
      setBankData(data);
    } catch (err) {
      setError("Erreur lors du chargement du positionnement des banques");
      console.error("Erreur positionnement banques:", err);
      // Mettre à 0 en cas d'échec
      setBankData([]);
    } finally {
      setBankLoading(false);
    }
  };

  // Fonction pour recharger toutes les données
  const refreshAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadKPIs(),
        loadMonthlyHistogram(),
        loadWeeklyHistogram(),
        loadTopAgencies(),
        loadRegionalPerformance(),
        loadErrorRates(),
        loadBankPositioning(),
      ]);
    } catch (err) {
      setError("Erreur lors du rechargement des données");
      console.error("Erreur rechargement:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage et quand l'année, les DR ou les dates changent
  useEffect(() => {
    refreshAllData();
  }, [selectedYear, selectedDRNames, startDate, endDate]);

  return {
    // Données
    kpiData,
    histogramData,
    weeklyHistogramData,
    topAgenciesData,
    regionalData,
    errorRateData,
    bankData,

    // États de chargement
    isLoading,
    kpiLoading,
    histogramLoading,
    weeklyHistogramLoading,
    topAgenciesLoading,
    regionalLoading,
    errorRateLoading,
    bankLoading,

    // États
    selectedYear,
    setSelectedYear,
    error,

    // Fonctions
    refreshAllData,
  };
};
