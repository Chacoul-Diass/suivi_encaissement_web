
import EtatParent from "@/components/etat/EtatParent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "État des encaissements",
};

const Page = () => {
    return <EtatParent />;
};

export default Page; 