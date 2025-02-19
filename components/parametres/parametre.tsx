"use client";
import { useState, useEffect } from "react";
import IconPlus from "@/components/icon/icon-plus";
import IconPencil from "@/components/icon/icon-pencil";
import IconTrash from "@/components/icon/icon-trash";
import IconRefresh from "@/components/icon/icon-refresh";
import IconSettings from "@/components/icon/icon-settings";
import IconSearch from "@/components/icon/icon-search";
import IconFilter from "@/components/icon/icon-filter";

interface Parametre {
  id: number;
  email: string;
  type: string;
  description: string;
  dateModification: string;
}

const typeOptions = [
  { value: "all", label: "Tous les types" },
  { value: "MAIL_ADDRESS", label: "Adresse E-mail" },
];

const ITEMS_PER_PAGE = 6;

const Parametre = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [parametres, setParametres] = useState<Parametre[]>([
    {
      id: 1,
      email: "sgbs@example.com",
      type: "MAIL_ADDRESS",
      description: "Email de la banque SGBS",
      dateModification: "2025-02-19",
    },
    {
      id: 2,
      email: "cbao@example.com",
      type: "MAIL_ADDRESS",
      description: "Email de la banque CBAO",
      dateModification: "2025-02-18",
    },
    {
      id: 3,
      email: "boa@example.com",
      type: "MAIL_ADDRESS",
      description: "Email de la banque BOA",
      dateModification: "2025-02-17",
    },
    {
      id: 4,
      email: "bnde@example.com",
      type: "MAIL_ADDRESS",
      description: "Email de la banque BNDE",
      dateModification: "2025-02-16",
    },
    {
      id: 5,
      email: "bhs@example.com",
      type: "MAIL_ADDRESS",
      description: "Email de la banque BHS",
      dateModification: "2025-02-15",
    },
    {
      id: 6,
      email: "bimao@example.com",
      type: "MAIL_ADDRESS",
      description: "Email de la banque BIMAO",
      dateModification: "2025-02-14",
    },
    {
      id: 7,
      email: "baci@example.com",
      type: "MAIL_ADDRESS",
      description: "Email de la banque BACI",
      dateModification: "2025-02-13",
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentParam, setCurrentParam] = useState<Parametre | null>(null);
  const [paramToDelete, setParamToDelete] = useState<Parametre | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    description: "",
  });

  const filteredParams = parametres.filter((param) => {
    const matchesSearch =
      param.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      param.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || param.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredParams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedParams = filteredParams.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      description: param.description,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (param: Parametre) => {
    setParamToDelete(param);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (paramToDelete) {
      const updatedParams = parametres.filter((p) => p.id !== paramToDelete.id);
      setParametres(updatedParams);
      
      const newFilteredParams = updatedParams.filter((param) => {
        const matchesSearch =
          param.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          param.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "all" || param.type === selectedType;
        return matchesSearch && matchesType;
      });
      
      const newTotalPages = Math.ceil(newFilteredParams.length / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
    setShowDeleteModal(false);
    setParamToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setParamToDelete(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentParam(null);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      MAIL_ADDRESS: "bg-success/10 text-success",
    };
    return colors[type] || "bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-400";
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.description) {
      // Vous pouvez ajouter une notification d'erreur ici
      return;
    }

    if (currentParam) {
      // Modification
      const updatedParams = parametres.map((p) =>
        p.id === currentParam.id
          ? {
              ...p,
              email: formData.email,
              description: formData.description,
              dateModification: new Date().toISOString().split("T")[0],
            }
          : p
      );
      setParametres(updatedParams);
    } else {
      // Ajout
      const newParam: Parametre = {
        id: Math.max(...parametres.map((p) => p.id)) + 1,
        email: formData.email,
        type: "MAIL_ADDRESS",
        description: formData.description,
        dateModification: new Date().toISOString().split("T")[0],
      };
      setParametres([...parametres, newParam]);
    }

    handleModalClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <button
        key="prev"
        className={`btn btn-sm ${
          currentPage === 1
            ? "btn-disabled"
            : "btn-outline-primary hover:scale-105"
        }`}
        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Précédent
      </button>
    );

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={`btn btn-sm ${
            currentPage === 1
              ? "btn-primary"
              : "btn-outline-primary hover:scale-105"
          }`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="px-2 py-1">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`btn btn-sm ${
            currentPage === i
              ? "btn-primary"
              : "btn-outline-primary hover:scale-105"
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className="px-2 py-1">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className={`btn btn-sm ${
            currentPage === totalPages
              ? "btn-primary"
              : "btn-outline-primary hover:scale-105"
          }`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        className={`btn btn-sm ${
          currentPage === totalPages
            ? "btn-disabled"
            : "btn-outline-primary hover:scale-105"
        }`}
        onClick={() =>
          currentPage < totalPages && handlePageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
      >
        Suivant
      </button>
    );

    return (
      <div className="mt-4 flex items-center justify-center gap-2">
        {pages}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="panel mt-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Gestion des Adresses E-mail</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Gérez les adresses e-mail des banques
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn btn-primary gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
                onClick={handleAdd}
              >
                <IconPlus className="h-5 w-5 shrink-0" />
                <span>Nouvelle adresse e-mail</span>
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary p-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 ${
                  loading ? "cursor-wait" : ""
                }`}
                onClick={handleRefresh}
                disabled={loading}
              >
                <IconRefresh
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                className="form-input pl-10 pr-4"
                placeholder="Rechercher une adresse e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <IconSearch className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>
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

      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedParams.length === 0 ? (
              <div className="dark:border-navy-600 col-span-full flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <IconSettings className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? "Aucune adresse e-mail ne correspond à votre recherche"
                      : "Aucune adresse e-mail trouvée"}
                  </p>
                </div>
              </div>
            ) : (
              paginatedParams.map((param) => (
                <div
                  key={param.id}
                  className="dark:bg-navy-800 dark:shadow-navy-700/50 group relative overflow-hidden rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${getTypeColor(
                          param.type
                        )} transition-transform group-hover:scale-110`}
                      >
                        <IconSettings className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold group-hover:text-primary">
                          {param.email}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {param.description}
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      Dernière modification : {param.dateModification}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary gap-2"
                      onClick={() => handleEdit(param)}
                    >
                      <IconPencil className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger gap-2"
                      onClick={() => handleDeleteClick(param)}
                    >
                      <IconTrash className="h-4 w-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {renderPagination()}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/60">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="panel w-full max-w-lg">
              <div className="mb-5">
                <h3 className="text-lg font-bold">
                  {currentParam ? "Modifier l'adresse e-mail" : "Nouvelle adresse e-mail"}
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {currentParam
                    ? "Modifier les informations de l'adresse e-mail"
                    : "Ajouter une nouvelle adresse e-mail"}
                </p>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Entrez l'adresse e-mail"
                      className="form-input"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="mb-1.5 block text-sm font-semibold">
                      Description
                    </label>
                    <textarea
                      id="description"
                      placeholder="Entrez la description (ex: Email de la banque XXXXX)"
                      className="form-textarea"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleModalClose}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary min-w-[7rem]"
                  >
                    {currentParam ? "Modifier" : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/60">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="panel w-full max-w-md">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-danger">
                  Confirmer la suppression
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Êtes-vous sûr de vouloir supprimer cette adresse e-mail ?
                </p>
              </div>

              <div className="mt-8">
                <div className="rounded-lg bg-danger/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-danger/10 text-danger">
                      <IconTrash className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-danger">
                        {paramToDelete?.email}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {paramToDelete?.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleDeleteCancel}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger min-w-[7rem]"
                    onClick={handleDeleteConfirm}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parametre;
