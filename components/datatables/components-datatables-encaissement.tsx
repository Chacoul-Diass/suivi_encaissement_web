"use client";
import Dropdown from "@/components/dropdown";
import IconCaretDown from "@/components/icon/icon-caret-down";
import IconPencil from "@/components/icon/icon-pencil";
import IconEye from "@/components/icon/icon-eye";
import IconMail from "@/components/icon/icon-mail";
import IconAlertTriangle from "@/components/icon/icon-alert-triangle";
import { TAppDispatch, TRootState } from "@/store";
import { fetchDataReleve } from "@/store/reducers/encaissements/releve.slice";
import { submitEncaissementValidation } from "@/store/reducers/encaissements/soumission.slice";
import { sendEmail } from "@/store/reducers/mail/mail.slice";
import { EStatutEncaissement } from "@/utils/enums";
import { Paginations } from "@/utils/interface";
import { ToastError, ToastSuccess } from "@/utils/toast";
import getUserPermission from "@/utils/user-info";
import Tippy from "@tippyjs/react";
import "flatpickr/dist/flatpickr.css";
import "jspdf-autotable";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import React, { useCallback, useEffect, useState } from "react";
import { ImageListType } from "react-images-uploading";
import "react-quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import "tippy.js/dist/tippy.css";
import ExportBtn from "../actionBtn/exportBtn";
import RefreshBtn from "../actionBtn/refreshBtn";
import GlobalFiltre from "../filtre/globalFiltre";
import ConfirmationModal from "../modales/confirmationModal";
import EditModal from "../modales/editModal";
import EmailModal from "../modales/emailModal";
import PreuvePhotoModal from "../modales/preuvePhotoModal";
import ViewModal from "../modales/viewModal";
import { fetchDirectionRegionales } from "@/store/reducers/select/dr.slice";
import EncaissementTutorial from "../tutorial/TutorialTable-encaissement";
import { handleApiError } from "@/utils/apiErrorHandler";
import { toast } from "react-toastify";

export interface DataReverse {
  id: number;
  directionRegionale: string;
  codeExpl: string;
  libelleExpl?: string;
  matriculeCaissiere?: string;
  dateEncaissement: string;
  banque: string;
  produit: string;
  compteBanque: string | null;
  numeroBordereau: string;
  journeeCaisse: string;
  modeReglement: string;
  montantReleve: number;
  isCorrect: number;
  montantRestitutionCaisse: number;
  montantBordereauBanque: number;
  ecartCaisseBanque: number;
  validationEncaissement: any | null;

  documents?: Array<{
    id: number;
    encaissementId: number;
    fileName: string;
    filePath: string;
  }>;

  // Additional fields that might be needed for the app to continue working
  "Date Encais"?: string;
  "Caisse mode"?: string;
  "Montant caisse (A)"?: number;
  "Montant bordereau (B)"?: number;
  "Montant relevé (C)"?: number;
  "Date cloture"?: string;
  "Date Validation"?: string;
  Bordereau?: string;
  caisse?: string;
  statutValidation?: number;
  DR?: string;
  EXP?: string;
  Produit?: string;
  "Compte banque Jade"?: string;
  "Ecart(A-B)"?: any;
  "Ecart(B-C)"?: any;
  "Observation(A-B)"?: string;
  "Observation(B-C)"?: string;
  "Observation rejet"?: string;
  observationReclamation?: string;
  observationRejete?: string;
}

interface DocumentType {
  id: number;
  encaissementId: number;
  fileName: string;
  filePath: string;
}

const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return "N/A";
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    useGrouping: true,
  }).format(num);
  return formatted.replace(/\s/g, " ").replace(/\u202f/g, " ");
};

interface EncaissementComptableProps {
  statutValidation: number;
  data: any[];
  fetchLoading: boolean;
  paginate: Paginations;
  habilitation: any[];
  handlePageChange?: (page: number) => void;
  handleSearchChange?: (value: string) => void;
  handleLimitChange?: (value: number) => void;
}

const ComponentsDatatablesColumnChooser: React.FC<
  EncaissementComptableProps
> = ({
  statutValidation,
  data,
  fetchLoading,
  paginate,
  habilitation,
  handlePageChange,
  handleSearchChange,
  handleLimitChange,
}: EncaissementComptableProps): React.ReactElement => {
    const dispatch = useDispatch<TAppDispatch>();

    const [search, setSearch] = useState("");
    const [hideCols, setHideCols] = useState<string[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [preuvePhotoModal, setPreuvePhotoModal] = useState(false);
    const [photoDocuments, setPhotoDocuments] = useState<DocumentType[]>([]);
    const formatDateData = (dateString: string | null | undefined): string => {
      if (!dateString) return "N/A";

      try {
        // Gérer le format DD/MM/YYYY
        if (dateString.includes("/")) {
          const [day, month, year] = dateString.split("/");
          const date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );

          if (!isNaN(date.getTime())) {
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }
        }

        // Gérer les autres formats de date
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.error("Date invalide :", dateString);
          return "N/A";
        }

        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error("Erreur lors du formatage de la date :", error);
        return "N/A";
      }
    };

    const filterAndMapData = useCallback(
      (data: any[], statutValidation: number): any[] => {
        if (!Array.isArray(data) || data.length === 0) {
          return [];
        }

        const mappedData = data?.map((item) => ({
          id: item.id,
          DR: item.directionRegionale,
          EXP: item.codeExpl,
          libelleExpl: item.libelleExpl,
          matriculeCaissiere: item.matriculeCaissiere,
          Produit: item.produit,
          banque: item.banque,
          compteBanque: item.compteBanque,
          journeeCaisse: item.journeeCaisse,
          modeReglement: item.modeReglement,
          "Date Encais": item.dateEncaissement,
          "Montant caisse (A)": item.montantRestitutionCaisse || 0,
          "Montant bordereau (B)": item.montantBordereauBanque || 0,
          "Montant relevé (C)":
            statutValidation === 0
              ? item.montantReleve || 0
              : item.validationEncaissement?.montantReleve || 0,
          isCorrect: item?.isCorrect || 0,
          "Date cloture": item.dateRemiseBanque || "",
          Bordereau: item.numeroBordereau || "",
          caisse: item.caisse || "",
          statutValidation: item.validationEncaissement?.statutValidation,
          "Ecart(A-B)":
            item.montantRestitutionCaisse - item.montantBordereauBanque,
          "Ecart(B-C)":
            statutValidation === 0
              ? (item.montantBordereauBanque || 0) - (item.montantReleve || 0)
              : item.validationEncaissement?.ecartReleve || 0,
          "Observation(A-B)":
            item.validationEncaissement?.observationCaisse || "",
          "Observation(B-C)":
            item.validationEncaissement?.observationReleve || "",
          ...(item.validationEncaissement && {
            "Date Validation": item.validationEncaissement?.dateValidation || "",
            "Observation caisse":
              item.validationEncaissement?.observationCaisse || "",
            "Observation réclamation":
              item.validationEncaissement?.observationReclamation || "",
            "Observation relevé":
              item.validationEncaissement?.observationReleve || "",
            "Ecart relevé": item.validationEncaissement?.ecartReleve || "0",
            "Montant relevé": item.validationEncaissement?.montantReleve || "0",
            observationReclamation:
              item.validationEncaissement?.observationReclamation || "",
            observationRejete:
              item.validationEncaissement?.observationRejete || "",
          }),
          documents: item.documents,
          // Ajouter les propriétés directes pour assurer la compatibilité
          directionRegionale: item.directionRegionale,
          codeExpl: item.codeExpl,
          dateEncaissement: item.dateEncaissement,
          produit: item.produit,
          numeroBordereau: item.numeroBordereau,
          montantReleve: item.montantReleve || 0,
          montantRestitutionCaisse: item.montantRestitutionCaisse || 0,
          montantBordereauBanque: item.montantBordereauBanque || 0,
          ecartCaisseBanque: item.ecartCaisseBanque || 0,
          validationEncaissement: item.validationEncaissement,
        }));
        return mappedData;
      },
      []
    );

    const [recordsData, setRecordsData] = useState<any[]>([]);

    useEffect(() => {
      const allData = filterAndMapData(data, statutValidation);
      setRecordsData(allData);
    }, [data, filterAndMapData, statutValidation]);

    const filteredData = recordsData.length > 0 ? recordsData : filterAndMapData(data, statutValidation);

    const unvalidatedRecords = recordsData.filter(
      (record) => record.validated !== EStatutEncaissement.VALIDE
    );

    const totalUnvalidatedRecords = unvalidatedRecords.length;
    const encaissementText = `${statutValidation === EStatutEncaissement.RECLAMATION_REVERSES ||
      statutValidation === EStatutEncaissement.RECLAMATION_TRAITES
      ? ` Réclamation${totalUnvalidatedRecords > 1 ? "s " : " "}`
      : ` Encaissement${totalUnvalidatedRecords > 1 ? "s " : " "}`
      }`;

    const [currentPage, setCurrentPage] = useState(paginate.currentPage || 1);
    const [pageSize, setPageSize] = useState(paginate.count || 10);
    const PAGE_SIZES = paginate.pageSizes || [10, 20, 30, 50, 100];

    useEffect(() => {
      if (paginate) {
        setCurrentPage(paginate.currentPage || 1);
        setPageSize(paginate.count || 10);
      }
    }, [paginate]);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
      columnAccessor: "Date Encais",
      direction: "asc",
    });

    const [rasChecked1, setRasChecked1] = useState(false);
    const [rasChecked2, setRasChecked2] = useState(false);
    const [selectedRow, setSelectedRow] = useState<DataReverse | null>(null);
    const [observationCaisse, setObservationCaisse] = useState("");
    const [observationBanque, setObservationBanque] = useState("");
    const [observationRejete, setObeservationRejete] = useState("");

    const showHideColumns = (col: string) => {
      if (hideCols.includes(col)) {
        setHideCols((prev) => prev.filter((d) => d !== col));
      } else {
        setHideCols((prev) => [...prev, col]);
      }
    };

    const handleOpenModal = (row: DataReverse) => {
      setSelectedRow(row);
      setObservationCaisse(row["Observation(A-B)"] || "");
      setObservationBanque(row["Observation(B-C)"] || "");
      setRasChecked1(false);
      setRasChecked2(false);
      setModalOpen(true);
    };

    const handleAmountChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      field: string
    ) => {
      const value = parseInt(event.target.value.replace(/\D/g, ""), 10);
      setSelectedRow((prev) => ({
        ...(prev as DataReverse),
        [field]: isNaN(value) ? "" : value,
      }));
    };

    const hasPermission = (habilitationName: string, permission: string) => {
      const foundHabilitation = habilitation.find(
        (h) => h.name === habilitationName
      );
      return foundHabilitation?.[permission] || false;
    };

    const today = new Date().toLocaleDateString();

    const handleRasChecked1Change = () => {
      setRasChecked1(!rasChecked1);
      if (!rasChecked1) {
        setObservationCaisse("");
      }
    };

    const handleRasChecked2Change = () => {
      setRasChecked2(!rasChecked2);
      if (!rasChecked2) {
        setObservationBanque("");
      }
    };

    const getStatutLibelle = (
      statut: EStatutEncaissement,
      count: number
    ): string => {
      const isPlural = count > 1;
      switch (statut) {
        case EStatutEncaissement.EN_ATTENTE:
          return isPlural ? "en attentes" : "en attente";
        case EStatutEncaissement.REJETE:
          return isPlural ? "rejetés" : "rejeté";
        case EStatutEncaissement.TRAITE:
          return isPlural ? "traités" : "traité";
        case EStatutEncaissement.VALIDE:
          return isPlural ? "validés" : "validé";
        case EStatutEncaissement.CLOTURE:
          return isPlural ? "cloturés" : "cloturé";
        case EStatutEncaissement.RECLAMATION_TRAITES:
          return isPlural ? "traités" : "traité";
        case EStatutEncaissement.RECLAMATION_REVERSES:
          return isPlural ? "chargés" : "chargé";
        default:
          return isPlural ? "inconnus" : "inconnu";
      }
    };

    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshTableData = async (showToast = true) => {
      // Si déjà en cours de rafraîchissement, ne pas lancer une nouvelle requête
      if (isRefreshing) {
        console.log("⚠️ Rafraîchissement déjà en cours, demande ignorée");
        return;
      }

      console.log("🔄 Début du rafraîchissement des données...");

      // Réinitialiser les données et montrer l'état de chargement
      setRecordsData([]);
      setIsRefreshing(true);

      try {
        console.log("🔍 Chargement des nouvelles données...");

        // Utiliser les paramètres actuels pour le rafraîchissement
        const result = await dispatch(
          fetchDataReleve({
            id: statutValidation,
            page: currentPage,
            limit: pageSize,
            search: search || "",
            ...params, // Inclure tous les paramètres/filtres actuels
          })
        ).unwrap();

        // Forcer un remontage complet
        setForceRender((prev) => prev + 1);

        // Mettre à jour la liste manuellement avec les nouvelles données
        if (result && result.result) {
          const newData = filterAndMapData(result.result, statutValidation);
          console.log(`📊 ${newData.length} enregistrements chargés avec succès`);
          setRecordsData(newData);
        }

        console.log("✅ Rafraîchissement des données terminé");

        // Afficher le toast seulement si showToast est true
        if (showToast) {
          toast.success("Données actualisées avec succès");
        }

        return result;
      } catch (error) {
        console.error("❌ Erreur lors du rafraîchissement des données:", error);

        // Afficher le toast d'erreur seulement si showToast est true
        if (showToast) {
          toast.error("Erreur lors du rafraîchissement des données");
        }

        throw error;
      } finally {
        // S'assurer que l'état de chargement est désactivé, même en cas d'erreur
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500); // Petit délai pour éviter un flashage du bouton
      }
    };

    const handleRefresh = async () => {
      // Éviter les doubles clics
      if (isRefreshing) return;

      setIsRefreshing(true);
      try {
        // Toujours afficher le toast lors d'un refresh explicite
        await refreshTableData(true);
      } catch (error) {
        console.error("Erreur lors de l'actualisation :", error);
      } finally {
        // S'assurer que l'état de chargement est désactivé, même en cas d'erreur
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500); // Petit délai pour éviter un flashage du bouton
      }
    };

    const showAlertValide = async (encaissementId: number) => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-dark ltr:mr-3 rtl:ml-3",
          popup: "sweet-alerts",
        },
        buttonsStyling: false,
      });

      await swalWithBootstrapButtons
        .fire({
          title: "Êtes-vous sûr de valider ?",
          text: "Cette action validera l'encaissement.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Confirmer",
          cancelButtonText: "Annuler",
          reverseButtons: true,
          padding: "2em",
        })
        .then((result) => {
          if (result.isConfirmed) {
            // Payload à soumettre
            const payload: any = {
              encaissementId,
              statutValidation: EStatutEncaissement.VALIDE,
            };

            // Ajouter les fichiers s'ils existent
            if (images2 && images2.length > 0) {
              const files = images2
                .filter((image: { file?: File; dataURL?: string }) => image.file)
                .map(
                  (image: { file?: File; dataURL?: string }) => image.file as File
                );
              payload.files = files;
            }

            // Appel à la fonction Redux ou autre logique de soumission
            dispatch(submitEncaissementValidation(payload))
              .unwrap()
              .then(async (response) => {
                swalWithBootstrapButtons.fire(
                  "Valider",
                  "Votre encaissement a été validé avec succès.",
                  "success"
                );

                // Utiliser la nouvelle fonction de rafraîchissement sans afficher le toast
                await refreshTableData(false);

                setModalOpen(false);
              })
              .catch((error) => {
                const errorMessage = handleApiError(error);
                toast.error(errorMessage);
              });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
              "Annuler",
              "Vous avez annulé l'action.",
              "error"
            );
          }
        });
    };

    const showAlertRejete = async (encaissementId: number) => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton:
            "btn btn-primary disabled:opacity-50 disabled:pointer-events-none",
          cancelButton: "btn btn-dark ltr:mr-3 rtl:ml-3",
          popup: "sweet-alerts",
        },
        buttonsStyling: false,
      });

      let userInput = "";

      let payloadStatutValidation: EStatutEncaissement | undefined;

      switch (statutValidation) {
        case EStatutEncaissement.TRAITE:
          payloadStatutValidation = EStatutEncaissement.REJETE;
          break;
        case EStatutEncaissement.VALIDE:
          payloadStatutValidation = EStatutEncaissement.REJETE;
          break;
        case EStatutEncaissement.DFC:
          payloadStatutValidation = EStatutEncaissement.REJETE;
          break;
        case EStatutEncaissement.RECLAMATION_TRAITES:
          payloadStatutValidation = EStatutEncaissement.REJETE;
          break;
        default:
          console.warn("Statut de validation inconnu :", statutValidation);
          return;
      }

      // Déterminer le message selon le statut actuel
      const getRejectMessage = () => {
        switch (statutValidation) {
          case EStatutEncaissement.VALIDE:
            return "Cette action rejettera l'encaissement validé et le transmettra vers les encaissements rejetés.";
          case EStatutEncaissement.TRAITE:
            return "Cette action mettra l'encaissement dans les encaissements rejetés.";
          case EStatutEncaissement.DFC:
            return "Cette action mettra l'encaissement dans les encaissements rejetés.";
          case EStatutEncaissement.RECLAMATION_TRAITES:
            return "Cette action mettra l'encaissement dans les encaissements rejetés.";
          default:
            return "Cette action mettra l'encaissement dans les encaissements rejetés.";
        }
      };

      await swalWithBootstrapButtons
        .fire({
          title: "Êtes-vous sûr de rejeter cet encaissement ?",
          text: getRejectMessage(),
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Confirmer",
          cancelButtonText: "Annuler",
          reverseButtons: true,
          html: `
          <div>
            <textarea
              id="reason-textarea"
              class="form-control w-full border rounded-md p-2 mt-4"
              rows="4"
              placeholder="Veuillez indiquer la raison ici..."
              style="width: 100%; box-sizing: border-box;"
            ></textarea>
          </div>
        `,
          preConfirm: () => {
            const textareaValue = (
              document.getElementById("reason-textarea") as HTMLTextAreaElement
            )?.value.trim();
            if (!textareaValue) {
              Swal.showValidationMessage("⚠️ Le champ de texte est requis !");
              return false;
            }
            userInput = textareaValue;
            return true;
          },
          didOpen: () => {
            const confirmButton = Swal.getConfirmButton();
            const textarea = document.getElementById(
              "reason-textarea"
            ) as HTMLTextAreaElement;

            confirmButton?.setAttribute("disabled", "true");

            textarea?.addEventListener("input", () => {
              if (textarea.value.trim()) {
                confirmButton?.removeAttribute("disabled");
              } else {
                confirmButton?.setAttribute("disabled", "true");
              }
            });
          },
        })
        .then((result) => {
          if (result.isConfirmed && userInput) {
            const payload: any = {
              encaissementId: encaissementId,
              statutValidation: payloadStatutValidation,
              observationRejete: userInput,
            };

            // Ajouter les fichiers s'ils existent
            if (images2 && images2.length > 0) {
              const files = images2
                .filter((image: { file?: File; dataURL?: string }) => image.file)
                .map(
                  (image: { file?: File; dataURL?: string }) => image.file as File
                );
              payload.files = files;
            }

            // ✅ Envoi de la requête Redux
            dispatch(submitEncaissementValidation(payload))
              .unwrap()
              .then(async (response) => {
                setObeservationRejete(response?.observationRejete);
                // Déterminer le message de succès selon le statut précédent
                const getSuccessMessage = () => {
                  switch (statutValidation) {
                    case EStatutEncaissement.VALIDE:
                      return `L'encaissement validé a été rejeté et transmis vers les encaissements rejetés. Raison : "${userInput}"`;
                    default:
                      return `Votre encaissement a été rejeté avec la raison : "${userInput}"`;
                  }
                };

                swalWithBootstrapButtons.fire(
                  "Rejeter ✅",
                  getSuccessMessage(),
                  "success"
                );

                // Utiliser la nouvelle fonction de rafraîchissement
                await refreshTableData(false);

                setModalOpen(false);
              })
              .catch((error) => {
                const errorMessage = handleApiError(error);
                toast.error(errorMessage);
              });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
              "Annulé ❌",
              "Vous avez annulé l'action.",
              "error"
            );
          }
        });
    };

    const showAlertCloture = async (encaissementId: number) => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton:
            "btn btn-primary disabled:opacity-50 disabled:pointer-events-none",
          cancelButton: "btn btn-dark ltr:mr-3 rtl:ml-3",
          popup: "sweet-alerts",
        },
        buttonsStyling: false,
      });

      await swalWithBootstrapButtons
        .fire({
          title: "Êtes-vous sûr de vouloir clôturer ?",
          text: "Cette action clôturera l'encaissement.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Confirmer",
          cancelButtonText: "Annuler",
          reverseButtons: true,
          padding: "2em",
        })
        .then((result) => {
          if (result.isConfirmed) {
            // Payload à soumettre
            const payload: any = {
              encaissementId,
              statutValidation: EStatutEncaissement.CLOTURE,
            };

            // Ajouter les fichiers s'ils existent
            if (images2 && images2.length > 0) {
              const files = images2
                .filter((image: { file?: File; dataURL?: string }) => image.file)
                .map(
                  (image: { file?: File; dataURL?: string }) => image.file as File
                );
              payload.files = files;
            }

            // Appel à la fonction Redux ou autre logique de soumission
            dispatch(submitEncaissementValidation(payload))
              .unwrap()
              .then(async (response) => {
                swalWithBootstrapButtons.fire(
                  "Clôturer",
                  "Votre encaissement a été clôturé avec succès.",
                  "success"
                );

                // Utiliser la nouvelle fonction de rafraîchissement
                await refreshTableData(false);

                setModalOpen(false);
              })
              .catch((error) => {
                const errorMessage = handleApiError(error);
                toast.error(errorMessage);
              });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
              "Annulé",
              "Vous avez annulé l'action.",
              "error"
            );
          }
        });
    };

    const showAlertDRDFC = async (encaissementId: number) => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton:
            "btn btn-primary disabled:opacity-50 disabled:pointer-events-none",
          cancelButton: "btn btn-dark ltr:mr-3 rtl:ml-3",
          popup: "sweet-alerts",
        },
        buttonsStyling: false,
      });

      await swalWithBootstrapButtons
        .fire({
          title: "Êtes-vous sûr de vouloir valider cet encaissement ?",
          text: "Cette action validera l'encaissement.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Confirmer",
          cancelButtonText: "Annuler",
          reverseButtons: true,
          padding: "2em",
        })
        .then((result) => {
          if (result.isConfirmed) {
            // Payload à soumettre
            const payload: any = {
              encaissementId,
              statutValidation: EStatutEncaissement.DFC,
            };

            // Ajouter les fichiers s'ils existent
            if (images2 && images2.length > 0) {
              const files = images2
                .filter((image: { file?: File; dataURL?: string }) => image.file)
                .map(
                  (image: { file?: File; dataURL?: string }) => image.file as File
                );
              payload.files = files;
            }

            // Appel à la fonction Redux ou autre logique de soumission
            dispatch(submitEncaissementValidation(payload))
              .unwrap()
              .then(async (response) => {
                swalWithBootstrapButtons.fire(
                  "Valider",
                  "Votre encaissement a été validé avec succès.",
                  "success"
                );

                // Utiliser la nouvelle fonction de rafraîchissement
                await refreshTableData(false);

                setModalOpen(false);
              })
              .catch((error) => {
                const errorMessage = handleApiError(error);
                toast.error(errorMessage);
              });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
              "Annulé",
              "Vous avez annulé l'action.",
              "error"
            );
          }
        });
    };

    const [params, setParams] = useState<any>({
      description: "",
      displayDescription: "",
    });

    const userInfo = getUserPermission();

    const emailConnecte = userInfo?.email;

    const drData: any = useSelector((state: TRootState) => state.dr?.data);

    useEffect(() => {
      dispatch(fetchDirectionRegionales());
    }, [dispatch]);

    const [toEmails, setToEmails] = useState<{ mail: string }[]>([]);
    console.log(toEmails, "toEmails");

    const [toInput, setToInput] = useState<string>("");
    const [ccEmails, setCcEmails] = useState<Array<{ mail: string }>>([]);
    const numeroBordereau = selectedRow?.numeroBordereau;
    const [emailSubject, setEmailSubject] = useState<string>(
      `Retard sur le bordereau N°${numeroBordereau || ""}`
    );

    useEffect(() => {
      if (!emailSubject) {
        setEmailSubject(`Retard sur le bordereau N°${numeroBordereau || ""}`);
      }
    }, [emailSubject, numeroBordereau]);

    const [uploadedFiles, setUploadedFiles] = useState<
      { file: File; preview: string }[]
    >([]);

    const baseCols = [
      {
        accessor: "numeroBordereau",
        title: "Numéro Bordereau",
        sortable: true,
        render: ({ numeroBordereau, validationEncaissement }: DataReverse) => {
          // Fonction pour déterminer la couleur de bordure selon le validationLevel
          const getBorderColor = () => {
            // Si c'est un encaissement rejeté (statutValidation === 1)
            if (statutValidation === 1) {
              const validationLevel = validationEncaissement?.validationLevel;
              if (validationLevel) {
                switch (validationLevel.toUpperCase()) {
                  case "AGC":
                    return "border-l-8 border-l-primary"; // Rouge - plus large
                  case "DR":
                    return "border-l-8 border-l-warning"; // Violet - plus large
                  case "DFC":
                    return "border-l-8 border-l-success"; // Jaune - plus large
                  default:
                    return "border-l-8 border-l-red-500"; // Rouge par défaut - plus large
                }
              }
            }
            return "";
          };

          return (
            <div className={`absolute inset-0 ${getBorderColor()}`}>
              <div className="cursor-pointer font-semibold text-primary underline hover:no-underline pl-4 h-full flex items-center">
                {numeroBordereau && numeroBordereau.trim() !== ""
                  ? `#${numeroBordereau}`
                  : "Non renseigné"}
              </div>
            </div>
          );
        },
      },
      {
        accessor: "journeeCaisse",
        title: "Journée caisse",
        sortable: true,
        render: ({ journeeCaisse }: DataReverse) => (
          <div>
            <p className="text-sm ">{journeeCaisse}</p>
          </div>
        ),
      },
      {
        accessor: "matriculeCaissiere",
        title: "Matricule Caissière",
        sortable: true,
        render: ({ matriculeCaissiere }: DataReverse) => (
          <div className="cursor-pointer font-semibold text-secondary ">
            {matriculeCaissiere || "N/A"}
          </div>
        ),
      },
      {
        accessor: "modeReglement",
        title: "Mode de réglement ",
        sortable: true,
        render: ({ modeReglement }: DataReverse) => (
          <div>
            <p className="text-sm ">{modeReglement}</p>
          </div>
        ),
      },
      { accessor: "banque", title: "Banque", sortable: true },
      {
        accessor: "compteBanque",
        title: "Code banque",
        sortable: true,
        render: ({ compteBanque }: DataReverse) => (
          <div className=" text-primary  hover:no-underline">
            {`${compteBanque || ""}`}
          </div>
        ),
      },

      { accessor: "DR", title: "DR", sortable: true },
      {
        accessor: "EXP",
        title: "Exploitation",
        sortable: true,
        render: ({ libelleExpl }: DataReverse) => (
          <div>
            <div className="font-medium">{libelleExpl} </div>
          </div>
        ),
      },

      { accessor: "Produit", title: "Produit", sortable: true },
      { accessor: "Date Encais", title: "Date Encaissement", sortable: true },

      {
        accessor: "Montant caisse (A)",
        title: "Montant Restitution Caisse (A)",
        sortable: true,
        render: (row: DataReverse) => {
          const montant =
            row.montantRestitutionCaisse || row["Montant caisse (A)"] || 0;
          return `${formatNumber(montant)} F CFA`;
        },
      },
      {
        accessor: "Montant bordereau (B)",
        title: "Montant Bordereau Banque (B)",
        sortable: true,
        render: (row: DataReverse) => {
          const montant =
            row.montantBordereauBanque || row["Montant bordereau (B)"] || 0;
          return `${formatNumber(montant)} F CFA`;
        },
      },
      {
        accessor: "Ecart(A-B)",
        title: "Ecart (A-B)",
        sortable: true,
        render: (row: DataReverse) => {
          // Calculer l'écart en utilisant les propriétés disponibles
          const ecart =
            row.ecartCaisseBanque !== undefined
              ? row.ecartCaisseBanque
              : row["Ecart(A-B)"] !== undefined
                ? row["Ecart(A-B)"]
                : (row.montantRestitutionCaisse || row["Montant caisse (A)"] || 0) -
                (row.montantBordereauBanque || row["Montant bordereau (B)"] || 0);

          return (
            <div
              className={
                ecart < 0
                  ? "text-danger"
                  : ecart > 0
                    ? "text-success"
                    : "font-bold"
              }
            >
              {formatNumber(ecart)} F CFA
            </div>
          );
        },
      },
    ];

    const additionalCols =
      statutValidation !== 0
        ? [
          {
            accessor: "Montant relevé (C°",
            title: "Montant Relevé",
            sortable: true,
            render: (row: DataReverse) => {
              const montant =
                row.montantReleve ||
                row["Montant relevé (C)"] ||
                row.validationEncaissement?.montantReleve ||
                0;
              return `${formatNumber(montant)} F CFA`;
            },
          },
          {
            accessor: "Ecart (B-C)",
            title: "Écart (B-C)",
            sortable: true,
            render: (row: DataReverse) => {
              const ecart =
                row["Ecart(B-C)"] !== undefined
                  ? row["Ecart(B-C)"]
                  : row.validationEncaissement?.ecartReleve || 0;

              return (
                <div
                  className={
                    ecart < 0
                      ? "text-danger"
                      : ecart > 0
                        ? "text-success"
                        : "font-bold"
                  }
                >
                  {formatNumber(ecart)} F CFA
                </div>
              );
            },
          },
          {
            accessor: "Date Validation",
            title: "Date Validation",
            sortable: true,
            render: (row: DataReverse) =>
              formatDateData(row["Date Validation"]) || "N/A",
          },
          {
            accessor: "observationReleve",
            title: "Observation Relevé",
            sortable: false,
            render: (row: DataReverse) => (
              <span>{row.validationEncaissement?.observationReleve || ""}</span>
            ),
          },

          {
            accessor: "observationRejete",
            title: "Observation rejété",
            sortable: false,
            render: (row: DataReverse) => (
              <span>
                {row.observationRejete ||
                  row.validationEncaissement?.observationRejete ||
                  ""}
              </span>
            ),
          },
          {
            accessor: "observationReclamation",
            title: "Observation rejet 2",
            sortable: false,
            render: (row: DataReverse) => (
              <span>
                {row.observationReclamation ||
                  row.validationEncaissement?.observationReclamation ||
                  ""}
              </span>
            ),
          },
        ]
        : [];


    const cols = [...baseCols, ...additionalCols];

    useEffect(() => {
      const filteredData = filterAndMapData(data, statutValidation);
      setRecordsData(filteredData);
    }, [data, filterAndMapData, statutValidation]);

    const [emailInput, setEmailInput] = useState("");

    const removeCcEmail = (index: number) => {
      setCcEmails((prevEmails) => prevEmails.filter((_, i) => i !== index));
    };

    const removeToEmail = (index: number) => {
      setToEmails((prevEmails) => prevEmails.filter((_, i) => i !== index));
    };

    const validateEmail = (email: string | null | undefined): boolean => {
      if (!email) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const handleToKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Tab" || e.key === " ") {
        e.preventDefault();
        const email: any = toInput.trim();

        if (
          email &&
          validateEmail(email) &&
          !toEmails.some((item) => item.mail === email)
        ) {
          setToEmails((prevEmails) => [...prevEmails, { mail: email }]);
          setToInput("");
          ToastSuccess.fire({
            text: "Email ajouté avec succès !",
          });
        } else if (email && !validateEmail(email)) {
          ToastError.fire({
            text: "Veuillez entrer une adresse email valide.",
          });
        } else if (toEmails.some((item) => item.mail === email)) {
          ToastError.fire({
            text: "Cet email est déjà ajouté.",
          });
        }
      }
    };

    const handleCcKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Tab" || e.key === " ") {
        e.preventDefault();
        const email = emailInput?.trim();

        // Vérifier si l'email n'est pas vide et est valide
        if (!email || !validateEmail(email)) {
          if (email) {
            ToastError.fire({
              text: "Veuillez entrer une adresse email valide.",
            });
          }
          return;
        }

        // Vérifier si l'email n'est pas déjà dans la liste (insensible à la casse)
        const emailExists = ccEmails.some(
          (e) => e.mail.toLowerCase() === email.toLowerCase()
        );

        if (emailExists) {
          ToastError.fire({
            text: "Cet email est déjà ajouté.",
          });
          return;
        }

        // Ajouter l'email
        setCcEmails((prevEmails) => [...prevEmails, { mail: email }]);
        setEmailInput("");
        ToastSuccess.fire({
          text: "Email ajouté avec succès !",
        });
      }
    };

    const handleSendEmail = async () => {
      if (!params?.toEmails || params.toEmails.length === 0) {
        ToastError.fire({
          text: "Veuillez ajouter au moins une adresse email dans le champ 'À'.",
        });
        return;
      }

      // ✅ Vérification des emails "À"
      for (const emailObj of params.toEmails) {
        if (!validateEmail(emailObj.mail)) {
          ToastError.fire({
            text: `L'adresse email "À" ${emailObj.mail} est invalide.`,
          });
          return;
        }
      }

      // ✅ Vérification des emails "CC"
      if (params?.ccEmails) {
        for (const emailObj of params.ccEmails) {
          if (!validateEmail(emailObj.mail)) {
            ToastError.fire({
              text: `L'adresse email CC ${emailObj.mail} est invalide.`,
            });
            return;
          }
        }
      }

      try {
        // 1. D'abord, mettre à jour le statut
        const validationPayload = {
          encaissementId: selectedRow?.id,
          statutValidation: EStatutEncaissement.RECLAMATION_TRAITES,
        };

        const validationResult = await dispatch(submitEncaissementValidation(validationPayload)).unwrap();

        if (validationResult) {
          // 2. Si la validation réussit, envoyer l'email
          const attachments = uploadedFiles.map((item) => item.file);
          const emailPayload = {
            to: params.toEmails.map((emailObj: any) => emailObj.mail).join(","),
            cc: params.ccEmails?.map((emailObj: any) => emailObj.mail).join(",") || "",
            subject: emailSubject,
            text: params.description,
            attachments,
          };

          const emailResult = await dispatch(sendEmail(emailPayload));

          if (sendEmail.fulfilled.match(emailResult)) {
            setEmailModalOpen(false);
            ToastSuccess.fire({ text: "Statut mis à jour et email envoyé avec succès !" });

            // ✅ Réinitialisation correcte des états
            setParams({
              toEmails: [],
              ccEmails: [],
              description: "",
              displayDescription: "",
            });

            setUploadedFiles([]);
            setEmailSubject("");

            // Rafraîchir les données après l'envoi de l'email
            await refreshTableData(false);
          } else {
            console.error("❌ Échec lors de l'envoi de l'email :", emailResult);
            ToastError.fire({ text: "Le statut a été mis à jour mais l'envoi de l'email a échoué." });
          }
        } else {
          console.error("❌ Échec lors de la mise à jour du statut");
          ToastError.fire({ text: "Échec lors de la mise à jour du statut." });
        }
      } catch (error) {
        console.error("⚠️ Erreur inattendue :", error);
        ToastError.fire({ text: "Une erreur inattendue est survenue." });
      }
    };

    useEffect(() => {
      if (emailConnecte && ccEmails.length === 0) {
        setCcEmails([{ mail: emailConnecte }]);
      }
    }, [ccEmails.length, emailConnecte]);

    const resetCcEmails = () => {
      if (emailConnecte) {
        setCcEmails([{ mail: emailConnecte }]);
      } else {
        setCcEmails([]);
      }
    };

    useEffect(() => {
      const allData = filterAndMapData(data, statutValidation);
      setRecordsData(allData);
    }, [data, filterAndMapData, statutValidation]);

    const [images2, setImages2] = useState<any>([]);

    const onChange2 = (imageList: ImageListType) => {
      setImages2(imageList as never[]);
      const files: any = imageList.map((image) => image.file);
    };

    const [observationReclamation, setObservationReclamation] = useState("");
    const stripHtml = (html: string) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.body.textContent || "";
    };

    const handleSubmit = (updatedRow: any) => {
      if (!selectedRow?.id) {
        console.warn("Aucune ligne sélectionnée pour validation.");
        return;
      }

      // Indiquer que le traitement est en cours
      setIsRefreshing(true);

      // ✅ Construction du payload avec les valeurs mises à jour
      const payload: any = {
        encaissementId: selectedRow.id,
        observationCaisse: rasChecked1 ? "" : observationCaisse,
        observationReleve: rasChecked2 ? "" : observationBanque,
        montantReleve: updatedRow.montantReleve,
        ecartReleve: updatedRow.ecartReleve,
        statutValidation:
          statutValidation === 0
            ? EStatutEncaissement.TRAITE
            : statutValidation === 4
              ? EStatutEncaissement.RECLAMATION_TRAITES
              : EStatutEncaissement.TRAITE,
        observationReclamation: stripHtml(observationReclamation) || "",
        observationRejete: updatedRow.observationRejete || "",
      };

      // Si des fichiers sont présents dans images2, les ajouter au payload
      if (images2 && images2.length > 0) {
        const files = images2.map(
          (image: { file?: File; dataURL?: string }) => image.file
        );
        payload.files = files;
      }

      // Ajouter la date du montant banque si présente
      if (updatedRow.dateMontantBanque) {
        payload.dateMontantReleve = updatedRow.dateMontantBanque;
      }

      // ✅ Envoi de la requête
      dispatch(submitEncaissementValidation(payload))
        .unwrap()
        .then(async () => {
          // Afficher un toast de succès
          toast.success("Les modifications ont été enregistrées avec succès.");

          // Fermer le modal
          setModalOpen(false);

          // Réinitialiser les états
          setObservationCaisse("");
          setObservationBanque("");
          setObservationReclamation("");
          setRasChecked1(false);
          setRasChecked2(false);
          setImages2([]);

          // Rafraîchir les données sans afficher de toast
          await refreshTableData(false);
        })
        .catch((error) => {
          const errorMessage = handleApiError(error);
          toast.error(errorMessage);
          setIsRefreshing(false); // Réinitialiser l'état de chargement en cas d'erreur
        });
    };

    const handleMultipleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const newFiles = files.map((file) => {
        const preview =
          file.type.startsWith("image/") || file.type === "application/pdf"
            ? URL.createObjectURL(file)
            : "";
        return { file, preview };
      });
      setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const removeFile = (index: number) => {
      setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

    const confirmClose = () => {
      setConfirmationModalOpen(false);
      setModalOpen(false);
    };

    const handleOpenConfirmationModal = () => {
      setConfirmationModalOpen(true);
    };

    const handleApplyFilters = async (newParams: any) => {
      try {
        // Mettre à jour les paramètres
        setParams((prevParams: any) => ({ ...prevParams, ...newParams }));

        // Attendre un moment pour que les états soient mis à jour
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Utiliser la fonction refreshTableData pour rafraîchir les données
        // avec les nouveaux paramètres
        await refreshTableData(true);
      } catch (error) {
        console.error("Erreur lors de l'application des filtres:", error);
        toast.error("Erreur lors de l'application des filtres");
      }
    };

    const [montantBanque, setMontantBanque] = useState("");
    const isMontantValid = montantBanque !== "";

    const handleMontantChange = (value: number) => {
      const formattedValue = new Intl.NumberFormat().format(value);
      setMontantBanque(formattedValue);
    };

    // Ajouter un état pour forcer le remontage du composant
    const [forceRender, setForceRender] = useState(0);

    const showAlertReclamation = async (encaissementId: number) => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-dark ltr:mr-3 rtl:ml-3",
          popup: "sweet-alerts",
        },
        buttonsStyling: false,
      });

      await swalWithBootstrapButtons
        .fire({
          title:
            "Êtes-vous sûr de vouloir passer cet encaissement en réclamation ?",
          text: "Cette action passera l'encaissement en réclamation.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Confirmer",
          cancelButtonText: "Annuler",
          reverseButtons: true,
          padding: "2em",
        })
        .then((result) => {
          if (result.isConfirmed) {
            const payload: any = {
              encaissementId,
              statutValidation: EStatutEncaissement.RECLAMATION_REVERSES,
            };

            // Ajouter les fichiers s'ils existent
            if (images2 && images2.length > 0) {
              const files = images2
                .filter((image: { file?: File; dataURL?: string }) => image.file)
                .map(
                  (image: { file?: File; dataURL?: string }) => image.file as File
                );
              payload.files = files;
            }

            dispatch(submitEncaissementValidation(payload))
              .unwrap()
              .then(async (response) => {
                swalWithBootstrapButtons.fire(
                  "Réclamation",
                  "Votre encaissement a été passé en réclamation avec succès.",
                  "success"
                );

                setTimeout(() => {
                  // Méthode 1: Utiliser le prop fetchData (refreshTableData)
                  if (refreshTableData) {
                    refreshTableData();
                  }

                  // Méthode 2: Utiliser window.fetchData global
                  if (
                    typeof window !== "undefined" &&
                    (window as any).fetchData
                  ) {
                    (window as any).fetchData();
                  }
                  // Méthode 3: Forcer un rafraîchissement de la page si rien d'autre ne fonctionne
                  // Cette méthode est plus drastique mais garantit la mise à jour
                  if (
                    !refreshTableData &&
                    (typeof window === "undefined" ||
                      !(window as any).refreshTableData)
                  ) {
                    if (typeof window !== "undefined") {
                      window.location.reload();
                    }
                  }
                }, 800);
                setModalOpen(false);
              })
              .catch((error) => {
                const errorMessage = handleApiError(error);
                toast.error(errorMessage);
              });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
              "Annulé",
              "Vous avez annulé l'action.",
              "error"
            );
          }
        });
    };

    const showAlertRamener = async (
      encaissementId: number,
      montantReleve?: number
    ) => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-dark ltr:mr-3 rtl:ml-3",
          popup: "sweet-alerts",
        },
        buttonsStyling: false,
      });

      await swalWithBootstrapButtons
        .fire({
          title: "Êtes-vous sûr de ramener a vérifié ?",
          text: "Cette action ramenera l'encaissement.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Confirmer",
          cancelButtonText: "Annuler",
          reverseButtons: true,
          padding: "2em",
        })
        .then((result) => {
          if (result.isConfirmed) {
            // Payload à soumettre
            const payload: any = {
              encaissementId,
              statutValidation: EStatutEncaissement.TRAITE,
            };
            if (typeof montantReleve !== "undefined") {
              payload.montantReleve = montantReleve;
            }

            // Ajouter les fichiers s'ils existent
            if (images2 && images2.length > 0) {
              const files = images2
                .filter((image: { file?: File; dataURL?: string }) => image.file)
                .map(
                  (image: { file?: File; dataURL?: string }) => image.file as File
                );
              payload.files = files;
            }

            dispatch(submitEncaissementValidation(payload))
              .unwrap()
              .then(async (response) => {
                swalWithBootstrapButtons.fire(
                  "Validé",
                  "Votre encaissement a été ramené avec succès.",
                  "success"
                );

                setTimeout(() => {
                  // Méthode 1: Utiliser le prop fetchData (refreshTableData)
                  if (refreshTableData) {
                    refreshTableData();
                  }

                  // Méthode 2: Utiliser window.fetchData global
                  if (
                    typeof window !== "undefined" &&
                    (window as any).fetchData
                  ) {
                    (window as any).fetchData();
                  }
                  // Méthode 3: Forcer un rafraîchissement de la page si rien d'autre ne fonctionne
                  // Cette méthode est plus drastique mais garantit la mise à jour
                  if (
                    !refreshTableData &&
                    (typeof window === "undefined" ||
                      !(window as any).refreshTableData)
                  ) {
                    if (typeof window !== "undefined") {
                      window.location.reload();
                    }
                  }
                }, 800);

                setModalOpen(false);
              })
              .catch((error) => {
                const errorMessage = handleApiError(error);
                toast.error(errorMessage);
              });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
              "Annulé",
              "Vous avez annulé l'action.",
              "error"
            );
          }
        });
    };

    return (
      <>
        {/* Contenu de la page */}
        <div className=" mt-9">
          {/* 10 Encaissements connus */}
          <div className="flex w-full" id="tuto-encaissement-titre">
            <h5 className="mb-8  flex w-full flex-wrap items-center gap-6 text-xl font-thin text-primary">
              {paginate.totalCount}
              {encaissementText}{" "}
              {getStatutLibelle(statutValidation, totalUnvalidatedRecords)}
            </h5>
          </div>

          <div className="panel datatables">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              {/* Actualisation */}
              <RefreshBtn
                isRefreshing={isRefreshing}
                handleRefresh={handleRefresh}
              />
              <div className="flex flex-wrap items-center gap-2">
                <ExportBtn
                  filteredData={filteredData}
                  cols={cols}
                  hideCols={hideCols}
                  formatNumber={formatNumber}
                />

                {/* Search Input with Icon */}
                <div className="relative text-right" id="tuto-search-bar">
                  <input
                    type="text"
                    className="form-input w-[300px] rounded-lg border-gray-300 py-2 pl-10 pr-4 focus:border-primary focus:ring-primary dark:border-[#253b5c] dark:bg-[#1b2e4b]"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setSearch(newValue);
                      if (handleSearchChange) {
                        handleSearchChange(newValue);
                      }
                    }}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Column Chooser Dropdown */}
                <div className="dropdown" id="tuto-dropdown-colonnes">
                  <Dropdown
                    btnClassName="relative flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:shadow-sm dark:border-[#253b5c] dark:bg-[#1b2e4b] dark:text-white-dark dark:hover:bg-[#1b2e4b]/80"
                    button={
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                          />
                        </svg>
                        <span>Colonnes</span>
                        <IconCaretDown className="h-4 w-4 transition-transform duration-200" />
                      </div>
                    }
                  >
                    <ul className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-[#253b5c] dark:bg-[#1b2e4b]">
                      {cols.map((col, i) => (
                        <li
                          key={i}
                          className="flex flex-col"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#253b5c]">
                            <input
                              type="checkbox"
                              checked={!hideCols.includes(col.accessor)}
                              className="form-checkbox rounded border-gray-300 text-primary focus:ring-primary dark:border-[#253b5c]"
                              value={col.accessor}
                              onChange={(event) => {
                                showHideColumns(event.target.value);
                              }}
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-white-dark">
                              {col.title}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </Dropdown>
                </div>
              </div>
            </div>

            <div className="relative" id="tuto-datatable">
              <div>
                <DataTable<DataReverse>
                  key={`datatable-${forceRender}`}
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                  rowStyle={(row: DataReverse) => {
                    // Position relative pour permettre l'absolute positioning de la bordure
                    return {
                      position: 'relative'
                    };
                  }}
                  className="table-hover whitespace-nowrap"
                  records={
                    !fetchLoading && filteredData?.length > 0 ? filteredData : []
                  }
                  columns={[
                    ...cols
                      ?.map((col) => ({
                        ...col,
                        hidden: hideCols.includes(col.accessor),
                      }))
                      .filter((col) => col.accessor !== "Actions"),
                    {
                      accessor: "Actions",
                      title: "Actions",
                      sortable: false,
                      render: (row: DataReverse) => {
                        const canEditComptable =
                          statutValidation === 0 &&
                          hasPermission("ENCAISSEMENTS CHARGES", "MODIFIER");

                        const seeEmailIcon =
                          (statutValidation === 4 &&
                            hasPermission("LITIGES", "MODIFIER")) ||
                          statutValidation === 6;

                        return (
                          <div className="flex items-center justify-center gap-3">
                            {/* Icône Modifier si l'utilisateur peut modifier */}
                            {canEditComptable && (
                              <>
                                <Tippy content="Modifier">
                                  <button
                                    type="button"
                                    className="flex items-center justify-center rounded-lg p-2 text-primary hover:text-primary"
                                    onClick={() => handleOpenModal(row)}
                                  >
                                    <IconPencil className="h-5 w-5 stroke-[1.5]" />
                                  </button>
                                </Tippy>
                                {/* Reclamation action  */}
                                <Tippy content="Passer en réclamation">
                                  <button
                                    type="button"
                                    className="flex items-center justify-center rounded-lg p-2 text-warning hover:text-warning"
                                    onClick={() => showAlertReclamation(row.id)}
                                  >
                                    <IconAlertTriangle className="h-5 w-5 stroke-[1.5]" />
                                  </button>
                                </Tippy>
                              </>
                            )}

                            {/* Icône Voir si l'utilisateur ne peut pas modifier et statutValidation !== 0 */}
                            {!canEditComptable && statutValidation !== 0 && (
                              <Tippy content="Voir">
                                <button
                                  type="button"
                                  className="flex items-center justify-center rounded-lg p-2 text-primary hover:text-primary"
                                  onClick={() => handleOpenModal(row)}
                                >
                                  <IconEye className="h-5 w-5 stroke-[1.5]" />
                                </button>
                              </Tippy>
                            )}

                            {/* Icône Envoyer un mail si statutValidation === 4 */}
                            {seeEmailIcon && (
                              <Tippy content="Envoyer un mail">
                                <button
                                  type="button"
                                  className="flex items-center justify-center rounded-lg p-2 text-primary hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRow(row);
                                    setEmailModalOpen(true);
                                  }}
                                >
                                  <IconMail className="h-5 w-5 stroke-[1.5]" />
                                </button>
                              </Tippy>
                            )}
                          </div>
                        );
                      },
                    },
                  ]}
                  highlightOnHover
                  totalRecords={!fetchLoading ? paginate.totalCount : 0}
                  recordsPerPage={pageSize}
                  page={currentPage}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    handlePageChange && handlePageChange(page);
                  }}
                  recordsPerPageOptions={PAGE_SIZES}
                  onRecordsPerPageChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                    handleLimitChange && handleLimitChange(size);
                  }}
                  sortStatus={sortStatus}
                  onSortStatusChange={setSortStatus}
                  minHeight={200}
                  paginationText={({ from, to, totalRecords }) =>
                    `Affichage de ${from} à ${to} sur ${totalRecords} entrées`
                  }
                  paginationSize="md"
                  noRecordsText={
                    fetchLoading
                      ? ((
                        <>
                          <span className="delay-800 mt-2 animate-pulse text-black">
                            Chargement en cours
                          </span>
                          <div className="mt-2 flex items-center justify-center space-x-2">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                          </div>
                        </>
                      ) as unknown as string)
                      : ("Aucune donnée disponible" as string)
                  }
                />
              </div>
            </div>

            {/* Légende des bordures colorées */}
            {statutValidation === 1 && (
              <div className="mt-6 p-5 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-[#1b2e4b] dark:border-[#253b5c]">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-danger" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h6 className="text-sm font-semibold text-gray-800 dark:text-white-dark">
                      Acteurs ayant rejeté l'encaissement
                    </h6>
                  </div>
                </div>
                <div className="flex justify-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 bg-primary border-l-6 border-l-primary rounded-sm shadow-sm"></div>
                    <div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white-dark">AGC</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Agence Générale Comptable</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 bg-warning border-l-6 border-l-warning rounded-sm shadow-sm"></div>
                    <div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white-dark">DR</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Direction Régionale</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 bg-success border-l-6 border-l-success rounded-sm shadow-sm"></div>
                    <div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white-dark">DFC</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Direction Financière</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modalOpen && selectedRow && (
              <div>
                {statutValidation === 0 ? (
                  <EditModal
                    setModalOpen={setModalOpen}
                    modalOpen={modalOpen}
                    selectedRow={{
                      ...selectedRow,
                      "Montant caisse (A)":
                        selectedRow["Montant caisse (A)"] || 0,
                      "Montant bordereau (B)":
                        selectedRow["Montant bordereau (B)"] || 0,
                      "Montant revelé (C)":
                        selectedRow["Montant relevé (C)"] ||
                        selectedRow.montantReleve ||
                        0,
                      "Date cloture": selectedRow["Date cloture"] || "",
                      banque: selectedRow.banque || "",
                      Produit: selectedRow.produit || selectedRow.Produit || "",
                      numeroBordereau: selectedRow.numeroBordereau || "",
                    }}
                    rasChecked1={rasChecked1}
                    handleRasChecked1Change={handleRasChecked1Change}
                    observationCaisse={observationCaisse}
                    setObservationCaisse={setObservationCaisse}
                    handleMontantChange={handleMontantChange}
                    rasChecked2={rasChecked2}
                    handleRasChecked2Change={handleRasChecked2Change}
                    handleSubmit={handleSubmit}
                    today={today}
                    formatNumber={formatNumber}
                    observationBanque={observationBanque}
                    setObservationBanque={setObservationBanque}
                    setImages2={setImages2}
                    images2={images2}
                    onChange2={onChange2}
                    fetchData={refreshTableData}
                  />
                ) : (
                  <ViewModal
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    formatNumber={formatNumber}
                    selectedRow={selectedRow}
                    rasChecked1={rasChecked1}
                    handleRasChecked1Change={handleRasChecked1Change}
                    statutValidation={statutValidation}
                    observationCaisse={observationCaisse}
                    setObservationCaisse={setObservationCaisse}
                    observationBanque={observationBanque}
                    setObservationBanque={setObservationBanque}
                    handleAmountChange={handleAmountChange}
                    showAlertReclamation={showAlertReclamation}
                    showAlertCloture={showAlertCloture}
                    showAlertDRDFC={showAlertDRDFC}
                    rasChecked2={rasChecked2}
                    handleRasChecked2Change={handleRasChecked2Change}
                    showAlertRejete={showAlertRejete}
                    showAlertValide={showAlertValide}
                    showAlertRamener={showAlertRamener}
                    today={today}
                    setPreuvePhotoModal={setPreuvePhotoModal}
                    handleSendEmail={handleSendEmail}
                    handleMultipleFileUpload={handleMultipleFileUpload}
                    uploadedFiles={uploadedFiles}
                    removeFile={removeFile}
                    params={params}
                    setParams={setParams}
                    observationRejete={observationRejete}
                    handleOpenConfirmationModal={handleOpenConfirmationModal}
                    handleSubmit={handleSubmit}
                    setPhotoDocuments={setPhotoDocuments}
                    setImages2={setImages2}
                    images2={images2}
                    onChange2={onChange2}
                    observationReclamation={observationReclamation}
                    setObservationReclamation={setObservationReclamation}
                    refreshTableData={refreshTableData}
                  />
                )}
              </div>
            )}

            {confirmationModalOpen && (
              <ConfirmationModal
                showConfirm={confirmationModalOpen}
                cancelCloseModal={() => setConfirmationModalOpen(false)}
                confirmCloseModal={confirmClose}
              />
            )}

            {/* EmailModale */}
            <EmailModal
              emailModalOpen={emailModalOpen}
              setEmailModalOpen={setEmailModalOpen}
              params={params}
              setParams={setParams}
              emailSubject={emailSubject}
              setEmailSubject={setEmailSubject}
              handleMultipleFileUpload={handleMultipleFileUpload}
              uploadedFiles={uploadedFiles}
              removeFile={removeFile}
              handleSendEmail={handleSendEmail}
              emailConnecte={emailConnecte}
              removeToEmail={removeToEmail}
              removeCcEmail={removeCcEmail}
              setToEmails={setToEmails}
            />
            {/* PreuvePhoto */}
            <PreuvePhotoModal
              preuvePhotoModal={preuvePhotoModal}
              setPreuvePhotoModal={setPreuvePhotoModal}
              documents={photoDocuments}
            />
          </div>
        </div>

        {/* {isFirstLogin === 1 && <EncaissementTutorial />} */}
      </>
    );
  };

export default ComponentsDatatablesColumnChooser;
