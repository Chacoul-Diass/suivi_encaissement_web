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
import IconId from "@/components/icon/icon-id";
import IconUser from "@/components/icon/icon-user";
import IconMail from "@/components/icon/icon-mail";
import IconPhone from "@/components/icon/icon-phone";
import IconBuildingStore from "@/components/icon/icon-building-store";
import IconUserCircle from "@/components/icon/icon-user-circle";
import IconBuildingSkyscraper from "@/components/icon/icon-building-skyscraper";
import IconBuildingCommunity from "@/components/icon/icon-building-community";
import IconAlertCircle from "@/components/icon/icon-alert-circle";

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
          poste: user.poste || "",
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
            accountInfo.dr.length === availableDirections.length - 1
              ? "✕ Désélectionner toutes les directions"
              : "✓ Sélectionner toutes les directions",
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
              ? "✕ Désélectionner tous les secteurs"
              : "✓ Sélectionner tous les secteurs",
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

    // Si le profil n'est pas ADMIN, alors DR et secteur sont obligatoires pour Comptable et AGC
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
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <IconSquareRotated className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">
              {id ? `Modifier l'utilisateur` : "Ajouter un utilisateur"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => router.push("/user")}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <IconArrowBackward className="h-4 w-4" />
            Retour
          </button>
        </div>
        <hr className="my-6 border-gray-200 dark:border-gray-700" />

        <div className="px-4">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Information Personnelle */}
            <div className="w-full space-y-6 lg:w-1/2">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <IconSquareRotated className="h-5 w-5 text-primary" />
                Information personnelle
              </div>

              <div className="space-y-4 rounded-xl bg-gray-50 p-6 dark:bg-gray-800/50">
                <div className="space-y-2">
                  <label
                    htmlFor="matricule"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center gap-1">
                      <IconId className="h-4 w-4 text-gray-400" />
                      Matricule <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <IconId className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="matricule"
                      type="text"
                      className="form-input w-full rounded-lg border-gray-300 bg-white pl-10 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
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
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                      <IconAlertCircle className="h-4 w-4" />
                      {errors.matricule}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <div className="flex items-center gap-1">
                        <IconUser className="h-4 w-4 text-gray-400" />
                        Nom <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <IconUser className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        className="form-input w-full rounded-lg border-gray-300 bg-white pl-10 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Entrer votre nom"
                        value={personalInfo.name}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                        <IconAlertCircle className="h-4 w-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="prenom"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <div className="flex items-center gap-1">
                        <IconUser className="h-4 w-4 text-gray-400" />
                        Prénoms <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <IconUser className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="prenom"
                        type="text"
                        className="form-input w-full rounded-lg border-gray-300 bg-white pl-10 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Entrer votre prénom"
                        value={personalInfo.prenom}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            prenom: e.target.value,
                          })
                        }
                      />
                    </div>
                    {errors.prenom && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                        <IconAlertCircle className="h-4 w-4" />
                        {errors.prenom}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center gap-1">
                      <IconMail className="h-4 w-4 text-gray-400" />
                      Email <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <IconMail className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex">
                      <input
                        id="email"
                        type="text"
                        className={`form-input ${personalInfo.email.includes('@') ? 'flex-1 rounded-l-lg border-r-0' : 'w-full rounded-lg'} border-gray-300 bg-white pl-10 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700`}
                        placeholder="exemple@cie.ci"
                        value={personalInfo.email}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Si l'utilisateur essaie de saisir après @, ne pas permettre
                          if (value.includes('@') && value.split('@').length > 2) {
                            return;
                          }

                          // Si l'utilisateur saisit @, ajouter automatiquement le domaine par défaut
                          if (value.endsWith('@')) {
                            setPersonalInfo({
                              ...personalInfo,
                              email: value + "cie.ci"
                            });
                            return;
                          }

                          setPersonalInfo({
                            ...personalInfo,
                            email: value,
                          });
                        }}
                      />
                      {personalInfo.email.includes('@') && (
                        <select
                          value={personalInfo.email.includes('@') ? personalInfo.email.split('@')[1] : "cie.ci"}
                          onChange={(e) => {
                            const prefix = personalInfo.email.split('@')[0];
                            setPersonalInfo({
                              ...personalInfo,
                              email: `${prefix}@${e.target.value}`
                            });
                          }}
                          className="rounded-r-lg border-l-0 border-gray-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                        >
                          <option value="cie.ci">cie.ci</option>
                          <option value="gs2e.ci">gs2e.ci</option>
                        </select>
                      )}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                      <IconAlertCircle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="number"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center gap-1">
                      <IconPhone className="h-4 w-4 text-gray-400" />
                      Téléphone <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <IconPhone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="number"
                      type="text"
                      className="form-input w-full rounded-lg border-gray-300 bg-white pl-10 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                      placeholder="0X XX XX XX XX"
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
                      <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                        <IconAlertCircle className="h-4 w-4" />
                        Le numéro de téléphone doit contenir exactement 10
                        chiffres.
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="poste"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center gap-1">
                      <IconBuildingStore className="h-4 w-4 text-gray-400" />
                      Poste
                    </div>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <IconBuildingStore className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="poste"
                      type="text"
                      className="form-input w-full rounded-lg border-gray-300 bg-white pl-10 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Entrer le poste"
                      value={personalInfo.poste}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          poste: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Information Compte */}
            <div className="w-full space-y-6 lg:w-1/2">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <IconSquareRotated className="h-5 w-5 text-primary" />
                Information Compte
              </div>

              <div className="space-y-4 rounded-xl bg-gray-50 p-6 dark:bg-gray-800/50">
                <div className="space-y-2">
                  <label
                    htmlFor="profil"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center gap-1">
                      <IconUserCircle className="h-4 w-4 text-gray-400" />
                      Profil <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <Select
                    id="profil"
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
                    className="text-sm"
                    classNamePrefix="select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: "#E5E7EB",
                        borderRadius: "0.5rem",
                        minHeight: "2.5rem",
                        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                        paddingLeft: "2.5rem",
                      }),
                      container: (base) => ({
                        ...base,
                        position: "relative",
                        "&:before": {
                          content: '""',
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "16px",
                          height: "16px",
                          backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round' class='css-i6dzq1'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E\")",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                          opacity: 0.5,
                          zIndex: 1,
                        },
                      }),
                      menuList: (base) => ({
                        ...base,
                        maxHeight: "200px",
                      }),
                    }}
                  />
                  {errors.profil && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                      <IconAlertCircle className="h-4 w-4" />
                      {errors.profil}
                    </p>
                  )}
                </div>

                {accountInfo.profil !== "ADMIN" && (
                  <>
                    <div className="space-y-2">
                      <label
                        htmlFor="dr"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <div className="flex items-center gap-1">
                          <IconBuildingSkyscraper className="h-4 w-4 text-gray-400" />
                          Direction régionale{" "}
                          <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <Select
                        id="dr"
                        placeholder="Choisir une direction régionale"
                        options={availableDirections}
                        value={accountInfo.dr}
                        isMulti
                        isSearchable
                        isClearable
                        onChange={(selectedOptions: any) => {
                          // Gestion de "Tout sélectionner/désélectionner"
                          if (
                            selectedOptions?.some((opt: any) => opt.value === "all")
                          ) {
                            if (
                              accountInfo.dr.length ===
                              availableDirections.length - 1
                            ) {
                              // Tout désélectionner
                              setAccountInfo((prev) => ({
                                ...prev,
                                dr: [],
                                secteur: [],
                              }));
                              setAvailableSecteurs([]);
                            } else {
                              // Tout sélectionner
                              const allDRs = availableDirections
                                .filter((dir) => dir.value !== "all")
                                .map((dir) => ({
                                  value: dir.value,
                                  label: dir.label,
                                }));
                              setAccountInfo((prev) => ({
                                ...prev,
                                dr: allDRs,
                              }));
                              const drIds = allDRs
                                .map((dr: any) => Number(dr.value))
                                .filter((id: number) => !isNaN(id) && id > 0);
                              if (drIds.length > 0) {
                                dispatch(fetchSecteurs(drIds));
                              }
                            }
                            return;
                          }

                          // Gestion normale des sélections
                          const newDRs = selectedOptions || [];
                          const oldDRIds = new Set(
                            accountInfo.dr.map((dr) => dr.value)
                          );
                          const newDRIds = new Set(
                            newDRs.map((dr: any) => dr.value)
                          );
                          const removedDRIds = [...oldDRIds].filter(
                            (id) => !newDRIds.has(id)
                          );

                          const updatedSecteurs =
                            removedDRIds.length > 0
                              ? accountInfo.secteur.filter((secteur) => {
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

                          setAccountInfo((prev) => ({
                            ...prev,
                            dr: newDRs,
                            secteur: updatedSecteurs,
                          }));

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
                        className="text-sm"
                        classNamePrefix="select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: "#E5E7EB",
                            borderRadius: "0.5rem",
                            minHeight: "2.5rem",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            maxHeight: "100px",
                            overflowY: "auto",
                            flexWrap: "wrap",
                            padding: "2px 8px",
                          }),
                          menuList: (base) => ({
                            ...base,
                            maxHeight: "200px",
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor:
                              state.data.value === "all"
                                ? "#F3F4F6"
                                : base.backgroundColor,
                            fontWeight:
                              state.data.value === "all" ? "600" : "normal",
                            color:
                              state.data.value === "all" ? "#374151" : base.color,
                          }),
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="secteur"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <div className="flex items-center gap-1">
                          <IconBuildingCommunity className="h-4 w-4 text-gray-400" />
                          Exploitation <span className="text-red-500">*</span>
                        </div>
                      </label>

                      <Select
                        id="secteur"
                        placeholder={
                          accountInfo.dr.length === 0
                            ? "Sélectionnez d'abord une direction régionale"
                            : "Choisir un secteur"
                        }
                        options={availableSecteurs}
                        value={accountInfo.secteur}
                        classNamePrefix="select"
                        isMulti
                        isSearchable
                        isClearable
                        isDisabled={accountInfo.dr.length === 0}
                        onChange={(selectedOptions: any) => {
                          // Gestion de "Tout sélectionner/désélectionner"
                          if (
                            selectedOptions?.some((opt: any) => opt.value === "all")
                          ) {
                            if (accountInfo.secteur.length === secteurData.length) {
                              // Tout désélectionner
                              setAccountInfo((prev) => ({
                                ...prev,
                                secteur: [],
                              }));
                            } else {
                              // Tout sélectionner
                              const allSecteurs = availableSecteurs
                                .filter((sect) => sect.value !== "all")
                                .map((sect) => ({
                                  value: sect.value,
                                  label: sect.label,
                                }));
                              setAccountInfo((prev) => ({
                                ...prev,
                                secteur: allSecteurs,
                              }));
                            }
                            return;
                          }

                          // Gestion normale des sélections
                          const newSecteurs = selectedOptions || [];
                          setAccountInfo((prev) => ({
                            ...prev,
                            secteur: newSecteurs,
                          }));
                        }}
                        className="text-sm"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: "#E5E7EB",
                            borderRadius: "0.5rem",
                            minHeight: "2.5rem",
                            maxHeight: "100px",
                            overflowY: "auto",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                          }),
                          menu: (base) => ({
                            ...base,
                            position: "absolute",
                            width: "100%",
                            zIndex: 1000,
                          }),
                          menuList: (base) => ({
                            ...base,
                            maxHeight: "150px",
                            overflowY: "auto",
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor:
                              state.data.value === "all"
                                ? "#F3F4F6"
                                : base.backgroundColor,
                            fontWeight:
                              state.data.value === "all" ? "600" : "normal",
                            color:
                              state.data.value === "all" ? "#374151" : base.color,
                            padding: "8px 12px",
                          }),
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: "#EFF6FF",
                            borderRadius: "4px",
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: "#2563EB",
                            padding: "2px 6px",
                          }),
                          multiValueRemove: (base) => ({
                            ...base,
                            color: "#2563EB",
                            ":hover": {
                              backgroundColor: "#DBEAFE",
                              color: "#1D4ED8",
                            },
                          }),
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 active:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <IconSave className="h-4 w-4" />
              {loading ? "En cours..." : id ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="mt-6 w-full xl:mt-0 xl:w-96">
        <div className="panel h-full">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <IconSquareRotated className="h-5 w-5 text-success" />
              <h3 className="text-lg font-semibold">Récapitulatif</h3>
            </div>
          </div>

          <div className="space-y-6 p-4" style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Information personnelle
              </h4>
              <div className="rounded-lg bg-gradient-to-br from-gray-50 to-orange-50/30 p-4 dark:from-gray-800/50 dark:to-orange-900/20">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IconUser className="h-4 w-4 text-primary" />
                      Nom :
                    </dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {personalInfo.name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IconUser className="h-4 w-4 text-primary" />
                      Prénoms :
                    </dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {personalInfo.prenom}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IconMail className="h-4 w-4 text-primary" />
                      Email :
                    </dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {personalInfo.email}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IconPhone className="h-4 w-4 text-primary" />
                      Téléphone :
                    </dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {personalInfo.number}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IconBuildingStore className="h-4 w-4 text-primary" />
                      Poste :
                    </dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {personalInfo.poste || "-"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Information compte
              </h4>
              <div className="rounded-lg bg-gradient-to-br from-gray-50 to-orange-50/30 p-4 dark:from-gray-800/50 dark:to-orange-900/20">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IconId className="h-4 w-4 text-primary" />
                      Matricule :
                    </dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {accountInfo.matricule}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IconUserCircle className="h-4 w-4 text-primary" />
                      Profil :
                    </dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {accountInfo.profil || "-"}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IconBuildingSkyscraper className="h-4 w-4 text-primary" />
                      Directions régionales ({accountInfo.dr.length}) :
                    </dt>
                    <dd className="mt-2">
                      {accountInfo.dr.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1" style={{ maxHeight: "150px", overflowY: "auto" }}>
                          {accountInfo.dr.map((dr: Option, index: number) => (
                            <div
                              key={index}
                              className="flex items-center rounded bg-white/80 px-2 py-1 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200/70 hover:bg-orange-50/50"
                            >
                              <IconBuildingSkyscraper className="mr-2 h-3 w-3 text-primary" />
                              {dr.label}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IconBuildingCommunity className="h-4 w-4 text-primary" />
                      Exploitations ({accountInfo.secteur.length}) :
                    </dt>
                    <dd className="mt-2">
                      {accountInfo.secteur.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1" style={{ maxHeight: "150px", overflowY: "auto" }}>
                          {accountInfo.secteur.map(
                            (secteur: Option, index: number) => (
                              <div
                                key={index}
                                className="flex items-center rounded bg-white/80 px-2 py-1 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200/70 hover:bg-orange-50/50"
                              >
                                <IconBuildingCommunity className="mr-2 h-3 w-3 text-primary" />
                                {secteur.label}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentsAppsInvoiceAdd;
