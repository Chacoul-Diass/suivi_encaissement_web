"use client";
import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import Select from "react-select";
import { useSelector } from "react-redux";
import { TRootState } from "@/store";

interface TableData {
  dr: string;
  montantA?: number;
  montantB: number;
  montantC?: number;
  ecartAB?: number;
  ecartBC?: number;
}

interface TableProps {
  data: TableData[];
  showAll?: boolean;
  onViewMore?: (tableType: "AB" | "BC") => void;
}

type SelectOption = {
  value: string;
  label: string;
};

const TableAB: React.FC<TableProps> = ({
  data,
  showAll = false,
  onViewMore,
}) => {
  return (
    <div className="table-responsive overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr className="bg-gray-50/50 backdrop-blur-sm dark:bg-gray-700/50">
            <th className="group px-6 py-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors group-hover:text-primary dark:text-gray-300">
                  DR
                </span>
                <svg
                  className="h-4 w-4 text-gray-400 opacity-0 transition-all group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </th>
            <th className="group px-6 py-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors group-hover:text-primary dark:text-gray-300">
                  Montant Restitution caisse (A)
                </span>
                <svg
                  className="h-4 w-4 text-gray-400 opacity-0 transition-all group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </th>
            <th className="group px-6 py-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors group-hover:text-primary dark:text-gray-300">
                  Montant bordereau Banque (B)
                </span>
                <svg
                  className="h-4 w-4 text-gray-400 opacity-0 transition-all group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </th>
            <th className="group px-6 py-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors group-hover:text-primary dark:text-gray-300">
                  Ecart (A-B)
                </span>
                <svg
                  className="h-4 w-4 text-gray-400 opacity-0 transition-all group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white/50 backdrop-blur-sm dark:divide-gray-700 dark:bg-gray-800/50">
          {data.map((item, index) => (
            <tr
              key={index}
              className="transition-all duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-700/50"
            >
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.dr}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <span className="font-medium">
                  {item.montantA?.toLocaleString("fr-FR")}
                </span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                  F CFA
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <span className="font-medium">
                  {item.montantB?.toLocaleString("fr-FR")}
                </span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                  F CFA
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                    (item.ecartAB ?? 0) >= 0
                      ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                      : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  }`}
                >
                  {(item.ecartAB ?? 0) >= 0 ? (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  )}
                  <span>{item.ecartAB?.toLocaleString("fr-FR")}</span>
                  <span className="text-xs opacity-75">F CFA</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!showAll && onViewMore && (
        <div className="mt-6 text-right">
          <button
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus:outline-none active:bg-primary/95"
            onClick={() => onViewMore("AB")}
          >
            <span>Voir plus</span>
            <svg
              className="h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

const TableBC: React.FC<TableProps> = ({
  data,
  showAll = false,
  onViewMore,
}) => {
  return (
    <div className="table-responsive overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr className="bg-gray-50/50 backdrop-blur-sm dark:bg-gray-700/50">
            <th className="group px-6 py-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors group-hover:text-primary dark:text-gray-300">
                  DR
                </span>
                <svg
                  className="h-4 w-4 text-gray-400 opacity-0 transition-all group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </th>
            <th className="group px-6 py-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors group-hover:text-primary dark:text-gray-300">
                  Montant bordereau Banque (B)
                </span>
                <svg
                  className="h-4 w-4 text-gray-400 opacity-0 transition-all group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </th>
            <th className="group px-6 py-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors group-hover:text-primary dark:text-gray-300">
                  Montant Relevé (C)
                </span>
                <svg
                  className="h-4 w-4 text-gray-400 opacity-0 transition-all group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </th>
            <th className="group px-6 py-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors group-hover:text-primary dark:text-gray-300">
                  Ecart (B-C)
                </span>
                <svg
                  className="h-4 w-4 text-gray-400 opacity-0 transition-all group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white/50 backdrop-blur-sm dark:divide-gray-700 dark:bg-gray-800/50">
          {data.map((item, index) => (
            <tr
              key={index}
              className="transition-all duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-700/50"
            >
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.dr}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <span className="font-medium">
                  {item.montantB?.toLocaleString("fr-FR")}
                </span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                  F CFA
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <span className="font-medium">
                  {item.montantC?.toLocaleString("fr-FR")}
                </span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                  F CFA
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                    (item.ecartBC ?? 0) >= 0
                      ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                      : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  }`}
                >
                  {(item.ecartBC ?? 0) >= 0 ? (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  )}
                  <span>{item.ecartBC?.toLocaleString("fr-FR")}</span>
                  <span className="text-xs opacity-75">F CFA</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!showAll && onViewMore && (
        <div className="mt-6 text-right">
          <button
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus:outline-none active:bg-primary/95"
            onClick={() => onViewMore("BC")}
          >
            <span>Voir plus</span>
            <svg
              className="h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

const ComponentsDashboardTables = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState<"AB" | "BC">("AB");
  const [selectedSecteur, setSelectedSecteur] = useState<SelectOption | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(1);
  const itemsPerPage = 14;

  const secteurs = useSelector(
    (state: TRootState) => state.secteur?.data || []
  );

  const mockData: TableData[] = [
    {
      dr: "DRAN",
      montantA: 1000000,
      montantB: 950000,
      montantC: 900000,
      ecartAB: 50000,
      ecartBC: 50000,
    },
  ];

  const filteredData = selectedSecteur
    ? mockData.filter((item) => item.dr === selectedSecteur.value)
    : mockData;

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewMore = (tableType: "AB" | "BC") => {
    setCurrentTable(tableType);
    setIsModalOpen(true);
  };

  return (
    <div className="mt-6 space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="group overflow-hidden rounded-xl border border-gray-100 bg-white/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 dark:border-gray-700 dark:bg-gray-800/90">
          <div className="flex items-center justify-between border-b border-gray-200/80 px-6 py-4 dark:border-gray-700/80">
            <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Écarts Restitution - Bordereau
            </h5>
            <div className="flex h-8 w-8 transform items-center justify-center rounded-full bg-primary/10 transition-transform duration-500 group-hover:rotate-180">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
          <div className="p-6">
            <TableAB
              data={filteredData.slice(0, 5)}
              onViewMore={handleViewMore}
            />
          </div>
        </div>

        <div className="group overflow-hidden rounded-xl border border-gray-100 bg-white/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 dark:border-gray-700 dark:bg-gray-800/90">
          <div className="flex items-center justify-between border-b border-gray-200/80 px-6 py-4 dark:border-gray-700/80">
            <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Écarts Bordereau - Relevé
            </h5>
            <div className="flex h-8 w-8 transform items-center justify-center rounded-full bg-primary/10 transition-transform duration-500 group-hover:rotate-180">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
          <div className="p-6">
            <TableBC
              data={filteredData.slice(0, 5)}
              onViewMore={handleViewMore}
            />
          </div>
        </div>
      </div>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="my-8 inline-block w-full max-w-4xl transform overflow-hidden rounded-2xl border border-gray-200 bg-white/90 p-8 text-left align-middle shadow-xl backdrop-blur-xl transition-all dark:border-gray-700 dark:bg-gray-800/90">
                <div className="mb-8 flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-2xl font-bold text-transparent"
                  >
                    {currentTable === "AB"
                      ? "Écarts Restitution - Bordereau"
                      : "Écarts Bordereau - Relevé"}
                  </Dialog.Title>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="group inline-flex items-center justify-center rounded-full p-2 text-gray-400 transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:outline-none"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg
                      className="h-6 w-6 transform transition-transform duration-200 group-hover:rotate-90"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {currentTable === "AB" ? (
                  <TableAB data={paginatedData} showAll />
                ) : (
                  <TableBC data={paginatedData} showAll />
                )}

                <div className="mt-8 flex items-center justify-between">
                  <button
                    className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/50 px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-primary hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-primary"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <svg
                      className="h-4 w-4 transform transition-transform duration-200 group-hover:-translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Précédent
                  </button>

                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Page {currentPage} sur{" "}
                    {Math.ceil(filteredData.length / itemsPerPage)}
                  </span>

                  <button
                    className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/50 px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-primary hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-primary"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          Math.ceil(filteredData.length / itemsPerPage),
                          prev + 1
                        )
                      )
                    }
                    disabled={
                      currentPage >=
                      Math.ceil(filteredData.length / itemsPerPage)
                    }
                  >
                    Suivant
                    <svg
                      className="h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ComponentsDashboardTables;
