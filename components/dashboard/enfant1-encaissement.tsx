"use client";

import React, { useEffect, useState } from "react";
import ComponentsDatatablesColumnChooser from "../datatables/components-datatables-encaissement";
import IconZipFile from "../icon/icon-zip-file";
import IconCircleCheck from "../icon/icon-circle-check";
import { ITotal, Paginations } from "@/utils/interface";
import EncaissementTutorial from "../tutorial/TutorialTable-encaissement";
import getUserPermission from "@/utils/user-info";

interface EncaissementComptableProps {
  statutValidation: number;
  data: any[];
  total: ITotal;
  paginate: Paginations;
  fetchLoading: boolean;
  habilitation: any[];
  handlePageChange?: (page: number) => void;
  handleSearchChange?: (value: string) => void;
  handleLimitChange?: (value: number) => void;
}

const EncaissementComptable: React.FC<EncaissementComptableProps> = ({
  statutValidation,
  data,
  total,
  paginate,
  fetchLoading,
  habilitation,
  handlePageChange,
  handleSearchChange,
  handleLimitChange,
}) => {
  const [expensesPercentage, setExpensesPercentage] = useState<number>(0);

  const formatDate = (date: Date): string => {
    const dt = new Date(date);
    const month =
      dt.getMonth() + 1 < 10 ? `0${dt.getMonth() + 1}` : dt.getMonth() + 1;
    const day = dt.getDate() < 10 ? `0${dt.getDate()}` : dt.getDate();
    return `${day}/${month}/${dt.getFullYear()}`;
  };

  const user = getUserPermission();

  const isFirstLogin = user?.isFirstLogin;

  const today = formatDate(new Date());

  const formatNumber: any = (number: number): string => {
    return number?.toLocaleString("fr-FR", {
      useGrouping: true,
      maximumFractionDigits: 0,
    });
  };

  const getColorClass = (value: number): string => {
    if (value > 0) return "text-success";
    if (value < 0) return "text-danger";
    return "text-black";
  };

  useEffect(() => {
    if (total.totalDossiers > 0) {
      const percentage = (total.dossiersClotures / total.totalDossiers) * 100;
      setExpensesPercentage(percentage);
    } else {
      setExpensesPercentage(0);
    }
  }, [total.dossiersClotures, total.totalDossiers]);

  return (
    <div>
      <div className="grid pt-5">
        <div className="flex flex-col md:flex-row md:gap-6">
          <div className="panel w-full md:w-1/2 flex-1 min-w-0 mb-4 md:mb-0 md:mr-4" id="completion">
            <div className="-m-5 mb-5 flex items-center justify-between border-b border-white-light p-5 dark:border-[#1b2e4b]">
              <button type="button" className="flex items-center font-semibold">
                <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-md bg-primary text-white ltr:mr-2 md:ltr:mr-4 rtl:ml-2 md:rtl:ml-4">
                  <span>TC</span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <h6 className="text-base md:text-lg">Taux de complétion</h6>
                  <p className="mt-1 text-xs md:text-sm text-primary">
                    {`${total.dossiersClotures}/${total.totalDossiers} lignes`}
                  </p>
                </div>
              </button>
            </div>
            <div className="group">
              <div className="mb-5 text-sm md:text-base text-white-dark">
                Vous indique combien de fiches ont été éditées
              </div>
            </div>
            <div className="space-y-9">
              <div className="flex h-5 items-center">
                <div className="h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 ltr:mr-2 md:ltr:mr-3 rtl:ml-2 md:rtl:ml-3">
                  <div className="grid h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 place-content-center rounded-full bg-warning-light text-warning dark:bg-warning dark:text-warning-light">
                    <IconZipFile />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex font-semibold text-white-dark">
                    <h6 className="md:text-base">Pourcentage</h6>
                    <p className="ltr:ml-auto rtl:mr-auto md:text-base">
                      {`${expensesPercentage.toFixed(2)}%`}
                    </p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#f09819] to-primary"
                      style={{ width: `${expensesPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel w-full md:w-1/2 flex-1 min-w-0" id="totalmontant">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg md:text-xl font-bold">Total des montants</div>
                <div className="text-primary md:text-base">À la date du {today}</div>
              </div>
            </div>
            <div className="relative mt-4 md:mt-6 lg:mt-10">
              <div className="absolute -bottom-12 h-12 w-12 ltr:-right-12 rtl:-left-12 hidden md:block opacity-20">
                <IconCircleCheck className="-ml-7 -mt-[25px] h-full w-full text-success" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fetchLoading ? (
                  <>
                    {/* Skeleton loaders */}
                    <div className="min-w-[180px]">
                      <div className="text-white-black md:text-base">
                        Total Montant Caisse
                      </div>
                      <div className="mt-2 text-lg md:text-xl font-light xl:text-xl">
                        <div className="h-2 w-32 animate-pulse rounded bg-gray-300"></div>
                      </div>
                    </div>
                    <div className="min-w-[180px]">
                      <div className="text-white-black md:text-base">
                        Total Montant Bordereau
                      </div>
                      <div className="mt-2 text-lg md:text-xl font-light xl:text-xl">
                        <div className="h-2 w-32 animate-pulse rounded bg-gray-300"></div>
                      </div>
                    </div>
                    <div className="min-w-[180px]">
                      <div className="text-white-black md:text-base">
                        Total Montant Relevé
                      </div>
                      <div className="mt-2 text-lg md:text-xl font-light xl:text-xl">
                        <div className="h-2 w-32 animate-pulse rounded bg-gray-300"></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="min-w-[180px]">
                      <div className="text-white-black md:text-base">
                        Total Montant Caisse
                      </div>
                      <div
                        className={`mt-2 whitespace-nowrap text-lg md:text-xl font-light xl:text-xl ${getColorClass(
                          total.totalMontantRestitutionCaisse
                        )}`}
                      >
                        {`${formatNumber(
                          total.totalMontantRestitutionCaisse
                        )} F CFA`}
                      </div>
                    </div>
                    <div className="min-w-[180px]">
                      <div className="text-white-black md:text-base">
                        Total Montant Bordereau
                      </div>
                      <div
                        className={`mt-2 whitespace-nowrap text-lg md:text-xl font-light xl:text-xl ${getColorClass(
                          total.totalMontantBordereauBanque
                        )}`}
                      >
                        {`${formatNumber(
                          total.totalMontantBordereauBanque
                        )} F CFA`}
                      </div>
                    </div>
                    <div className="min-w-[180px]">
                      <div className="text-white-black md:text-base">
                        Total Montant Relevé
                      </div>
                      <div
                        className={`mt-2 whitespace-nowrap text-lg md:text-xl font-light xl:text-xl ${getColorClass(
                          total.totalMontantReleve
                        )}`}
                      >
                        {`${formatNumber(total.totalMontantReleve)} F CFA`}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <ComponentsDatatablesColumnChooser
          statutValidation={statutValidation}
          data={data}
          fetchLoading={fetchLoading}
          paginate={paginate}
          habilitation={habilitation}
          handlePageChange={handlePageChange}
          handleSearchChange={handleSearchChange}
          handleLimitChange={handleLimitChange}
        />
      </div>

      {/* {isFirstLogin === 1 && <EncaissementTutorial />} */}
    </div>
  );
};

export default EncaissementComptable;
