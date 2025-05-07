"use client";

import Csv from "@/components/icon/csv";
import IconExcel from "@/components/icon/excel";
import IconSquareRotated from "@/components/icon/icon-square-rotated";
import Pdf from "@/components/icon/pdf";
import { TAppDispatch, TRootState } from "@/store";
// import { fetchDataRapprochement } from "@/store/reducers/rapprochement/rapprochement.slice";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { fetchDataRapprochement } from "@/store/reducers/rapprochement/rapprochement.slice";

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

  // -- Récupération des données depuis le store --
  const dataRapprochment: any = useSelector(
    (state: TRootState) => state.rapprochement?.data
  );
  const loading: boolean = useSelector(
    (state: TRootState) => state.rapprochement?.loading
  );

  // Facultatif : si vous souhaitez charger par défaut, vous pouvez décommenter
  useEffect(() => {
    dispatch(fetchDataRapprochement({}));
  }, [dispatch]);

  const V2 = dataRapprochment?.V2 || [];
  const V3 = dataRapprochment?.V3 || [];
  const Prepaye = dataRapprochment?.Prepayé || [];

  const [tableDataV2, setTableDataV2] = useState<MontantData[]>([]);
  const [tableDataV3, setTableDataV3] = useState<MontantData[]>([]);
  const [tableDataPrepaye, setTableDataPrepaye] = useState<MontantData[]>([]);

  // Format de nombre
  const formatNumber = (value: number | string) => {
    const num = typeof value === "number" ? value : Number(value);
    return isNaN(num) ? "0" : num.toLocaleString("fr-FR");
  };

  // Couleur si écart
  const couleurEcartTotaux = (value: number) => {
    const formattedValue = formatNumber(value);
    if (value > 0)
      return <div className="text-green-600">{formattedValue}</div>;
    if (value === 0) return <div className="text-black">{formattedValue}</div>;
    return <div className="text-red-600">{formattedValue}</div>;
  };

  // Transformation des données
  const transformData = (data: any[]) =>
    data.map((item: any) => {
      const isEcartRow = item.Libelle?.toLowerCase?.().includes("écart");

      // Calcul du total
      const total: number = Object.values(item)
        .slice(1, 13) // colonnes mois
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
          ? couleurEcartTotaux(Number(item.Février))
          : formatNumber(item.Février),
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
          ? couleurEcartTotaux(Number(item.Août))
          : formatNumber(item.Août),
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
          ? couleurEcartTotaux(Number(item.Décembre))
          : formatNumber(item.Décembre),
        Total: couleurEcartTotaux(total),
      };
    });

  // Mettre à jour les tables quand V2, V3, Prépayé changent
  useEffect(() => {
    if (V2.length > 0) setTableDataV2(transformData(V2));
    if (V3.length > 0) setTableDataV3(transformData(V3));
    if (Prepaye.length > 0) setTableDataPrepaye(transformData(Prepaye));
  }, [V2, V3, Prepaye]);

  // Fonction utilitaire pour nettoyer les données avant export
  const getRawData = (data: any[]): any[] => {
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return data.map((row: any) => {
      const cleanRow: any = { Libelle: row.Libelle };
      months.forEach(month => {
        if (typeof row[month] === "object" && row[month]?.props?.children) {
          cleanRow[month] = Number(
            Array.isArray(row[month].props.children)
              ? row[month].props.children.join("")
              : row[month].props.children
          );
        } else {
          cleanRow[month] = typeof row[month] === "string"
            ? Number(row[month].replace(/\s/g, ""))
            : row[month];
        }
      });
      cleanRow.Total = months.reduce((sum, m) => sum + (Number(cleanRow[m]) || 0), 0);
      return cleanRow;
    });
  };

  // -- Fonctions d'export (Excel / CSV / PDF) -- //
  const exportToExcel = (data: MontantData[], title: string) => {
    const rawData = getRawData(data);
    const worksheet = XLSX.utils.json_to_sheet(rawData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const exportToCSV = (data: MontantData[], title: string) => {
    const rawData = getRawData(data);
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
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 18, { align: "center" });

    const rawData = getRawData(data);
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    const headers = ["Libellé", ...months, "Total"];
    const tableData = rawData.map(row => [
      row.Libelle,
      ...months.map(month => row[month]?.toLocaleString("fr-FR") || "0"),
      row.Total?.toLocaleString("fr-FR") || "0"
    ]);

    // Si tu utilises import autoTable from "jspdf-autotable"
    // sinon remplace autoTable(doc, ...) par (window as any).jspdf_autotable(doc, ...)
    import('jspdf-autotable').then(({ default: autoTable }) => {
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 28,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 12,
        },
        bodyStyles: {
          fontSize: 10,
          halign: 'right',
          valign: 'middle',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        styles: {
          cellPadding: 3,
          lineColor: [44, 62, 80],
          lineWidth: 0.2,
          font: "helvetica",
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold', fontSize: 11 },
        },
      });
      doc.save(`${title}.pdf`);
    });
  };

  // Pour factoriser l'affichage
  const renderTable = (data: MontantData[], title: string) => (
    <div className="panel mt-5">
      <div className="flex w-full items-center justify-between mb-4">
        <div className="flex items-center text-success">
          <button
            type="button"
            className="flex h-10 cursor-default items-center rounded-md font-medium text-success duration-300"
          >
            <IconSquareRotated className="shrink-0 fill-success" />
          </button>
          <span className="ml-2 text-lg font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-2">
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

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin">
              <IconSquareRotated className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-500 font-medium">Chargement des données...</p>
          </div>
        </div>
      ) : (
        <div className="datatables">
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
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {renderTable(tableDataV2, "Montants Timbres V2")}
      {renderTable(tableDataV3, "Montants Timbres V3")}
      {renderTable(tableDataPrepaye, "Montants Timbres Prépayé")}
    </div>
  );
};

export default Table;
