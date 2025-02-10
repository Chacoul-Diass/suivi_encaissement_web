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

  // -- Fonctions d'export (Excel / CSV / PDF) -- //
  const exportToExcel = (data: MontantData[], title: string) => {
    // ... identique à votre code
  };

  const exportToCSV = (data: MontantData[], title: string) => {
    // ... identique
  };

  const exportToPDF = (data: MontantData[], title: string) => {
    // ... identique
  };

  // Pour factoriser l'affichage
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
          withBorder
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
              : "Aucune donnée disponible"
          }
        />
      </div>
    </div>
  );

  return (
    <div>
      {renderTable(tableDataV2, "Montants Timbres V2")}
      {renderTable(tableDataV3, "Montants Timbres V3")}
      {renderTable(tableDataPrepaye, "Montants Timbres Prépayé")}
    </div>
  );
};

export default Table;
