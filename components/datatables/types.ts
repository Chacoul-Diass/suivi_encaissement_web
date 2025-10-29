export interface DataReverse {
  id: number;
  "Date Encais": string;
  "Caisse mode": string;
  banque: string;
  "Montant caisse (A)": number;
  "Montant bordereau (B)": number;
  "Montant revelé (C)": number;
  "Date cloture": string;
  "Date Validation": string;
  Bordereau: string;
  caisse: string;
  statutValidation: number;
  DR?: string;
  EXP?: string;
  Produit?: string;
  "Compte banque Jade"?: string;
  "Ecart(A-B)"?: any;
  "Ecart(B-C)"?: any;
  "Observation(A-B)"?: string;
  "Observation(B-C)"?: string;
  "Observation rejet"?: string;
  compteBanque: string;
  numeroBordereau: string;
  observationReclamation: string;
  observationRejete: string;
  documents?: Array<Document>;
}

export interface Document {
  id: number;
  encaissementId: number;
  fileName: string;
  filePath: string;
}

export interface Paginations {
  currentPage: number;
  count: number;
  pageSizes: number[];
}

export interface DataTableColumn<T> {
  hidden?: boolean;
  accessor: string;
  title: string;
  sortable: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface TableProps {
  statutValidation: number;
  data: any[];
  loading: boolean;
  paginate: Paginations;
  habilitation: any[];
  handlePageChange?: (page: number) => void;
  handleSearchChange?: (value: string) => void;
  handleLimitChange?: (value: number) => void;
}
