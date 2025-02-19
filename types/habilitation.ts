export interface Habilitation {
  id: number;
  name: string;
  CREER: boolean;
  MODIFIER: boolean;
  SUPPRIMER: boolean;
  LIRE: boolean;
}

export type MenuName =
  | "DASHBOARD"
  | "MES ENCAISSEMENTS"
  | "ENCAISSEMENTS VALIDES"
  | "UTILISATEURS"
  | "HABILITATIONS"
  | "ENCAISSEMENTS CHARGES"
  | "ENCAISSEMENTS VERIFIES"
  | "ENCAISSEMENTS REJETES"
  | "ENCAISSEMENTS TRAITES"
  | "LITIGES"
  | "RAPPROCHEMENT"
  | "LITIGES CHARGES"
  | "LITIGES TRAITES";

export type HabilitationAction = "CREER" | "MODIFIER" | "SUPPRIMER" | "LIRE";
