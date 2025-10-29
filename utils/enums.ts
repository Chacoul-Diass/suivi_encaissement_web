export enum EStatutEncaissement {
  EN_ATTENTE = 0,
  REJETE = 1,
  TRAITE = 2,
  VALIDE = 3,
  RECLAMATION_REVERSES = 4,
  CLOTURE = 5,
  RECLAMATION_TRAITES = 6,
  DFC = 7,
}

export enum EProfileLevel {
  ADMIN = 1,
  DFC = 2,
  DR = 3,
  RC = 4,
  COMPTABLE = 5,
}
