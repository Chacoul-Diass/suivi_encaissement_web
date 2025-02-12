import { safeLocalStorage } from '@/hooks/useLocalStorage';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const TokenService = {
  setAccessToken(token: string) {
    // Stockage sécurisé du token
    cookies.set('accessToken', token, {
      path: '/',
      secure: true,
      sameSite: 'strict',
      maxAge: 3600 // 1 heure
    });
    
    // Backup dans le localStorage pour la persistance
    safeLocalStorage.setItem('accessToken', token);
  },

  getAccessToken(): string | null {
    // Essayer d'abord les cookies
    const cookieToken = cookies.get('accessToken');
    if (cookieToken) return cookieToken;

    // Fallback sur localStorage
    return safeLocalStorage.getItem('accessToken');
  },

  removeAccessToken() {
    cookies.remove('accessToken', { path: '/' });
    safeLocalStorage.removeItem('accessToken');
  },

  refreshToken() {
    const token = this.getAccessToken();
    if (!token) return null;

    // Ici, vous pouvez implémenter la logique de rafraîchissement du token
    // en appelant votre API avec le token actuel
    return token;
  }
};
