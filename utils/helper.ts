/**
 * Formate une date au format 'yyyy-mm-dd'
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

/**
 * Formate une date au format 'dd/mm/yyyy'
 */
export const formatDateDisplay = (date: Date | string): string => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);

  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formate un montant en devise
 */
export const formatMontant = (montant: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(montant);
};
