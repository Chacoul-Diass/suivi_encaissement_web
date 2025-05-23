"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import IconBox from "../icon/icon-box";
import IconHome from "@/components/icon/icon-home";
import { Tab } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import IconBarChart from "../icon/icon-bar-chart";
import IconXCircle from "../icon/icon-x-circle";
import IconChecks from "../icon/icon-checks";
import IconCircleCheck from "../icon/icon-circle-check";
import { TAppDispatch } from "@/store";
import { DataReverse } from "@/utils/interface";
import { EStatutEncaissement } from "@/utils/enums";
import getUserHabilitation from "@/utils/getHabilitation";
import IconArchive from "../icon/icon-archive";
import EncaissementComptable from "../dashboard/enfant1-encaissement";
import { fetchDataReleve } from "@/store/reducers/encaissements/releve.slice";
import axiosInstance from "@/utils/axios";
import { API_AUTH_SUIVI } from "@/config/constants";
import GlobalFiltre from "@/components/filtre/globalFiltre";

export default function Litige() {
  const habilitation = getUserHabilitation();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Données des directions régionales pour le filtre
  const [drData, setDrData] = useState([]);

  // Charger les données des DR au chargement du composant
  useEffect(() => {
    const fetchDrData = async () => {
      try {
        const response = await axiosInstance.get(`${API_AUTH_SUIVI}/direction-regionale`);
        if (response?.data && !response.data.error) {
          setDrData(response.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des directions régionales:", error);
      }
    };

    fetchDrData();
  }, []);

  const [activeTab, setActiveTab] = useState<EStatutEncaissement>(
    EStatutEncaissement.RECLAMATION_REVERSES
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= paginate.totalPages) {
      setCurrentPage(page);
    }
  };

  const dataReverseloading: any = useSelector(
    (state: any) => state?.encaissementReleve?.loading
  );


  const allTabs = [
    {
      id: EStatutEncaissement.RECLAMATION_REVERSES,
      label: "Reclamations Chargés",
      icon: IconBarChart,
      habilitationName: "LITIGES CHARGES",
    },

    {
      id: EStatutEncaissement.RECLAMATION_TRAITES,
      label: "Reclamations Traités",
      icon: IconChecks,
      habilitationName: "LITIGES TRAITES",
    },
  ];

  const filteredTabs = allTabs?.filter((tab) =>
    habilitation?.some(
      (h: { name: string; LIRE: boolean }) =>
        h.name.normalize("NFKC").toUpperCase() ===
        tab.habilitationName.normalize("NFKC").toUpperCase() &&
        h.LIRE === true
    )
  );

  const [ecartDataEncaissement, setEcartDataEncaissement] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  console.log(loading, "loading")

  const fetchData = async (filters?: Record<string, any>) => {
    setLoading(true);
    try {
      const cleanArray = (arr?: string[]): string[] =>
        arr ? arr.map((item) => item.trim()) : [];

      const formatArray = (arr?: string[]): string =>
        JSON.stringify(cleanArray(arr));

      const formatDate = (date?: string): string | undefined => {
        if (!date) return undefined;
        const d = new Date(date);
        if (isNaN(d.getTime())) return undefined;
        return `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
      };

      const params: Record<string, any> = {
        directionRegional: filters?.directionRegional
          ? formatArray(filters.directionRegional)
          : undefined,
        codeExpl: filters?.codeExpl ? formatArray(filters.codeExpl) : undefined,
        startDate: filters?.startDate
          ? formatDate(filters.startDate)
          : undefined,
        endDate: filters?.endDate ? formatDate(filters.endDate) : undefined,
        banque: filters?.banque ? formatArray(filters.banque) : undefined,
        caisse: filters?.caisse ? formatArray(filters.caisse) : undefined,
        produit: filters?.produit ? formatArray(filters.produit) : undefined,
        modeReglement: filters?.modeReglement
          ? formatArray(filters.modeReglement)
          : undefined,
      };

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined) delete params[key];
      });

      const response: any = await axiosInstance.get(
        `${API_AUTH_SUIVI}/encaissements/${activeTab}?page=${currentPage}&search=${searchTerm}&limit=${pageLimit}`,
        { params }
      );

      if (response?.data && !response.data.error) {
        setEcartDataEncaissement(response.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleLimitChange = (value: number) => {
    setPageLimit(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (isMounted) {
      fetchData({
        id: activeTab.toString(),
        page: currentPage || 1,
        search: searchTerm || "",
        limit: pageLimit || 5,
      });
    }
  }, [activeTab, isMounted, currentPage, pageLimit, searchTerm]);

  const dataEncaissementReverse = ecartDataEncaissement?.result || [];
  const Totaldata = ecartDataEncaissement?.totals || [];
  const paginate = ecartDataEncaissement?.pagination || [];

  return (
    <div>
      <div className="mb-5">
        <ol className="flex flex-wrap items-center gap-y-4 font-semibold text-gray-500 dark:text-white-dark">
          <li>
            <button className="flex items-center justify-center rounded-md border border-gray-500/20 p-2.5 shadow hover:text-gray-500/70 dark:border-0 dark:bg-[#191e3a] dark:hover:text-white-dark/70">
              <Link className="flex" href="/litige">
                <IconHome className="shrink-0 ltr:mr-2 rtl:ml-2" />
                Réclamations
              </Link>
            </button>
          </li>
          <li className="flex items-center before:relative before:-top-0.5 before:mx-4 before:inline-block before:h-1 before:w-1 before:rounded-full before:bg-primary">
            <button className="flex items-center justify-center rounded-md border border-gray-500/20 p-2.5 text-primary shadow dark:border-0 dark:bg-[#191e3a]">
              <IconBox className="shrink-0 ltr:mr-2 rtl:ml-2" />
              {filteredTabs.find((tab) => tab.id === activeTab)?.label ||
                "Reversé"}
            </button>
          </li>
        </ol>
      </div>

      <div className="panel mb-5">
        {isMounted && (
          <Tab.Group onChange={(index) => setActiveTab(filteredTabs[index].id)}>
            <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
              {filteredTabs.map((tab) => (
                <Tab as={Fragment} key={tab.id}>
                  {({ selected }) => (
                    <button
                      className={`${selected
                        ? "text-primary !outline-none before:!w-full"
                        : ""
                        }relative -mb-[1px] flex items-center p-5 py-3`}
                    >
                      <tab.icon className="ltr:mr-2 rtl:ml-2" />
                      {tab.label}
                    </button>
                  )}
                </Tab>
              ))}
            </Tab.List>

            <GlobalFiltre
              drData={drData}
              statutValidation={activeTab}
              onApplyFilters={fetchData}
            />

            <Tab.Panels>
              {filteredTabs.map((tab) => (
                <Tab.Panel key={tab.id}>
                  <EncaissementComptable
                    statutValidation={tab.id}
                    data={dataEncaissementReverse || []}
                    total={Totaldata}
                    paginate={paginate}
                    fetchLoading={loading}
                    habilitation={habilitation}
                    handlePageChange={handlePageChange}
                    handleSearchChange={handleSearchChange}
                    handleLimitChange={handleLimitChange}
                  />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>
    </div>
  );
}
