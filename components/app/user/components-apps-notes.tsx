"use client";

import IconLayoutGrid from "@/components/icon/icon-layout-grid";
import IconListCheck from "@/components/icon/icon-list-check";
import IconSearch from "@/components/icon/icon-search";
import IconX from "@/components/icon/icon-x";
import IconPlus from "@/components/icon/icon-plus";
import Link from "next/link";
import { Transition, Dialog } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import IconUser from "@/components/icon/icon-user";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "@/store/reducers/user/get.user.slice";
import { TAppDispatch, TRootState } from "@/store";
import IconRefresh from "@/components/icon/icon-refresh";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { fetchDirectionRegionales } from "@/store/reducers/select/dr.slice";
import { fetchProfile } from "@/store/reducers/select/profile.slice";
import { fetchSecteurs } from "@/store/reducers/select/secteur.slice";
import { fetchUsersgetpatch } from "@/store/reducers/user/get-patch-user.slice";
import { Toastify } from "@/utils/toast";
import { fetchupdateUser } from "@/store/reducers/user/update-user.slice";
import { fetchUserDelete } from "@/store/reducers/user/delete-user.slice";
import IconUserPlus from "@/components/icon/icon-user-plus";
import IconId from "@/components/icon/icon-id";
import IconSignature from "@/components/icon/icon-signature";
import IconMail from "@/components/icon/icon-mail";
import IconPhone from "@/components/icon/icon-phone";
import IconUserCircle from "@/components/icon/icon-user-circle";
import IconBuilding from "@/components/icon/icon-building";
import IconBuildingSkyscraper from "@/components/icon/icon-building-skyscraper";
import IconBuildingCommunity from "@/components/icon/icon-building-community";
import IconAlertCircle from "@/components/icon/icon-alert-circle";
import IconDeviceFloppy from "@/components/icon/icon-device-floppy";
import IconBook from "@/components/icon/icon-book";
import IconBuildingStore from "@/components/icon/icon-building-store";
import { IconLock, IconLockOpen } from "@tabler/icons-react";
import axiosInstance from "@/utils/axios";
import { API_AUTH_SUIVI } from "@/config/constants";
import { clsx } from "@mantine/core";

type User = {
  id: number;
  email: string;
  matricule: string;
  phoneNumber: string;
  firstname: string;
  lastname: string;
  profile: string;
  poste: string;
  directionRegionales: string[];
  secteurs: string[];
  isActif: number;
};

interface Option {
  value: string;
  label: string;
}

const ComponentsAppsUsers: React.FC = () => {
  const dispatch = useDispatch<TAppDispatch>();
  const { result: users, pagination } = useSelector(
    (state: TRootState) =>
      state?.usersData?.data || { result: [], pagination: {} }
  );
  const loading = useSelector((state: TRootState) => state?.usersData?.loading);

  const ProfilList: any = useSelector(
    (state: TRootState) => state?.profile?.data
  );

  console.log(users, "users");

  const [addUserModal, setAddUserModal] = useState(false);
  const [isDeleteUserModal, setIsDeleteUserModal] = useState(false);
  const [value, setValue] = useState<string>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [filteredItems, setFilteredItems] = useState<User[]>([]);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(
    null
  );

  const [availableProfiles, setAvailableProfiles] = useState<Option[]>([]);

  useEffect(() => {
    if (ProfilList) {
      const profiles = ProfilList?.map((profil: any) => ({
        value: profil.id,
        label: profil.name,
      }));
      setAvailableProfiles(profiles);
    }
  }, [ProfilList]);

  const [editUserData, setEditUserData] = useState<any>(null);

  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  // Fonction pour mettre à jour l'URL et les filtres
  const updateUrlAndFilters = (params: {
    profile?: string | null;
    page?: number;
    search?: string;
    limit?: number;
  }) => {
    const url = new URL(window.location.href);

    // Mise à jour des paramètres d'URL
    if (params.profile) {
      url.searchParams.set("profile", params.profile.toString());
    } else {
      url.searchParams.delete("profile");
    }

    if (params.page && params.page > 1) {
      url.searchParams.set("page", params.page.toString());
    } else {
      url.searchParams.delete("page");
    }

    if (params.search) {
      url.searchParams.set("search", params.search);
    } else {
      url.searchParams.delete("search");
    }

    if (params.limit && params.limit !== 10) {
      url.searchParams.set("limit", params.limit.toString());
    } else {
      url.searchParams.delete("limit");
    }

    // Mise à jour de l'URL sans rechargement
    window.history.pushState({}, "", url.toString());

    // Appel à l'API avec les paramètres
    const apiParams: any = {
      page: params.page || 1,
      limit: params.limit || 10,
    };

    if (params.search) {
      apiParams.search = params.search;
    }

    if (params.profile) {
      apiParams.profile = params.profile;
    }

    dispatch(fetchUsers(apiParams));
  };

  // Gestionnaire de changement de profil
  const handleProfileChange = (profileId: string | null) => {
    setSelectedProfile(profileId);
    setCurrentPage(1);
    updateUrlAndFilters({
      profile: profileId,
      page: 1,
      search: searchTerm,
      limit: itemsPerPage,
    });
  };

  // Gestionnaire de recherche
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateUrlAndFilters({
      profile: selectedProfile,
      page: 1,
      search: value,
      limit: itemsPerPage,
    });
  };

  // Gestionnaire de changement de page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    dispatch(
      fetchUsers({
        search: searchTerm,
        page: pageNumber,
        limit: itemsPerPage,
      })
    );
  };

  // Gestionnaire de changement d'items par page
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    dispatch(
      fetchUsers({
        search: searchTerm,
        page: 1,
        limit: value,
      })
    );
  };

  // Effet pour initialiser les filtres depuis l'URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const profileParam = searchParams.get("profile");
    const pageParam = parseInt(searchParams.get("page") || "1");
    const searchParam = searchParams.get("search") || "";
    const limitParam = parseInt(searchParams.get("limit") || "10");

    setSelectedProfile(profileParam);
    setCurrentPage(pageParam);
    setSearchTerm(searchParam);
    setItemsPerPage(limitParam);

    const apiParams: any = {
      page: pageParam,
      limit: limitParam,
    };

    if (searchParam) {
      apiParams.search = searchParam;
    }

    if (profileParam) {
      apiParams.profile = profileParam;
    }

    dispatch(fetchUsers(apiParams));
  }, []);

  useEffect(() => {
    if (users) {
      let filtered = [...users];
      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.matricule.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (selectedTag !== "all") {
        filtered = filtered.filter((item) => item.profile === selectedTag);
      }
      setFilteredItems(filtered);
    }
  }, [searchTerm, selectedTag, users]);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDirectionRegionales());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDirectionRegionales());
  }, [dispatch]);

  useEffect(() => {
    if (editUserData?.directionRegionales?.length > 0) {
      const drIds = editUserData?.directionRegionales.map((dr: any) => dr?.id);
      dispatch(fetchSecteurs(drIds))
        .unwrap()
        .then((secteurs) => {
          const secteurOptions = secteurs?.map((secteur: any) => ({
            value: secteur?.id,
            label: secteur?.name,
          }));
          setAvailableSecteurs(secteurOptions);
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des secteurs :", error);
        });
    } else {
      setAvailableSecteurs([]);
    }
  }, [editUserData?.directionRegionales, dispatch]);

  const confirmDeleteUser = (user: User) => {
    if (!user?.id) {
      console.error("ID utilisateur manquant !");
      return;
    }
    dispatch(fetchUserDelete(user?.id))
      .unwrap()
      .then((data) => {
        setFilteredItems(filteredItems?.filter((u) => u?.id !== data?.id));
        setIsDeleteUserModal(false);
      })
      .catch((error) => {
        console.error(
          "Erreur lors du chargement des données utilisateur :",
          error
        );
        Swal.fire("Erreur", "Impossible de supprimer l'utilisateur.", "error");
      });
  };

  const [availableDirections, setAvailableDirections] = useState<Option[]>([]);
  const [availableSecteurs, setAvailableSecteurs] = useState<Option[]>([]);
  const [profils, setProfils] = useState<Option[]>([]);
  const [accountInfo, setAccountInfo] = useState({
    matricule: "",
    profil: "",
    dr: [] as Option[],
    secteur: [] as Option[],
  });

  const profileData: any = useSelector(
    (state: TRootState) => state?.profile?.data
  );

  const drData: any = useSelector((state: TRootState) => state?.dr?.data);
  const secteurData: any = useSelector(
    (state: TRootState) => state?.secteur?.data
  );

  useEffect(() => {
    if (drData) {
      const directions = [
        {
          value: "all",
          label:
            drData?.length === availableDirections?.length - 1
              ? "Tout désélectionner"
              : "Tout sélectionner",
        },
        ...drData?.map((dr: any) => ({
          value: dr?.id,
          label: `${dr?.code} - ${dr?.name?.trim()}`,
        })),
      ];
      setAvailableDirections(directions);
    }
  }, [drData, drData?.length, availableDirections?.length]);

  useEffect(() => {
    if (profileData) {
      const profile = profileData?.map((profil: any) => ({
        value: profil?.id,
        label: `${profil?.name?.trim()}`,
      }));
      setProfils(profile);
    }
  }, [profileData]);

  useEffect(() => {
    if (drData?.length > 0) {
      const drIds = drData?.map((dr: any) => Number(dr?.value));
      dispatch(fetchSecteurs(drIds));
    } else {
      setAvailableSecteurs([]);
    }
  }, [drData, dispatch]);

  useEffect(() => {
    if (secteurData) {
      const secteurs = [
        {
          value: "all",
          label:
            accountInfo?.secteur?.length === secteurData?.length
              ? "Tout désélectionner"
              : "Tout sélectionner",
        },
        ...secteurData?.map((secteur: any) => ({
          value: secteur?.id,
          label: secteur?.name,
        })),
      ];
      setAvailableSecteurs(secteurs);
    }
  }, [secteurData, accountInfo.secteur]);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedUserForToggle, setSelectedUserForToggle] = useState<{
    id: number;
    currentStatus: number;
  } | null>(null);

  const openConfirmToggleModal = (userId: number, currentStatus: number) => {
    setSelectedUserForToggle({ id: userId, currentStatus });
    setIsConfirmModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedUserForToggle) return;

    try {
      const { id: userId, currentStatus } = selectedUserForToggle;
      const endpoint = currentStatus === 1 ? "deactivate" : "activate";
      const response: any = await axiosInstance.patch(
        `${API_AUTH_SUIVI}/users/${userId}/${endpoint}`
      );

      if (!response.data.error) {
        Toastify(
          "success",
          `Utilisateur ${
            currentStatus === 1 ? "désactivé" : "activé"
          } avec succès`
        );

        // Rafraîchir la liste des utilisateurs
        dispatch(fetchUsers({}));
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("Erreur lors du changement de statut:", error);
      Toastify(
        "error",
        error.response?.data?.message || "Erreur lors du changement de statut"
      );
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedUserForToggle(null);
    }
  };

  const updateUser = async () => {
    if (!editUserData?.id) {
      Swal.fire("Erreur", "ID utilisateur manquant.", "error");
      return;
    }

    const userData = {
      email: editUserData?.email,
      firstname: editUserData?.firstname,
      lastname: editUserData?.lastname,
      matricule: editUserData?.matricule,
      poste: editUserData?.poste,
      phoneNumber: editUserData?.phoneNumber,
      profileId: editUserData?.profile?.id || 1, // Utiliser un profil par défaut si non défini
      directionRegionales: editUserData?.directionRegionales
        .map((dr: any) => ({ id: dr?.id }))
        .filter((dr: any) => dr?.id !== undefined), // S'assurer que `id` existe
      secteurs: editUserData?.secteurs
        .map((secteur: any) => ({ id: secteur?.id }))
        .filter((secteur: any) => secteur?.id !== undefined), // S'assurer que `id` existe
    };

    try {
      const resultAction = await dispatch(
        fetchupdateUser({ userId: editUserData?.id, userData })
      ).unwrap();

      Swal.fire(
        "Succès",
        resultAction?.message || "Utilisateur mis à jour avec succès.",
        "success"
      );
      setAddUserModal(false);
      dispatch(
        fetchUsers({
          search: searchTerm,
          page: currentPage,
          limit: itemsPerPage,
        })
      ); // Rafraîchir la liste des utilisateurs
    } catch (error: any) {
      Swal.fire(
        "Erreur",
        error || "Erreur lors de la mise à jour de l'utilisateur.",
        "error"
      );
    }
  };

  const handleSelectAllDR = () => {
    if (editUserData?.directionRegionales?.length === drData?.length) {
      // Si toutes les DR sont sélectionnées, on désélectionne tout et on vide les secteurs
      setEditUserData({
        ...editUserData,
        directionRegionales: [],
        secteurs: [],
      });
      setAvailableSecteurs([]); // Réinitialiser les secteurs
    } else {
      // Sinon, on sélectionne toutes les DR disponibles
      const selectedDRs = drData?.map((dr: any) => ({
        id: dr?.id,
        code: dr?.code,
        name: dr?.name,
      }));

      setEditUserData({ ...editUserData, directionRegionales: selectedDRs });

      // Récupérer les exploitations associées aux DR sélectionnées
      const drIds = selectedDRs.map((dr: any) => dr.id);
      dispatch(fetchSecteurs(drIds))
        .unwrap()
        .then((secteurs) => {
          const secteurOptions = secteurs?.map((secteur: any) => ({
            value: secteur?.id,
            label: secteur?.name,
          }));
          setAvailableSecteurs(secteurOptions);
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des secteurs :", error);
        });
    }
  };

  const handleSelectAllSecteurs = () => {
    if (editUserData?.secteurs?.length === availableSecteurs.length) {
      // Si tout est sélectionné, on désélectionne tout
      setEditUserData({ ...editUserData, secteurs: [] });
    } else {
      // Sinon, on sélectionne toutes les exploitations disponibles
      const selectedSecteurs = availableSecteurs.map((secteur) => ({
        id: secteur.value,
        name: secteur.label,
      }));

      setEditUserData({ ...editUserData, secteurs: selectedSecteurs });
    }
  };

  const refreshUsers = () => {
    dispatch(
      fetchUsers({
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
      })
    );
  };

  const renderLimitedItems = (items: string | string[], id: number): any => {
    const itemList = Array.isArray(items)
      ? items.flatMap((item) => item.split(", "))
      : items.split(", ");

    if (itemList.length <= 3) {
      return itemList.join(", ");
    }

    return (
      <div className="group relative">
        <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          +{itemList.length}
        </span>
        <div
          className={`absolute z-50 hidden w-max max-w-xs rounded bg-gray-700 p-3 text-xs text-white group-hover:block`}
          style={{ top: "-50px", left: "0" }}
        >
          {itemList.join(", ")}
        </div>
      </div>
    );
  };

  const editUser = (user: User) => {
    if (!user?.id) {
      console.error("ID utilisateur manquant !");
      return;
    }

    dispatch(fetchUsersgetpatch(user.id))
      .unwrap()
      .then((data) => {
        setEditUserData(data);
        setAddUserModal(true);
      })
      .catch((error) => {
        console.error(
          "Erreur lors du chargement des données utilisateur :",
          error
        );
        Swal.fire(
          "Erreur",
          "Impossible de charger les données de l'utilisateur.",
          "error"
        );
      });
  };

  const loadingUpdate = useSelector(
    (state: TRootState) => state.userUpdate.loading
  );

  return (
    <>
      <div>
        {/* Section des filtres */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
          {/* En-tête avec titre et bouton d'action */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 dark:border-gray-700">
            {/* Titre et icône */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                <IconSearch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Gestion des utilisateurs
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Gérez et organisez les utilisateurs du système
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  dispatch(
                    fetchUsers({
                      search: searchTerm,
                      page: currentPage,
                      limit: itemsPerPage,
                    })
                  );
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-all duration-200 hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 active:bg-primary/80 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-primary"
              >
                <IconRefresh className="h-4 w-4" />
                <span>Actualiser</span>
              </button>
              <Link
                href="/utilisateur/add"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 active:bg-primary/80"
              >
                <IconPlus className="h-4 w-4" strokeWidth={2.5} />
                <span>Ajouter un utilisateur</span>
              </Link>
            </div>
          </div>
          {/* Conteneur des filtres */}
          <div className="space-y-6">
            {/* Barre de recherche */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-600 transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-400">
                <IconSearch className="h-5 w-5" />
              </div>
            </div>

            {/* Filtres par profil */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="rounded-lg bg-primary/10 p-1.5">
                  <IconUser className="h-4 w-4 text-primary" />
                </span>
                Filtrer par profil
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleProfileChange(null)}
                  className={`relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    !selectedProfile
                      ? "bg-primary text-white shadow-md hover:shadow-lg"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Tous les profils
                  {!selectedProfile && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
                      ✓
                    </span>
                  )}
                </button>
                {ProfilList?.map((profile: any) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleProfileChange(profile.id.toString())}
                    className={`relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      selectedProfile === profile.id.toString()
                        ? "bg-primary text-white shadow-md hover:shadow-lg"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {profile.name}
                    {selectedProfile === profile.id.toString() && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Options de pagination */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-primary/10 p-1.5">
                  <IconLayoutGrid className="h-4 w-4 text-primary" />
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                >
                  <option value="5">5 par page</option>
                  <option value="10">10 par page</option>
                  <option value="20">20 par page</option>
                  <option value="50">50 par page</option>
                </select>
              </div>

              {/* Bouton de réinitialisation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedProfile(null);
                    setItemsPerPage(10);
                    updateUrlAndFilters({
                      search: "",
                      profile: null,
                      page: 1,
                      limit: 10,
                    });
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                >
                  <IconRefresh className="h-4 w-4" />
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        {loading ? (
          <div className="grid min-h-[400px] place-content-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-l-transparent"></div>
              <p className="font-medium text-primary">Chargement en cours...</p>
            </div>
          </div>
        ) : (
          <>
            {value === "list" ? (
              <div className="panel mt-5">
                <div className="table-responsive">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Matricule
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Nom
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Prénom
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Poste
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Téléphone
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Profil
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Directions Régionales
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Secteurs
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Statut
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                      {filteredItems.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-900"
                              : "bg-gray-50 dark:bg-gray-800"
                          }`}
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                            {user.matricule}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                            {user.lastname}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                            {user.firstname}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                            {user.poste}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                            {user.phoneNumber}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                              {user.profile}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                            {renderLimitedItems(
                              user.directionRegionales,
                              user.id
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                            {renderLimitedItems(user.secteurs, user.id)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                            {user.isActif === 1 ? (
                              <span className="text-green-600">Actif</span>
                            ) : (
                              <span className="text-red-600">Inactif</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                                onClick={() => editUser(user)}
                              >
                                Modifier
                              </button>
                              <button
                                type="button"
                                className={clsx(
                                  "group relative flex items-center justify-center rounded-full p-2.5 transition-all duration-200",
                                  user.isActif === 1
                                    ? "bg-red-100/80 text-red-600 hover:bg-red-200 hover:shadow-md"
                                    : "bg-emerald-100/80 text-emerald-600 hover:bg-emerald-200 hover:shadow-md"
                                )}
                                onClick={() =>
                                  openConfirmToggleModal(user.id, user.isActif)
                                }
                                title={
                                  user.isActif === 1
                                    ? "Désactiver l'utilisateur"
                                    : "Activer l'utilisateur"
                                }
                              >
                                <div className="flex items-center justify-center w-8 h-8 relative">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    {user.isActif === 1 ? (
                                      <IconLock className="h-5 w-5" />
                                    ) : (
                                      <IconLockOpen className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div className="absolute -top-1 -right-1">
                                    <div className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                      user.isActif === 1
                                        ? 'bg-red-500'
                                        : 'bg-emerald-500'
                                    } text-[10px] font-bold text-white`}>
                                      {user.isActif === 1 ? '✕' : '✓'}
                                    </div>
                                  </div>
                                </div>
                              </button>
                              {/* <button
                                type="button"
                                className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white"
                                onClick={() => {
                                  setSelectedUserToDelete(user);
                                  setIsDeleteUserModal(true);
                                }}
                              >
                                Supprimer
                              </button> */}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mt-5 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredItems.map((user) => (
                  <div
                    key={user.id}
                    className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl dark:bg-[#1c232f]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                    <div className="relative px-6 pb-24 pt-6">
                      <div className="mb-6 flex justify-center">
                        <div className="relative">
                          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-primary/30">
                            <IconUser className="h-12 w-12" />
                          </div>
                          <div className="absolute -bottom-2 -right-2">
                            <span className="inline-flex rounded-full bg-success px-2 py-1 text-xs font-medium text-white">
                              {user.profile}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {user.firstname} {user.lastname}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {user.matricule}
                        </p>
                      </div>
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <span className="flex-1 truncate text-gray-600 dark:text-gray-300">
                            {user.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 011.21-.502l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          <span className="flex-1 text-gray-600 dark:text-gray-300">
                            {user.phoneNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m-9 0a2 2 0 012-2v-6a2 2 0 012-2v6a2 2 0 012 2v6a2 2 0 012-2v-6a2 2 0 012-2z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 text-gray-600 dark:text-gray-300">
                            {renderLimitedItems(
                              user.directionRegionales,
                              user.id
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <button
                        type="button"
                        className="flex-1 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                        onClick={() => editUser(user)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className={clsx(
                          "group relative flex items-center justify-center rounded-full p-2.5 transition-all duration-200",
                          user.isActif === 1
                            ? "bg-red-100/80 text-red-600 hover:bg-red-200 hover:shadow-md"
                            : "bg-emerald-100/80 text-emerald-600 hover:bg-emerald-200 hover:shadow-md"
                        )}
                        onClick={() =>
                          openConfirmToggleModal(user.id, user.isActif)
                        }
                        title={
                          user.isActif === 1
                            ? "Désactiver l'utilisateur"
                            : "Activer l'utilisateur"
                        }
                      >
                        <div className="flex items-center justify-center w-8 h-8 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            {user.isActif === 1 ? (
                              <IconLock className="h-5 w-5" />
                            ) : (
                              <IconLockOpen className="h-5 w-5" />
                            )}
                          </div>
                          <div className="absolute -top-1 -right-1">
                            <div className={`flex h-4 w-4 items-center justify-center rounded-full ${
                              user.isActif === 1
                                ? 'bg-red-500'
                                : 'bg-emerald-500'
                            } text-[10px] font-bold text-white`}>
                              {user.isActif === 1 ? '✕' : '✓'}
                            </div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        className="flex-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white"
                        onClick={() => {
                          setSelectedUserToDelete(user);
                          setIsDeleteUserModal(true);
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de{" "}
                    <span className="font-medium">
                      {((pagination?.currentPage || 1) - 1) * itemsPerPage + 1}
                    </span>{" "}
                    à{" "}
                    <span className="font-medium">
                      {Math.min(
                        (pagination?.currentPage || 1) * itemsPerPage,
                        pagination?.totalCount || 0
                      )}
                    </span>{" "}
                    sur{" "}
                    <span className="font-medium">
                      {pagination?.totalCount || 0}
                    </span>{" "}
                    résultats
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Navigation de pagination */}
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === 1 ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="sr-only">Précédent</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 011.04 1.08l-4.5 4.25a.75.75 0 010 1.08l4.5-4.25a.75.75 0 011.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Pages */}
                    {Array.from(
                      {
                        length: Math.ceil(
                          (pagination?.totalCount || 0) / itemsPerPage
                        ),
                      },
                      (_, i) => i + 1
                    )
                      .filter(
                        (pageNum) =>
                          pageNum === 1 ||
                          pageNum ===
                            Math.ceil(
                              (pagination?.totalCount || 0) / itemsPerPage
                            ) ||
                          (pageNum >= currentPage - 1 &&
                            pageNum <= currentPage + 1)
                      )
                      .map((pageNum, index, array) => (
                        <React.Fragment key={pageNum}>
                          {index > 0 && array[index - 1] !== pageNum - 1 && (
                            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === pageNum
                                ? "z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil((pagination?.totalCount || 0) / itemsPerPage)
                      }
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage ===
                        Math.ceil((pagination?.totalCount || 0) / itemsPerPage)
                          ? "cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <span className="sr-only">Suivant</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 011.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Transition appear show={isDeleteUserModal} as={Fragment}>
        <Dialog
          as="div"
          open={isDeleteUserModal}
          onClose={() => setIsDeleteUserModal(false)}
          className="relative z-50"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl dark:bg-[#1c232f]">
                  <div className="relative border-b border-gray-200 bg-[#fbfbfb] px-6 py-4 dark:border-gray-700 dark:bg-[#121c2c]">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-white">
                        Supprimer l'utilisateur
                      </Dialog.Title>
                      <button
                        type="button"
                        onClick={() => setIsDeleteUserModal(false)}
                        className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      >
                        <IconX className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 rounded-lg bg-red-50 p-4 dark:bg-red-500/10">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                        <svg
                          className="h-6 w-6 text-red-600 dark:text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                          Confirmation de suppression
                        </h3>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                          Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                          <span className="font-semibold">
                            {selectedUserToDelete?.firstname}{" "}
                            {selectedUserToDelete?.lastname}
                          </span>
                          ?
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Cette action est irréversible. Toutes les données
                      associées à cet utilisateur seront définitivement
                      supprimées.
                    </p>
                    <div className="mt-6 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className="btn btn-outline-danger px-6"
                        onClick={() => setIsDeleteUserModal(false)}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger px-6"
                        onClick={() =>
                          selectedUserToDelete &&
                          confirmDeleteUser(selectedUserToDelete)
                        }
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={addUserModal} as={Fragment}>
        <Dialog
          as="div"
          open={addUserModal}
          onClose={() => setAddUserModal(false)}
          className="relative z-50"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-[#1c232f]">
                  <div className="relative border-b border-gray-200 bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 dark:border-gray-700 dark:from-primary/20 dark:to-primary/30">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
                        <IconUserPlus className="h-6 w-6 text-primary" />
                        {editUserData
                          ? "Modifier l'utilisateur"
                          : "Ajouter un utilisateur"}
                      </Dialog.Title>
                      <button
                        type="button"
                        onClick={() => setAddUserModal(false)}
                        className="rounded-full p-2 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                      >
                        <IconX className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
                    <form className="grid grid-cols-2 gap-6">
                      {/* Colonne gauche */}
                      <div className="space-y-5">
                        {/* Informations personnelles */}
                        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md dark:bg-gray-800/50">
                          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                            <div className="rounded-lg bg-primary/10 p-2 dark:bg-primary/20">
                              <IconUser className="h-5 w-5 text-primary" />
                            </div>
                            Informations personnelles
                          </h3>

                          <div className="mt-5 space-y-4">
                            <div>
                              <label
                                htmlFor="matricule"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                <div className="flex items-center gap-1">
                                  <IconId className="h-4 w-4 text-gray-400" />
                                  Matricule{" "}
                                  <span className="text-red-500">*</span>
                                </div>
                              </label>
                              <input
                                id="matricule"
                                type="text"
                                placeholder="Entrez le matricule"
                                className="form-input w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                value={editUserData?.matricule || ""}
                                onChange={(e) =>
                                  setEditUserData({
                                    ...editUserData,
                                    matricule: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label
                                  htmlFor="lastname"
                                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  <div className="flex items-center gap-1">
                                    <IconSignature className="h-4 w-4 text-gray-400" />
                                    Nom <span className="text-red-500">*</span>
                                  </div>
                                </label>
                                <input
                                  id="lastname"
                                  type="text"
                                  placeholder="Entrez le nom"
                                  className="form-input w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                  value={editUserData?.lastname || ""}
                                  onChange={(e) =>
                                    setEditUserData({
                                      ...editUserData,
                                      lastname: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="firstname"
                                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  <div className="flex items-center gap-1">
                                    <IconSignature className="h-4 w-4 text-gray-400" />
                                    Prénom{" "}
                                    <span className="text-red-500">*</span>
                                  </div>
                                </label>
                                <input
                                  id="firstname"
                                  type="text"
                                  placeholder="Entrez le prénom"
                                  className="form-input w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                  value={editUserData?.firstname || ""}
                                  onChange={(e) =>
                                    setEditUserData({
                                      ...editUserData,
                                      firstname: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Coordonnées */}
                        <div className="space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                            <IconBook className="h-5 w-5 text-primary" />
                            Coordonnées
                          </h3>

                          <div className="space-y-3">
                            <div>
                              <label
                                htmlFor="email"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                <div className="flex items-center gap-1">
                                  <IconMail className="h-4 w-4 text-gray-400" />
                                  Email <span className="text-red-500">*</span>
                                </div>
                              </label>
                              <input
                                id="email"
                                type="email"
                                placeholder="exemple@cie.ci"
                                className="form-input w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                value={editUserData?.email || ""}
                                onChange={(e) =>
                                  setEditUserData({
                                    ...editUserData,
                                    email: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="phoneNumber"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                <div className="flex items-center gap-1">
                                  <IconPhone className="h-4 w-4 text-gray-400" />
                                  Téléphone{" "}
                                  <span className="text-red-500">*</span>
                                </div>
                              </label>
                              <input
                                id="phoneNumber"
                                type="text"
                                placeholder="0X XX XX XX XX"
                                className="form-input w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                value={editUserData?.phoneNumber || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^\d{0,10}$/.test(value)) {
                                    setEditUserData({
                                      ...editUserData,
                                      phoneNumber: value,
                                    });
                                  }
                                }}
                              />
                              {editUserData?.phoneNumber &&
                                editUserData.phoneNumber.length !== 10 && (
                                  <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                    <IconAlertCircle className="h-4 w-4" />
                                    Le numéro doit contenir exactement 10
                                    chiffres
                                  </p>
                                )}
                            </div>

                            <div>
                              <label
                                htmlFor="poste"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                <div className="flex items-center gap-1">
                                  <IconBuildingStore className="h-4 w-4 text-gray-400" />
                                  Poste
                                </div>
                              </label>
                              <input
                                id="poste"
                                type="text"
                                placeholder="Entrez le poste"
                                className="form-input w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                value={editUserData?.poste || ""}
                                onChange={(e) =>
                                  setEditUserData({
                                    ...editUserData,
                                    poste: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Colonne droite */}
                      <div className="space-y-4">
                        {/* Profil */}
                        <div className="space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                            <IconUserCircle className="h-5 w-5 text-primary" />
                            Profil
                          </h3>

                          <div>
                            <label
                              htmlFor="profile"
                              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              <div className="flex items-center gap-1">
                                <IconUserCircle className="h-4 w-4 text-gray-400" />
                                Profil <span className="text-red-500">*</span>
                              </div>
                            </label>
                            <Select
                              id="profile"
                              placeholder="Choisir un profil"
                              options={profils}
                              value={profils.find(
                                (p) => p.value === editUserData?.profile?.id
                              )}
                              onChange={(option) =>
                                setEditUserData({
                                  ...editUserData,
                                  profile: {
                                    id: option?.value,
                                    name: option?.label,
                                  },
                                })
                              }
                              isClearable
                              className="text-sm"
                            />
                          </div>
                        </div>

                        {/* Affectations */}
                        <div className="space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                            <IconBuilding className="h-5 w-5 text-primary" />
                            Affectations
                          </h3>

                          <div className="space-y-3">
                            <div>
                              <label
                                htmlFor="directions"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                <div className="flex items-center gap-1">
                                  <IconBuildingSkyscraper className="h-4 w-4 text-gray-400" />
                                  Directions Régionales{" "}
                                  <span className="text-red-500">*</span>
                                </div>
                              </label>
                              <div className="relative">
                                <Select
                                  id="directions"
                                  placeholder="Choisir une direction régionale"
                                  options={[
                                    {
                                      value: "all",
                                      label:
                                        editUserData?.directionRegionales
                                          ?.length === drData.length
                                          ? "Tout désélectionner"
                                          : "Tout sélectionner",
                                    },
                                    ...availableDirections.filter(
                                      (option) => option.value !== "all"
                                    ),
                                  ]}
                                  value={editUserData?.directionRegionales.map(
                                    (dr: any) => ({
                                      value: dr.id,
                                      label: `${dr.code} - ${dr.name}`,
                                    })
                                  )}
                                  isMulti
                                  onChange={(selectedOptions) => {
                                    if (
                                      selectedOptions.some(
                                        (option) => option.value === "all"
                                      )
                                    ) {
                                      handleSelectAllDR();
                                    } else {
                                      const selectedDRs = selectedOptions.map(
                                        (option: any) => ({
                                          id: option.value,
                                          code: option.label.split(" - ")[0],
                                          name: option.label.split(" - ")[1],
                                        })
                                      );

                                      setEditUserData({
                                        ...editUserData,
                                        directionRegionales: selectedDRs,
                                        secteurs:
                                          selectedDRs.length === 0
                                            ? []
                                            : editUserData.secteurs,
                                      });

                                      if (selectedDRs.length > 0) {
                                        const drIds = selectedDRs.map(
                                          (dr) => dr.id
                                        );
                                        dispatch(fetchSecteurs(drIds))
                                          .unwrap()
                                          .then((secteurs) => {
                                            const secteurOptions = secteurs.map(
                                              (secteur: any) => ({
                                                value: secteur.id,
                                                label: secteur.name,
                                              })
                                            );
                                            setAvailableSecteurs(
                                              secteurOptions
                                            );
                                          })
                                          .catch((error) =>
                                            console.error(
                                              "Erreur lors du chargement des secteurs :",
                                              error
                                            )
                                          );
                                      } else {
                                        setAvailableSecteurs([]);
                                      }
                                    }
                                  }}
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor="secteurs"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                <div className="flex items-center gap-1">
                                  <IconBuildingCommunity className="h-4 w-4 text-gray-400" />
                                  Secteurs{" "}
                                  <span className="text-red-500">*</span>
                                </div>
                              </label>
                              <div className="relative">
                                <Select
                                  id="secteurs"
                                  placeholder="Choisir un secteur"
                                  options={[
                                    {
                                      value: "all",
                                      label:
                                        editUserData?.secteurs?.length ===
                                        availableSecteurs.length
                                          ? "Tout désélectionner"
                                          : "Tout sélectionner",
                                    },
                                    ...availableSecteurs.filter(
                                      (option) => option.value !== "all"
                                    ),
                                  ]}
                                  value={editUserData?.secteurs.map(
                                    (secteur: any) => ({
                                      value: secteur.id,
                                      label: secteur.name,
                                    })
                                  )}
                                  isMulti
                                  onChange={(selectedOptions) => {
                                    if (
                                      selectedOptions.some(
                                        (option) => option.value === "all"
                                      )
                                    ) {
                                      handleSelectAllSecteurs();
                                    } else {
                                      setEditUserData({
                                        ...editUserData,
                                        secteurs: selectedOptions.map(
                                          (option: any) => ({
                                            id: option.value,
                                            name: option.label,
                                          })
                                        ),
                                      });
                                    }
                                  }}
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>

                    {/* Boutons d'action */}
                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => setAddUserModal(false)}
                        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <IconX className="h-4 w-4" />
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={updateUser}
                        disabled={loadingUpdate}
                        className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 active:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <IconDeviceFloppy className="h-4 w-4 transition-transform group-hover:scale-110" />
                        {loadingUpdate
                          ? "Modification en cours..."
                          : "Modifier"}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isConfirmModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsConfirmModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Confirmation
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Êtes-vous sûr de vouloir{" "}
                      {selectedUserForToggle?.currentStatus === 1
                        ? "désactiver"
                        : "activer"}{" "}
                      cet utilisateur ?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={() => setIsConfirmModalOpen(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleToggleStatus}
                    >
                      Confirmer
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ComponentsAppsUsers;
