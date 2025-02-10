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
  | "MES ENCAISEMENTS"
  | "ENCAISSEMENTS VALIDES"
  | "UTILISATEURS"
  | "HABILITATIONS"
  | "ENCAISSEMENTS REVERSES"
  | "ENCAISSEMENTS TRAITÉS"
  | "ENCAISSEMENTS REJETES"
  | "ENCAISSEMENTS CLOTURES"
  | "RECLAMATION"
  | "RAPPROCHEMENT"
  | "RECLAMATION REVERSES"
  | "RECLAMATION TRAITES";

export type HabilitationAction = "CREER" | "MODIFIER" | "SUPPRIMER" | "LIRE";
