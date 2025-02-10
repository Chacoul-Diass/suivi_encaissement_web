export const handleApiError = (error: any): string => {
  if (error.response) {
    // Si la réponse contient un message, on le retourne
    if (error.response.data?.message) {
      return error.response.data.message;
    }

    // Sinon, on retourne un message par défaut basé sur le statut HTTP
    switch (error.response.status) {
      case 400:
        return "Requête invalide. Veuillez vérifier les données envoyées.";
      case 401:
        return "Non autorisé. Veuillez vous authentifier.";
      case 403:
        return "Accès interdit. Vous n'avez pas les permissions nécessaires.";
      case 404:
        return "Ressource introuvable.";
      case 500:
        return "Une erreur interne s'est produite.";
      default:
        return "Une erreur inattendue s'est produite.";
    }
  }

  // Si aucune réponse du serveur n'est disponible
  if (error.request) {
    return "Impossible de joindre le serveur. Veuillez vérifier votre connexion réseau.";
  }

  // Si une autre erreur est survenue
  return error.message || "Une erreur est survenue.";
};
