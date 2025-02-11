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

  const updateUrl = (page: number, search: string) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", itemsPerPage.toString());
    if (search) params.set("search", search);
    router.push(`?${params.toString()}`);
  };

  const fetchData = async (page: number, limit: number, search?: string) => {
    try {
      setIsLoading(true);
      if (search) setSearchLoading(true);
      const response: any = await axiosInstance.get<ApiResponse>(
        `${API_AUTH_SUIVI}/log-history`,
        {
          params: {
            page,
            limit,
            search,
          },
        }
      );
      setData(response.data);
      updateUrl(page, search || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
      if (search) setSearchLoading(false);
    }
  };

  const fetchUserDetails = async (userId: number, page: number = 1) => {
    try {
      setDetailsLoading(true);
      const response: any = await axiosInstance.get<DetailedConnectionResponse>(
        `${API_AUTH_SUIVI}/log-history/${userId}`,
        {
          params: {
            page,
            limit: 4,
          },
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

  const handleRefresh = () => {
    fetchData(currentPage, itemsPerPage, searchTerm);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchData(1, itemsPerPage, value);
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
                    fetchUserDetails(history.id);
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
                        <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                          <IconLogout className="text-red-500" size={20} />
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Déconnecté le:
                            </span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                              {formatDateSafely(detail.disconnectedAt, true)}
                            </span>
                          </div>
                        </div>
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
