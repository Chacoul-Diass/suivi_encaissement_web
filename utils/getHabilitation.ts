import { decodeToken } from "react-jwt";
import { safeLocalStorage, isClient } from "@/hooks/useLocalStorage";

const getUserHabilitation = (): any => {
  // Return null during SSR
  if (!isClient) {
    console.log("getUserHabilitation: Exécution côté serveur, retourne null");
    return null;
  }

  // Récupérer les données persistées
  const persistData = safeLocalStorage.getItem("persist:suivi-encaissement");
  console.log("getUserHabilitation: Données persistées:", persistData);

  if (persistData) {
    try {
      // Parser les données JSON
      const parsedData = JSON.parse(persistData);
      console.log("getUserHabilitation: Données parsées:", parsedData);

      // Récupérer et parser l'objet auth
      const authData = parsedData.auth ? JSON.parse(parsedData.auth) : null;
      console.log("getUserHabilitation: Données d'authentification:", authData);

      // Vérifier si le token existe
      const token = authData?.accessToken;
      if (token) {
        // Décoder le token
        const tokenData: any = decodeToken(token);
        console.log("getUserHabilitation: Données du token:", tokenData);

        if (tokenData && tokenData.permissions) {
          console.log(
            "getUserHabilitation: Permissions trouvées:",
            tokenData.permissions
          );
          return tokenData.permissions;
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération ou du décodage du token :",
        error
      );
    }
  }

  console.log("getUserHabilitation: Aucune permission trouvée, retourne null");
  return null; // Retourne null si l'utilisateur n'est pas identifié
};

export default getUserHabilitation;
