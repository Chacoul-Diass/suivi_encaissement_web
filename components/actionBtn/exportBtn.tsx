"use client";

import React from "react";
import IconExcel from "../icon/excel";
import Csv from "../icon/csv";
import * as XLSX from "xlsx";

interface ExportBtnProps {
  filteredData: any;
  cols: any;
  hideCols: any;
  formatNumber: any;
}

export default function ExportBtn({
  filteredData,
  cols,
  hideCols,
  formatNumber,
}: ExportBtnProps) {
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
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

  const handleExportCSV = () => {
    if (typeof window === 'undefined') return;

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
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
