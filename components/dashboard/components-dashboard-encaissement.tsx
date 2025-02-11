"use client";
import IconCashBanknotes from "@/components/icon/icon-cash-banknotes";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import PerfectScrollbar from "react-perfect-scrollbar";
import IconHome from "../icon/icon-home";
import IconBox from "../icon/icon-box";
import Select from "react-select";
import { TAppDispatch, TRootState } from "@/store";
import IconCreditCard from "../icon/icon-credit-card";
import IconTag from "../icon/icon-tag";
import IconInbox from "../icon/icon-inbox";
import IconCaretDown from "../icon/icon-caret-down";
import { fetchDashbord } from "@/store/reducers/dashboard/dashbord.slice";
import getUserPermission from "@/utils/user-info";
import { fetchSecteurs } from "@/store/reducers/select/secteur.slice";
import IconRefresh from "../icon/icon-refresh";
import { fetchDirectionRegionales } from "@/store/reducers/select/dr.slice";
import IconFilter from "../icon/icon-filter";

const ComponentsDashboardSales = () => {
  const dispatch = useDispatch<TAppDispatch>();

  const dataDashboard: any = useSelector(
    (state: TRootState) => state?.dashboard?.data
  );

  const loadingDashboard: any = useSelector(
    (state: TRootState) => state.dashboard.loading
  );

  useEffect(() => {
    dispatch(fetchDashbord({}));
    dispatch(fetchDirectionRegionales());
  }, [dispatch]);

  const caisses = dataDashboard?.caisses || {};
  const banques = dataDashboard?.banques || [];
  const completionRate = dataDashboard?.completionRate || {};
  const ecart = dataDashboard?.ecart || {};
  const graph = dataDashboard?.graph || {};

  const isDark = useSelector(
    (state: TRootState) =>
      state.themeConfig.theme === "dark" || state.themeConfig.isDarkMode
  );
  const isRtl =
    useSelector((state: TRootState) => state.themeConfig.rtlClass) === "rtl";

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const revenueChart: any = {
    series:
      graph?.series?.map((serie: any) => ({
        name: serie?.name || "Unknown",
        data: serie?.data || [],
      })) || [],
    options: {
      chart: {
        height: 325,
        type: "area",
        fontFamily: "Nunito, sans-serif",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: "smooth",
        width: 2,
        lineCap: "square",
      },
      dropShadow: {
        enabled: true,
        opacity: 0.2,
        blur: 10,
        left: -7,
        top: 22,
      },
      colors: isDark ? ["#59959E", "#8FC717"] : ["#C7493D", "#008F75"],
      labels: graph?.categories || [],
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: true,
        },
        labels: {
          offsetX: isRtl ? 2 : 0,
          offsetY: 5,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-xaxis-title",
          },
        },
      },
      yaxis: {
        tickAmount: 7,
        labels: {
          formatter: (value: number) => {
            return value?.toLocaleString("fr-FR") + " F CFA";
          },
          offsetX: isRtl ? -30 : -10,
          offsetY: 0,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-yaxis-title",
          },
        },
        opposite: isRtl ? true : false,
      },
      grid: {
        borderColor: isDark ? "#191E3A" : "#E0E6ED",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "16px",
        markers: {
          width: 10,
          height: 10,
          offsetX: -2,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5,
        },
      },
      tooltip: {
        marker: {
          show: true,
        },
        x: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: isDark ? 0.19 : 0.28,
          opacityTo: 0.05,
          stops: isDark ? [100, 100] : [45, 100],
        },
      },
    },
  };

  const [selectedDRIds, setSelectedDRIds] = useState<number[]>([]);
  const [selectedDRLabel, setSelectedDRLabel] = useState<number[]>([]);
  const [secteurOptions, setSecteurOptions] = useState<any[]>([]);
  const [selectedCodeExpl, setSelectedCodeExpl] = useState<number[]>([]);
  const [selectedDR, setSelectedDR] = useState<any[]>([]);
  const [selectedSecteur, setSelectedSecteur] = useState<any[]>([]);

  const drData: any = useSelector((state: TRootState) => state.dr?.data);
  const drOptions = drData?.map((dr: any) => ({
    value: dr.id,
    label: dr.name,
  }));

  const secteurs = useSelector((state: TRootState) => state?.secteur?.data);
  const secteurLoading = useSelector(
    (state: TRootState) => state?.secteur?.loading
  );

  useEffect(() => {
    if (selectedDRIds?.length > 0) {
      dispatch(fetchSecteurs(selectedDRIds));
    } else {
      setSecteurOptions([]);
    }
  }, [selectedDRIds, dispatch]);

  useEffect(() => {
    if (secteurs && selectedDRIds?.length > 0) {
      const filteredSecteurs = secteurs?.map((secteur: any) => ({
        value: secteur?.code,
        label: secteur?.name,
      }));
      setSecteurOptions(filteredSecteurs);
    }
  }, [secteurs, selectedDRIds]);

  // Gestion des sélections DR
  const handleDRChange = (selected: any) => {
    setSelectedDR(selected);
    const ids = selected ? selected.map((dr: any) => dr.value) : [];
    const label = selected ? selected.map((dr: any) => dr.label) : [];
    setSelectedDRIds(ids);
    setSelectedDRLabel(label);
  };

  const handleSecteurChange = (selected: any) => {
    setSelectedSecteur(selected);
    const ids = selected ? selected.map((expl: any) => expl.value) : [];
    setSelectedCodeExpl(ids);
  };

  const handleApplyFilters = () => {
    dispatch(
      fetchDashbord({
        directionRegional: selectedDRLabel?.length
          ? selectedDRLabel?.map(String)
          : undefined,
        codeExpl: selectedCodeExpl?.length
          ? selectedCodeExpl?.map(String)
          : undefined,
      })
    );
  };

  const handleResetFilters = () => {
    setSelectedDR([]);
    setSelectedSecteur([]);
    setSelectedDRIds([]);
    setSelectedCodeExpl([]);
    setSecteurOptions([]);
    setSelectedDRLabel([]);
    dispatch(fetchDashbord({}));
  };

  const handleRefresh = () => {
    if (selectedDRLabel.length === 0 && selectedCodeExpl.length === 0) {
      dispatch(fetchDashbord({}));
    } else {
      dispatch(
        fetchDashbord({
          directionRegional: selectedDRLabel.length
            ? selectedDRLabel.map(String)
            : undefined,
          codeExpl: selectedCodeExpl.length
            ? selectedCodeExpl.map(String)
            : undefined,
        })
      );
    }
  };

  return (
    <>
      <div className="panel">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-md bg-white px-4 py-2.5 font-semibold text-primary shadow transition-all hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:hover:bg-primary"
              >
                <IconHome className="h-4.5 w-4.5" />
                Tableau de bord
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-semibold text-white shadow dark:bg-[#191e3a]">
                <IconBox className="h-4.5 w-4.5" />
                Suivi
              </button>
            </li>
          </ol>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-primary transition-all hover:bg-primary hover:text-white"
              onClick={handleRefresh}
            >
              <IconRefresh className="h-4 w-4" />
              Actualiser
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[200px]">
                <Select
                  placeholder="Filtrer par DR"
                  options={drOptions}
                  isMulti
                  isSearchable
                  onChange={handleDRChange}
                  value={selectedDR}
                  className="text-sm"
                  classNamePrefix="select"
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: "#4361ee",
                      primary25: "#eef2ff",
                    },
                  })}
                />
              </div>

              <div className="min-w-[200px]">
                <Select
                  placeholder="Filtrer par Secteurs"
                  options={secteurOptions}
                  isMulti
                  isSearchable
                  isDisabled={secteurLoading || secteurOptions?.length === 0}
                  onChange={handleSecteurChange}
                  value={selectedSecteur}
                  className="text-sm"
                  classNamePrefix="select"
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: "#4361ee",
                      primary25: "#eef2ff",
                    },
                  })}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="group flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <IconRefresh className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                  Réinitialiser
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  disabled={selectedDRIds?.length === 0}
                  className="group flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-primary/90 hover:shadow-sm disabled:cursor-not-allowed disabled:bg-primary/60"
                >
                  <IconFilter className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="mb-6 grid gap-6 xl:grid-cols-3">
            <div className="panel h-full xl:col-span-2">
              <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">Revenue</h5>
              </div>

              {loadingDashboard ? (
                <div className="relative">
                  <div className="rounded-lg bg-white p-4 dark:bg-black">
                    <div className="h-[325px] w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>
                  </div>
                </div>
              ) : banques.length === 0 ? (
                <div className="flex items-center justify-center py-4 text-center text-gray-500 dark:text-gray-400">
                  Aucun élément disponible pour le moment.
                </div>
              ) : (
                <div className="relative">
                  <div className="rounded-lg bg-white dark:bg-black">
                    {isMounted ? (
                      <ReactApexChart
                        series={revenueChart?.series}
                        options={revenueChart?.options}
                        type="area"
                        height={325}
                        width="100%"
                      />
                    ) : (
                      <div className="h-[325px] w-full animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="panel h-auto">
              <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">Résumé catégoriel</h5>
              </div>

              <div className="space-y-9">
                {loadingDashboard ? (
                  // Skeleton Loader pour le résumé catégoriel
                  <div className="space-y-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center space-x-3"
                      >
                        {/* Icône Placeholder */}
                        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700"></div>

                        {/* Texte Skeleton */}
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                          <div className="h-3 w-24 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                        </div>

                        {/* Barre de progression Skeleton */}
                        <div className="h-2 w-full animate-pulse rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Clôture */}
                    <div className="flex items-center justify-center transition-all hover:scale-105">
                      <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                        <div className="grid h-9 w-9 place-content-center rounded-full bg-secondary-light text-secondary shadow-sm dark:bg-secondary dark:text-secondary-light">
                          <IconInbox />
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="mb-2 flex justify-between font-semibold text-white-dark">
                          <h6>Clôture</h6>
                          <p>{completionRate.completionRateCloture}%</p>
                        </div>
                        <div className="h-2 rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#7579ff] to-[#b224ef]"
                            style={{
                              width: `${completionRate.completionRateCloture}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Validation */}
                    <div className="flex items-center justify-center transition-all hover:scale-105">
                      <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                        <div className="grid h-9 w-9 place-content-center rounded-full bg-success-light text-success shadow-sm dark:bg-success dark:text-success-light">
                          <IconTag />
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="mb-2 flex justify-between font-semibold text-white-dark">
                          <h6>Validation</h6>
                          <p>{completionRate.completionRateValidation}%</p>
                        </div>
                        <div className="h-2 rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#3cba92] to-[#0ba360]"
                            style={{
                              width: `${completionRate.completionRateValidation}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Réclamation */}
                    <div className="flex items-center justify-center transition-all hover:scale-105">
                      <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                        <div className="grid h-9 w-9 place-content-center rounded-full bg-warning-light text-warning shadow-sm dark:bg-warning dark:text-warning-light">
                          <IconCreditCard />
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="mb-2 flex justify-between font-semibold text-white-dark">
                          <h6>Réclamation</h6>
                          <p>{completionRate.completionRateReclamation}%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#f09819] to-[#ff5858]"
                            style={{
                              width: `${completionRate.completionRateReclamation}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Reversement */}
                    <div className="flex items-center justify-center transition-all hover:scale-105">
                      <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                        <div className="grid h-9 w-9 place-content-center rounded-full bg-primary-light text-primary shadow-sm dark:bg-primary dark:text-primary-light">
                          <IconInbox />
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="mb-2 flex justify-between font-semibold text-white-dark">
                          <h6>Reversement</h6>
                          <p>{completionRate.completionRateReverse}%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#00c6ff] to-[#0072ff]"
                            style={{
                              width: `${completionRate.completionRateReverse}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-auto p-4">
                <img
                  className="h-[150px] w-full object-contain transition-all hover:scale-105"
                  src="/assets/images/pilonne.png"
                  alt="logo"
                />
              </div>
            </div>
          </div>
        </div>

        <div className=" h-full">
          <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <div className="panel h-full pb-0 sm:col-span-2 xl:col-span-1">
              <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
                Banques avec le plus d'écart
              </h5>

              {loadingDashboard ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-4 w-full animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"
                    ></div>
                  ))}
                </div>
              ) : (
                <PerfectScrollbar
                  className="relative mb-4 h-[290px] ltr:-mr-3 ltr:pr-3 rtl:-ml-3 rtl:pl-3"
                  options={{ suppressScrollX: true }}
                >
                  <div className="cursor-pointer text-sm">
                    {banques?.map((banque: any, index: number) => {
                      const badgeClass =
                        index === 0
                          ? "badge-outline-primary bg-primary-light"
                          : index === 1
                          ? "badge-outline-success bg-success-light"
                          : "badge-outline-danger bg-danger-light";

                      return (
                        <div
                          key={index}
                          className="group relative flex items-center py-1.5"
                        >
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${
                              index === 0
                                ? "bg-primary"
                                : index === 1
                                ? "bg-success"
                                : "bg-danger"
                            } ltr:mr-1 rtl:ml-1.5`}
                          ></div>
                          <div className="flex-1">{banque?.banque}</div>
                          <div className="text-xs text-white-dark dark:text-gray-500 ltr:ml-auto rtl:mr-auto">
                            {banque?.totalEcartReleve.toLocaleString("fr-FR")} F
                            CFA
                          </div>
                          <span
                            className={`badge ${badgeClass} absolute text-xs opacity-0 group-hover:opacity-100 dark:bg-black ltr:right-0 rtl:left-0`}
                          >
                            {index + 1}ère banque
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </PerfectScrollbar>
              )}
            </div>

            <div className="panel h-full">
              <div className="mb-5 flex items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">
                  Les caisses avec le plus et le moins d'ecarts
                </h5>
              </div>
              <div>
                <div className="space-y-6">
                  {loadingDashboard
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <div className="h-9 w-9 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                            <div className="h-3 w-1/2 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                          </div>
                          <div className="h-5 w-12 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
                        </div>
                      ))
                    : caisses?.most?.map((caisse: any, index: number) => {
                        const isPositive = caisse?.totalEcartReleve >= 0;
                        const badgeClass = isPositive
                          ? "bg-success-light text-success dark:bg-success dark:text-success-light"
                          : "bg-danger-light text-danger dark:bg-danger dark:text-danger-light";
                        const textColorClass = isPositive
                          ? "text-success"
                          : "text-danger";
                        const signe = isPositive ? "+" : "";

                        return (
                          <div className="flex" key={index}>
                            <span
                              className={`grid h-9 w-9 shrink-0 place-content-center rounded-md ${badgeClass}`}
                            >
                              J{index + 1}
                            </span>
                            <div className="flex-1 px-3">
                              <div>{`Journée ${caisse?.numeroJourneeCaisse}`}</div>
                              <div className="text-xs text-white-dark dark:text-gray-500">
                                {isPositive ? "Écart positif" : "Écart négatif"}
                              </div>
                            </div>
                            <span
                              className={`whitespace-pre px-1 text-base ${textColorClass} ltr:ml-auto rtl:mr-auto`}
                            >
                              {`${signe}${caisse?.totalEcartReleve?.toLocaleString(
                                "fr-FR"
                              )} F CFA`}
                            </span>
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>

            <div className="panel h-full overflow-hidden border-0 p-0">
              <div className="min-h-[70px] bg-primary bg-gradient-to-r to-[#160f6b] p-4">
                <div className="flex items-center justify-between text-white">
                  <p className="text-xl">Écarts</p>
                </div>
              </div>
              <div className="-mt-6 grid grid-cols-2 gap-2 px-8">
                {loadingDashboard ? (
                  Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"
                    ></div>
                  ))
                ) : (
                  <>
                    {/* Écart (A-B) */}
                    <div className="rounded-md bg-white px-4 py-2.5 shadow transition-all hover:shadow-md dark:bg-[#060818]">
                      <span className="mb-4 flex items-center justify-between dark:text-white">
                        Écart (A-B)
                        <IconCaretDown
                          className={`h-4 w-4 ${
                            ecart?.ecartAB >= 0 ? "text-success" : "text-danger"
                          }`}
                        />
                      </span>
                      <div className="btn w-full border-0 bg-[#ebedf2] py-1 text-base text-[#515365] shadow-none dark:bg-black dark:text-[#bfc9d4]">
                        {ecart?.ecartAB?.toLocaleString("fr-FR")} F CFA
                      </div>
                    </div>
                    {/* Écart (B-C) */}
                    <div className="rounded-md bg-white px-4 py-2.5 shadow transition-all hover:shadow-md dark:bg-[#060818]">
                      <span className="mb-4 flex items-center justify-between dark:text-white">
                        Écart (B-C)
                        <IconCaretDown
                          className={`h-4 w-4 ${
                            ecart?.ecartBC >= 0 ? "text-success" : "text-danger"
                          }`}
                        />
                      </span>
                      <div className="btn w-full border-0 bg-[#ebedf2] py-1 text-base text-[#515365] shadow-none dark:bg-black dark:text-[#bfc9d4]">
                        {ecart?.ecartBC?.toLocaleString("fr-FR")} F CFA
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-5">
                <div className="mb-5">
                  <span className="rounded-full bg-[#1b2e4b] px-4 py-1.5 text-xs text-white before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-white ltr:before:mr-2 rtl:before:ml-2">
                    Liste des caisses avec le plus de clôtures
                  </span>
                </div>
                <div className="mb-5 space-y-1">
                  {loadingDashboard
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-4 w-full animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"
                        ></div>
                      ))
                    : ecart.top5CaissesWithMostCloturedDossiers?.map(
                        (caisse: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <p className="font-semibold text-[#515365]">
                              Journée {caisse.numeroJourneeCaisse}
                            </p>
                            <p className="text-base">
                              <span className="font-semibold">
                                {caisse.nombreDossiersClotures}
                              </span>
                              <span className="text-sm font-light text-gray-500">
                                {" "}
                                caisses clôturés
                              </span>
                            </p>
                          </div>
                        )
                      )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComponentsDashboardSales;
