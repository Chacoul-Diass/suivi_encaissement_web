"use client";

import Csv from "@/components/icon/csv";
import IconExcel from "@/components/icon/excel";
import IconSquareRotated from "@/components/icon/icon-square-rotated";
import Pdf from "@/components/icon/pdf";
import { TAppDispatch, TRootState } from "@/store";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fetchDataRapprochementjade } from "@/store/reducers/rapprochement/rapprochementJade.slice";
import { fetchDataRapprochementSmart } from "@/store/reducers/rapprochement/rapprochementSmart";
interface MontantData {
  Libelle: string;
  Janvier: string;
  Février: string;
  Mars: string;
  Avril: string;
  Mai: string;
  Juin: string;
  Juillet: string;
  Août: string;
  Septembre: string;
  Octobre: string;
  Novembre: string;
  Décembre: string;
  Total?: string;
}

const Table = () => {
  const dispatch = useDispatch<TAppDispatch>();

  const dataRapprochment: any = useSelector(
    (state: TRootState) => state.rapprochementJade.data
  );

  const dataRapprochmentSmart: any = useSelector(
    (state: TRootState) => state.rapprochementSmart.data
  );

  const loading: boolean = useSelector(
    (state: TRootState) => state.rapprochementJade.loading
  );

  const loadingSmart: boolean = useSelector(
    (state: TRootState) => state.rapprochementSmart.loading
  );

  useEffect(() => {
    dispatch(fetchDataRapprochementjade({}));
    dispatch(fetchDataRapprochementSmart({}));
  }, [dispatch]);

  const CHQ = dataRapprochment?.Chèque || [];
  const ESP = dataRapprochment?.Espèce || [];
  const ESP_SMART = dataRapprochmentSmart?.Espèce || [];

  const [tableDataCHQ, setTableDataCHQ] = useState<MontantData[]>([]);
  const [tableDataESP, setTableDataESP] = useState<MontantData[]>([]);
  const [tableDataESPSmart, setTableDataESPSmart] = useState<MontantData[]>([]);

  // Format des nombres
  const formatNumber = (value: number | string) => {
    const num = typeof value === "number" ? value : Number(value);
    return isNaN(num) ? "0" : num.toLocaleString("fr-FR");
  };

  // Affichage couleur si écart
  const couleurEcartTotaux = (value: number) => {
    const formattedValue = formatNumber(value);
    if (value > 0) {
      return <div className="text-green-600">{formattedValue}</div>;
    } else if (value === 0) {
      return <div className="text-black">{formattedValue}</div>;
    } else {
      return <div className="text-red-600">{formattedValue}</div>;
    }
  };

  // Transformation des données (format, etc.)
  const transformData = (data: any[]) =>
    data.map((item: any) => {
      const isEcartRow = item.Libelle.toLowerCase().includes("écart");

      const total: number = Object.values(item)
        .slice(1, 13)
        .reduce((acc: number, val: unknown) => {
          const numericValue = typeof val === "number" ? val : Number(val);
          return acc + (isNaN(numericValue) ? 0 : numericValue);
        }, 0);

      return {
        ...item,
        Janvier: isEcartRow
          ? couleurEcartTotaux(Number(item.Janvier))
          : formatNumber(item.Janvier),
        Février: isEcartRow
          ? couleurEcartTotaux(Number(item["Février"]))
          : formatNumber(item["Février"]),
        Mars: isEcartRow
          ? couleurEcartTotaux(Number(item.Mars))
          : formatNumber(item.Mars),
        Avril: isEcartRow
          ? couleurEcartTotaux(Number(item.Avril))
          : formatNumber(item.Avril),
        Mai: isEcartRow
          ? couleurEcartTotaux(Number(item.Mai))
          : formatNumber(item.Mai),
        Juin: isEcartRow
          ? couleurEcartTotaux(Number(item.Juin))
          : formatNumber(item.Juin),
        Juillet: isEcartRow
          ? couleurEcartTotaux(Number(item.Juillet))
          : formatNumber(item.Juillet),
        Août: isEcartRow
          ? couleurEcartTotaux(Number(item["Août"]))
          : formatNumber(item["Août"]),
        Septembre: isEcartRow
          ? couleurEcartTotaux(Number(item.Septembre))
          : formatNumber(item.Septembre),
        Octobre: isEcartRow
          ? couleurEcartTotaux(Number(item.Octobre))
          : formatNumber(item.Octobre),
        Novembre: isEcartRow
          ? couleurEcartTotaux(Number(item.Novembre))
          : formatNumber(item.Novembre),
        Décembre: isEcartRow
          ? couleurEcartTotaux(Number(item["Décembre"]))
          : formatNumber(item["Décembre"]),
        Total: couleurEcartTotaux(total),
      };
    });

  useEffect(() => {
    if (CHQ.length > 0) setTableDataCHQ(transformData(CHQ));
    if (ESP.length > 0) setTableDataESP(transformData(ESP));
    if (ESP_SMART.length > 0) setTableDataESPSmart(transformData(ESP_SMART));
  }, [CHQ, ESP]);

  // -- Fonctions d'export (Excel, CSV, PDF) -- //

  const exportToExcel = (data: MontantData[], title: string) => {
    // Utiliser les données brutes avant transformation
    const rawData = data.map((row) => {
      const cleanRow: any = { Libelle: row.Libelle };
      const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];

      months.forEach(month => {
        const value = row[month as keyof MontantData];
        if (typeof value === 'string') {
          // Extraire la valeur numérique des chaînes formatées
          const numericValue = value.replace(/[^\d-]/g, '');
          cleanRow[month] = parseFloat(numericValue) || 0;
        } else {
          cleanRow[month] = value || 0;
        }
      });

      // Calculer le total
      const total = months.reduce((sum, month) => sum + (cleanRow[month] || 0), 0);
      cleanRow.Total = total;

      return cleanRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(rawData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const exportToCSV = (data: MontantData[], title: string) => {
    // Utiliser les mêmes données nettoyées que pour Excel
    const rawData = data.map((row) => {
      const cleanRow: any = { Libelle: row.Libelle };
      const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];

      months.forEach(month => {
        const value = row[month as keyof MontantData];
        if (typeof value === 'string') {
          const numericValue = value.replace(/[^\d-]/g, '');
          cleanRow[month] = parseFloat(numericValue) || 0;
        } else {
          cleanRow[month] = value || 0;
        }
      });

      const total = months.reduce((sum, month) => sum + (cleanRow[month] || 0), 0);
      cleanRow.Total = total;

      return cleanRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(rawData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data: MontantData[], title: string) => {
    const doc = new jsPDF();
    doc.text(title, 10, 10);

    // Utiliser les mêmes données nettoyées que pour Excel/CSV
    const rawData = data.map((row) => {
      const cleanRow: any = { Libelle: row.Libelle };
      const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];

      months.forEach(month => {
        const value = row[month as keyof MontantData];
        if (typeof value === 'string') {
          const numericValue = value.replace(/[^\d-]/g, '');
          cleanRow[month] = parseFloat(numericValue) || 0;
        } else {
          cleanRow[month] = value || 0;
        }
      });

      const total = months.reduce((sum, month) => sum + (cleanRow[month] || 0), 0);
      cleanRow.Total = total;

      return cleanRow;
    });

    const headers = ["Libellé", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre", "Total"];

    const tableData = rawData.map(row => [
      row.Libelle,
      ...headers.slice(1).map(header => row[header]?.toString() || "0")
    ]);

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 20,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      }
    });

    doc.save(`${title}.pdf`);
  };

  // Rendu d'une table
  const renderTable = (data: MontantData[], title: string) => (
    <div className="panel mt-5">
      <div className="flex w-full">
        <div className="flex w-full items-center text-success">
          <button
            type="button"
            className="flex h-10 cursor-default items-center rounded-md font-medium text-success duration-300"
          >
            <IconSquareRotated className="shrink-0 fill-success" />
          </button>
          <span className="ml-2">{title}</span>
        </div>
        <div className="flex items-center justify-center lg:justify-end">
          <button
            type="button"
            className="mr-1"
            onClick={() => exportToExcel(data, title)}
          >
            <IconExcel />
          </button>
          <button
            type="button"
            className="text-white"
            onClick={() => exportToCSV(data, title)}
          >
            <Csv />
          </button>

        </div>
      </div>
      <div className="datatables mt-3">
        {loading || loadingSmart ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin">
                <IconSquareRotated className="w-8 h-8 text-primary" />
              </div>
              <p className="text-gray-500 font-medium">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <DataTable
            noRecordsText="Aucun enregistrement trouvé"
            highlightOnHover
            className="whitespace-nowrap table-hover"
            records={data}
            columns={[
              { accessor: "Libelle", title: "Libellé", width: 200 },
              { accessor: "Janvier", title: "Janvier" },
              { accessor: "Février", title: "Février" },
              { accessor: "Mars", title: "Mars" },
              { accessor: "Avril", title: "Avril" },
              { accessor: "Mai", title: "Mai" },
              { accessor: "Juin", title: "Juin" },
              { accessor: "Juillet", title: "Juillet" },
              { accessor: "Août", title: "Août" },
              { accessor: "Septembre", title: "Septembre" },
              { accessor: "Octobre", title: "Octobre" },
              { accessor: "Novembre", title: "Novembre" },
              { accessor: "Décembre", title: "Décembre" },
              { accessor: "Total", title: "Total" },
            ]}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderTable(tableDataCHQ, "Montants Chèques")}
      {renderTable(tableDataESP, "Montants Espèces")}
      {renderTable(tableDataESPSmart, "Montants Jade Smart (Espèces)")}
      {/* Vous pouvez avoir d'autres données similaires (Prépayé, etc.) */}
    </div>
  );
};

export default Table;
