interface Permission {
  CREER: boolean;
  LIRE: boolean;
  MODIFIER: boolean;
  SUPPRIMER: boolean;
  name: string;
}

interface MenuItem {
  id: number;
  name: string;
  path: string;
  section: string;
}

// Ordre de priorité des menus
const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "DASHBOARD",
    path: "/dashboard",
    section: "Tableau de bord",
  },
  {
    id: 2,
    name: "MES ENCAISSEMENTS",
    path: "/encaissement",
    section: "Encaissements",
  },
  {
    id: 11,
    name: "LITIGES",
    path: "/litige",
    section: "Encaissements",
  },
  {
    id: 12,
    name: "RAPPROCHEMENT",
    path: "/rapprochement",
    section: "Encaissements",
  },
  {
    id: 3,
    name: "HABILITATIONS",
    path: "/profil",
    section: "Administration",
  },
  {
    id: 4,
    name: "UTILISATEURS",
    path: "/user",
    section: "Administration",
  },
];

const hasAnyPermission = (permission: Permission): boolean => {
  if (!permission) return false;

  const result =
    permission.CREER ||
    permission.LIRE ||
    permission.MODIFIER ||
    permission.SUPPRIMER;

  return result;
};

export const getFirstAccessibleRoute = (habilitation: Permission[]): string => {
  if (!Array.isArray(habilitation)) {
    console.error("Les habilitations doivent être un tableau");
    return "/login";
  }

  // Parcourir les menus dans l'ordre de priorité
  for (const menuItem of menuItems) {
    const permission = habilitation.find(
      (h) => h && typeof h === "object" && h.name === menuItem.name
    );

    if (permission) {
      if (hasAnyPermission(permission)) {
        return menuItem.path;
      } else {
        console.log(`Aucune permission active pour ${menuItem.name}`);
      }
    } else {
      console.log(`Menu ${menuItem.name} non trouvé dans les habilitations`);
    }
  }

  return "/login";
};
