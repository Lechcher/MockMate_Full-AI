/**
 * useAuth hook
 * 
 * Provides authentication functionality via Auth0 with Google OAuth.
 * Wraps react-native-auth0 with typed helpers and error handling.
 * 
 * @example
 * ```tsx
 * import { useAuth } from '@/hooks/useAuth';
 * 
 * function WelcomeScreen() {
 *   const { login, isLoading, error } = useAuth();
 * 
 *   const handleLogin = async () => {
 *     try {
 *       await login();
 *       // User redirected to home on success
 *     } catch (err) {
 *       console.error('Login failed:', err);
 *     }
 *   };
 * 
 *   return (
 *     <Button onPress={handleLogin} disabled={isLoading}>
 *       Continue with Google
 *     </Button>
 *   );
 * }
 * ```
 * 
 * @returns {Object} Authentication state and methods
 * @returns {Auth0User | null} user - Current authenticated user or null
 * @returns {boolean} isLoading - Auth0 loading state
 * @returns {Error | null} error - Auth0 error if any
 * @returns {() => Promise<void>} login - Initiates Google OAuth login flow
 * @returns {() => Promise<void>} logout - Clears session and logs out user
 * @returns {() => Promise<string>} getAccessToken - Retrieves current access token
 */

import { useAuth0 } from 'react-native-auth0';
import { Auth0User } from '../types/user';

export function useAuth() {
  const auth0 = useAuth0();

  const login = async () => {
    try {
      await auth0.authorize({
        connection: 'google-oauth2',
        scope: 'openid profile email',
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth0.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const getAccessToken = async (): Promise<string> => {
    try {
      const credentials = await auth0.getCredentials();
      if (!credentials?.accessToken) {
        throw new Error('No access token available');
      }
      return credentials.accessToken;
    } catch (error) {
      console.error('Get access token error:', error);
      throw error;
    }
  };

  return {
    user: auth0.user as Auth0User | null,
    isLoading: auth0.isLoading,
    error: auth0.error,
    login,
    logout,
    getAccessToken,
  };
}
