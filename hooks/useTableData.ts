import { useState, useCallback, useEffect } from 'react';
import { DataReverse } from '@/components/datatables/types';
import { EStatutEncaissement } from '@/utils/enums';

export const useTableData = (initialData: any[], statutValidation: number) => {
  const [recordsData, setRecordsData] = useState<DataReverse[]>([]);
  const [search, setSearch] = useState("");
  const [hideCols, setHideCols] = useState<string[]>([]);

  const formatDateData = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error("Date invalide :", dateString);
        return "N/A";
      }

      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Erreur lors du formatage de la date :", error);
      return "N/A";
    }
  };

  const filterAndMapData = useCallback(
    (data: any[]): DataReverse[] => {
      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      return data.map((item) => ({
        id: item.id,
        DR: item.directionRegionale,
        EXP: item.codeExpl,
        Produit: item.produit,
        banque: item.banque,
        compteBanque: item.compteBanque,
        "Date Encais": formatDateData(item.dateEncaissement),
        "Montant caisse (A)": item.montantRestitutionCaisse || 0,
        "Montant bordereau (B)": item.montantBordereauBanque || 0,
        "Montant revelé (C)": item.validationEncaissement?.montantReleve || 0,
        "Date cloture": formatDateData(item.dateRemiseBanque) || "",
        Bordereau: item.numeroBordereau || "",
        caisse: item.caisse || "",
        statutValidation: item.validationEncaissement?.statutValidation,
        "Ecart(A-B)": item.montantRestitutionCaisse - item.montantBordereauBanque,
        "Ecart(B-C)": item.validationEncaissement?.ecartReleve || 0,
        "Observation(A-B)": item.validationEncaissement?.observationCaisse || "RAS",
        "Observation(B-C)": item.validationEncaissement?.observationReleve || "RAS",
        "Date Validation": item.validationEncaissement?.dateValidation || "N/A",
        "Observation caisse": item.validationEncaissement?.observationCaisse || "N/A",
        "Observation réclamation": item.validationEncaissement?.observationReclamation || "N/A",
        "Observation relevé": item.validationEncaissement?.observationReleve || "N/A",
        "Ecart relevé": item.validationEncaissement?.ecartReleve || "0",
        "Montant relevé": item.validationEncaissement?.montantReleve || "0",
        observationReclamation: item.validationEncaissement?.observationReclamation || "N/A",
        observationRejete: item.validationEncaissement?.observationRejete || "N/A",
        documents: item.documents,
        "Caisse mode": item.modeReglement || "",
        numeroBordereau: item.numeroBordereau || "",
      }));
    },
    []
  );

  const getFilteredData = useCallback(() => {
    const filteredData = filterAndMapData(initialData);
    if (search) {
      return filteredData.filter((item) =>
        Object.values(item).some(
          (val) =>
            val &&
            val.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    return filteredData;
  }, [initialData, search, filterAndMapData]);

  useEffect(() => {
    const filteredData = getFilteredData();
    setRecordsData(filteredData);
  }, [initialData, search, getFilteredData]);

  const showHideColumns = (col: string) => {
    setHideCols((prev) =>
      prev.includes(col) ? prev.filter((d) => d !== col) : [...prev, col]
    );
  };

  const unvalidatedRecords = recordsData.filter(
    (record) => record.statutValidation !== EStatutEncaissement.VALIDE
  );

  return {
    recordsData,
    search,
    setSearch,
    hideCols,
    showHideColumns,
    unvalidatedRecords,
    filterAndMapData,
  };
};

export default useTableData;
