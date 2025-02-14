"use client";
import getUserPermission from "@/utils/user-info";
import React, { useEffect, useState } from "react";
import Joyride, { CallBackProps, Step } from "react-joyride";

export default function DashboardTutorial() {
  const [run, setRun] = useState(false);

  const user = getUserPermission();
  const isFirstLogin = user?.isFirstLogin;

  // Les différentes étapes du tutoriel
  const steps: Step[] = [
    {
      target: "#tuto-dashboard-globalView",
      content: "Onglet de vue globale",
      placement: "right-start",
    },
    {
      target: "#tuto-dashboard-details",
      content: "Onglet des détails des écarts",
      placement: "right-start",
    },
    {
      target: "#tuto-dashboard-refresh",
      content: "Ici vous pouvez râfraichir la donnée.",
      placement: "top",
    },
    {
      target: "#tuto-dashboard-filtre",
      content:
        "Voici les filtres qui permettent de trier la donnée par DR ou Exploitation.",
      placement: "top",
    },
    {
      target: "#tuto-dashboard-ecart",
      content: "Voir plus d'écarts Restitution",
      placement: "bottom",
    },
  ];

  useEffect(() => {
    const tutorialSeen = localStorage.getItem("tutorialDashboardSeen");
    if (isFirstLogin === 1) {
      setRun(true);
    }
  }, [isFirstLogin]);

  // Callback pour arrêter le tutoriel
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (["finished", "skipped"].includes(status!)) {
      localStorage.setItem("tutorialDashboardSeen", "true");
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
