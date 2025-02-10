import ComponentsAppsNotes from "@/components/app/user/components-apps-notes";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Utilisateurs",
};

const Notes = () => {
  return <ComponentsAppsNotes />;
};

export default Notes;
