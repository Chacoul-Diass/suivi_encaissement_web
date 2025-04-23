"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import IconSave from "@/components/icon/icon-save";
import IconArrowBackward from "../icon/icon-arrow-backward";
import IconSquareRotated from "../icon/icon-square-rotated";
import IconCaretDown from "@/components/icon/icon-caret-down";
import IconFolder from "@/components/icon/icon-folder";
import IconVideo from "@/components/icon/icon-video";
import IconEdit from "@/components/icon/icon-edit";
import { motion, AnimatePresence } from "framer-motion";
import IconTxtFile from "../icon/icon-txt-file";
import IconTrashLines from "../icon/icon-trash-lines";
import IconClipboardText from "@/components/icon/icon-clipboard-text";
import { useDispatch, useSelector } from "react-redux";
import { TAppDispatch, TRootState } from "@/store";
import { fetchObjet } from "@/store/reducers/permission/objet-get-slice";
import { fetchpermissions } from "@/store/reducers/permission/list-crud.slice";
import { fetchAddRole } from "@/store/reducers/permission/create-habilitation.slice";
import { Metadata } from "next";
import { fetchUpdateRole } from "@/store/reducers/permission/edit-habilitations.slice";
import { fetchProfile } from "@/store/reducers/select/profile.slice";
import { handleApiError } from "@/utils/apiErrorHandler";
import { toast } from "react-toastify";
import {
  IconUsers,
  IconShieldLock,
  IconSettings,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconInfoCircle,
  IconRefresh,
} from "@tabler/icons-react";

// Définition des types pour les options des sélecteurs
interface Option {
  value: string;
  label: string;
}

interface DataResponse {
  profils: Option[];
  dr_secteurs: { [key: string]: Option[] };
}

interface Objet {
  id: number;
  text: string;
  description: string;
}

interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface RoleProps {
  modalEdit: boolean;
  onClose: () => void;
  selectedRole?: {
    id: number;
    text: string;
    name: string;
    permissions: { objectId: number; permissionId: number }[];
  };
}

export const metadata: Metadata = {
  title: "Ajouter un rôle",
};

const Role = ({ modalEdit, selectedRole, onClose }: RoleProps) => {
  const dispatch = useDispatch<TAppDispatch>();

  const [personalInfo, setPersonalInfo] = useState<any>({
    libelle: modalEdit && selectedRole ? selectedRole.text : "",
    description: modalEdit && selectedRole ? selectedRole.name : "",
    permissions: (modalEdit && selectedRole?.permissions) || [],
  });

  const [errors, setErrors] = useState({
    libelle: "",
    description: "",
  });

  const objetList: any = useSelector(
    (state: TRootState) => state.ListHabilitation?.data
  );

  const permissionList: Permission[] = useSelector(
    (state: TRootState) => state.permissionCrud.data
  );

  useEffect(() => {
    dispatch(fetchObjet());
    dispatch(fetchpermissions());
  }, [dispatch]);

  const items2: any = useMemo(
    () =>
      objetList
        ? objetList?.map(
          (objet: { id: number; name: string; description: string }) => ({
            id: objet.id,
            text: objet.name,
            description: objet.description || "",
          })
        )
        : [],
    [objetList]
  );

  const permissionNames = useMemo(
    () => permissionList?.map((perm: any) => perm?.name) || [],
    [permissionList]
  );

  const [individualSwitches, setIndividualSwitches] = useState<boolean[][]>([]);
  const [globalSwitch, setGlobalSwitch] = useState(false);
  const [treeview, setTreeview] = useState<string[]>([]);
  const [openAccordions, setOpenAccordions] = useState<{
    [key: string]: boolean;
  }>({});

  const getDynamicDependanceMapping = (items: Objet[]) => {
    const mapping: Record<string, string[]> = {};

    // Trouver les objets principaux
    const mesEncaissements = items.find(
      (item: any) => item?.text === "MES ENCAISSEMENTS"
    );
    const reclamation = items.find((item: any) => item?.text === "LITIGES");

    if (mesEncaissements) {
      mapping["MES ENCAISSEMENTS"] = items
        .filter((item: any) =>
          [
            "ENCAISSEMENTS VALIDES",
            "ENCAISSEMENTS CHARGES",
            "ENCAISSEMENTS VERIFIES",
            "ENCAISSEMENTS REJETES",
            "ENCAISSEMENTS TRAITES",
          ].includes(item?.text)
        )
        .map((item: any) => item?.text);
    }

    if (reclamation) {
      mapping["LITIGES"] = items
        .filter((item: any) =>
          ["LITIGES CHARGES", "LITIGES TRAITES"].includes(item?.text)
        )
        .map((item: any) => item?.text);
    }

    return mapping;
  };

  const hasActivePermission = useCallback(
    (objectName: string) => {
      const roleIndex = items2.findIndex(
        (item: any) => item.text.trim() === objectName.trim()
      );
      if (roleIndex === -1) return false;

      return individualSwitches[roleIndex]?.some(Boolean) || false;
    },
    [items2, individualSwitches]
  );

  const filteredItems = useMemo(() => {
    if (!items2) return [];

    const dependanceMapping = getDynamicDependanceMapping(items2);

    // Déterminer les objets toujours visibles
    const alwaysDisplayed = items2
      .filter((item: any) =>
        [
          "DASHBOARD",
          "MES ENCAISSEMENTS",
          "UTILISATEURS",
          "HABILITATIONS",
          "RECLAMATION",
          "RAPPROCHEMENT",
          "HISTORIQUE CONNEXIONS",
          "PARAMETRES",
        ].includes(item?.text)
      )
      .map((item: any) => item?.text);

    let displayedObjects = [...alwaysDisplayed];

    // Vérifier MES ENCAISSEMENTS
    if (hasActivePermission("MES ENCAISSEMENTS")) {
      displayedObjects.push(...(dependanceMapping["MES ENCAISSEMENTS"] || []));
    }

    // Vérifier RECLAMATION
    if (hasActivePermission("RECLAMATION")) {
      displayedObjects.push(...(dependanceMapping["RECLAMATION"] || []));
    }

    return items2.filter((item: any) => displayedObjects.includes(item?.text));
  }, [items2, hasActivePermission]); // hasActivePermission est maintenant stable grâce à useCallback

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  // Toggle global switch, which controls all individual switches
  const handleGlobalSwitch = () => {
    const newState = !globalSwitch;
    setGlobalSwitch(newState);
    const updatedSwitches = items2?.map(() =>
      permissionNames?.map(() => newState)
    );
    setIndividualSwitches(updatedSwitches);
  };

  // Toggle individual switch for a specific role and permission
  const handleIndividualSwitch = (roleIndex: number, permIndex: number) => {
    const updatedSwitches = [...individualSwitches];
    updatedSwitches[roleIndex][permIndex] =
      !updatedSwitches[roleIndex][permIndex];
    setIndividualSwitches(updatedSwitches);
  };

  // Handle folder expansion in the treeview
  const toggleTreeview = (name: any) => {
    if (treeview.includes(name)) {
      setTreeview((value) => value.filter((d) => d !== name));
    } else {
      setTreeview([...treeview, name]);
    }
  };

  useEffect(() => {
    if (items2?.length > 0 && permissionNames?.length > 0) {
      // Initialise les switches
      const updatedSwitches = items2.map(
        () => permissionNames.map(() => false) // Initialiser toutes les cases à décochées
      );

      // Mettre à jour les switches en fonction des permissions existantes (en cas d'édition)
      personalInfo.permissions.forEach(
        (perm: { objectId: number; permissionId: number }) => {
          const roleIndex = items2.findIndex(
            (item: { id: number }) => item?.id === perm.objectId
          );
          const permIndex = permissionList.findIndex(
            (p: Permission) => p.id === perm.permissionId
          );
          if (roleIndex !== -1 && permIndex !== -1) {
            updatedSwitches[roleIndex][permIndex] = true; // Marquer la case comme cochée
          }
        }
      );

      setIndividualSwitches(updatedSwitches); // Mettre à jour l'état
    }
  }, [items2, permissionNames, personalInfo.permissions, permissionList]);

  const generateSelectedPermissions = () => {
    const selectedPermissions: { objectId: number; permissionId: number }[] =
      [];

    items2.forEach((item: Objet, roleIndex: number) => {
      permissionList.forEach((permission: Permission, permIndex: number) => {
        if (individualSwitches[roleIndex]?.[permIndex]) {
          selectedPermissions.push({
            objectId: item?.id, // ID de l'objet
            permissionId: permission.id, // ID de la permission
          });
        }
      });
    });

    return selectedPermissions;
  };

  const handleSave = async () => {
    const selectedPermissions = generateSelectedPermissions();

    const roleData = {
      name: personalInfo.libelle,
      description: personalInfo.description,
      permissions: selectedPermissions,
    };

    if (modalEdit) {
      // Cas de la modification du rôle
      try {
        if (selectedRole?.id) {
          await dispatch(
            fetchUpdateRole({ roleData, id: selectedRole.id })
          ).unwrap();

          toast.success("Les informations ont été mises à jour avec succès !");
          onClose();
          await dispatch(fetchProfile());
        } else {
          toast.error("ID du rôle manquant pour la mise à jour.");
        }
      } catch (err: any) {
        const errorMessage = handleApiError(err);
        toast.error(
          errorMessage || "Une erreur s'est produite lors de la mise à jour."
        );
      }
    } else {
      // Cas de la création d'un nouveau rôle
      try {
        await dispatch(fetchAddRole(roleData)).unwrap();
        toast.success("Profil ajouté avec succès !");
        onClose();
        await dispatch(fetchProfile());
      } catch (err: any) {
        const errorMessage = handleApiError(err);
        toast.error(
          errorMessage || "Une erreur s'est produite lors de la création."
        );
      }
    }
  };

  const toggleAccordion = (roleId: string) => {
    setOpenAccordions((prev) => {
      // Si l'accordéon est déjà ouvert, on le ferme
      if (prev[roleId]) {
        const { [roleId]: _, ...rest } = prev;
        return rest;
      }
      // Sinon on l'ouvre en fermant les autres
      return {
        [roleId]: true,
      };
    });
  };

  const renderAccordions = () => (
    <div className="max-h-[calc(100vh-300px)] overflow-y-auto px-1">
      <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredItems?.map(
          (role: { id: any; text: any }, roleIndex: number) => {
            const isOpen = openAccordions[role.id] || false;
            const activePermissions =
              individualSwitches[roleIndex]?.filter(Boolean).length || 0;
            const totalPermissions = permissionNames?.length || 0;
            const progress = (activePermissions / totalPermissions) * 100;

            return (
              <div
                key={role.id}
                className={`group relative h-full overflow-hidden rounded-2xl border-0 bg-white shadow-lg ${isOpen
                    ? "shadow-success/10 ring-2 ring-success/30"
                    : "hover:shadow-xl"
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-success/5 opacity-50" />
                <div
                  className={`absolute inset-0 bg-success/5 transition-opacity duration-300 ${isOpen ? "opacity-10" : "opacity-0"
                    }`}
                />

                <button
                  type="button"
                  className={`relative flex w-full items-center justify-between p-5 text-left ${isOpen ? "bg-success/5" : "hover:bg-gray-50/80"
                    }`}
                  onClick={() => toggleAccordion(role.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl backdrop-blur-sm transition-all duration-300 ${isOpen
                          ? "bg-success/15 shadow-lg shadow-success/10"
                          : "bg-gray-100/80 group-hover:bg-success/10"
                        }`}
                    >
                      <IconUsers
                        className={`h-7 w-7 transition-colors duration-300 ${isOpen
                            ? "text-success"
                            : "text-gray-500 group-hover:text-success"
                          }`}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {role.text}
                      </h4>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100/80 backdrop-blur-sm">
                            <div
                              className="h-full rounded-full bg-success shadow-sm transition-all duration-300"
                              style={{
                                width: `${progress}%`,
                                boxShadow: isOpen
                                  ? "0 0 15px rgba(0, 200, 100, 0.3)"
                                  : "none",
                              }}
                            />
                          </div>
                        </div>
                        <span className="min-w-[3rem] text-center text-sm font-medium text-gray-500">
                          {activePermissions}/{totalPermissions}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {activePermissions > 0 && (
                      <span className="flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success backdrop-blur-sm">
                        <IconCheck className="h-4 w-4" />
                        {activePermissions}
                      </span>
                    )}
                    <IconCaretDown
                      className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180 text-success" : "text-gray-400"
                        }`}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <div className="relative overflow-hidden">
                      <div className="max-h-[350px] space-y-3 overflow-y-auto border-t border-gray-100 bg-gray-50/80 p-5 backdrop-blur-sm">
                        {permissionNames?.map((permission, permIndex) => {
                          let IconComponent = IconTxtFile;
                          let iconColorClass = "text-gray-400";
                          let bgColorClass = "bg-gray-100/80";
                          let labelClass = "text-gray-700";
                          let description = "";

                          switch (permission) {
                            case "CREATION":
                              IconComponent = IconSave;
                              iconColorClass = "text-emerald-500";
                              bgColorClass = "bg-emerald-50/80";
                              labelClass = "text-emerald-700";
                              description = "Créer de nouveaux éléments";
                              break;
                            case "LECTURE":
                              IconComponent = IconClipboardText;
                              iconColorClass = "text-blue-500";
                              bgColorClass = "bg-blue-50/80";
                              labelClass = "text-blue-700";
                              description = "Consulter les informations";
                              break;
                            case "MODIFICATION":
                              IconComponent = IconEdit;
                              iconColorClass = "text-amber-500";
                              bgColorClass = "bg-amber-50/80";
                              labelClass = "text-amber-700";
                              description = "Modifier les données existantes";
                              break;
                            case "SUPPRESSION":
                              IconComponent = IconTrashLines;
                              iconColorClass = "text-rose-500";
                              bgColorClass = "bg-rose-50/80";
                              labelClass = "text-rose-700";
                              description = "Supprimer des éléments";
                              break;
                          }

                          const isChecked =
                            individualSwitches[roleIndex]?.[permIndex] || false;

                          return (
                            <div
                              key={permIndex}
                              className={`group/item flex items-center justify-between rounded-xl bg-white/90 p-4 shadow-sm transition-colors duration-300 ${isChecked
                                  ? "shadow-success/10 ring-1 ring-success"
                                  : "hover:bg-white hover:shadow-md"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${bgColorClass}`}
                                >
                                  <IconComponent
                                    className={`h-4 w-4 ${iconColorClass}`}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-medium ${labelClass}`}
                                    >
                                      {permission}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      • {description}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`flex h-7 items-center justify-center rounded-full px-3 text-xs font-medium transition-all duration-300 ${isChecked
                                      ? "bg-success/10 text-success"
                                      : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                  {isChecked ? "Activé" : "Désactivé"}
                                </span>
                                <label className="relative inline-flex cursor-pointer items-center">
                                  <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={isChecked}
                                    onChange={() =>
                                      handleIndividualSwitch(
                                        roleIndex,
                                        permIndex
                                      )
                                    }
                                  />
                                  <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-success/20"></div>
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gray-50/50 p-4 lg:p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="flex flex-col gap-6 xl:flex-row">
          {/* FORMULAIRE PRINCIPAL */}
          <div className="flex-1">
            <div className="rounded-xl bg-white p-4 shadow-md transition-all duration-300 lg:p-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <IconSquareRotated className="h-5 w-5 shrink-0 fill-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-gray-800">
                      {modalEdit
                        ? `Modifier le profil ${personalInfo?.libelle}`
                        : "Ajouter un profil"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {modalEdit
                        ? "Modifiez les informations du profil"
                        : "Créez un nouveau profil avec ses permissions"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-6">
                {/* Informations du profil */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="libelle"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Libellé <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="libelle"
                      type="text"
                      name="libelle"
                      value={personalInfo.libelle}
                      className="form-input w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-colors focus:border-primary focus:ring-primary"
                      placeholder="Entrez le libellé du profil"
                      onChange={handlePersonalInfoChange}
                    />
                    {errors.libelle && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.libelle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="description"
                      type="text"
                      name="description"
                      value={personalInfo.description}
                      className="form-input w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-colors focus:border-primary focus:ring-primary"
                      placeholder="Entrez la description du profil"
                      onChange={handlePersonalInfoChange}
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Section des permissions */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <IconShieldLock className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Permissions
                        </h3>
                        <p className="text-sm text-gray-500">
                          Gérez les permissions pour chaque module
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <IconCheck
                          className={`h-5 w-5 ${globalSwitch ? "text-success" : "text-gray-400"
                            }`}
                        />
                        <span className="text-sm text-gray-600">
                          Tout sélectionner
                        </span>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={globalSwitch}
                          onChange={handleGlobalSwitch}
                        />
                        <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-success/20"></div>
                      </label>
                    </div>
                  </div>

                  {renderAccordions()}
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="btn btn-danger flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-transform hover:scale-105"
                    onClick={onClose}
                  >
                    <IconArrowBackward className="h-4 w-4" />
                    {modalEdit ? "Annuler" : "Retour"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-success flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-transform hover:scale-105"
                    onClick={handleSave}
                  >
                    <IconSave className="h-4 w-4" />
                    {modalEdit ? "Modifier" : "Ajouter"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RÉCAPITULATIF */}
          <div className="w-full xl:w-96">
            <div className="sticky top-4 rounded-xl bg-white p-4 shadow-md transition-all duration-300 lg:p-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="rounded-lg bg-success/10 p-2">
                  <IconSquareRotated className="h-5 w-5 shrink-0 fill-success" />
                </div>
                <h3 className="text-base font-bold text-gray-800">
                  Récapitulatif
                </h3>
              </div>

              <div className="mt-4 space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">
                      Libellé
                    </label>
                    <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
                      {personalInfo.libelle || "Non défini"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">
                      Description
                    </label>
                    <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
                      {personalInfo.description || "Non défini"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-danger/10 p-1.5">
                      <IconSquareRotated className="h-4 w-4 shrink-0 fill-danger" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800">
                      Permissions
                    </h4>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto rounded-lg bg-gray-50 p-3">
                    {/* Permission TreeView */}
                    <div className="space-y-3">
                      <div className="relative">
                        <button
                          type="button"
                          className={`flex w-full items-center justify-between rounded-lg bg-white p-3 text-left text-sm font-medium shadow-sm transition-all duration-200 hover:bg-gray-50 ${treeview.includes(personalInfo.libelle)
                              ? "bg-gray-50"
                              : ""
                            }`}
                          onClick={() => toggleTreeview(personalInfo.libelle)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                              <IconFolder className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-gray-700">
                              {personalInfo.libelle || "Nouveau profil"}
                            </span>
                          </div>
                          <IconCaretDown
                            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${treeview.includes(personalInfo.libelle)
                                ? "rotate-180"
                                : ""
                              }`}
                          />
                        </button>

                        <AnimatePresence>
                          {treeview.includes(personalInfo.libelle) && (
                            <div className="relative overflow-hidden">
                              <div className="mt-2 space-y-2 rounded-lg bg-gray-50/50 p-3">
                                {items2?.map(
                                  (
                                    role: { text: string; id: number },
                                    roleIndex: number
                                  ) => {
                                    // Vérifie si au moins une permission est active sur ce role
                                    const isRoleVisible = individualSwitches[
                                      roleIndex
                                    ]?.some((state: boolean) => state);
                                    if (!isRoleVisible) return null;

                                    const isRoleOpen = treeview.includes(
                                      role.text
                                    );

                                    return (
                                      <div
                                        key={role.id}
                                        className="mb-2 rounded-lg bg-white"
                                      >
                                        <button
                                          type="button"
                                          className={`flex w-full items-center justify-between rounded-lg p-3 text-left text-sm transition-all duration-200 ${isRoleOpen ? "bg-gray-50" : ""
                                            }`}
                                          onClick={() =>
                                            toggleTreeview(role.text)
                                          }
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10">
                                              <IconFolder className="h-4 w-4 text-success" />
                                            </div>
                                            <span className="font-medium text-gray-700">
                                              {role.text}
                                            </span>
                                          </div>
                                          <IconCaretDown
                                            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isRoleOpen ? "rotate-180" : ""
                                              }`}
                                          />
                                        </button>

                                        <AnimatePresence>
                                          {isRoleOpen && (
                                            <div className="relative overflow-hidden">
                                              <div className="space-y-1 p-2">
                                                {permissionNames?.map(
                                                  (permission, permIndex) => {
                                                    if (
                                                      !individualSwitches[
                                                      roleIndex
                                                      ][permIndex]
                                                    )
                                                      return null;

                                                    let IconComponent =
                                                      IconTxtFile;
                                                    let iconColorClass =
                                                      "text-gray-400";
                                                    let bgColorClass =
                                                      "bg-gray-100";

                                                    switch (permission) {
                                                      case "CREATION":
                                                        IconComponent =
                                                          IconSave;
                                                        iconColorClass =
                                                          "text-green-500";
                                                        bgColorClass =
                                                          "bg-green-50";
                                                        break;
                                                      case "LECTURE":
                                                        IconComponent =
                                                          IconClipboardText;
                                                        iconColorClass =
                                                          "text-blue-500";
                                                        bgColorClass =
                                                          "bg-blue-50";
                                                        break;
                                                      case "MODIFICATION":
                                                        IconComponent =
                                                          IconEdit;
                                                        iconColorClass =
                                                          "text-yellow-500";
                                                        bgColorClass =
                                                          "bg-yellow-50";
                                                        break;
                                                      case "SUPPRESSION":
                                                        IconComponent =
                                                          IconTrashLines;
                                                        iconColorClass =
                                                          "text-red-500";
                                                        bgColorClass =
                                                          "bg-red-50";
                                                        break;
                                                    }

                                                    return (
                                                      <div
                                                        key={permIndex}
                                                        className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 hover:bg-gray-50"
                                                      >
                                                        <div
                                                          className={`flex h-6 w-6 items-center justify-center rounded-md ${bgColorClass}`}
                                                        >
                                                          <IconComponent
                                                            className={`h-3.5 w-3.5 ${iconColorClass}`}
                                                          />
                                                        </div>
                                                        <span className="text-sm text-gray-600">
                                                          {permission}
                                                        </span>
                                                      </div>
                                                    );
                                                  }
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* FIN DU RÉCAPITULATIF */}
        </div>
      </div>
    </div>
  );
};

export default Role;
