import { decodeToken } from "react-jwt";

const getUserPermission = (): any => {
  // Récupérer les données persistées
  const persistData = localStorage.getItem("persist:suivi-encaissement");
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
        if (tokenData && tokenData) {
          return tokenData;
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

export default getUserPermission;
