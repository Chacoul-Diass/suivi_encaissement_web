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
import "jspdf-autotable";
import { fetchDataRapprochementjade } from "@/store/reducers/rapprochement/rapprochementJade.slice";

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
  const loading: boolean = useSelector(
    (state: TRootState) => state.rapprochementJade.loading
  );

  // Vous pouvez conserver ce useEffect si vous voulez un chargement par défaut
  // au montage du composant (sans filtres).
  // Sinon, commentez-le si vous ne voulez charger que via le bouton "Valider" du filtre.
  useEffect(() => {
    dispatch(fetchDataRapprochementjade({}));
  }, [dispatch]);

  const CHQ = dataRapprochment?.CHQ || [];
  const ESP = dataRapprochment?.ESP || [];

  const [tableDataCHQ, setTableDataCHQ] = useState<MontantData[]>([]);
  const [tableDataESP, setTableDataESP] = useState<MontantData[]>([]);

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
  }, [CHQ, ESP]);

  // -- Fonctions d'export (Excel, CSV, PDF) -- //

  const exportToExcel = (data: MontantData[], title: string) => {
    const cleanedData = data.map((row) => ({
      Libelle: row.Libelle,
      Janvier:
        typeof row.Janvier === "number"
          ? row.Janvier
          : Number(row.Janvier.toString().replace(/\s/g, "")),
      Février:
        typeof row["Février"] === "number"
          ? row["Février"]
          : Number(row["Février"].toString().replace(/\s/g, "")),
      Mars:
        typeof row.Mars === "number"
          ? row.Mars
          : Number(row.Mars.toString().replace(/\s/g, "")),
      Avril:
        typeof row.Avril === "number"
          ? row.Avril
          : Number(row.Avril.toString().replace(/\s/g, "")),
      Mai:
        typeof row.Mai === "number"
          ? row.Mai
          : Number(row.Mai.toString().replace(/\s/g, "")),
      Juin:
        typeof row.Juin === "number"
          ? row.Juin
          : Number(row.Juin.toString().replace(/\s/g, "")),
      Juillet:
        typeof row.Juillet === "number"
          ? row.Juillet
          : Number(row.Juillet.toString().replace(/\s/g, "")),
      Août:
        typeof row["Août"] === "number"
          ? row["Août"]
          : Number(row["Août"].toString().replace(/\s/g, "")),
      Septembre:
        typeof row.Septembre === "number"
          ? row.Septembre
          : Number(row.Septembre.toString().replace(/\s/g, "")),
      Octobre:
        typeof row.Octobre === "number"
          ? row.Octobre
          : Number(row.Octobre.toString().replace(/\s/g, "")),
      Novembre:
        typeof row.Novembre === "number"
          ? row.Novembre
          : Number(row.Novembre.toString().replace(/\s/g, "")),
      Décembre:
        typeof row["Décembre"] === "number"
          ? row["Décembre"]
          : Number(row["Décembre"].toString().replace(/\s/g, "")),
      Total:
        typeof row.Total === "number"
          ? row.Total
          : Number(row.Total?.toString().replace(/\s/g, "")) || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const exportToCSV = (data: MontantData[], title: string) => {
    const cleanedData = data.map((row) => ({
      Libelle: row.Libelle,
      Janvier:
        typeof row.Janvier === "number"
          ? row.Janvier
          : Number(row.Janvier.toString().replace(/\s/g, "")),
      Février:
        typeof row["Février"] === "number"
          ? row["Février"]
          : Number(row["Février"].toString().replace(/\s/g, "")),
      Mars:
        typeof row.Mars === "number"
          ? row.Mars
          : Number(row.Mars.toString().replace(/\s/g, "")),
      Avril:
        typeof row.Avril === "number"
          ? row.Avril
          : Number(row.Avril.toString().replace(/\s/g, "")),
      Mai:
        typeof row.Mai === "number"
          ? row.Mai
          : Number(row.Mai.toString().replace(/\s/g, "")),
      Juin:
        typeof row.Juin === "number"
          ? row.Juin
          : Number(row.Juin.toString().replace(/\s/g, "")),
      Juillet:
        typeof row.Juillet === "number"
          ? row.Juillet
          : Number(row.Juillet.toString().replace(/\s/g, "")),
      Août:
        typeof row["Août"] === "number"
          ? row["Août"]
          : Number(row["Août"].toString().replace(/\s/g, "")),
      Septembre:
        typeof row.Septembre === "number"
          ? row.Septembre
          : Number(row.Septembre.toString().replace(/\s/g, "")),
      Octobre:
        typeof row.Octobre === "number"
          ? row.Octobre
          : Number(row.Octobre.toString().replace(/\s/g, "")),
      Novembre:
        typeof row.Novembre === "number"
          ? row.Novembre
          : Number(row.Novembre.toString().replace(/\s/g, "")),
      Décembre:
        typeof row["Décembre"] === "number"
          ? row["Décembre"]
          : Number(row["Décembre"].toString().replace(/\s/g, "")),
      Total:
        typeof row.Total === "number"
          ? row.Total
          : Number(row.Total?.toString().replace(/\s/g, "")) || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.csv`;
    a.click();
  };

  const exportToPDF = (data: MontantData[], title: string) => {
    const doc = new jsPDF();
    doc.text(title, 10, 10);

    const cleanedData = data.map((row) => ({
      Libelle: row.Libelle,
      Janvier: typeof row.Janvier === "string" ? row.Janvier : row.Janvier,
      Février: typeof row.Février === "string" ? row.Février : row.Février,
      Mars: typeof row.Mars === "string" ? row.Mars : row.Mars,
      Avril: typeof row.Avril === "string" ? row.Avril : row.Avril,
      Mai: typeof row.Mai === "string" ? row.Mai : row.Mai,
      Juin: typeof row.Juin === "string" ? row.Juin : row.Juin,
      Juillet: typeof row.Juillet === "string" ? row.Juillet : row.Juillet,
      Août: typeof row.Août === "string" ? row.Août : row.Août,
      Septembre:
        typeof row.Septembre === "string" ? row.Septembre : row.Septembre,
      Octobre: typeof row.Octobre === "string" ? row.Octobre : row.Octobre,
      Novembre: typeof row.Novembre === "string" ? row.Novembre : row.Novembre,
      Décembre: typeof row.Décembre === "string" ? row.Décembre : row.Décembre,
      Total: typeof row.Total === "string" ? row.Total : row.Total,
    }));

    doc.autoTable({
      head: [Object.keys(cleanedData[0])],
      body: cleanedData.map((row) => Object.values(row)),
      startY: 20,
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
          <button
            type="button"
            className="mr-7"
            onClick={() => exportToPDF(data, title)}
          >
            <Pdf />
          </button>
        </div>
      </div>
      <div className="datatables mt-3">
        <DataTable
          className="table-bordered whitespace-nowrap"
          records={data}
          columns={[
            { accessor: "Libelle", title: "Libelle" },
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
          minHeight={200}
          withBorder={true}
          borderRadius={10}
          noRecordsText={
            loading
              ? ((
                  <>
                    <span className="delay-800 mt-2 animate-pulse text-black">
                      Chargement en cours
                    </span>
                    <div className="mt-2 flex items-center justify-center space-x-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                    </div>
                  </>
                ) as unknown as string)
              : ("Aucune donnée disponible" as string)
          }
        />
      </div>
    </div>
  );

  return (
    <div>
      {renderTable(tableDataCHQ, "Montants Chèques")}
      {renderTable(tableDataESP, "Montants Espèces")}
      {/* Vous pouvez avoir d'autres données similaires (Prépayé, etc.) */}
    </div>
  );
};

export default Table;
