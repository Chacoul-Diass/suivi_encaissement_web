"use client";
import Dropdown from "@/components/dropdown";
import IconCaretDown from "@/components/icon/icon-caret-down";
import IconPencil from "@/components/icon/icon-pencil";
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
import IconEye from "../icon/icon-eye";
import IconMail from "../icon/icon-mail";
import ConfirmationModal from "../modales/confirmationModal";
import EditModal from "../modales/editModal";
import EmailModal from "../modales/emailModal";
import PreuvePhotoModal from "../modales/preuvePhotoModal";
import ViewModal from "../modales/viewModal";
import { fetchDirectionRegionales } from "@/store/reducers/select/dr.slice";
import EncaissementTutorial from "../tutorial/TutorialTable-encaissement";

export interface DataReverse {
  id: number;
  "Date Encais": string;
  "Caisse mode": string;
  banque: string;
  "Montant caisse (A)": number;
  "Montant bordereau (B)": number;
  "Montant revelé (C)": number;
  "Date cloture": string;
  "Date Validation": string;
  Bordereau: string;
  caisse: string;
  statutValidation: number;
  DR?: string;
  EXP?: string;
  Produit?: string;
  "Compte banque Jade"?: string;
  "Ecart(A-B)"?: any;
  "Ecart(B-C)"?: any;
  "Observation(A-B)"?: string;
  "Observation(B-C)"?: string;
  "Observation rejet"?: string;
  compteBanque: string;
  numeroBordereau: string;
  observationReclamation: string;
  observationRejete: string;

  documents?: Array<{
    id: number;
    encaissementId: number;
    fileName: string;
    filePath: string;
  }>;
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
  loading: boolean;
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
  loading,
  paginate,
  habilitation,
  handlePageChange,
  handleSearchChange,
  handleLimitChange,
}) => {
  const dispatch = useDispatch<TAppDispatch>();

  const [search, setSearch] = useState("");
  const [hideCols, setHideCols] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
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

  const user = getUserPermission();

  const isFirstLogin = user?.isFirstLogin;

  const filterAndMapData = useCallback(
    (data: any[], statutValidation: number): any[] => {
      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      const mappedData = data?.map((item) => ({
        id: item.id,
        DR: item.directionRegionale,
        EXP: item.codeExpl,
        Produit: item.produit,
        banque: item.banque,
        compteBanque: item.compteBanque,
        journeeCaisse: item.journeeCaisse,
        modeReglement: item.modeReglement,
        "Date Encais": formatDateData(item.dateEncaissement),
        "Montant caisse (A)": item.montantRestitutionCaisse || 0,
        "Montant bordereau (B)": item.montantBordereauBanque || 0,
        "Montant revelé (C)": item.validationEncaissement?.montantReleve || 0,
        "Date cloture": formatDateData(item.dateRemiseBanque) || "",
        Bordereau: item.numeroBordereau || "",
        caisse: item.caisse || "",
        statutValidation: item.validationEncaissement?.statutValidation,
        "Ecart(A-B)":
          item.montantRestitutionCaisse - item.montantBordereauBanque,
        "Ecart(B-C)": item.validationEncaissement?.ecartReleve || 0,
        "Observation(A-B)":
          item.validationEncaissement?.observationCaisse || "RAS",
        "Observation(B-C)":
          item.validationEncaissement?.observationReleve || "RAS",
        ...(item.validationEncaissement && {
          "Date Validation":
            item.validationEncaissement?.dateValidation || "N/A",
          "Observation caisse":
            item.validationEncaissement?.observationCaisse || "N/A",
          "Observation réclamation":
            item.validationEncaissement?.observationReclamation || "N/A",
          "Observation relevé":
            item.validationEncaissement?.observationReleve || "N/A",
          "Ecart relevé": item.validationEncaissement?.ecartReleve || "0",
          "Montant relevé": item.validationEncaissement?.montantReleve || "0",
          observationReclamation:
            item.validationEncaissement?.observationReclamation || "N/A",
          observationRejete:
            item.validationEncaissement?.observationRejete || "N/A",
        }),
        documents: item.documents,
      }));
      return mappedData;
    },
    []
  );

  useEffect(() => {
    const allData = filterAndMapData(data, statutValidation);
    setRecordsData(allData);
  }, [data, filterAndMapData, statutValidation]);

  const filteredData = filterAndMapData(data, statutValidation);

  const [recordsData, setRecordsData] = useState<any[]>([]);

  const unvalidatedRecords = recordsData.filter(
    (record) => record.validated !== EStatutEncaissement.VALIDE
  );

  const totalUnvalidatedRecords = unvalidatedRecords.length;
  const encaissementText = `${
    statutValidation === EStatutEncaissement.RECLAMATION_REVERSES ||
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
      default:
        return isPlural ? "inconnus" : "inconnu";
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
          const payload = {
            encaissementId,
            statutValidation: EStatutEncaissement.VALIDE,
          };

          // Appel à la fonction Redux ou autre logique de soumission
          dispatch(submitEncaissementValidation(payload))
            .unwrap()
            .then((response) => {
              swalWithBootstrapButtons.fire(
                "Valider",
                "Votre encaissement a été validé avec succès.",
                "success"
              );
              dispatch(
                fetchDataReleve({
                  id: statutValidation,
                  page: currentPage,
                  limit: 5,
                  search: search,
                })
              );
              setModalOpen(false);
            })
            .catch((error) => {
              swalWithBootstrapButtons.fire(
                "Erreur",
                "Une erreur est survenue lors de la validation.",
                "error"
              );
              console.error("Erreur lors de la soumission :", error);
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

  const showAlertRamener = async (encaissementId: number) => {
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
        title: "Êtes-vous sûr de ramener a traiter ?",
        text: "Cette action ramenera l'encaissement.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirmer",
        cancelButtonText: "Annuler",
        reverseButtons: true,
        padding: "2em",
        // Suppression de la section 'html' avec le textarea
        // Suppression de 'preConfirm' car il n'y a plus de validation de champ
      })
      .then((result) => {
        if (result.isConfirmed) {
          // Payload à soumettre
          const payload = {
            encaissementId,
            statutValidation: EStatutEncaissement.TRAITE,
          };

          dispatch(submitEncaissementValidation(payload))
            .unwrap()
            .then((response) => {
              swalWithBootstrapButtons.fire(
                "Validé",
                "Votre encaissement a été ramené avec succès.",
                "success"
              );
              dispatch(
                fetchDataReleve({
                  id: statutValidation,
                  page: currentPage,
                  limit: 5,
                  search: search,
                })
              );
              setModalOpen(false);
            })
            .catch((error) => {
              swalWithBootstrapButtons.fire(
                "Erreur",
                "Une erreur est survenue lors de la validation.",
                "error"
              );
              console.error("Erreur lors de la soumission :", error);
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
      case EStatutEncaissement.RECLAMATION_TRAITES:
        payloadStatutValidation = EStatutEncaissement.RECLAMATION_REVERSES;
        break;
      default:
        console.warn("Statut de validation inconnu :", statutValidation);
        return;
    }

    await swalWithBootstrapButtons
      .fire({
        title: "Êtes-vous sûr de rejeter cet encaissement ?",
        text: "Cette action mettra l'encaissement dans les encaissements rejetés.",
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

          // ✅ Envoi de la requête Redux
          dispatch(submitEncaissementValidation(payload))
            .unwrap()
            .then((response) => {
              setObeservationRejete(response?.observationRejete);
              swalWithBootstrapButtons.fire(
                "Rejeter ✅",
                `Votre encaissement a été rejeté avec la raison : "${userInput}"`,
                "success"
              );

              dispatch(
                fetchDataReleve({
                  id: statutValidation,
                  page: currentPage,
                  limit: 5,
                  search: search,
                })
              );
              setModalOpen(false);
            })
            .catch((error) => {
              swalWithBootstrapButtons.fire(
                "Erreur ❌",
                "Une erreur est survenue lors de la soumission.",
                "error"
              );
              console.error("❌ Erreur lors de la validation :", error);
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

  const showAlertReclamation = async (encaissementId: number) => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton:
          "btn btn-primary disabled:opacity-50 disabled:pointer-events-none",
        cancelButton: "btn btn-dark ltr:mr-3 rtl:ml-3",
        popup: "sweet-alerts",
      },
      buttonsStyling: false,
    });

    let userInput = ""; // Variable pour stocker l'observation saisie

    await swalWithBootstrapButtons
      .fire({
        title: "Êtes-vous sûr de mettre cet encaissement en litige ?",
        text: "Cette action mettra l'encaissement en litige.",
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
            Swal.showValidationMessage("Le champ de texte est requis !");
            return false; // Empêche la confirmation tant que le champ est vide
          }
          userInput = textareaValue; // Stocke l'observation saisie
          return true;
        },
        didOpen: () => {
          const confirmButton = Swal.getConfirmButton();
          const textarea = document.getElementById(
            "reason-textarea"
          ) as HTMLTextAreaElement;

          // Désactive le bouton de confirmation initialement
          confirmButton?.setAttribute("disabled", "true");

          // Écoute les événements d'entrée pour activer/désactiver le bouton
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
          // Payload à envoyer
          const payload = {
            encaissementId: selectedRow?.id, // ID de l'encaissement
            observationReclamation: userInput, // Observation saisie dans le textarea
            statutValidation: EStatutEncaissement.RECLAMATION_REVERSES, // Statut Rejeté
          };

          // Appel à la fonction Redux ou autre logique de soumission
          dispatch(submitEncaissementValidation(payload))
            .unwrap()
            .then((response) => {
              swalWithBootstrapButtons.fire(
                "Rejeté",
                `Votre encaissement est en litige avec la raison : "${userInput}"`,
                "success"
              );
              dispatch(
                fetchDataReleve({
                  id: statutValidation,
                  page: currentPage,
                  limit: 5,
                  search: search,
                })
              );
              setModalOpen(false);
            })
            .catch((error) => {
              swalWithBootstrapButtons.fire(
                "Erreur",
                "Une erreur est survenue lors de la soumission.",
                "error"
              );
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
        // Suppression de la section 'html' avec le textarea
        // Suppression de 'preConfirm' car il n'y a plus de validation de champ
      })
      .then((result) => {
        if (result.isConfirmed) {
          // Payload à soumettre sans 'observationReclamation'
          const payload = {
            encaissementId, // ID de l'encaissement
            statutValidation: EStatutEncaissement.CLOTURE, // Statut clôturé
          };

          // Appel à la fonction Redux ou autre logique de soumission
          dispatch(submitEncaissementValidation(payload))
            .unwrap()
            .then((response) => {
              swalWithBootstrapButtons.fire(
                "Clôturer",
                "Votre encaissement a été clôturé avec succès.",
                "success"
              );
              dispatch(
                fetchDataReleve({
                  id: statutValidation,
                  page: currentPage,
                  limit: 5,
                  search: search,
                })
              );
              setModalOpen(false);
            })
            .catch((error) => {
              swalWithBootstrapButtons.fire(
                "Erreur",
                "Une erreur est survenue lors de la clôture.",
                "error"
              );
              console.error("Erreur lors de la soumission :", error);
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

  const [params, setParams] = useState({
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

  const [toInput, setToInput] = useState<string>("");
  const [ccEmails, setCcEmails] = useState<Array<{ mail: string }>>([]);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<
    { file: File; preview: string }[]
  >([]);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [preuvePhotoModal, setPreuvePhotoModal] = useState(false);

  const [photoDocuments, setPhotoDocuments] = useState<DocumentType[]>([]);

  const baseCols = [
    {
      accessor: "numeroBordereau",
      title: "Numero Bordereau",
      sortable: true,
      render: ({ numeroBordereau }: { numeroBordereau: any }) => (
        <div className="cursor-pointer font-semibold text-primary underline hover:no-underline">
          {numeroBordereau && numeroBordereau.trim() !== ""
            ? `#${numeroBordereau}`
            : "Non renseigné"}
        </div>
      ),
    },
    {
      accessor: "modeEtJournee",
      title: "Session Caisse",
      sortable: true,
      render: ({ journeeCaisse }: any) => (
        <div>
          <p className="text-sm ">{journeeCaisse}</p>
        </div>
      ),
    },
    {
      accessor: "modeEtJournee",
      title: "Mode de réglement ",
      sortable: true,
      render: ({ modeReglement }: any) => (
        <div>
          <p className="text-sm ">{modeReglement}</p>
        </div>
      ),
    },
    { accessor: "banque", title: "Banque", sortable: true },
    {
      accessor: "compteBanque",
      title: "Compte banque",
      sortable: true,
      render: ({ compteBanque }: { compteBanque: string }) => (
        <div className=" text-primary  hover:no-underline">
          {`${compteBanque}`}
        </div>
      ),
    },

    { accessor: "DR", title: "DR", sortable: true },
    { accessor: "EXP", title: "Code Exp", sortable: true },
    { accessor: "Produit", title: "Produit", sortable: true },
    { accessor: "Date Encais", title: "Date Encaissement", sortable: true },

    {
      accessor: "Montant caisse (A)",
      title: "Montant Restitution Caisse (A)",
      sortable: true,
      render: ({ "Montant caisse (A)": montantCaisse }: DataReverse) =>
        `${formatNumber(montantCaisse)} F CFA`,
    },
    {
      accessor: "Montant bordereau (B)",
      title: "Montant Bordereau Banque (B)",
      sortable: true,
      render: ({ "Montant bordereau (B)": montantBordereau }: DataReverse) =>
        `${formatNumber(montantBordereau)} F CFA`,
    },
    {
      accessor: "Ecart(A-B)",
      title: "Ecart (A-B)",
      sortable: true,
      render: ({ "Ecart(A-B)": ecartAB }: DataReverse) => (
        <div
          className={
            ecartAB < 0
              ? "text-danger"
              : ecartAB > 0
              ? "text-success"
              : "font-bold"
          }
        >
          {formatNumber(ecartAB)} F CFA
        </div>
      ),
    },
  ];

  const additionalCols =
    statutValidation !== 0
      ? [
          {
            accessor: "Montant relevé (C°",
            title: "Montant Relevé",
            sortable: true,
            render: ({ "Montant relevé": montantReleve }: any) =>
              `${formatNumber(montantReleve)} F CFA`,
          },
          {
            accessor: "Ecart (B-C)",
            title: "Écart (B-C)",
            sortable: true,
            render: ({ "Ecart(B-C)": ecartReleve }: DataReverse) => (
              <div
                className={
                  ecartReleve < 0
                    ? "text-danger"
                    : ecartReleve > 0
                    ? "text-success"
                    : "font-bold"
                }
              >
                {formatNumber(ecartReleve)} F CFA
              </div>
            ),
          },
          {
            accessor: "Date Validation",
            title: "Date Validation",
            sortable: true,
            render: ({ "Date Validation": dateValidation }: any) =>
              formatDateData(dateValidation) || "N/A",
          },
          {
            accessor: "Observation caisse",
            title: "Observation Caisse",
            sortable: false,
            render: ({ "Observation caisse": observation }: any) => (
              <span>{observation}</span>
            ),
          },
          {
            accessor: "Observation relevé",
            title: "Observation Relevé",
            sortable: false,
            render: ({ "Observation relevé": observation }: any) => (
              <span>{observation}</span>
            ),
          },

          {
            accessor: "Observation réclamation",
            title: "Observation réclamation",
            sortable: false,
            render: ({ "Observation réclamation": observation }: any) => (
              <span>{observation}</span>
            ),
          },
          {
            accessor: "observationRejete",
            title: "Observation rejété",
            sortable: false,
            render: ({ observationRejete: observation }: any) => (
              <span>{observation}</span>
            ),
          },
        ]
      : [];

  const actionsCol = [
    {
      accessor: "Actions",
      title: "Actions",
      sortable: false,
      render: (row: DataReverse) => {
        const canEditComptable =
          statutValidation === 0 &&
          hasPermission("ENCAISSEMENTS REVERSES", "MODIFIER");

        return (
          <div className="flex items-center justify-center gap-3">
            {canEditComptable ? (
              <div className="flex items-center gap-3">
                <Tippy content="Modifier">
                  <button
                    type="button"
                    className="flex items-center justify-center rounded-lg p-2 text-primary hover:text-primary"
                    id="tuto-edit-btn"
                    onClick={() => handleOpenModal(row)}
                  >
                    <IconPencil className="h-5 w-5 stroke-[1.5]" />
                  </button>
                </Tippy>
                <Tippy content="Envoyer un mail">
                  <button
                    type="button"
                    className="flex items-center justify-center rounded-lg p-2 text-primary hover:text-primary"
                    id="tuto-mail-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRow(row); // Sauvegarder la ligne sélectionnée
                      setEmailModalOpen(true);
                    }}
                  >
                    <IconMail className="h-5 w-5 stroke-[1.5]" />
                  </button>
                </Tippy>
              </div>
            ) : (
              statutValidation !== 0 && (
                <Tippy content="Voir">
                  <button
                    type="button"
                    className="flex items-center justify-center rounded-lg p-2 text-primary hover:text-primary"
                    onClick={() => handleOpenModal(row)}
                  >
                    <IconEye className="h-5 w-5 stroke-[1.5]" />
                  </button>
                </Tippy>
              )
            )}
          </div>
        );
      },
    },
  ];

  const cols = [...baseCols, ...additionalCols, ...actionsCol];

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
    if (toEmails.length === 0) {
      ToastError.fire({
        text: "Veuillez ajouter au moins une adresse email dans le champ 'À'.",
      });
      return;
    }

    // ✅ Vérification des emails "À"
    for (const emailObj of toEmails) {
      if (!validateEmail(emailObj.mail)) {
        ToastError.fire({
          text: `L'adresse email "À" ${emailObj.mail} est invalide.`,
        });
        return;
      }
    }

    // ✅ Vérification des emails "CC"
    for (const emailObj of ccEmails) {
      if (!validateEmail(emailObj.mail)) {
        ToastError.fire({
          text: `L'adresse email CC ${emailObj.mail} est invalide.`,
        });
        return;
      }
    }

    try {
      const attachments = uploadedFiles.map((item) => item.file);

      const payload: any = {
        to: toEmails.map((emailObj) => emailObj.mail).join(","),
        cc: ccEmails.map((emailObj) => emailObj.mail).join(","),
        subject: emailSubject,
        text: params.description,
        attachments,
      };

      const resultAction = await dispatch(sendEmail(payload));

      if (sendEmail.fulfilled.match(resultAction)) {
        setEmailModalOpen(false);
        ToastSuccess.fire({ text: "Email envoyé avec succès !" });

        setToEmails([]);
        resetCcEmails(); // Utilisation de la nouvelle fonction
        setEmailSubject("");
        setParams({ description: "", displayDescription: "" });
        setUploadedFiles([]);
      } else {
        console.error("❌ Échec lors de l'envoi de l'email :", resultAction);
        ToastError.fire({ text: "Échec lors de l'envoi de l'email." });
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
  }, [emailConnecte]);

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

    // ✅ Construction du payload avec les valeurs mises à jour
    const payload: any = {
      encaissementId: selectedRow.id,
      observationCaisse: rasChecked1 ? "RAS" : observationCaisse,
      observationReleve: rasChecked2 ? "RAS" : observationBanque,
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
      const files = images2.map((image: { file: File }) => image.file);
      payload.files = files;
    }

    // ✅ Envoi de la requête
    dispatch(submitEncaissementValidation(payload))
      .unwrap()
      .then(() => {
        dispatch(
          fetchDataReleve({
            id: statutValidation,
            page: currentPage,
            limit: 5,
            search: search,
          })
        );
        setModalOpen(false);
      })
      .catch((error) => {
        console.error("❌ Erreur lors de la validation :", error);
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

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(
        fetchDataReleve({
          id: statutValidation,
          page: currentPage,
          limit: 5,
          search: search,
        })
      );
    } catch (error) {
      console.error("Erreur lors de l'actualisation :", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const confirmClose = () => {
    setConfirmationModalOpen(false);
    setModalOpen(false);
  };

  const handleOpenConfirmationModal = () => {
    setConfirmationModalOpen(true);
  };

  const handleApplyFilters = (params: any) => {
    dispatch(
      fetchDataReleve({
        id: statutValidation,
        page: currentPage || 1,
        limit: 5,
        search: search || "",
        ...params,
      })
    );
  };

  const [montantBanque, setMontantBanque] = useState("");
  const isMontantValid = montantBanque !== "";

  const handleMontantChange = (value: number) => {
    const formattedValue = new Intl.NumberFormat().format(value);
    setMontantBanque(formattedValue);
  };

  console.log(paginate, "paginate");

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
        <GlobalFiltre
          drData={drData}
          showHideColumns={showHideColumns}
          onApplyFilters={handleApplyFilters}
          statutValidation={statutValidation}
        />

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
            <div className="overflow-x-auto">
              <DataTable
                style={{
                  position: "relative",
                  width: "100%",
                }}
                className="table-hover whitespace-nowrap"
                records={
                  !loading && filteredData?.length > 0 ? filteredData : []
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
                            <Tippy content="Modifier">
                              <button
                                type="button"
                                className="flex items-center justify-center rounded-lg p-2 text-primary hover:text-primary"
                                onClick={() => handleOpenModal(row)}
                              >
                                <IconPencil className="h-5 w-5 stroke-[1.5]" />
                              </button>
                            </Tippy>
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
                totalRecords={!loading ? paginate.totalCount : 0}
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
                noRecordsText={
                  loading
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

          {modalOpen && selectedRow && (
            <div>
              {statutValidation === 0 ? (
                <EditModal
                  setModalOpen={setModalOpen}
                  modalOpen={modalOpen}
                  selectedRow={selectedRow}
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
                  handleAmountChange={handleAmountChange}
                  showAlertReclamation={showAlertReclamation}
                  showAlertCloture={showAlertCloture}
                  rasChecked2={rasChecked2}
                  handleRasChecked2Change={handleRasChecked2Change}
                  observationBanque={observationBanque}
                  setObservationBanque={setObservationBanque}
                  showAlertRejete={showAlertRejete}
                  showAlertValide={showAlertValide}
                  showAlertRamener={showAlertRamener}
                  handleSubmit={handleSubmit}
                  today={today}
                  setPreuvePhotoModal={setPreuvePhotoModal}
                  observationRejete={observationRejete}
                  handleSendEmail={handleSubmit}
                  handleMultipleFileUpload={handleMultipleFileUpload}
                  uploadedFiles={uploadedFiles}
                  removeFile={removeFile}
                  params={params}
                  setParams={setParams}
                  handleOpenConfirmationModal={handleOpenConfirmationModal}
                  setPhotoDocuments={setPhotoDocuments}
                  setImages2={setImages2}
                  images2={images2}
                  onChange2={onChange2}
                  observationReclamation={observationReclamation}
                  setObservationReclamation={setObservationReclamation}
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
            ccEmails={ccEmails}
            emailConnecte={emailConnecte}
            removeToEmail={removeToEmail}
            emailInput={emailInput}
            setEmailInput={setEmailInput}
            handleCcKeyDown={handleCcKeyDown}
            emailSubject={emailSubject}
            setEmailSubject={setEmailSubject}
            params={params}
            setParams={setParams}
            handleMultipleFileUpload={handleMultipleFileUpload}
            uploadedFiles={uploadedFiles}
            removeFile={removeFile}
            setEmailModalOpen={setEmailModalOpen}
            handleSendEmail={handleSendEmail}
            handleToKeyDown={handleToKeyDown}
            setToInput={setToInput}
            removeCcEmail={removeCcEmail}
            toEmails={toEmails}
            toInput={toInput}
            numeroBordereau={selectedRow?.numeroBordereau}
          />
          {/* PreuvePhoto */}
          <PreuvePhotoModal
            preuvePhotoModal={preuvePhotoModal}
            setPreuvePhotoModal={setPreuvePhotoModal}
            documents={photoDocuments}
          />
        </div>
      </div>

      {isFirstLogin === 1 && <EncaissementTutorial />}
    </>
  );
};

export default ComponentsDatatablesColumnChooser;
