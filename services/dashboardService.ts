import axios from "../utils/axios";
import {
  KPIData,
  HistogramData,
  WeeklyHistogramData,
  AgencyData,
  RegionalData,
  ErrorRateData,
  BankData,
} from "../types/dashboard.types";

// Fonction utilitaire pour formater les tableaux comme dans les slices
const formatArray = (arr: string[] | undefined) => {
  if (!arr || arr.length === 0) return undefined;
  return JSON.stringify(arr);
};

// Fonction utilitaire pour formater les dates comme dans les slices
const formatDate = (date: string | undefined) => {
  if (!date) return undefined;
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

class DashboardService {
  // KPIs
  async getKPIs(
    year?: number,
    selectedDRNames?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<KPIData> {
    const params: Record<string, any> = {};
    if (year) params["year"] = year.toString();
    if (selectedDRNames?.length) {
      params["directionRegional"] = formatArray(selectedDRNames);
    }
    if (startDate) params["startDate"] = formatDate(startDate);
    if (endDate) params["endDate"] = formatDate(endDate);

    const response = await axios.get("/dashboard/kpis", { params });
    return response.data;
  }

  // Histogramme mensuel
  async getMonthlyHistogram(
    year?: number,
    selectedDRNames?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<HistogramData> {
    const params: Record<string, any> = {};
    if (year) params["year"] = year.toString();
    if (selectedDRNames?.length) {
      params["directionRegional"] = formatArray(selectedDRNames);
    }
    if (startDate) params["startDate"] = formatDate(startDate);
    if (endDate) params["endDate"] = formatDate(endDate);

    const response = await axios.get("/dashboard/histogramme-mensuel", {
      params,
    });
    return response.data;
  }

  // Histogramme hebdomadaire
  async getWeeklyHistogram(
    year?: number,
    selectedDRNames?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<WeeklyHistogramData> {
    const params: Record<string, any> = {};
    if (year) params["year"] = year.toString();
    if (selectedDRNames?.length) {
      params["directionRegional"] = formatArray(selectedDRNames);
    }
    if (startDate) params["startDate"] = formatDate(startDate);
    if (endDate) params["endDate"] = formatDate(endDate);

    const response = await axios.get("/dashboard/histogramme-hebdomadaire", {
      params,
    });
    return response.data;
  }

  // Top agences
  async getTopAgencies(
    year?: number,
    limit?: number,
    selectedDRNames?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<AgencyData[]> {
    const params: Record<string, any> = {};
    if (year) params["year"] = year.toString();
    if (limit) params["limit"] = limit.toString();
    if (selectedDRNames?.length) {
      params["directionRegional"] = formatArray(selectedDRNames);
    }
    if (startDate) params["startDate"] = formatDate(startDate);
    if (endDate) params["endDate"] = formatDate(endDate);

    const response = await axios.get("/dashboard/top-agences", { params });
    return response.data;
  }

  // Performance régionale
  async getRegionalPerformance(
    year?: number,
    selectedDRNames?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<RegionalData[]> {
    const params: Record<string, any> = {};
    if (year) params["year"] = year.toString();
    if (selectedDRNames?.length) {
      params["directionRegional"] = formatArray(selectedDRNames);
    }
    if (startDate) params["startDate"] = formatDate(startDate);
    if (endDate) params["endDate"] = formatDate(endDate);

    const response = await axios.get("/dashboard/performance-regions", {
      params,
    });
    return response.data;
  }

  // Taux d'erreurs
  async getErrorRates(
    year?: number,
    selectedDRNames?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<ErrorRateData[]> {
    const params: Record<string, any> = {};
    if (year) params["year"] = year.toString();
    if (selectedDRNames?.length) {
      params["directionRegional"] = formatArray(selectedDRNames);
    }
    if (startDate) params["startDate"] = formatDate(startDate);
    if (endDate) params["endDate"] = formatDate(endDate);

    const response = await axios.get("/dashboard/taux-erreurs", { params });
    return response.data;
  }

  // Positionnement banques
  async getBankPositioning(
    year?: number,
    selectedDRNames?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<BankData[]> {
    const params: Record<string, any> = {};
    if (year) params["year"] = year.toString();
    if (selectedDRNames?.length) {
      params["directionRegional"] = formatArray(selectedDRNames);
    }
    if (startDate) params["startDate"] = formatDate(startDate);
    if (endDate) params["endDate"] = formatDate(endDate);

    const response = await axios.get("/dashboard/positionnement-banques", {
      params,
    });
    return response.data;
  }
}

export const dashboardService = new DashboardService();
