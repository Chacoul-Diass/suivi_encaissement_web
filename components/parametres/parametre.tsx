"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchParametres,
  updateParametre,
  deleteParametre,
  createParametre,
} from "@/store/reducers/parametres/parametre.slice";
import IconPlus from "@/components/icon/icon-plus";
import IconPencil from "@/components/icon/icon-pencil";
import IconTrash from "@/components/icon/icon-trash";
import IconRefresh from "@/components/icon/icon-refresh";
import IconSettings from "@/components/icon/icon-settings";
import IconSearch from "@/components/icon/icon-search";
import { TAppDispatch, TRootState } from "@/store";
import { toast } from "react-toastify";

interface Parametre {
  id: number;
  email: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const ITEMS_PER_PAGE = 6;

const Parametre = () => {
  const dispatch = useDispatch<TAppDispatch>();

  const data = useSelector((state: TRootState) => state.parametres?.data);
  const loading = useSelector((state: TRootState) => state.parametres?.loading);
  const error = useSelector((state: TRootState) => state.parametres?.error);

  const pagination = data?.pagination;

  console.log(pagination, "data");
  const parametres = data?.result || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentParam, setCurrentParam] = useState<Parametre | null>(null);
  const [paramToDelete, setParamToDelete] = useState<Parametre | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    description: "MAIL_ADDRESS",
  });

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchParametres({ page: currentPage })).unwrap();
      } catch (err: any) {
        toast.error(err.message || "Erreur lors du chargement des données");
      }
    };
    loadData();
  }, [dispatch, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(fetchParametres({ page: currentPage }));
  };

  const handleAdd = () => {
    setCurrentParam(null);
    setFormData({ email: "", description: "" });
    setShowModal(true);
  };

  const handleEdit = (param: Parametre) => {
    setCurrentParam(param);
    setFormData({
      email: param.email,
      description: param.description || "",
    });
    setShowModal(true);
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
        dispatch(fetchParametres({ page: currentPage }));
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
    dispatch(fetchParametres({ page: currentPage }));
    toast.info("Liste des paramètres actualisée");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      return;
    }

    try {
      if (currentParam) {
        // Pour la modification
        await dispatch(
          updateParametre({
            id: currentParam.id,
            email: formData.email.toLowerCase(),
            description: formData.description || "MAIL_ADDRESS",
          })
        ).unwrap();
        toast.success("Paramètre modifié avec succès");
      } else {
        // Pour la création
        await dispatch(
          createParametre({
            email: formData.email.toLowerCase(),
            description: formData.description || "MAIL_ADDRESS",
          })
        ).unwrap();
        toast.success("Paramètre créé avec succès");
      }

      // Rafraîchir la liste après modification/création
      dispatch(fetchParametres({ page: currentPage }));
      handleModalClose();
    } catch (err: any) {
      console.error("Erreur lors de la soumission:", err);
      toast.error(err.message || "Une erreur est survenue lors de l'opération");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredParams = parametres.filter((param) =>
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
            className={`btn btn-sm ${
              !showPrevious
                ? "btn-disabled"
                : "btn-outline-primary hover:scale-105"
            }`}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!showPrevious}
          >
            Précédent
          </button>

          <button
            className={`btn btn-sm ${
              !showNext ? "btn-disabled" : "btn-outline-primary hover:scale-105"
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
                ? `${pagination.totalCount} adresse${
                    pagination.totalCount > 1 ? "s" : ""
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

        {filteredParams.length === 0 ? (
          <div className="dark:border-navy-600 dark:bg-navy-800 flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white">
            <div className="text-center">
              <IconSettings className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Aucun paramètre trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Commencez par ajouter un nouveau paramètre
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredParams.map((param) => (
              <div
                key={param.id}
                className="dark:bg-navy-800 dark:shadow-navy-700/50 group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
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
                  <div className="flex-1">
                    <h3 className="line-clamp-1 font-semibold text-gray-900 dark:text-white">
                      {param.email}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {param.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(param.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(param.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(param)}
                      className="btn btn-icon btn-sm btn-warning rounded-full"
                      title="Modifier"
                    >
                      <IconPencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(param)}
                      className="btn btn-icon btn-sm btn-danger rounded-full"
                      title="Supprimer"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {renderPagination()}
      </div>

      {loading && (
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
      )}

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
