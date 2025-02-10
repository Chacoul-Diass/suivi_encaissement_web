"use client";

import React from "react";
import IconExcel from "../icon/excel";
import Csv from "../icon/csv";
import Pdf from "../icon/pdf";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

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

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    const imgUrl = "/assets/images/logo.png";

    const img = new Image();
    img.src = imgUrl;

    img.onload = () => {
      doc.addImage(img, "PNG", 10, 5, 30, 15);

      doc.text("Encaissements - Rapport détaillé", 50, 15);

      const visibleColumns = cols.filter(
        (col: any) =>
          col.accessor !== "Actions" && !hideCols.includes(col.accessor)
      );

      const headers = [visibleColumns.map((col: any) => col.title)];

      const body = filteredData.map((row: any) =>
        visibleColumns.map((col: any) => {
          const accessor = col.accessor;

          if (row.hasOwnProperty(accessor)) {
            const value = row[accessor];
            return typeof value === "number"
              ? formatNumber(value)
              : value || "N/A";
          }

          if (accessor === "modeEtJournee") {
            return `${row.journeeCaisse || "N/A"} - ${
              row.modeReglement || "N/A"
            }`;
          }

          return "N/A";
        })
      );

      doc.autoTable({
        head: headers,
        body: body,
        startY: 25,
        theme: "grid",
        headStyles: { fillColor: [54, 162, 235], textColor: 255 },
        bodyStyles: { fontSize: 8 },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: "linebreak",
        },
        margin: { top: 20, left: 10, right: 10 },
      });

      doc.save("encaissements_complet.pdf");
    };

    img.onerror = () => {
      console.error("Erreur lors du chargement de l'image.");
    };
  };
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
      <button
        type="button"
        className="mr-7"
        onClick={handleExportPDF}
        title="Export Pdf"
      >
        <Pdf />
      </button>
    </>
  );
}
