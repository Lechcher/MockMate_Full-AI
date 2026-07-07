/**
 * Appwrite JWT token verification using jose.
 *
 * Verifies HMAC-signed Appwrite JWTs against the project secret.
 */

import { jwtVerify } from "jose";

const jwtSecret = process.env.APPWRITE_JWT_SECRET;
const bypass = process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS === "true";

// Pre-encode secret once at module load
const encodedSecret = jwtSecret ? new TextEncoder().encode(jwtSecret) : null;

interface TokenPayload {
	sub: string;
	email?: string;
	email_verified?: boolean;
	name?: string;
	picture?: string;
	iat: number;
	exp: number;
}

export async function verifyToken(token: string): Promise<TokenPayload> {
	if (bypass && token === "dev-bypass-access-token") {
		return {
			sub: "appwrite-dev-bypass",
			email: "dev@mockmate.local",
			email_verified: true,
			name: "Dev Bypass",
			picture: "",
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 3600,
		};
	}

	if (!encodedSecret) {
		throw new Error(
			"Appwrite JWT secret is not configured. Set APPWRITE_JWT_SECRET in env.",
		);
	}

	try {
		const { payload } = await jwtVerify(token, encodedSecret);
		return payload as TokenPayload;
	} catch (error) {
		console.error("Token verification failed:", error);
		throw new Error("Invalid or expired token");
	}
}

export async function verifyAppwriteToken(
	request: Request,
): Promise<TokenPayload> {
	const authHeader = request.headers.get("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		throw new Error("Missing or invalid Authorization header");
	}

	const token = authHeader.substring(7);
	return verifyToken(token);
}

// Legacy alias for migration compat
export {
	verifyAppwriteToken as verifyClerkToken,
	verifyAppwriteToken as verifyGoogleIdToken,
};
