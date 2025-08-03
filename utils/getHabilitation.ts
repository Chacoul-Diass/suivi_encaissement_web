import { decodeToken } from "react-jwt";
import { safeLocalStorage, isClient } from "@/hooks/useLocalStorage";

const getUserHabilitation = (): any => {
  // Return null during SSR
  if (!isClient) {
    return null;
  }

  try {
    // Récupérer les données persistées
    const persistData = safeLocalStorage.getItem("persist:suivi-encaissement");

    if (!persistData) {
      return null;
    }

    // Parser les données JSON
    const parsedData = JSON.parse(persistData);
    if (!parsedData || !parsedData.auth) {
      return null;
    }

    // Récupérer et parser l'objet auth
    const authData = JSON.parse(parsedData.auth);
    if (!authData || !authData.accessToken) {
      return null;
    }

    // Décoder le token
    const tokenData: any = decodeToken(authData.accessToken);
    if (!tokenData || !tokenData.permissions) {
      return null;
    }

    return tokenData.permissions;
  } catch (error) {
    return null;
  }
};

export default getUserHabilitation;
