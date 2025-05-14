"use client";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteParametre,
  createParametre,
  updateParametre,
} from "@/store/reducers/parametres/parametre.slice";
import { fetchBanques } from "@/store/reducers/select/banque.slice";
import IconPlus from "@/components/icon/icon-plus";
import IconPencil from "@/components/icon/icon-pencil";
import IconTrash from "@/components/icon/icon-trash";
import IconRefresh from "@/components/icon/icon-refresh";
import IconSettings from "@/components/icon/icon-settings";
import IconSearch from "@/components/icon/icon-search";
import { TAppDispatch, TRootState } from "@/store";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axios";
import { API_AUTH_SUIVI } from "@/config/constants";

interface Banque {
  libelle: string;
  id?: number;
}

interface Parametre {
  id: number;
  email: string;
  description: string;
  banque?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  count: number;
  totalCount: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 6;

const Parametre = () => {
  const dispatch = useDispatch<TAppDispatch>();

  const banquesData = useSelector((state: TRootState) => state.Banques?.data);
  const banquesLoading = useSelector((state: TRootState) => state.Banques?.loading);
  const banquesError = useSelector((state: TRootState) => state.Banques?.error);

  // Convertir les données des banques en tableau et s'assurer qu'elles ont le bon format
  const banques = Array.isArray(banquesData) ? banquesData as Banque[] : [] as Banque[];

  // Debug log pour voir les données des banques
  console.log("Banques disponibles:", banques.length, banquesData);

  // États pour les paramètres chargés directement avec axios
  const [parametres, setParametres] = useState<Parametre[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentParam, setCurrentParam] = useState<Parametre | null>(null);
  const [paramToDelete, setParamToDelete] = useState<Parametre | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    description: "MAIL_ADDRESS",
    banque: "",
  });

  // États pour la recherche de banque
  const [banqueSearchTerm, setBanqueSearchTerm] = useState("");
  const [showBanqueDropdown, setShowBanqueDropdown] = useState(false);
  const banqueDropdownRef = useRef<HTMLDivElement>(null);

  // Filtrer les banques en fonction du terme de recherche
  const filteredBanques = banques.filter(banque =>
    banque.libelle.toLowerCase().includes(banqueSearchTerm.toLowerCase())
  );

  // Vérifier si le dropdown des banques s'affiche
  useEffect(() => {
    if (showModal && showBanqueDropdown) {
      console.log("État du dropdown des banques:", {
        showBanqueDropdown,
        filteredBanquesCount: filteredBanques.length,
        searchTerm: banqueSearchTerm
      });
    }
  }, [showModal, showBanqueDropdown, filteredBanques.length, banqueSearchTerm]);

  // Sélectionner une banque depuis le dropdown
  const handleSelectBanque = (banque: Banque) => {
    console.log("Banque sélectionnée:", banque.libelle);

    // Mettre à jour formData avec la nouvelle valeur de banque de manière synchrone
    setFormData({
      ...formData,
      banque: banque.libelle
    });

    console.log("Nouveau formData après sélection:", {
      ...formData,
      banque: banque.libelle
    });

    // Mettre à jour le terme de recherche pour afficher la banque sélectionnée
    setBanqueSearchTerm(banque.libelle);

    // Fermer le dropdown après la sélection
    setShowBanqueDropdown(false);
  };

  // Fonction pour charger les paramètres directement avec axios
  const fetchParametresDirectly = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `${API_AUTH_SUIVI}/email-receiver/list-paginate${page > 1 ? `?page=${page}` : ''}`
      );

      if (response && response.data && response.data.result) {
        console.log("Données reçues de l'API:", response.data.result);
        setParametres(response.data.result);
        setPagination(response.data.pagination);
      } else {
        setParametres([]);
        setError("Format de réponse inattendu");
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des paramètres:", err);
      setError(err.message || "Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les banques si nécessaire
  const loadBanques = async () => {
    // Toujours recharger les banques depuis l'API
    console.log("Chargement des banques depuis l'API...");
    try {
      await dispatch(fetchBanques()).unwrap();
      console.log("Banques chargées avec succès:", banquesData);
    } catch (err: any) {
      console.error("Erreur lors du chargement des banques:", err);
      toast.error("Erreur lors du chargement des banques. Veuillez réessayer.");
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchParametresDirectly(currentPage);
        await loadBanques();
      } catch (err: any) {
        console.error("Erreur lors du chargement initial des données:", err);
        toast.error(err.message || "Erreur lors du chargement des données");
      }
    };

    loadInitialData();

    // Rafraîchir périodiquement
    // const refreshInterval = setInterval(() => {
    //   fetchParametresDirectly(currentPage);
    // }, 300000); // 5 minutes

    // return () => {
    //   clearInterval(refreshInterval);
    // };
  }, [dispatch]);

  // Recharger les données quand la page change
  useEffect(() => {
    fetchParametresDirectly(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAdd = () => {
    setCurrentParam(null);
    setFormData({ email: "", description: "", banque: "" });
    setBanqueSearchTerm("");
    setShowModal(true);
    // Ne pas ouvrir le dropdown immédiatement lors de l'ajout
    setShowBanqueDropdown(false);
  };

  const handleEdit = (param: Parametre) => {
    setCurrentParam(param);
    const banqueValue = param.banque || "";
    console.log("Édition avec banque:", banqueValue);

    setFormData({
      email: param.email,
      description: param.description || "",
      banque: banqueValue,
    });

    setBanqueSearchTerm(banqueValue);
    setShowModal(true);

    // Force la liste à être rechargée et visible avec un court délai
    setTimeout(() => {
      loadBanques().then(() => {
        setShowBanqueDropdown(true);
        console.log("Dropdown forcé à s'ouvrir après chargement des banques");
      });
    }, 300);
  };

  const handleDeleteClick = (param: Parametre) => {
    setParamToDelete(param);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (paramToDelete) {
      try {
        await dispatch(deleteParametre(paramToDelete.id)).unwrap();
        toast.success("Paramètre supprimé avec succès");
        fetchParametresDirectly(currentPage);
        setShowDeleteModal(false);
        setParamToDelete(null);
      } catch (err: any) {
        console.error("Erreur lors de la suppression:", err);
        toast.error(
          err.message || "Une erreur est survenue lors de la suppression"
        );
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setParamToDelete(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentParam(null);
  };

  const handleRefresh = () => {
    fetchParametresDirectly(currentPage);
    dispatch(fetchBanques());
    toast.info("Liste des paramètres actualisée");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("L'adresse email est requise");
      return;
    }

    // Déboguer les valeurs du formulaire avant soumission
    console.log("Soumission du formulaire avec les valeurs:", formData);

    try {
      if (currentParam) {
        // Assurer que banque est définie et non undefined
        const banqueValue = formData.banque ? formData.banque : null;

        console.log("Valeur de banque avant envoi:", formData.banque, "→", banqueValue);

        // Pour la modification, construire un payload explicite
        const updatePayload = {
          id: currentParam.id,
          email: formData.email.toLowerCase(),
          description: formData.description || "MAIL_ADDRESS",
          banque: banqueValue  // Utiliser la valeur préparée
        };

        // Log du payload avant envoi
        console.log("Envoi de la mise à jour avec payload:", updatePayload);

        try {
          // Appel direct à l'API pour vérifier que tout fonctionne
          const response = await axiosInstance.patch(
            `${API_AUTH_SUIVI}/email-receiver/${currentParam.id}`,
            {
              email: formData.email.toLowerCase(),
              description: formData.description || "MAIL_ADDRESS",
              banque: banqueValue
            }
          );
          console.log("Réponse API directe:", response);

          // Rafraîchir les données
          await fetchParametresDirectly(currentPage);

          toast.success("Paramètre modifié avec succès");
          handleModalClose();
        } catch (apiErr: any) {
          console.error("Erreur API directe:", apiErr);
          toast.error(apiErr.message || "Erreur lors de la mise à jour via l'API");
        }
      } else {
        // Pour la création
        const createPayload = {
          email: formData.email.toLowerCase(),
          description: formData.description || "MAIL_ADDRESS",
          banque: formData.banque || undefined
        };

        console.log("Création avec payload:", createPayload);

        await dispatch(createParametre(createPayload)).unwrap();
        toast.success("Paramètre créé avec succès");

        // Rafraîchir la liste après création
        await fetchParametresDirectly(currentPage);
        handleModalClose();
      }
    } catch (err: any) {
      console.error("Erreur lors de la soumission:", err);
      toast.error(err.message || "Une erreur est survenue lors de l'opération");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredParams = parametres.filter((param: { email: string; }) =>
    param.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const showPrevious = pagination.currentPage > 1;
    const showNext = pagination.currentPage < pagination.totalPages;

    return (
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {pagination.currentPage} sur {pagination.totalPages} •{" "}
          {pagination.totalCount} résultat{pagination.totalCount > 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`btn btn-sm ${!showPrevious
              ? "btn-disabled"
              : "btn-outline-primary hover:scale-105"
              }`}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!showPrevious}
          >
            Précédent
          </button>

          <button
            className={`btn btn-sm ${!showNext ? "btn-disabled" : "btn-outline-primary hover:scale-105"
              }`}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!showNext}
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

  // Gérer le clic en dehors du dropdown pour le fermer
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Ne fermer le dropdown que s'il est actuellement ouvert
      if (showBanqueDropdown &&
        banqueDropdownRef.current &&
        !banqueDropdownRef.current.contains(event.target as Node)) {
        console.log("Clic en dehors du dropdown détecté, fermeture");
        setShowBanqueDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBanqueDropdown]); // Dépendance ajoutée pour ne s'activer que lorsque showBanqueDropdown change

  // Quand le modal s'ouvre, s'assurer que les banques sont chargées
  useEffect(() => {
    if (showModal) {
      loadBanques();
    }
  }, [showModal]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="dark:bg-navy-800 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Gestion des Adresses E-mail
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {pagination?.totalCount
                ? `${pagination.totalCount} adresse${pagination.totalCount > 1 ? "s" : ""
                } e-mail enregistrée${pagination.totalCount > 1 ? "s" : ""}`
                : "Aucune adresse e-mail"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une adresse e-mail..."
                className="dark:border-navy-450 dark:focus:border-accent form-input rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <IconSearch className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="btn btn-outline-primary flex items-center gap-2"
              >
                <IconRefresh className="h-5 w-5" />
                <span>Actualiser</span>
              </button>
              <button
                onClick={handleAdd}
                className="btn btn-primary flex items-center gap-2"
              >
                <IconPlus className="h-5 w-5" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="relative h-32 w-32">
              <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
                <div className="h-full w-full rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
              <div className="absolute inset-2 animate-[spin_2s_linear_infinite_reverse]">
                <div className="h-full w-full rounded-full border-4 border-info border-t-transparent"></div>
              </div>
              <div className="absolute inset-4 animate-pulse">
                <IconSettings className="h-24 w-24 text-primary" />
              </div>
            </div>
          </div>
        ) : filteredParams.length === 0 ? (
          <div className="dark:border-navy-600 dark:bg-navy-800 flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white">
            <div className="text-center">
              <IconSettings className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Aucun paramètre trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ?
                  `Aucun résultat pour "${searchTerm}"` :
                  "Commencez par ajouter un nouveau paramètre"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-primary hover:text-primary-dark dark:hover:text-primary-light"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredParams.map((param: Parametre) => (
              <div
                key={param.id}
                className="dark:bg-navy-800 dark:shadow-navy-700/50 group relative overflow-hidden rounded-xl bg-white p-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* En-tête de la carte avec la date de création */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-navy-700 dark:bg-navy-700/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Créé le {new Date(param.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Corps de la carte avec les détails */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="mb-2 font-semibold text-lg text-gray-900 dark:text-white break-all">
                      {param.email}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {param.description}
                    </p>
                  </div>

                  {/* Banque avec badge */}
                  {param.banque && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Banque:</span>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary/20 flex items-center gap-1">
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm12-12v7h3v-7h-3zm6 0v7h3v-7h-3zM11 4L2 9.5V10h19V9.5L12 4h-1z" />
                          </svg>
                          {param.banque}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dernière mise à jour avec horloge */}
                  <div className="mb-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Dernière mise à jour: {new Date(param.updatedAt).toLocaleDateString()}
                      à {new Date(param.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Barre d'actions en bas de la carte */}
                <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-3 dark:border-navy-700 dark:bg-navy-700/30">
                  <button
                    onClick={() => handleEdit(param)}
                    className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/20"
                  >
                    <IconPencil className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteClick(param)}
                    className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/20"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {renderPagination()}
      </div>

      {error && (
        <div className="border-danger-500 bg-danger-50 text-danger-700 mt-4 rounded-lg border p-4">
          <p className="font-medium">Une erreur est survenue</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-danger-100 text-danger-700 hover:bg-danger-200 mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
          >
            <IconRefresh className="h-4 w-4" />
            Réessayer
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[999] overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="dark:bg-navy-800 relative w-full max-w-lg transform rounded-xl bg-white p-8 shadow-2xl transition-all">
              {/* Bouton de fermeture */}
              <button
                onClick={handleModalClose}
                className="dark:hover:bg-navy-600 absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* En-tête */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentParam
                        ? "Modifier l'adresse e-mail"
                        : "Nouvelle adresse e-mail"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {currentParam
                        ? "Modifier les informations de l'adresse e-mail"
                        : "Ajouter une nouvelle adresse e-mail"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                      Adresse e-mail
                    </label>
                    <div className="relative mt-2">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        className="dark:border-navy-450 dark:bg-navy-700 dark:focus:border-accent block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 focus:border-primary focus:ring-primary dark:text-white sm:text-sm"
                        placeholder="exemple@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                      Description
                    </label>
                    <div className="relative mt-2">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M7 8h10M7 12h10M7 16h10" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="description"
                        className="dark:border-navy-450 dark:bg-navy-700 dark:focus:border-accent block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 focus:border-primary focus:ring-primary dark:text-white sm:text-sm"
                        placeholder="Description du paramètre"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Dans la partie du formulaire modal, section du dropdown de banques */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                      Banque
                    </label>
                    <div className="relative mt-2" ref={banqueDropdownRef}>
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm12-12v7h3v-7h-3zm6 0v7h3v-7h-3zM11 4L2 9.5V10h19V9.5L12 4h-1z" />
                        </svg>
                      </div>

                      {/* Champ de saisie pour rechercher une banque */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Sélectionner une banque..."
                          className="dark:border-navy-450 dark:bg-navy-700 dark:focus:border-accent block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-gray-900 focus:border-primary focus:ring-primary dark:text-white sm:text-sm cursor-pointer"
                          value={banqueSearchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            console.log("Changement de valeur de recherche banque:", value);

                            // Mettre à jour le terme de recherche
                            setBanqueSearchTerm(value);

                            // Mettre à jour formData de manière cohérente avec handleSelectBanque
                            setFormData({
                              ...formData,
                              banque: value
                            });

                            // Toujours montrer le dropdown après une recherche
                            setShowBanqueDropdown(true);
                          }}
                          onFocus={() => {
                            // Forcer l'ouverture du dropdown à chaque fois que le champ obtient le focus
                            setShowBanqueDropdown(true);

                            // Si le dropdown est fermé et qu'il y a des banques disponibles, les afficher toutes
                            if (!showBanqueDropdown && banques.length > 0) {
                              setBanqueSearchTerm("");  // Effacer la recherche pour montrer toutes les banques
                            }

                            console.log("Focus sur input, dropdown devrait être visible maintenant");
                          }}
                          // Ajouter un clic explicite pour ouvrir le dropdown
                          onClick={() => {
                            setShowBanqueDropdown(true);
                            // Toujours recharger les banques depuis l'API pour s'assurer d'avoir les dernières données
                            console.log("Chargement des banques lors du clic sur le champ");
                            loadBanques();
                          }}
                        />

                        {/* Bouton pour effacer la sélection */}
                        {banqueSearchTerm && (
                          <button
                            type="button"
                            className="absolute inset-y-0 right-10 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Utiliser la même approche cohérente pour mettre à jour formData
                              console.log("Effacement de la banque sélectionnée");
                              setFormData({
                                ...formData,
                                banque: ""
                              });
                              setBanqueSearchTerm("");
                            }}
                          >
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}

                        {/* Bouton pour ouvrir/fermer le dropdown */}
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowBanqueDropdown(!showBanqueDropdown)}
                        >
                          <svg
                            className={`h-5 w-5 transform transition-transform ${showBanqueDropdown ? 'rotate-180' : ''}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Liste déroulante des banques */}
                      <div
                        className={`absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg max-h-60 overflow-auto dark:bg-navy-700 border dark:border-navy-500 ${showBanqueDropdown ? 'block' : 'hidden'}`}
                      >
                        {banquesLoading ? (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Chargement...
                          </div>
                        ) : banques.length > 0 ? (
                          <>
                            <div className="sticky top-0 bg-gray-50 dark:bg-navy-800 px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 flex justify-between items-center border-b border-gray-100 dark:border-navy-600">
                              <span>
                                {filteredBanques.length} banque{filteredBanques.length > 1 ? 's' : ''} trouvée{filteredBanques.length > 1 ? 's' : ''}
                              </span>
                              {filteredBanques.length !== banques.length && (
                                <button
                                  type="button"
                                  className="text-primary hover:underline flex items-center gap-1"
                                  onClick={() => {
                                    setBanqueSearchTerm('');
                                    // Recharger toutes les banques depuis l'API
                                    console.log("Recharger toutes les banques depuis l'API");
                                    dispatch(fetchBanques()).then(() => {
                                      console.log("Banques rechargées avec succès");
                                    });
                                  }}
                                >
                                  <svg
                                    className="h-3.5 w-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Voir tout
                                </button>
                              )}
                            </div>
                            <ul className="max-h-40 overflow-y-auto py-1 text-sm">
                              {filteredBanques.map((banque, index) => (
                                <li
                                  key={index}
                                  className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-navy-600 ${formData.banque === banque.libelle
                                    ? 'bg-primary/10 text-primary font-medium dark:bg-primary/20'
                                    : 'text-gray-900 dark:text-white'
                                    }`}
                                  onClick={() => {
                                    handleSelectBanque(banque);
                                  }}
                                >
                                  <div className="flex items-center space-x-3">
                                    <svg
                                      className={`h-4 w-4 flex-shrink-0 ${formData.banque === banque.libelle
                                        ? 'text-primary'
                                        : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm12-12v7h3v-7h-3zm6 0v7h3v-7h-3zM11 4L2 9.5V10h19V9.5L12 4h-1z" />
                                    </svg>
                                    <span className="truncate">{banque.libelle}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {banqueSearchTerm
                              ? `Aucune banque trouvée pour "${banqueSearchTerm}"`
                              : "Aucune banque disponible. Veuillez recharger la page."}
                          </div>
                        )}

                        {banquesError && (
                          <div className="px-4 py-3 text-sm text-red-500">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-red-100 p-1">
                                <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </span>
                              <span>Erreur: {banquesError}</span>
                            </div>
                            <button
                              type="button"
                              onClick={loadBanques}
                              className="mt-2 text-primary hover:underline flex items-center gap-1"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Réessayer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Indication de banque sélectionnée */}
                    {formData.banque && (
                      <div className="mt-2">
                        <div className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary dark:bg-primary/20">
                          <svg
                            className="mr-1.5 h-4 w-4 flex-shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm12-12v7h3v-7h-3zm6 0v7h3v-7h-3zM11 4L2 9.5V10h19V9.5L12 4h-1z" />
                          </svg>
                          {formData.banque}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="dark:border-navy-450 dark:bg-navy-700 dark:hover:bg-navy-600 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="hover:bg-primary-focus dark:bg-accent dark:hover:bg-accent-focus inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {currentParam ? "Enregistrer" : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="dark:bg-navy-800 relative w-full max-w-md transform rounded-xl bg-white p-8 shadow-2xl transition-all">
              {/* En-tête */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20">
                    <IconTrash className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Confirmer la suppression
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Cette action est irréversible
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-500/10">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <svg
                      className="h-5 w-5 text-red-600 dark:text-red-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Vous êtes sur le point de supprimer définitivement :
                    </p>
                    <p className="mt-2 text-sm text-gray-900 dark:text-white">
                      {paramToDelete?.email}
                    </p>
                    {paramToDelete?.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {paramToDelete.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="dark:border-navy-450 dark:bg-navy-700 dark:hover:bg-navy-600 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parametre;
