export type Encaissement = {
  id?: number;
  directionRegionale: string;
  codeExpl: string;
  dateEncaissement: string;
  caisse: string;
  banque: string;
  montantRestitutionCaisse: number;
  montantBordereauBanque: number;
  numeroBordereau: string;
  produit: string;
  journeeCaisse: number;
  compteBanque: string;
  ecartCaisseBanque: number;
  dateRemiseBanque: string;
  observationCaisse?: string;
  observationReleve?: string;
  observationReclamation?: string;
  observationRejete?: string;
  ecartReleve?: number;
  montantReleve?: number;
  statutValidation?: number;
  dateValidation?: number;
  dateCloture?: number;
};
