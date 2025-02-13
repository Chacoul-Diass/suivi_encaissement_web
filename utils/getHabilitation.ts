import { decodeToken } from "react-jwt";
import { safeLocalStorage, isClient } from "@/hooks/useLocalStorage";

const getUserHabilitation = (): any => {
  // Return null during SSR
  if (!isClient) {
    console.log("getUserHabilitation: Exécution côté serveur, retourne null");
    return null;
  }

  try {
    // Récupérer les données persistées
    const persistData = safeLocalStorage.getItem("persist:suivi-encaissement");
    
    if (!persistData) {
      console.log("getUserHabilitation: Aucune donnée persistée trouvée");
      return null;
    }

    // Parser les données JSON
    const parsedData = JSON.parse(persistData);
    if (!parsedData || !parsedData.auth) {
      console.log("getUserHabilitation: Données auth non trouvées dans les données persistées");
      return null;
    }

    // Récupérer et parser l'objet auth
    const authData = JSON.parse(parsedData.auth);
    if (!authData || !authData.accessToken) {
      console.log("getUserHabilitation: Token non trouvé dans les données auth");
      return null;
    }

    // Décoder le token
    const tokenData: any = decodeToken(authData.accessToken);
    if (!tokenData || !tokenData.permissions) {
      console.log("getUserHabilitation: Permissions non trouvées dans le token");
      return null;
    }

    console.log("getUserHabilitation: Permissions récupérées avec succès");
    return tokenData.permissions;

  } catch (error) {
    console.error("Erreur lors de la récupération des permissions:", error);
    return null;
  }
};

export default getUserHabilitation;
