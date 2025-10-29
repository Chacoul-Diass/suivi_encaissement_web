export type DetailsMontants = {
	montantCaisses: number;
	montantBordereaux: number;
	ecart1: number;
	observationEcartCaisseBordereau: string;
};

export type ReleveBancaire = {
	dateReleve: string;
	montantBordereaux: number;
	nomBanque: string;
	montantBanque: number;
	ecart2: number;
	observationEcartCaisseBanque: string;
};

export type EncaissementTerminer = {
	detailsMontants: DetailsMontants;
	releveBancaire: ReleveBancaire;
};
