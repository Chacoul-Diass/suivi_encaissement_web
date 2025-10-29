import React, { useState } from "react";
import Image from "next/image";

// Interface pour les props du composant InfoItem
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

// Composant pour les informations avec icône
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
      <svg
        className="h-4 w-4 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
      >
        {icon}
      </svg>
    </span>
    <span className="font-medium text-gray-700">{label}</span>
    <span>{value}</span>
  </div>
);

export default function FicheDette() {
  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [isColorPrint, setIsColorPrint] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 ${
        !isColorPrint ? "print-bw" : ""
      }`}
    >
      {/* Bouton d'impression - visible uniquement à l'écran */}
      <div className="fixed right-6 top-6 z-50 flex items-center gap-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-white shadow-lg transition-all hover:bg-primary/90"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          <span>Imprimer</span>
        </button>
      </div>

      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 print:shadow-none">
        {/* Bordure décorative supérieure */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/50"></div>

        {/* Filigrane */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] print:opacity-[0.05]">
          <Image
            src="/assets/images/cie.png"
            alt="Filigrane CIE"
            width={600}
            height={600}
            className="rotate-12 transform"
          />
        </div>

        {/* Contenu principal avec padding */}
        <div className="relative z-10 p-8">
          {/* En-tête avec logos et titre */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-start space-x-4">
              <div className="relative h-16 w-16 shrink-0">
                <Image
                  src="/assets/images/cie.png"
                  alt="Logo GS2E"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  DG / DLF
                  <br />
                  SERVICE RECOUVREMENT
                </h1>
                <p className="mt-1 text-sm text-gray-600">Le {currentDate}</p>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-900">GS2E</h2>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  FICHE DE RECONNAISSANCE DE DETTE
                </p>
              </div>
              <div className="mt-4 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                N° Dossier: FR-2025-001
              </div>
            </div>
          </div>

          {/* Type de fraude avec style amélioré */}
          <div className="mb-6 overflow-hidden rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-white p-4 print:bg-white print:ring-1 print:ring-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-700">Type de fraude</h3>
                  <p className="mt-1 text-sm font-medium text-red-600">
                    BRANCHEMENT DIRECT AUX RACCORDS
                  </p>
                </div>
              </div>
              <div className="hidden rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 print:block">
                Fraude
              </div>
            </div>
          </div>

          {/* Informations du client avec style carte */}
          <div className="mb-6 rounded-xl bg-gray-50 p-6">
            <div className="mb-4 border-b border-gray-200 pb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Je soussigné(e)
              </h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                M. KOUAME KOUADIO DOMINIQUE
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
                  <InfoItem
                    icon={
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    }
                    label="Demeurant à :"
                    value="ABOBO - Quartier PK 18"
                  />
                  <InfoItem
                    icon={
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    }
                    label="Lot :"
                    value="Villa"
                  />
                </div>
                <div className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
                  <InfoItem
                    icon={
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                      />
                    }
                    label="Profession :"
                    value="ENTREPRENEUR"
                  />
                  <InfoItem
                    icon={
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    }
                    label="Cel. :"
                    value="05 44 78 79 78"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="flex items-center space-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      <svg
                        className="h-4 w-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      ID Client
                    </span>
                  </span>
                  <span className="font-mono text-sm font-bold text-gray-900">
                    221003225000
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="flex items-center space-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      <svg
                        className="h-4 w-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      Référence
                    </span>
                  </span>
                  <span className="font-mono text-sm font-bold text-gray-900">
                    ASA PROF
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      <svg
                        className="h-4 w-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      N° Contrat
                    </span>
                  </span>
                  <span className="font-mono text-sm font-bold text-gray-900">
                    371199050925
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Détails de la dette */}
          <div className="mb-6 rounded-xl bg-gray-50 p-6">
            <div className="flex items-start space-x-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.171-.879-1.171-2.303 0-3.182C10.536 7.719 11.768 7.5 12 7.5c1.45 0 2.9.659 4.242 1.977"
                  />
                </svg>
              </span>
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-gray-700">
                  Reconnais devoir à la CIE la somme de{" "}
                  <strong className="text-primary">
                    cent mille (100 000) francs CFA
                  </strong>{" "}
                  sur une facture fraude de{" "}
                  <strong className="text-primary">
                    neuf cent mille cinq cent cinquante-cinq (900 555) francs
                    CFA
                  </strong>{" "}
                  et dont un acompte de{" "}
                  <strong className="text-primary">
                    huit cent mille cinq cent cinquante-cinq (800 555) francs
                    CFA
                  </strong>{" "}
                  est fait ce lundi 17 Février 2025.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-start space-x-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </span>
              <p className="flex-1 text-sm font-medium text-gray-700">
                Je m'engage volontairement et sans contrainte à régler la
                totalité en un seul paiement ou selon l'échéancier ci-dessous :
              </p>
            </div>
          </div>

          {/* Tableau de l'échéancier avec style moderne */}
          <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center space-x-3 bg-gray-50 px-6 py-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200/70">
                <svg
                  className="h-4 w-4 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </span>
              <h4 className="font-medium text-gray-700">
                Échéancier de paiement
              </h4>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    N°
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Date d'échéance
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Montant (FCFA)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Date de paiement
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Observation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    1
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    28/02/2025
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">
                    100 000
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500"></td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500"></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4"></td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                    TOTAL
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-primary">
                    100 000
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Note de suspension avec style alerte */}
          <div className="mb-8 rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Important : </span>
              En cas de manquement à mon engagement, j'autorise la CIE à
              suspendre la fourniture d'électricité sans préavis et à user de
              toute voie de droit pour le recouvrement de sa créance.
            </p>
          </div>

          {/* Section signatures avec style moderne */}
          <div className="grid grid-cols-1 gap-6 rounded-xl border border-gray-200 bg-gray-50 p-6 sm:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">LE CLIENT</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Mention : Lu et approuvé</p>
                <p>Nom : KOUAME K. Dominique</p>
                <div className="mt-4 h-px bg-gray-300"></div>
                <p className="mt-1 text-xs italic">Signature</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">CONTRÔLEUR LITIGE</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Nom : Konan Baccy</p>
                <div className="mt-4 h-px bg-gray-300"></div>
                <p className="mt-1 text-xs italic">Signature</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                CHEF DE SERVICE RECOUVREMENT
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Département Lutte Contre la Fraude</p>
                <div className="mt-4 h-px bg-gray-300"></div>
                <p className="mt-1 text-xs italic">Signature</p>
              </div>
            </div>
          </div>

          {/* Pied de page avec style subtil */}
          <div className="mt-8 border-t border-gray-200 pt-4">
            <div className="flex flex-col items-start justify-between space-y-2 text-xs text-gray-500 sm:flex-row sm:space-y-0">
              <p>NB : Signature précédée de la mention « Lu et approuvé »</p>
              <p className="font-mono">DLF LCF IS 01 01 11</p>
            </div>
          </div>
        </div>
      </div>

      {/* Styles d'impression */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          /* Mode impression en noir et blanc */
          .print-bw {
            filter: grayscale(100%) !important;
            -webkit-filter: grayscale(100%) !important;
          }

          .print-bw * {
            color: black !important;
            background: white !important;
            border-color: black !important;
          }

          /* Optimisations d'impression */
          * {
            text-shadow: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
