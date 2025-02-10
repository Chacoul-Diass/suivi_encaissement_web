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

type User = {
  id: number;
  email: string;
  matricule: string;
  phoneNumber: string;
  firstname: string;
  lastname: string;
  profile: string;
  directionRegionales: string[];
  secteurs: string[];
};

interface Option {
  value: string;
  label: string;
}

const ComponentsAppsUsers: React.FC = () => {
  const dispatch = useDispatch<TAppDispatch>();
  const usersDataList: any = useSelector(
    (state: TRootState) => state.usersData?.data
  );
  const usersDataLoading: any = useSelector(
    (state: TRootState) => state.usersData?.loading
  );
  const loadingUpdate = useSelector(
    (state: TRootState) => state.userUpdate.loading
  );

  const ProfilList: any = useSelector(
    (state: TRootState) => state.profile.data
  );

  const [addUserModal, setAddUserModal] = useState(false);
  const [isDeleteUserModal, setIsDeleteUserModal] = useState(false);
  const [value, setValue] = useState<"list" | "grid">("list");
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(
    null
  );
  const [selectedTag, setSelectedTag] = useState("all");
  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState<User[]>([]);

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

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (usersDataList) {
      setFilteredItems(usersDataList);
    }
  }, [usersDataList]);

  useEffect(() => {
    if (usersDataList?.result) {
      let filtered = usersDataList.result.filter((user: User) =>
        `${user.firstname} ${user.lastname} ${user.email} ${user.matricule}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );

      if (selectedTag !== "all") {
        filtered = filtered.filter((user: any) => user.profile === selectedTag);
      }

      setFilteredItems(filtered);
    }
  }, [search, selectedTag, usersDataList]);

  const refreshUsers = () => {
    dispatch(fetchUsers());
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
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-center text-white">
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

  useEffect(() => {
    if (editUserData?.directionRegionales?.length > 0) {
      const drIds = editUserData.directionRegionales.map((dr: any) => dr.id);
      dispatch(fetchSecteurs(drIds))
        .unwrap()
        .then((secteurs) => {
          const secteurOptions = secteurs.map((secteur: any) => ({
            value: secteur.id,
            label: secteur.name,
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
    dispatch(fetchUserDelete(user.id))
      .unwrap()
      .then((data) => {
        setFilteredItems(filteredItems.filter((u) => u.id !== data.id));
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
    (state: TRootState) => state.profile?.data
  );

  const drData: any = useSelector((state: TRootState) => state.dr?.data);
  const secteurData: any = useSelector(
    (state: TRootState) => state.secteur?.data
  );

  useEffect(() => {
    dispatch(fetchDirectionRegionales());
    dispatch(fetchProfile());
    dispatch(fetchDirectionRegionales());
  }, [dispatch]);

  useEffect(() => {
    if (drData) {
      const directions = [
        {
          value: "all",
          label:
            drData.length === availableDirections.length - 1
              ? "Tout désélectionner"
              : "Tout sélectionner",
        },
        ...drData.map((dr: any) => ({
          value: dr.id,
          label: `${dr.code} - ${dr.name.trim()}`,
        })),
      ];
      setAvailableDirections(directions);
    }
  }, [drData, drData.length, availableDirections.length]);

  useEffect(() => {
    if (profileData) {
      const profile = profileData.map((profil: any) => ({
        value: profil.id,
        label: `${profil.name.trim()}`,
      }));
      setProfils(profile);
    }
  }, [profileData]);

  useEffect(() => {
    if (drData.length > 0) {
      const drIds = drData.map((dr: any) => Number(dr.value));
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
            accountInfo.secteur.length === secteurData.length
              ? "Tout désélectionner"
              : "Tout sélectionner",
        },
        ...secteurData.map((secteur: any) => ({
          value: secteur.id,
          label: secteur.name,
        })),
      ];
      setAvailableSecteurs(secteurs);
    }
  }, [secteurData, accountInfo.secteur]);

  const updateUser = async () => {
    if (!editUserData?.id) {
      Swal.fire("Erreur", "ID utilisateur manquant.", "error");
      return;
    }

    const userData = {
      email: editUserData.email,
      firstname: editUserData.firstname,
      lastname: editUserData.lastname,
      matricule: editUserData.matricule,
      phoneNumber: editUserData.phoneNumber,
      profileId: editUserData.profile?.id || 1, // Utiliser un profil par défaut si non défini
      directionRegionales: editUserData.directionRegionales
        .map((dr: any) => ({ id: dr.id }))
        .filter((dr: any) => dr.id !== undefined), // S'assurer que `id` existe
      secteurs: editUserData.secteurs
        .map((secteur: any) => ({ id: secteur.id }))
        .filter((secteur: any) => secteur.id !== undefined), // S'assurer que `id` existe
    };

    try {
      const resultAction = await dispatch(
        fetchupdateUser({ userId: editUserData.id, userData })
      ).unwrap();

      Swal.fire(
        "Succès",
        resultAction.message || "Utilisateur mis à jour avec succès.",
        "success"
      );
      setAddUserModal(false);
      dispatch(fetchUsers()); // Rafraîchir la liste des utilisateurs
    } catch (error: any) {
      Swal.fire(
        "Erreur",
        error || "Erreur lors de la mise à jour de l'utilisateur.",
        "error"
      );
    }
  };

  const handleSelectAllDR = () => {
    if (editUserData?.directionRegionales?.length === drData.length) {
      // Si toutes les DR sont sélectionnées, on désélectionne tout et on vide les secteurs
      setEditUserData({ ...editUserData, directionRegionales: [], secteurs: [] });
      setAvailableSecteurs([]); // Réinitialiser les secteurs
    } else {
      // Sinon, on sélectionne toutes les DR disponibles
      const selectedDRs = drData.map((dr: any) => ({
        id: dr.id,
        code: dr.code,
        name: dr.name,
      }));
  
      setEditUserData({ ...editUserData, directionRegionales: selectedDRs });
  
      // Récupérer les exploitations associées aux DR sélectionnées
      const drIds = selectedDRs.map((dr : any) => dr.id);
      dispatch(fetchSecteurs(drIds))
        .unwrap()
        .then((secteurs) => {
          const secteurOptions = secteurs.map((secteur: any) => ({
            value: secteur.id,
            label: secteur.name,
          }));
          setAvailableSecteurs(secteurOptions);
        })
        .catch((error) => console.error("Erreur lors du chargement des secteurs :", error));
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

  return (
    <div className="panel">
      <div className="panel flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl">{filteredItems.length} Utilisateurs</h2>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <div className="flex gap-3">
            <Link href="/utilisateur/add" className="btn btn-primary gap-2">
              <IconPlus />
              Ajouter un utilisateur
            </Link>
            <button
              type="button"
              className={`btn btn-outline-primary p-2 ${
                value === "list" && "bg-primary text-white"
              }`}
              onClick={() => setValue("list")}
            >
              <IconListCheck />
            </button>
            <button
              type="button"
              className={`btn btn-outline-primary p-2 ${
                value === "grid" && "bg-primary text-white"
              }`}
              onClick={() => setValue("grid")}
            >
              <IconLayoutGrid />
            </button>
          </div>
          <button
            type="button"
            className={`btn btn-outline-primary flex items-center gap-2 ${
              usersDataLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={refreshUsers}
            disabled={usersDataLoading}
          >
            {usersDataLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
            ) : (
              <IconRefresh />
            )}
            <span>{usersDataLoading ? "Chargement..." : "Rafraîchir"}</span>
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher"
              className="peer form-input py-2 ltr:pr-11 rtl:pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]"
            >
              <IconSearch className="mx-auto" />
            </button>
          </div>
        </div>
      </div>

      <div className=" mt-4 flex gap-4">
        <button
          onClick={() => setSelectedTag("all")}
          className={`btn ${
            selectedTag === "all" ? "btn-primary" : "btn-outline-primary"
          }`}
        >
          Tous
        </button>
        {availableProfiles.map((profile) => (
          <button
            key={profile.value}
            onClick={() => setSelectedTag(profile.value)}
            className={`btn ${
              selectedTag === profile.value
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
          >
            {profile.label}
          </button>
        ))}
      </div>

      {value === "list" && (
        <div className="panel mt-5 overflow-hidden border-0 p-0">
          <div className="table-responsive">
            <table className="table-striped table-hover">
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
                  <th className="!text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((user) => (
                  <tr key={user.id}>
                    <td>{user.matricule}</td>
                    <td>{user.lastname}</td>
                    <td>{user.firstname}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.profile}</td>
                    <td>
                      {renderLimitedItems(user.directionRegionales, user.id)}
                    </td>
                    <td>{renderLimitedItems(user.secteurs, user.id)}</td>
                    <td>
                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => editUser(user)}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setSelectedUserToDelete(user);

                            setIsDeleteUserModal(true);
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {value === "grid" && (
        <div className="mt-5 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredItems.map((user) => (
            <div
              className="relative overflow-hidden rounded-md bg-white text-center shadow dark:bg-[#1c232f]"
              key={user.id}
            >
              <div className="relative -mt-10 px-6 pb-24">
                <div className="rounded-t-md bg-white/40 bg-[url('/assets/images/notification-bg.png')] bg-cover bg-center p-6 pb-0">
                  <br />
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-success text-white">
                    <IconUser className="h-12 w-12" />
                  </div>
                </div>
                <div className="rounded-md bg-white px-2 py-4 shadow-md dark:bg-gray-900">
                  <div className="text-xl">{user.firstname}</div>
                  <div className="text-white-dark">{user.lastname}</div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 ltr:text-left rtl:text-right">
                  <div className="flex items-center">
                    <div className="flex-none ltr:mr-2 rtl:ml-2">Email :</div>
                    <div className="truncate text-white-dark">{user.email}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-none ltr:mr-2 rtl:ml-2">
                      Téléphone :
                    </div>
                    <div className="text-white-dark">{user.phoneNumber}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-none ltr:mr-2 rtl:ml-2">Profil :</div>
                    <div className="text-white-dark">{user.profile}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-none ltr:mr-2 rtl:ml-2">
                      Directions :
                    </div>
                    <div className="text-white-dark">
                      {user.directionRegionales}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-none ltr:mr-2 rtl:ml-2">
                      Secteurs :
                    </div>
                    <div className="text-white-dark">{user.secteurs}</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 mt-6 flex w-full gap-4 p-6 ltr:left-0 rtl:right-0">
                <button
                  type="button"
                  className="btn btn-outline-primary w-1/2"
                  onClick={() => editUser(user)}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger w-1/2"
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
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-[black]/60" />
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
                <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <button
                    type="button"
                    onClick={() => setAddUserModal(false)}
                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4"
                  >
                    <IconX />
                  </button>
                  <div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">
                    Modifier l'utilisateur
                  </div>
                  <div className="p-5">
                    <form>
                      <div className="mb-5">
                        <label htmlFor="matricule">Matricule</label>
                        <input
                          id="matricule"
                          type="text"
                          placeholder="Entrez le matricule"
                          className="form-input"
                          value={editUserData?.matricule || ""}
                          onChange={(e) =>
                            setEditUserData({
                              ...editUserData,
                              matricule: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="lastname">Nom</label>
                        <input
                          id="lastname"
                          type="text"
                          placeholder="Entrez le nom"
                          className="form-input"
                          value={editUserData?.lastname || ""}
                          onChange={(e) =>
                            setEditUserData({
                              ...editUserData,
                              lastname: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="firstname">Prénom</label>
                        <input
                          id="firstname"
                          type="text"
                          placeholder="Entrez le prénom"
                          className="form-input"
                          value={editUserData?.firstname || ""}
                          onChange={(e) =>
                            setEditUserData({
                              ...editUserData,
                              firstname: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="email">Email</label>
                        <input
                          id="email"
                          type="email"
                          placeholder="Entrez l'email"
                          className="form-input"
                          value={editUserData?.email || ""}
                          onChange={(e) =>
                            setEditUserData({
                              ...editUserData,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-5">
                        <label htmlFor="phoneNumber">Téléphone</label>
                        <input
                          id="phoneNumber"
                          type="text"
                          placeholder="Entrez le numéro de téléphone"
                          className="form-input"
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
                            <p className="text-red-500">
                              Le numéro de téléphone doit contenir exactement 10
                              chiffres.
                            </p>
                          )}
                      </div>

                      <div className="mb-5">
                        <label htmlFor="profile">Profil</label>
                        <Select
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
                        />
                      </div>
                      <Select
  placeholder="Choisir une direction régionale"
  options={[
    {
      value: "all",
      label: editUserData?.directionRegionales?.length === drData.length
        ? "Tout désélectionner"
        : "Tout sélectionner",
    },
    ...availableDirections.filter((option) => option.value !== "all"),
  ]}
  value={editUserData?.directionRegionales.map((dr: any) => ({
    value: dr.id,
    label: `${dr.code} - ${dr.name}`,
  }))}
  isMulti
  onChange={(selectedOptions) => {
    if (selectedOptions.some((option) => option.value === "all")) {
      handleSelectAllDR();
    } else {
      const selectedDRs = selectedOptions.map((option: any) => ({
        id: option.value,
        code: option.label.split(" - ")[0],
        name: option.label.split(" - ")[1],
      }));

      setEditUserData({
        ...editUserData,
        directionRegionales: selectedDRs,
        secteurs: selectedDRs.length === 0 ? [] : editUserData.secteurs, // ⚠️ Vider secteurs si DR vide
      });

      // Récupérer les secteurs associés si DR non vide
      if (selectedDRs.length > 0) {
        const drIds = selectedDRs.map((dr) => dr.id);
        dispatch(fetchSecteurs(drIds))
          .unwrap()
          .then((secteurs) => {
            const secteurOptions = secteurs.map((secteur: any) => ({
              value: secteur.id,
              label: secteur.name,
            }));
            setAvailableSecteurs(secteurOptions);
          })
          .catch((error) => console.error("Erreur lors du chargement des secteurs :", error));
      } else {
        setAvailableSecteurs([]); // Réinitialiser les secteurs si aucune DR sélectionnée
      }
    }
  }}
/>


                      <div className="mb-5">
                        <label htmlFor="secteurs">Exploitations</label>
                        <Select
                          placeholder="Choisir une exploitation"
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
                          value={editUserData?.secteurs.map((secteur: any) => ({
                            value: secteur.id,
                            label: secteur.name,
                          }))}
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
                        />
                      </div>

                      <br />
                      <br />
                      <br />
                      <br />
                      <br />
                      <div className="mt-8 flex items-center justify-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger gap-2"
                          onClick={() => setAddUserModal(false)}
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary ltr:ml-4 rtl:mr-4"
                          onClick={updateUser}
                          disabled={loadingUpdate}
                        >
                          {loadingUpdate
                            ? "Modification en cours..."
                            : "Modifier"}
                        </button>
                      </div>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

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
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-[black]/60" />
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
                <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">
                    Supprimer l'utilisateur
                  </div>

                  <div className="p-5 text-center">
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

                    <p className="mb-5 mt-4 text-gray-600 dark:text-gray-300">
                      Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                      <span className="font-bold">
                        {selectedUserToDelete?.firstname}{" "}
                        {selectedUserToDelete?.lastname}
                      </span>
                      ?
                    </p>

                    <div className="flex items-center justify-end gap-4">
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={() => setIsDeleteUserModal(false)}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
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
    </div>
  );
};

export default ComponentsAppsUsers;
