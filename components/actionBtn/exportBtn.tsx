"use client";

import React from "react";
import IconExcel from "../icon/excel";
import Csv from "../icon/csv";
import * as XLSX from "xlsx";
import axiosInstance from "@/utils/axios";
import { API_AUTH_SUIVI } from "@/config/constants";

interface ExportBtnProps {
  filteredData: any;
  cols: any;
  hideCols: any;
  formatNumber: any;
  getFilters: () => any; // filtres + search courants
  statutValidation: number; // id du tab (statut)
}

export default function ExportBtn({
  filteredData,
  cols,
  hideCols,
  formatNumber,
  getFilters,
  statutValidation,
}: ExportBtnProps) {
  const buildParams = (filters: any): Record<string, any> => {
    const cleanArray = (arr?: string[]) => (arr ? arr.map((i) => i.trim()) : []);
    const formatArray = (arr?: string[]) => JSON.stringify(cleanArray(arr));
    const formatDate = (date?: string) => {
      if (!date) return undefined;
      const d = new Date(date);
      if (isNaN(d.getTime())) return undefined;
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    };

    const params: Record<string, any> = {};
    if (filters?.directionRegional?.length)
      params["directionRegional"] = formatArray(filters.directionRegional);
    if (filters?.codeExpl?.length) params["codeExpl"] = formatArray(filters.codeExpl);
    if (filters?.banque?.length) params["banque"] = formatArray(filters.banque);
    if (filters?.caisse?.length) params["caisse"] = formatArray(filters.caisse);
    if (filters?.dailyCaisse?.length)
      params["dailyCaisse"] = formatArray(filters.dailyCaisse);
    if (filters?.produit?.length) params["produit"] = formatArray(filters.produit);
    if (filters?.modeReglement?.length)
      params["modeReglement"] = formatArray(filters.modeReglement);
    if (filters?.status?.length) params["status"] = filters.status.join(",");
    if (filters?.codeCaisse?.length) params["codeCaisse"] = formatArray(filters.codeCaisse);
    if (filters?.noCaisse?.length) params["noCaisse"] = formatArray(filters.noCaisse);
    if (filters?.startDate) params["startDate"] = formatDate(filters.startDate);
    if (filters?.endDate) params["endDate"] = formatDate(filters.endDate);

    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
    return params;
  };

  const fetchAllData = async (): Promise<any[]> => {
    const { search, ...filters } = getFilters() || {};
    const baseParams = buildParams(filters);
    const url = `${API_AUTH_SUIVI}/encaissements/${statutValidation}`;
    const finalParams: Record<string, any> = { ...baseParams, all: "true" };
    if (search !== undefined && search !== null && String(search).trim() !== "") {
      finalParams.search = String(search);
    }
    const resp = await axiosInstance.get(url, { params: finalParams });
    const payload = resp?.data;
    if (Array.isArray(payload)) return payload;
    if (payload?.data?.result) return payload.data.result;
    if (payload?.result) return payload.result;
    return [];
  };

  const buildVisibleColumns = () =>
    cols.filter((col: any) => col.accessor !== "Actions" && !hideCols.includes(col.accessor));

  const mapRowsToVisibleColumns = (rows: any[]): any[] => {
    const visible = buildVisibleColumns();
    return rows.map((row: any) => {
      const obj: Record<string, any> = {};
      visible.forEach((col: any) => {
        const accessor = col.accessor;
        let value: any = "";
        if (Object.prototype.hasOwnProperty.call(row, accessor)) {
          value = row[accessor];
        } else if (accessor === "modeEtJournee") {
          value = `${row.journeeCaisse || "N/A"} - ${row.modeReglement || "N/A"}`;
        } else if (accessor === "DR") {
          value = row.directionRegionale;
        } else if (accessor === "EXP") {
          value = row.codeExpl;
        } else if (accessor === "Date Encais") {
          value = row.dateEncaissement;
        } else if (accessor === "Montant caisse (A)") {
          value = row.montantRestitutionCaisse;
        } else if (accessor === "Montant bordereau (B)") {
          value = row.montantBordereauBanque;
        } else if (accessor === "Montant relevé (C)") {
          value = row?.validationEncaissement?.montantReleve ?? row.montantReleve;
        } else if (accessor === "Ecart(A-B)") {
          value = (row.montantRestitutionCaisse || 0) - (row.montantBordereauBanque || 0);
        } else if (accessor === "Ecart(B-C)") {
          value = row?.validationEncaissement?.ecartReleve ?? ((row.montantBordereauBanque || 0) - (row.montantReleve || 0));
        } else if (accessor === "Observation(A-B)") {
          value = row?.validationEncaissement?.observationCaisse;
        } else if (accessor === "Observation(B-C)") {
          value = row?.validationEncaissement?.observationReleve;
        } else if (accessor === "dateFermeture") {
          value = row?.validationEncaissement?.dateCloture || row?.dateRemiseBanque || row?.dateFermeture;
        } else {
          value = row[accessor] ?? "N/A";
        }
        if (typeof value === "number") value = formatNumber(value);
        obj[col.title || accessor] = value ?? "N/A";
      });
      return obj;
    });
  };

  const handleExportExcel = async () => {
    const allRows = await fetchAllData();
    const data = mapRowsToVisibleColumns(allRows);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Encaissements");
    XLSX.writeFile(workbook, "encaissements.xlsx");
  };

  const downloadFile = (url: string, filename: string) => {
    if (typeof window === 'undefined') return;

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = async () => {
    if (typeof window === 'undefined') return;
    const allRows = await fetchAllData();
    const data = mapRowsToVisibleColumns(allRows);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    downloadFile(url, "encaissements.csv");
    window.URL.revokeObjectURL(url);
  };

  // Export PDF retiré
  return (
    <>
      {" "}
      <button
        type="button"
        className="mr-1"
        onClick={handleExportExcel}
        title="Export Excel"
      >
        <IconExcel />
      </button>
      <button
        type="button"
        className="text-white"
        onClick={handleExportCSV}
        title="Export CSV"
      >
        <Csv />
      </button>
      {/* Bouton PDF retiré */}
    </>
  );
}
