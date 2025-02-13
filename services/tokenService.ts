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

  setRefreshToken(token: string) {
    // Stockage sécurisé du refresh token
    cookies.set('refreshToken', token, {
      path: '/',
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 3600 // 7 jours
    });
    
    // Backup dans le localStorage pour la persistance
    safeLocalStorage.setItem('refreshToken', token);
  },

  getAccessToken(): string | null {
    // Essayer d'abord les cookies
    const cookieToken = cookies.get('accessToken');
    if (cookieToken) return cookieToken;

    // Fallback sur localStorage
    return safeLocalStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    // Essayer d'abord les cookies
    const cookieToken = cookies.get('refreshToken');
    if (cookieToken) return cookieToken;

    // Fallback sur localStorage
    return safeLocalStorage.getItem('refreshToken');
  },

  removeAccessToken() {
    cookies.remove('accessToken', { path: '/' });
    safeLocalStorage.removeItem('accessToken');
  },

  removeRefreshToken() {
    cookies.remove('refreshToken', { path: '/' });
    safeLocalStorage.removeItem('refreshToken');
  },

  clearAllTokens() {
    this.removeAccessToken();
    this.removeRefreshToken();
  },

  refreshToken() {
    const token = this.getRefreshToken();
    if (!token) return null;

    // Ici, vous pouvez implémenter la logique de rafraîchissement du token
    // en appelant votre API avec le refresh token
    return token;
  }
};
