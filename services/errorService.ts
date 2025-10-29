import { Toastify } from '@/utils/toast';

interface ErrorMessages {
  [key: string]: string;
}

const ERROR_MESSAGES: ErrorMessages = {
  'auth/invalid-credentials': 'Identifiants invalides. Veuillez vérifier vos informations de connexion.',
  'auth/no-permissions': 'Vous n\'avez pas les permissions nécessaires pour accéder à l\'application.',
  'auth/token-expired': 'Votre session a expiré. Veuillez vous reconnecter.',
  'auth/network-error': 'Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.',
  'auth/first-login': 'Première connexion détectée. Veuillez changer votre mot de passe.',
  'auth/invalid-password': 'Le mot de passe ne respecte pas les critères de sécurité requis.',
  'default': 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
};

export const ErrorService = {
  handleError(error: any) {
    console.error('Error details:', error);

    // Gestion des erreurs réseau
    if (!navigator.onLine) {
      Toastify('error', ERROR_MESSAGES['auth/network-error']);
      return;
    }

    // Gestion des erreurs API
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message;

      switch (statusCode) {
        case 401:
          Toastify('error', ERROR_MESSAGES['auth/invalid-credentials']);
          break;
        case 403:
          Toastify('error', ERROR_MESSAGES['auth/no-permissions']);
          break;
        case 440:
          Toastify('error', ERROR_MESSAGES['auth/token-expired']);
          break;
        default:
          Toastify('error', errorMessage || ERROR_MESSAGES.default);
      }
      return;
    }

    // Gestion des erreurs spécifiques
    if (error.code && ERROR_MESSAGES[error.code]) {
      Toastify('error', ERROR_MESSAGES[error.code]);
      return;
    }

    // Erreur par défaut
    Toastify('error', ERROR_MESSAGES.default);
  },

  getErrorMessage(code: string): string {
    return ERROR_MESSAGES[code] || ERROR_MESSAGES.default;
  }
};
