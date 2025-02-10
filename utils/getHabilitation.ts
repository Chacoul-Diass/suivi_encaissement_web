import { decodeToken } from "react-jwt";
import { safeLocalStorage, isClient } from "@/hooks/useLocalStorage";

const getUserHabilitation = (): any => {
  // Return null during SSR
  if (!isClient) {
    return null;
  }

  // Récupérer les données persistées
  const persistData = safeLocalStorage.getItem("persist:suivi-encaissement");
  if (persistData) {
    try {
      // Parser les données JSON
      const parsedData = JSON.parse(persistData);

      // Récupérer et parser l'objet auth
      const authData = parsedData.auth ? JSON.parse(parsedData.auth) : null;

      // Vérifier si le token existe
      const token = authData?.accessToken;
      if (token) {
        // Décoder le token
        const tokenData: any = decodeToken(token);
        if (tokenData && tokenData.permissions) {
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

  return null; // Retourne null si l'utilisateur n'est pas identifié
};

export default getUserHabilitation;
