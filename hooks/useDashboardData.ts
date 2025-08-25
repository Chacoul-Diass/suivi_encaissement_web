import { useEffect, useState, useCallback } from "react";
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
  selectedYear?: number,
  selectedDRNames?: string[],
  startDate?: string,
  endDate?: string
) => {
  const dispatch = useDispatch<TAppDispatch>();
  const [internalSelectedYear, setInternalSelectedYear] = useState<number>(
    selectedYear || new Date().getFullYear()
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
  const loadKPIs = useCallback(async () => {
    try {
      setKpiLoading(true);
      setError(null);
      const data = await dashboardService.getKPIs(
        internalSelectedYear,
        selectedDRNames,
        startDate,
        endDate
      );

      // Vérifier que les données sont valides
      if (data && typeof data === "object") {
        setKpiData(data);
      } else {
        throw new Error("Données invalides reçues");
      }
    } catch (err: any) {
      console.error("Erreur KPIs:", err);

      // Gérer les différents types d'erreurs
      if (err?.response?.status === 500) {
        setError("Erreur serveur lors du chargement des KPIs");
      } else if (err?.response?.status === 401) {
        setError("Session expirée");
      } else if (err?.message) {
        setError(`Erreur lors du chargement des KPIs: ${err.message}`);
      } else {
        setError("Erreur lors du chargement des KPIs");
      }

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
  }, [internalSelectedYear, selectedDRNames, startDate, endDate]);

  // Fonction pour charger l'histogramme mensuel
  const loadMonthlyHistogram = useCallback(async () => {
    try {
      setHistogramLoading(true);
      setError(null);
      const data = await dashboardService.getMonthlyHistogram(
        internalSelectedYear,
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
        [internalSelectedYear]: {
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
  }, [internalSelectedYear, selectedDRNames, startDate, endDate]);

  // Fonction pour charger l'histogramme hebdomadaire
  const loadWeeklyHistogram = useCallback(async () => {
    try {
      setWeeklyHistogramLoading(true);
      setError(null);
      const data = await dashboardService.getWeeklyHistogram(
        internalSelectedYear,
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
      setWeeklyHistogramData({ [internalSelectedYear]: weeks });
    } finally {
      setWeeklyHistogramLoading(false);
    }
  }, [internalSelectedYear, selectedDRNames, startDate, endDate]);

  // Fonction pour charger les top agences
  const loadTopAgencies = useCallback(async () => {
    try {
      setTopAgenciesLoading(true);
      setError(null);
      const data = await dashboardService.getTopAgencies(
        internalSelectedYear,
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
  }, [internalSelectedYear, selectedDRNames, startDate, endDate]);

  // Fonction pour charger la performance par région
  const loadRegionalPerformance = useCallback(async () => {
    try {
      setRegionalLoading(true);
      setError(null);
      const data = await dashboardService.getRegionalPerformance(
        internalSelectedYear,
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
  }, [internalSelectedYear, selectedDRNames, startDate, endDate]);

  // Fonction pour charger les taux d'erreurs
  const loadErrorRates = useCallback(async () => {
    try {
      setErrorRateLoading(true);
      setError(null);
      const data = await dashboardService.getErrorRates(
        internalSelectedYear,
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
  }, [internalSelectedYear, selectedDRNames, startDate, endDate]);

  // Fonction pour charger le positionnement des banques
  const loadBankPositioning = useCallback(async () => {
    try {
      setBankLoading(true);
      setError(null);
      const data = await dashboardService.getBankPositioning(
        internalSelectedYear,
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
  }, [internalSelectedYear, selectedDRNames, startDate, endDate]);

  // Fonction pour recharger toutes les données de façon séquentielle
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Chargement séquentiel dans l'ordre
      console.log("🔄 Début du chargement séquentiel des données...");

      console.log("📊 Chargement des KPIs...");
      await loadKPIs();

      console.log("📈 Chargement de l'histogramme mensuel...");
      await loadMonthlyHistogram();

      console.log("📅 Chargement de l'histogramme hebdomadaire...");
      await loadWeeklyHistogram();

      console.log("🏢 Chargement des top agences...");
      await loadTopAgencies();

      console.log("🌍 Chargement de la performance par région...");
      await loadRegionalPerformance();

      console.log("❌ Chargement des taux d'erreurs...");
      await loadErrorRates();

      console.log("🏦 Chargement du positionnement des banques...");
      await loadBankPositioning();

      console.log("✅ Toutes les données ont été chargées avec succès !");
    } catch (err) {
      setError("Erreur lors du rechargement des données");
      console.error("❌ Erreur rechargement:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    loadKPIs,
    loadMonthlyHistogram,
    loadWeeklyHistogram,
    loadTopAgencies,
    loadRegionalPerformance,
    loadErrorRates,
    loadBankPositioning,
  ]);

  // Synchroniser internalSelectedYear avec selectedYear
  useEffect(() => {
    if (selectedYear && selectedYear !== internalSelectedYear) {
      setInternalSelectedYear(selectedYear);
    }
  }, [selectedYear]);

  // Charger les données au montage et quand l'année, les DR ou les dates changent
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

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
    selectedYear: internalSelectedYear,
    setSelectedYear: setInternalSelectedYear,
    error,

    // Fonctions
    refreshAllData,
  };
};
