// Types unifiés pour le dashboard

export interface KPIData {
  charges: { total: number; rejetes: number };
  verifies: { total: number; rejetes: number };
  traites: { total: number; rejetes: number };
  valides: { total: number; rejetes: number };
  rejetes: { total: number; rejetes: number };
  reclamations: { total: number; rejetes: number };
}

export interface HistogramData {
  [year: number]: {
    janvier: number;
    fevrier: number;
    mars: number;
    avril: number;
    mai: number;
    juin: number;
    juillet: number;
    aout: number;
    septembre: number;
    octobre: number;
    novembre: number;
    decembre: number;
  };
}

export interface WeeklyHistogramData {
  [year: number]: {
    semaine1: number;
    semaine2: number;
    semaine3: number;
    semaine4: number;
    semaine5: number;
    semaine6: number;
    semaine7: number;
    semaine8: number;
    semaine9: number;
    semaine10: number;
    semaine11: number;
    semaine12: number;
    semaine13: number;
    semaine14: number;
    semaine15: number;
    semaine16: number;
    semaine17: number;
    semaine18: number;
    semaine19: number;
    semaine20: number;
    semaine21: number;
    semaine22: number;
    semaine23: number;
    semaine24: number;
    semaine25: number;
    semaine26: number;
    semaine27: number;
    semaine28: number;
    semaine29: number;
    semaine30: number;
    semaine31: number;
    semaine32: number;
    semaine33: number;
    semaine34: number;
    semaine35: number;
    semaine36: number;
    semaine37: number;
    semaine38: number;
    semaine39: number;
    semaine40: number;
    semaine41: number;
    semaine42: number;
    semaine43: number;
    semaine44: number;
    semaine45: number;
    semaine46: number;
    semaine47: number;
    semaine48: number;
    semaine49: number;
    semaine50: number;
    semaine51: number;
    semaine52: number;
  };
}

export interface AgencyData {
  name: string;
  performance: number;
  encaissements: number;
  tauxReussite: number;
}

export interface RegionalData {
  region: string;
  tauxCloture: number;
  encaissementsTotal: number;
  encaissementsClotures: number;
  evolution: number;
}

export interface ErrorRateData {
  region: string;
  encaissementsValides: number;
  encaissementsRejetes: number;
  tauxErreur: number;
}

// Interface pour la réponse de l'API taux d'erreurs (structure réelle)
export interface ErrorRateApiResponse {
  tauxErreur: number;
  valides: number;
  rejetes: number;
  totalReference: number;
  details: Array<{
    region: string;
    valides: number;
    rejetes: number;
    verifies: number;
    traites: number;
    tauxErreur: number;
    totalReference: number;
  }>;
}

export interface BankData {
  bank: string;
  encaissements: number;
  position: number;
  evolution: number;
}
