"use client";

import React, { useState, useEffect } from "react";
import Select, { MultiValue, ActionMeta } from "react-select";
import IconSave from "@/components/icon/icon-save";
import IconArrowBackward from "../icon/icon-arrow-backward";
import IconSquareRotated from "../icon/icon-square-rotated";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { TAppDispatch, TRootState } from "@/store";
import { fetchDirectionRegionales } from "@/store/reducers/select/dr.slice";
import { fetchProfile } from "@/store/reducers/select/profile.slice";
import { fetchSecteurs } from "@/store/reducers/select/secteur.slice";
import { addUser } from "@/store/reducers/user/create-user.slice";
import { Toastify } from "@/utils/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchUsers } from "@/store/reducers/user/get.user.slice";
import { fetchupdateUser } from "@/store/reducers/user/update-user.slice";

// Définition des types pour les options des sélecteurs
interface Option {
  value: string;
  label: string;
}

interface DataResponse {
  profils: Option[];
  dr_secteurs: { [key: string]: Option[] };
}

const ComponentsAppsInvoiceAdd = () => {
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    prenom: "",
    email: "",
    number: "",
    poste: "",
  });

  const [accountInfo, setAccountInfo] = useState({
    matricule: "",
    profil: "",
    dr: [] as Option[],
    secteur: [] as Option[],
  });

  const [errors, setErrors] = useState({
    name: "",
    prenom: "",
    email: "",
    number: "",
    matricule: "",
    profil: "",
    dr: "",
    secteur: "",
    poste: "",
  });

  const [profils, setProfils] = useState<Option[]>([]);

  const [availableDirections, setAvailableDirections] = useState<Option[]>([]);
  const [availableSecteurs, setAvailableSecteurs] = useState<Option[]>([]);

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<TAppDispatch>();

  const [id, setId] = useState();

  const searchParams: any = useSearchParams();
  // const id = searchParams.get("id");

  useEffect(() => {
    setId(searchParams.get("id"));
  }, [searchParams]);

  const usersDataList: any = useSelector(
    (state: TRootState) => state.usersData?.data
  );

  const drData: any = useSelector((state: TRootState) => state.dr?.data);

  const secteurData: any = useSelector(
    (state: TRootState) => state.secteur?.data
  );
  const profileData: any = useSelector(
    (state: TRootState) => state.profile?.data
  );

  const router = useRouter();

  useEffect(() => {
    dispatch(fetchDirectionRegionales());
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      const user = usersDataList?.result?.find((u: any) => u.id === Number(id));
      if (user) {
        setPersonalInfo({
          name: user.firstname,
          prenom: user.lastname,
          email: user.email,
          number: user.phoneNumber,
          poste: user.poste || "", // Ajout de la récupération du poste avec une valeur par défaut
        });
        setAccountInfo({
          matricule: user.matricule,
          profil: user.profile,
          dr: drData?.map((dr: string) => ({
            value: dr,
            label: dr,
          })),
          secteur: user.secteurs.map((secteur: string) => ({
            value: secteur,
            label: secteur,
          })),
        });
      }
    }
  }, [drData, id, usersDataList]);

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
  }, [drData, availableDirections.length]);

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
  }, [dispatch, drData]);

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

  // Validation des champs obligatoires
  const validateFields = () => {
    let newErrors = { ...errors };
    let isValid = true;

    if (!personalInfo.name) {
      newErrors.name = "Le nom est obligatoire";
      isValid = false;
    } else {
      newErrors.name = "";
    }

    if (!personalInfo.prenom) {
      newErrors.prenom = "Le prénom est obligatoire";
      isValid = false;
    } else {
      newErrors.prenom = "";
    }

    if (!personalInfo.email) {
      newErrors.email = "L'email est obligatoire";
      isValid = false;
    } else {
      newErrors.email = "";
    }

    if (!personalInfo.number) {
      newErrors.number = "Le téléphone est obligatoire";
      isValid = false;
    } else {
      newErrors.number = "";
    }

    if (!accountInfo.matricule) {
      newErrors.matricule = "Le matricule est obligatoire";
      isValid = false;
    } else {
      newErrors.matricule = "";
    }

    if (!accountInfo.profil) {
      newErrors.profil = "Le profil est obligatoire";
      isValid = false;
    } else {
      newErrors.profil = "";
    }

    if (["Comptable", "AGC"].includes(accountInfo.profil)) {
      if (accountInfo.dr.length === 0) {
        newErrors.dr = "La direction régionale est obligatoire";
        isValid = false;
      } else {
        newErrors.dr = "";
      }

      if (accountInfo.secteur.length === 0) {
        newErrors.secteur = "Le secteur est obligatoire";
        isValid = false;
      } else {
        newErrors.secteur = "";
      }
    } else {
      newErrors.dr = "";
      newErrors.secteur = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const userData: any = {
      email: personalInfo.email,
      firstname: personalInfo.name,
      lastname: personalInfo.prenom,
      matricule: accountInfo.matricule,
      phoneNumber: personalInfo.number,
      poste: personalInfo.poste,
      profileId:
        profils.find((p) => p.label === accountInfo.profil)?.value || 1,
      directionRegionales: accountInfo.dr
        .map((dr) => ({ id: Number(dr.value) }))
        .filter((dr) => dr.id !== undefined),
      secteurs: accountInfo.secteur
        .map((secteur) => ({ id: Number(secteur.value) }))
        .filter((secteur) => secteur.id !== undefined),
    };

    console.log(userData, "userData");

    setLoading(true);

    try {
      if (id) {
        const response = await dispatch(
          fetchupdateUser({ userId: Number(id), userData })
        );
        if (response.meta.requestStatus === "fulfilled") {
          Toastify("success", "Utilisateur mis à jour avec succès");
          router.push("/user");
        } else {
          Toastify("error", "Erreur lors de la mise à jour de l'utilisateur");
        }
      } else {
        const response = await dispatch(addUser(userData));
        if (response.meta.requestStatus === "fulfilled") {
          Toastify("success", "Utilisateur ajouté avec succès");
          router.push("/user");
        } else {
          Toastify("error", "Erreur lors de l'ajout de l'utilisateur");
        }
      }
    } catch (error) {
      Swal.fire("Erreur", "Une erreur inattendue s'est produite", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 xl:flex-row">
      <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
        <p className="item-center flex justify-center text-center">
          <button
            type="button"
            className="flex cursor-default items-center rounded-md font-medium text-primary duration-300"
          >
            <IconSquareRotated className="shrink-0 fill-primary" />
          </button>
          <span className="ml-2 text-xl font-thin text-black">
            {id ? `Modifier l'utilisateur` : "Ajouter un utilisateur"}
          </span>
        </p>
        <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

        <div className="mt-8 px-4">
          <div className="flex flex-col justify-between lg:flex-row">
            {/* Information Personnelle */}
            <div className="mb-6 w-full lg:w-1/2 ltr:lg:mr-6 rtl:lg:ml-6">
              <div className="text-lg">Information personnelle :</div>

              <div className="mt-4 flex items-center">
                <label htmlFor="acno" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                  Matricule<span className="text-red-500">*</span>
                </label>
                <input
                  id="acno"
                  type="text"
                  name="matricule"
                  className="form-input flex-1"
                  placeholder="Entrer votre matricule"
                  value={accountInfo.matricule}
                  onChange={(e) =>
                    setAccountInfo({
                      ...accountInfo,
                      matricule: e.target.value,
                    })
                  }
                />
              </div>
              {errors.matricule && (
                <p className="text-red-500">{errors.matricule}</p>
              )}

              <div className="mt-4 flex items-center">
                <label
                  htmlFor="reciever-name"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  Nom<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input flex-1"
                  placeholder="Entrer votre nom"
                  value={personalInfo.name}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, name: e.target.value })
                  }
                />
              </div>
              {errors.name && <p className="text-red-500">{errors.name}</p>}

              <div className="mt-4 flex items-center">
                <label
                  htmlFor="reciever-prenom"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  Prénoms<span className="text-red-500">*</span>
                </label>
                <input
                  id="reciever-prenom"
                  type="text"
                  name="prenom"
                  className="form-input flex-1"
                  placeholder="Entrer votre prénom"
                  value={personalInfo.prenom}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, prenom: e.target.value })
                  }
                />
              </div>
              {errors.prenom && <p className="text-red-500">{errors.prenom}</p>}

              <div className="mt-4 flex items-center">
                <label
                  htmlFor="reciever-email"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  id="reciever-email"
                  type="email"
                  name="email"
                  className="form-input flex-1"
                  placeholder="Entrer votre email"
                  value={personalInfo.email}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, email: e.target.value })
                  }
                />
              </div>
              {errors.email && <p className="text-red-500">{errors.email}</p>}

              <div className="mt-4 flex items-center">
                <label
                  htmlFor="reciever-number"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  Téléphone<span className="text-red-500">*</span>
                </label>
                <input
                  id="reciever-number"
                  type="text"
                  name="number"
                  className="form-input flex-1"
                  placeholder="Entrer votre téléphone"
                  value={personalInfo.number}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      setPersonalInfo({ ...personalInfo, number: value });
                    }
                  }}
                />
              </div>
              {personalInfo.number.length > 0 &&
                personalInfo.number.length !== 10 && (
                  <p className="text-red-500">
                    Le numéro de téléphone doit contenir exactement 10 chiffres.
                  </p>
                )}

              <div className="mt-4 flex items-center">
                <label htmlFor="poste" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                  Poste
                </label>
                <input
                  id="poste"
                  type="text"
                  name="poste"
                  className="form-input flex-1"
                  placeholder="Entrer le poste"
                  value={personalInfo.poste}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, poste: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Information Compte */}
            <div className="w-full lg:w-1/2">
              <div className="text-lg">Information Compte :</div>

              <div className="mt-4 flex items-center">
                <label
                  htmlFor="profil"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  Profil<span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="Choisir un profil"
                  options={profils}
                  value={profils.find((p) => p.label === accountInfo.profil)}
                  onChange={(option) =>
                    setAccountInfo({
                      ...accountInfo,
                      profil: option?.label || "",
                    })
                  }
                  isClearable
                />
              </div>
              {errors.profil && <p className="text-red-500">{errors.profil}</p>}

              <div className="mt-4 flex items-center">
                <label htmlFor="DR" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                  Direction régionale<span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="Choisir une direction régionale"
                  options={availableDirections.filter(
                    (dir) => dir.value !== "all"
                  )}
                  value={accountInfo.dr}
                  isMulti
                  isSearchable
                  isClearable
                  onChange={(selectedOptions: any) => {
                    const newDRs = selectedOptions || [];
                    const oldDRIds = new Set(
                      accountInfo.dr.map((dr) => dr.value)
                    );
                    const newDRIds = new Set(newDRs.map((dr: any) => dr.value));

                    // Vérifier quelles DRs ont été retirées
                    const removedDRIds = [...oldDRIds].filter(
                      (id) => !newDRIds.has(id)
                    );

                    // Si des DRs ont été retirées, filtrer les secteurs correspondants
                    const updatedSecteurs =
                      removedDRIds.length > 0
                        ? accountInfo.secteur.filter((secteur) => {
                            // Garder le secteur si sa DR est toujours sélectionnée
                            const sectorInfo = secteurData?.find(
                              (s: { id: number }) =>
                                s.id === Number(secteur.value)
                            );
                            return (
                              sectorInfo &&
                              newDRs.some(
                                (dr: any) =>
                                  Number(dr.value) ===
                                  sectorInfo.directionRegionaleId
                              )
                            );
                          })
                        : accountInfo.secteur;

                    // Mettre à jour les DRs sélectionnées
                    setAccountInfo((prev) => ({
                      ...prev,
                      dr: newDRs,
                      secteur: updatedSecteurs,
                    }));

                    // Récupérer les secteurs pour les nouvelles DRs
                    if (newDRs.length > 0) {
                      const drIds = newDRs
                        .map((dr: any) => Number(dr.value))
                        .filter((id: number) => !isNaN(id) && id > 0);

                      if (drIds.length > 0) {
                        dispatch(fetchSecteurs(drIds));
                      }
                    } else {
                      setAvailableSecteurs([]);
                    }
                  }}
                  className="flex-1"
                  classNamePrefix="select"
                />
              </div>
              {errors.dr && <p className="text-red-500">{errors.dr}</p>}

              <div className="mt-4 flex items-center">
                <label
                  htmlFor="secteur"
                  className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2"
                >
                  Secteur<span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder={
                    accountInfo.dr.length === 0
                      ? "Sélectionnez d'abord une direction régionale"
                      : "Choisir un secteur"
                  }
                  options={availableSecteurs.filter(
                    (sect) => sect.value !== "all"
                  )}
                  value={accountInfo.secteur}
                  isMulti
                  isSearchable
                  isClearable
                  isDisabled={accountInfo.dr.length === 0}
                  onChange={(selectedOptions: any) => {
                    const newSecteurs = selectedOptions || [];
                    setAccountInfo((prev) => ({
                      ...prev,
                      secteur: newSecteurs,
                    }));
                  }}
                  className="flex-1"
                  classNamePrefix="select"
                />
              </div>
              {errors.secteur && (
                <p className="text-red-500">{errors.secteur}</p>
              )}
            </div>
          </div>

          <div className="mb-10 mt-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1">
              <button
                type="button"
                className={`btn btn-success w-full gap-2 ${
                  loading ? "opacity-50" : ""
                }`}
                onClick={handleSubmit}
                disabled={loading}
              >
                <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />

                {loading ? "En cours..." : id ? "Modifier" : "Ajouter"}
              </button>

              <button
                type="button"
                className="btn btn-danger w-full gap-2"
                onClick={() => router.push("/user")}
              >
                <IconArrowBackward className="shrink-0 ltr:mr-2 rtl:ml-2" />
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="mt-6 w-full xl:mt-0 xl:w-96">
        <div className="panel mb-5 h-full">
          <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

          <p className="flex items-center justify-center text-center">
            <button
              type="button"
              className={` h-10 cursor-default items-center rounded-md font-medium text-success duration-300`}
            >
              <IconSquareRotated className="shrink-0 fill-success" />
            </button>
            <span className="ml-4 items-center justify-center text-center text-lg font-bold">
              Récapitulatif
            </span>
          </p>

          <div className="mt-4">
            <p>
              <label className="text-[#8e8e8e]">
                Nom : <span className="text-black">{personalInfo.name}</span>
              </label>{" "}
              <br />
              <label className="text-[#8e8e8e]">
                Prénoms :{" "}
                <span className="text-black">{personalInfo.prenom} </span>
              </label>
              <br />
              <label className="text-[#8e8e8e]">
                Email : <span className="text-black">{personalInfo.email}</span>
              </label>{" "}
              <br />
              <label className="text-[#8e8e8e]">
                Téléphone :{" "}
                <span className="text-black">{personalInfo.number}</span>
              </label>{" "}
              <br />
              <label className="text-[#8e8e8e]">
                Poste : <span className="text-black">{personalInfo.poste}</span>
              </label>{" "}
            </p>
            <p className="mt-4">
              <label className="text-[#8e8e8e]">
                Matricule :{" "}
                <span className="text-black">{accountInfo.matricule}</span>
              </label>{" "}
              <br />
              <label className="text-[#8e8e8e]">
                Profil :{" "}
                <span className="text-black">{accountInfo.profil}</span>
              </label>{" "}
              <br />
              <>
                <label className="text-[#8e8e8e]">
                  Direction régionale :{" "}
                  <span className="text-black">
                    {accountInfo.dr.map((dr: Option) => dr.label).join(", ")}
                  </span>
                </label>{" "}
                <br />
              </>
              <label className="text-[#8e8e8e]">
                Secteur :{" "}
                <span className="text-black">
                  {accountInfo.secteur
                    .map((secteur: Option) => secteur.label)
                    .join(", ")}
                </span>
              </label>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentsAppsInvoiceAdd;
