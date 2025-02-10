/** @jsxImportSource react */
"use client";

import { useEffect, useState } from "react";
import { User, Paginations } from "@/utils/interface";
import IconCaretDown from "@/components/icon/icon-caret-down";
import Dropdown from "@/components/dropdown";

interface UserTableProps {
  data: User[];
  loading: boolean;
  paginate: Paginations;
  handlePageChange?: (page: number) => void;
  handleSearchChange?: (value: string) => void;
  handleLimitChange?: (value: number) => void;
}

const UserTable = ({
  data,
  loading,
  paginate,
  handlePageChange,
  handleSearchChange,
  handleLimitChange,
}: UserTableProps) => {
  const [currentPage, setCurrentPage] = useState(paginate.currentPage || 1);
  const [pageSize, setPageSize] = useState(paginate.count || 10);
  const PAGE_SIZES = [10, 20, 30, 50, 100];

  useEffect(() => {
    if (paginate) {
      setCurrentPage(paginate.currentPage || 1);
      setPageSize(paginate.count || 10);
    }
  }, [paginate]);

  const handlePage = (page: number) => {
    setCurrentPage(page);
    handlePageChange?.(page);
  };

  const handleLimit = (limit: number) => {
    setPageSize(limit);
    handleLimitChange?.(limit);
  };

  return (
    <div className="panel">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h5 className="text-lg font-semibold dark:text-white-light">
            Liste des utilisateurs
          </h5>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap">Afficher :</span>
              <div className="dropdown">
                <Dropdown
                  offset={[0, 5]}
                  placement="bottom-end"
                  btnClassName="dropdown-toggle"
                  button={
                    <span className="flex items-center gap-1">
                      {pageSize} <IconCaretDown className="w-5 h-5" />
                    </span>
                  }
                >
                  <ul className="!min-w-[170px]">
                    {PAGE_SIZES.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => handleLimit(item)}
                          className="w-full"
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table-hover">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Profil</th>
                <th>Directions Régionales</th>
                <th>Secteurs</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center">
                    Chargement...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                data.map((user) => (
                  <tr key={user.id}>
                    <td>{user.matricule}</td>
                    <td>{user.lastname}</td>
                    <td>{user.firstname}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.profile}</td>
                    <td>
                      <div className="max-w-[200px] truncate">
                        {user.directionRegionales.join(", ")}
                      </div>
                    </td>
                    <td>
                      <div className="max-w-[200px] truncate">
                        {user.secteurs.join(", ")}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>
              Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
              {Math.min(currentPage * pageSize, paginate.totalCount)} sur{" "}
              {paginate.totalCount} entrées
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={!paginate.previousPage}
              onClick={() => handlePage(currentPage - 1)}
            >
              Précédent
            </button>
            {Array.from({ length: paginate.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  className={`btn ${
                    currentPage === page
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => handlePage(page)}
                >
                  {page}
                </button>
              )
            )}
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={!paginate.nextPage}
              onClick={() => handlePage(currentPage + 1)}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
