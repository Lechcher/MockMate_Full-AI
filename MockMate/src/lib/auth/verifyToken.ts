/**
 * Auth0 JWT verification using jose
 * 
 * Verifies JWT tokens from Auth0 using JWKS
 */

import { jwtVerify, createRemoteJWKSet } from 'jose';

const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN;

if (!domain) {
  throw new Error('EXPO_PUBLIC_AUTH0_DOMAIN is required');
}

const JWKS = createRemoteJWKSet(new URL(`https://${domain}/.well-known/jwks.json`));

interface TokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  iat: number;
  exp: number;
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://${domain}/`,
      audience: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID,
    });

    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

export async function verifyAuth0Token(request: Request): Promise<TokenPayload> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}
