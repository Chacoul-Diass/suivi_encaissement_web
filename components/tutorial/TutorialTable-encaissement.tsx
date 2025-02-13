"use client";
import getUserPermission from "@/utils/user-info";
import React, { useEffect, useState } from "react";
import Joyride, { CallBackProps, Step } from "react-joyride";

export default function EncaissementTutorial() {
  const [run, setRun] = useState(false);

  const user = getUserPermission();
  const isFirstLogin = user?.isFirstLogin;

  // Les différentes étapes du tutoriel
  const steps: Step[] = [
    {
      target: "#tuto-encaissement-titre",
      content: "Voici le nombre total d'encaissements reversé.",
      placement: "bottom",
    },
    {
      target: "#tuto-barre-actions",
      content: "Vous pouvez rafraîchir les données, exporter un fichier, etc.",
      placement: "bottom",
    },
    {
      target: "#tuto-search-bar",
      content: "Ici, vous pouvez rechercher un encaissement par mot-clé.",
      placement: "left",
    },
    {
      target: "#tuto-dropdown-colonnes",
      content: "Personnalisez les colonnes à afficher ou masquer ici.",
      placement: "left",
    },
    {
      target: "#tuto-datatable",
      content:
        "Ceci est la liste des encaissements. Cliquez sur les actions pour éditer, envoyer un mail, etc.",
      placement: "top",
    },
  ];

  useEffect(() => {
    const tutorialSeen = localStorage.getItem("tutorialEncaissementSeen");
    if (isFirstLogin === 1) {
      setRun(true);
    }
  }, [isFirstLogin]);

  // Callback pour arrêter le tutoriel
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (["finished", "skipped"].includes(status!)) {
      localStorage.setItem("tutorialEncaissementSeen", "true");
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{
        back: "Précédent",
        next: "Suivant",
        skip: "Passer",
        last: "Terminer",
        close: "Fermer",
        open: "Ouvrir",
      }}
      styles={{
        options: {
          primaryColor: "#C7493D",
          zIndex: 10000,
        },
      }}
    />
  );
}
