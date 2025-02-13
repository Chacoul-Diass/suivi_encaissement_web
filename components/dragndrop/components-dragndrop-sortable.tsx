"use client";
import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import IconPlus from "../icon/icon-plus";
import { useDispatch, useSelector } from "react-redux";
import { TAppDispatch, TRootState } from "@/store";
import { fetchProfile } from "@/store/reducers/select/profile.slice";
import { deleteProfile } from "@/store/reducers/permission/delete-habilitation.slice";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import Role from "../permission/role";
import { motion, AnimatePresence } from "framer-motion";

const ComponentsDragndropSortable = () => {
  const dispatch = useDispatch<TAppDispatch>();

  const [isDeleteProfileModal, setIsDeleteProfileModal] = useState(false);
  const [selectedProfileDelete, setSelectedProfileDelete] = useState<any>(null);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalAdd, setModalAdd] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // État pour différencier Ajout / Modification

  const ProfilList = useSelector(
    (state: TRootState) => state?.profile?.data ?? []
  );
  const loading = useSelector(
    (state: TRootState) => state?.profile?.loading ?? false
  );
  const [sortable1, setSortable1] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);

  useEffect(() => {
    if (!ProfilList || ProfilList.length === 0) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  useEffect(() => {
    if (ProfilList && Array.isArray(ProfilList)) {
      const formattedProfiles = ProfilList.map((profile: any) => ({
        id: profile?.id ?? '',
        text: profile?.name ?? '',
        name: profile?.description ?? "Pas de description",
        permissions: profile?.permissions ?? [],
      }));
      setSortable1(formattedProfiles);
    }
  }, [ProfilList]);

  const confirmDeleteUser = async (profile: any) => {
    try {
      await dispatch(deleteProfile(profile.id)).unwrap();
      setSortable1((prev) => prev.filter((item) => item.id !== profile.id));
      setIsDeleteProfileModal(false);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const openDeleteModal = (profile: any) => {
    setSelectedProfileDelete(profile);
    setIsDeleteProfileModal(true);
  };

  const handleRoleModalClose = () => {
    setModalEdit(false);
    setModalAdd(false);
  };

  const [selectedRole, setSelectedRole] = useState<any>(null);

  const openRoleModal = (isEdit: boolean, role: any = null) => {
    setIsEditMode(isEdit);
    setSelectedRole(role);
    if (isEdit) {
      setModalEdit(true);
      setSelectedPermissions(role?.permissions || []);
    } else {
      setModalAdd(true);
    }
  };

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions(
      (prevPermissions) =>
        prevPermissions.includes(permissionId)
          ? prevPermissions.filter((id) => id !== permissionId) // Désactiver la permission
          : [...prevPermissions, permissionId] // Activer la permission
    );
  };

  if (loading) {
    return (
      <div className="min-h-[400px] grid place-content-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-l-transparent rounded-full"></div>
          <p className="text-primary font-medium">Chargement des habilitations...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="panel rounded-2xl bg-white p-6 shadow-lg"
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-800">
              Gestion des Rôles et Permissions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gérez les accès et les droits des utilisateurs
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openRoleModal(false)}
          className="btn btn-primary flex transform items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-4 py-2.5 shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg"
        >
          <IconPlus className="h-5 w-5" />
          <span>Nouveau rôle</span>
        </motion.button>
      </div>

      <div className="grid gap-6">
        <ReactSortable
          list={sortable1}
          setList={setSortable1}
          animation={200}
          className="space-y-4"
          ghostClass="opacity-50"
          dragClass="cursor-grabbing"
        >
          {sortable1.map((item: any) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="group rounded-xl border border-gray-100 bg-gray-50 p-5 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center gap-4">
                  <div className="rounded-lg bg-white p-3 shadow-sm transition-colors duration-200 group-hover:bg-primary/5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-800">
                      {item.text}
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                        ID: {item.id}
                      </span>
                    </h3>
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                      {item.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openRoleModal(true, item)}
                    className="btn btn-outline-primary tooltip-trigger rounded-lg p-2.5 transition-colors duration-200 hover:bg-primary/10"
                    data-tooltip="Modifier"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="btn btn-outline-danger tooltip-trigger rounded-lg p-2.5 transition-colors duration-200 hover:bg-danger/10"
                    data-tooltip="Supprimer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              {item.permissions && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="mb-2 flex w-full items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                    <span className="text-sm text-gray-500">
                      Permissions attribuées
                    </span>
                  </div>
                  {item.permissions
                    .slice(0, 3)
                    .map((permission: any, index: number) => (
                      <span
                        key={permission.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        {permission.name}
                      </span>
                    ))}
                  {item.permissions.length > 3 && (
                    <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                      +{item.permissions.length - 3} autres
                    </span>
                  )}
                </div>
              )}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      </svg>
                      Département
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="2"
                          y="7"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                      {item.permissions?.length || 0} permissions
                    </span>
                  </div>
                  <span className="flex cursor-move items-center gap-1 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                    Déplacer
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </ReactSortable>
      </div>

      <style jsx>{`
        .tooltip-trigger:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          background: #333;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          transform: translateY(-30px);
          white-space: nowrap;
        }
      `}</style>

      {/* Modal de Modification ou Ajout */}
      <AnimatePresence>
        {(modalAdd || modalEdit) && (
          <Transition appear show={modalAdd || modalEdit} as={Fragment}>
            <Dialog
              as="div"
              open={modalAdd || modalEdit}
              onClose={handleRoleModalClose}
              className="relative z-50 overflow-y-auto"
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
                <div className="fixed inset-0 bg-[black]/60" />
              </Transition.Child>
              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center px-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="relative w-[1600px] transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-[#1b2e4b]">
                      <Role
                        modalEdit={isEditMode}
                        onClose={handleRoleModalClose}
                        selectedRole={selectedRole}
                      />
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        )}
      </AnimatePresence>

      {/* Modal de Suppression */}
      <AnimatePresence>
        {isDeleteProfileModal && (
          <Transition appear show={isDeleteProfileModal} as={Fragment}>
            <Dialog
              as="div"
              open={isDeleteProfileModal}
              onClose={() => setIsDeleteProfileModal(false)}
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
                <div className="fixed inset-0 bg-[black]/60" />
              </Transition.Child>
              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center px-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-[#1b2e4b]">
                      <div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">
                        Supprimer le profile
                        <button
                          className="absolute right-3 top-3 text-2xl text-gray-600 dark:text-white"
                          onClick={() => setIsDeleteProfileModal(false)}
                        >
                          &times;
                        </button>
                      </div>
                      <div className="max-h-[70vh] overflow-y-auto p-5 text-center">
                        <div className="mx-auto w-fit rounded-full bg-danger p-4 text-white ring-4 ring-danger/30">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13 16h-1v-4h-1m1-4h.01M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <p className="mt-4 text-base font-semibold text-black dark:text-white-dark">
                          Êtes-vous sûr de vouloir supprimer ce profil ?
                        </p>
                        <p className="mt-4 text-sm text-[#6d7689] dark:text-[#d3d9e5]">
                          Cette action est irréversible.
                        </p>
                        <div className="mt-6 flex justify-center gap-5">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => setIsDeleteProfileModal(false)}
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() =>
                              selectedProfileDelete &&
                              confirmDeleteUser(selectedProfileDelete)
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
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ComponentsDragndropSortable;
