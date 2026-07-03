/**
 * Auth0Provider wrapper
 * 
 * Wraps the app with Auth0 authentication using react-native-auth0
 * Configured for Google OAuth only
 */

import React, { ReactNode } from 'react';
import { Auth0Provider as RNAuth0Provider } from 'react-native-auth0';

const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN;
const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;

if (!domain || !clientId) {
  throw new Error('EXPO_PUBLIC_AUTH0_DOMAIN and EXPO_PUBLIC_AUTH0_CLIENT_ID are required');
}

interface Auth0ProviderProps {
  children: ReactNode;
}

export function Auth0Provider({ children }: Auth0ProviderProps) {
  return (
    <RNAuth0Provider domain={domain} clientId={clientId}>
      {children}
    </RNAuth0Provider>
  );
}
