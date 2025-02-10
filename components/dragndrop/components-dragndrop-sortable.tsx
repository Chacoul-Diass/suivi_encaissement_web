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

const ComponentsDragndropSortable = () => {
  const dispatch = useDispatch<TAppDispatch>();

  const [isDeleteProfileModal, setIsDeleteProfileModal] = useState(false);
  const [selectedProfileDelete, setSelectedProfileDelete] = useState<any>(null);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalAdd, setModalAdd] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // État pour différencier Ajout / Modification

  const ProfilList: any = useSelector(
    (state: TRootState) => state.profile?.data
  );
  const [sortable1, setSortable1] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (ProfilList && Array.isArray(ProfilList)) {
      const formattedProfiles = ProfilList?.map((profile: any) => ({
        id: profile.id,
        text: profile.name,
        name: profile.description || "Pas de description",
        permissions: profile?.permissions,
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

  return (
    <div className="panel">
      <div className="mb-5 text-lg font-semibold">Rôle et Permission</div>
      <div className="flex gap-3">
        <div className="absolute right-0 -mt-[50px]">
          <Link
            href="#"
            onClick={() => openRoleModal(false)} // mode ajout
            className="btn btn-primary -left-5 gap-2"
          >
            <IconPlus />
            Ajouter un rôle
          </Link>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-6 px-4 sm:grid-cols-2">
        <ul id="example1" className="w-[1360px]">
          <ReactSortable
            list={sortable1}
            setList={setSortable1}
            animation={200}
            delay={2}
            ghostClass="gu-transit"
            group="shared"
          >
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
              {sortable1.map((item) => {
                return (
                  <li key={item.id} className="w-full cursor-grab">
                    <div className="flex w-full flex-col items-center justify-between rounded-md border border-white-light bg-white px-6 py-3.5 dark:border-dark dark:bg-[#1b2e4b] md:flex-row">
                      <div className="sm:mr-4">
                        <Image
                          alt="avatar"
                          src={`/assets/images/profile-${item.id}.jpeg`}
                          className="mx-auto h-11 w-11 rounded-full"
                          width={50}
                          height={50}
                        />
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-between md:flex-row">
                        <div className="my-3 font-semibold">
                          <div className="text-base text-dark dark:text-[#bfc9d4]">
                            {item.text}
                          </div>
                          <div className="text-xs text-white-dark">
                            {item.name}
                          </div>
                        </div>
                        <div className="ml-10 mt-4 flex gap-4">
                          <Link
                            href="#"
                            className="btn btn-success btn-sm px-5 py-2"
                            onClick={() => openRoleModal(true, item)}
                          >
                            Modifier
                          </Link>
                          <Link
                            href="#"
                            className="btn btn-primary btn-sm px-5 py-2"
                            onClick={() => openDeleteModal(item)}
                          >
                            Supprimer
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </div>
          </ReactSortable>
        </ul>
      </div>

      {/* Modal de Modification ou Ajout */}
      <Transition appear show={modalAdd || modalEdit} as={Fragment}>
        <Dialog
          as="div"
          open={modalAdd || modalEdit}
          onClose={handleRoleModalClose}
          className="relative z-50 overflow-y-auto"
        >
          <div className="fixed inset-0 z-[999] bg-[black]/60">
            <div className="mx-auto flex min-h-screen w-10/12 items-center justify-center px-4">
              <Transition.Child>
                <div className="relative flex w-full items-center justify-center bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                  <button
                    className="absolute right-4 top-4 text-2xl text-gray-600 dark:text-white"
                    onClick={handleRoleModalClose}
                  >
                    &times;
                  </button>
                  <Role
                    modalEdit={isEditMode}
                    onClose={handleRoleModalClose}
                    selectedRole={selectedRole}
                  />
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de Suppression */}
      <Transition appear show={isDeleteProfileModal} as={Fragment}>
        <Dialog
          as="div"
          open={isDeleteProfileModal}
          onClose={() => setIsDeleteProfileModal(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-[black]/60" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <Transition.Child>
                <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
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
    </div>
  );
};

export default ComponentsDragndropSortable;
