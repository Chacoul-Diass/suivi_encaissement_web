"use client";

import {
  Container,
  SimpleGrid,
  Card,
  Avatar,
  Text,
  Badge,
  Group,
  UnstyledButton,
  Modal,
  Stack,
  Title,
  Paper,
  Pagination,
  Tooltip,
  Button,
  Loader,
} from "@mantine/core";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconSearch,
  IconClock,
  IconDeviceLaptop,
  IconBrowser,
  IconMapPin,
  IconLogin,
  IconLogout,
  IconDeviceDesktop,
  IconInfoCircle,
  IconRefresh,
  IconFilter,
  IconCalendar,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";
import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { useRouter, useSearchParams } from "next/navigation";

interface ConnectionHistory {
  id: number;
  email: string;
  matricule: string;
  phoneNumber: string;
  firstname: string;
  lastname: string;
  profile: string;
  connectionNumber: number;
  lastConnection: string;
}

interface PaginationData {
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  count: number;
  totalCount: number;
  totalPages: number;
}

interface ApiResponse {
  error: boolean;
  statusCode: number;
  message: string;
  data: {
    pagination: PaginationData;
    result: ConnectionHistory[];
  };
}

interface DetailedConnection {
  id: number;
  userId: number;
  ipAddress: string;
  device: string | null;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  location: string | null;
  connectedAt: string;
  disconnectedAt: string;
}

interface DetailedConnectionResponse {
  error: boolean;
  statusCode: number;
  message: string;
  data: {
    pagination: PaginationData;
    result: DetailedConnection[];
  };
}

const formatDateSafely = (
  dateString: string | null | undefined,
  isDetail: boolean = false
) => {
  if (!dateString) return "Non disponible";
  const date = new Date(dateString);
  return isValid(date)
    ? format(date, isDetail ? "dd MMMM yyyy à HH:mm" : "EEEE dd MMMM yyyy", {
      locale: fr,
    })
    : "Date invalide";
};

const NO_DATES_SELECTED = { startDate: "", endDate: "" };

const ConnectionHistoryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams?.get("search") ?? ""
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams?.get("page") ?? "1")
  );
  const [itemsPerPage] = useState(3);
  const [detailItemsPerPage] = useState(4);
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [data, setData] = useState<ApiResponse["data"]>({
    pagination: {} as PaginationData,
    result: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [detailsData, setDetailsData] = useState<DetailedConnection[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsCurrentPage, setDetailsCurrentPage] = useState(1);
  const [detailsPagination, setDetailsPagination] = useState<PaginationData>(
    {} as PaginationData
  );

  const [dateRange, setDateRange] = useState(NO_DATES_SELECTED);
  const [dateRangeKey, setDateRangeKey] = useState(Date.now());

  const updateUrl = (
    page: number,
    search: string,
    startDate?: string,
    endDate?: string
  ) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", itemsPerPage.toString());
    if (search) params.set("search", search);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    router.push(`?${params.toString()}`);
  };

  const fetchData = async (
    page: number,
    limit: number,
    search?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      setIsLoading(true);
      if (search) setSearchLoading(true);

      const response: any = await axiosInstance.get<ApiResponse>(
        `${API_AUTH_SUIVI}/log-history`,
        {
          params: { page, limit, search, startDate, endDate },
        }
      );

      setData(response.data);
      updateUrl(page, search || "", startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
      if (search) setSearchLoading(false);
    }
  };

  const fetchUserDetails = async (
    userId: number,
    page: number,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      setDetailsLoading(true);

      const response: any = await axiosInstance.get<DetailedConnectionResponse>(
        `${API_AUTH_SUIVI}/log-history/${userId}`,
        {
          params: { page, limit: 3, startDate, endDate },
        }
      );

      setDetailsData(response.data.result);
      setDetailsPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage, searchTerm);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (selectedUserId) {
      const { startDate, endDate } = getFilterParams();
      fetchUserDetails(selectedUserId, detailsCurrentPage, startDate, endDate);
    }
  }, [selectedUserId, detailsCurrentPage]);

  const handleRefresh = () => {
    fetchData(currentPage, itemsPerPage, searchTerm);
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getFilterParams = () => {
    return {
      startDate: dateRange.startDate || "", // vide => pas de filtre
      endDate: dateRange.endDate || "", // vide => pas de filtre
    };
  };

  useEffect(() => {
    const { startDate, endDate } = getFilterParams();
    fetchData(currentPage, itemsPerPage, searchTerm, startDate, endDate);
  }, [currentPage, searchTerm]);

  // Effet pour récupérer les détails utilisateur quand on change d'utilisateur ou de page
  useEffect(() => {
    if (selectedUserId) {
      const { startDate, endDate } = getFilterParams();
      fetchUserDetails(selectedUserId, detailsCurrentPage, startDate, endDate);
    }
  }, [selectedUserId, detailsCurrentPage]);

  // Gérer l'affichage des détails utilisateur
  const handleUserDetails = (userId: number) => {
    setSelectedUserId(userId);
    setDetailsCurrentPage(1);
  };

  // Gérer la recherche
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    const { startDate, endDate } = getFilterParams();
    fetchData(1, itemsPerPage, value, startDate, endDate);
  };

  // Appliquer les filtres
  const applyFilters = () => {
    const { startDate, endDate } = getFilterParams();
    fetchData(currentPage, itemsPerPage, searchTerm, startDate, endDate);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setDateRange(NO_DATES_SELECTED);
    setDateRangeKey(Date.now());
    fetchData(currentPage, itemsPerPage, searchTerm);
  };

  // Gérer le changement de dates
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="panel container mx-auto px-6 py-8">
      <Loader
        size="xl"
        style={{
          display: isLoading || searchLoading ? "block" : "none",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 999,
        }}
      />
      {/* Page Title with Refresh Button */}
      <div className="panel mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Historique des Connexions
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Consultez l'historique détaillé des connexions des utilisateurs
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="light"
          color="red"
          className="transform transition-all duration-300 hover:scale-105"
          leftIcon={<IconRefresh size={20} />}
          loading={isLoading}
        >
          Actualiser
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pl-12 text-sm shadow-sm transition-all duration-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-red-400"
          />
          <IconSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-400"
            size={20}
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.result?.map((history) => (
          <div
            key={history.id}
            className="group relative transform overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-800"
          >
            {/* Decorative background element */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rotate-12 transform bg-gradient-to-br from-red-100 to-red-200 opacity-50 transition-transform duration-300 group-hover:rotate-45 dark:from-red-900 dark:to-red-800"></div>

            <div className="relative">
              {/* User Info */}
              <div className="mb-6 flex items-center space-x-4">
                <div className="relative">
                  <Avatar
                    size="lg"
                    radius="xl"
                    className="ring-2 ring-red-500 transition-transform duration-300 group-hover:scale-110"
                  >
                    {history.firstname.charAt(0)}
                  </Avatar>
                  {/* <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></div> */}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {`${history.firstname} ${history.lastname}`}
                  </h3>
                  <Badge
                    className="mt-1 bg-gradient-to-r from-red-500 to-red-600 text-white transition-transform duration-300 group-hover:scale-105"
                    size="lg"
                  >
                    {history.profile}
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-700 dark:to-gray-800">
                <div className="text-center">
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
                    <IconClock size={24} />
                  </div>
                  <span className="block text-2xl font-bold text-red-600 dark:text-red-400">
                    {history.connectionNumber}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Connexions
                  </span>
                </div>
                <div className="text-center">
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    <IconLogin size={24} />
                  </div>
                  <span className="block text-lg font-bold text-gray-900 dark:text-gray-100">
                    {!history.lastConnection || history.lastConnection === "N/A"
                      ? "Jamais connecté"
                      : formatDateSafely(history.lastConnection)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Dernière connexion
                  </span>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2 transition-colors duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <IconUser
                    className="text-gray-500 dark:text-gray-400"
                    size={20}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {history.matricule}
                  </span>
                </div>
                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2 transition-colors duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <IconMail
                    className="text-gray-500 dark:text-gray-400"
                    size={20}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {history.email}
                  </span>
                </div>
                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2 transition-colors duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <IconPhone
                    className="text-gray-500 dark:text-gray-400"
                    size={20}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {history.phoneNumber}
                  </span>
                </div>

                <Button
                  variant="light"
                  color="red"
                  fullWidth
                  className="mt-4 transform transition-all duration-300 hover:scale-105"
                  leftIcon={<IconInfoCircle size={20} />}
                  onClick={() => {
                    setSelectedUserId(history.id);
                    fetchUserDetails(history.id, 1);
                    setDetailModalOpened(true);
                  }}
                >
                  Voir plus de détails
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      <Modal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        title={
          <div className="flex items-center space-x-2 text-xl font-semibold">
            <IconDeviceDesktop className="text-red-500" />
            <span>Historique détaillé des connexions</span>
          </div>
        }
        size="xl"
        classNames={{
          modal: "bg-white dark:bg-gray-800",
          header: "border-b border-gray-200 dark:border-gray-700",
        }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <IconFilter className="h-5 w-5 text-primary" />
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative w-full sm:w-auto">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <IconCalendar className="h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-primary" />
                </div>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="form-input w-full min-w-[180px] rounded-lg border-gray-200 pl-10 text-sm transition-all duration-200 focus:border-primary focus:ring-primary group-hover:border-primary dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Date de début"
                />
              </div>
              <div className="relative w-full sm:w-auto">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <IconCalendar className="h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-primary" />
                </div>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="form-input w-full min-w-[180px] rounded-lg border-gray-200 pl-10 text-sm transition-all duration-200 focus:border-primary focus:ring-primary group-hover:border-primary dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Date de fin"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="group flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <IconRefresh className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="group flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-primary/90 hover:shadow-sm"
            >
              <IconFilter className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              Appliquer
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-4 lg:flex-nowrap lg:items-center">
          {/* Flatpickr avec icône et animation */}
        </div>
        {detailsLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader color="red" size="xl" variant="bars" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {detailsData.map((detail) => (
                <Paper
                  key={detail.id}
                  p="md"
                  withBorder
                  className="transform transition-all duration-300 hover:shadow-lg"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="mb-4 flex items-center space-x-2 font-semibold text-gray-800 dark:text-gray-200">
                        <IconBrowser className="text-red-500" size={20} />
                        <span>Informations de connexion</span>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                          <IconMapPin className="text-blue-500" size={20} />
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              IP:
                            </span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                              {detail.ipAddress}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                          <IconBrowser className="text-purple-500" size={20} />
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Navigateur:
                            </span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                              {detail.browser} {detail.browserVersion}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                          <IconDeviceLaptop
                            className="text-green-500"
                            size={20}
                          />
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Système:
                            </span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                              {detail.os} {detail.osVersion}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-4 flex items-center space-x-2 font-semibold text-gray-800 dark:text-gray-200">
                        <IconClock className="text-red-500" size={20} />
                        <span>Période de connexion</span>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                          <IconLogin className="text-green-500" size={20} />
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Connecté le:
                            </span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                              {formatDateSafely(detail.connectedAt, true)}
                            </span>
                          </div>
                        </div>
                        {/* <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                          <IconLogout className="text-red-500" size={20} />
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Déconnecté le:
                            </span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                              {formatDateSafely(detail.disconnectedAt, true)}
                            </span>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </Paper>
              ))}
            </div>
            {detailsPagination.totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  total={detailsPagination.totalPages}
                  page={detailsCurrentPage}
                  onChange={(page) => {
                    setDetailsCurrentPage(page);
                    fetchUserDetails(selectedUserId!, page);
                  }}
                  radius="xl"
                  size="sm"
                  styles={(theme) => ({
                    item: {
                      "&[data-active]": {
                        backgroundImage: theme.fn.gradient({
                          from: "red",
                          to: "pink",
                        }),
                      },
                    },
                  })}
                />
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Main Pagination */}
      {!isLoading && data.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            total={data.pagination.totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            radius="xl"
            size="lg"
            styles={(theme) => ({
              item: {
                "&[data-active]": {
                  backgroundImage: theme.fn.gradient({
                    from: "red",
                    to: "pink",
                  }),
                },
              },
            })}
          />
        </div>
      )}
    </div>
  );
};

export default ConnectionHistoryPage;
