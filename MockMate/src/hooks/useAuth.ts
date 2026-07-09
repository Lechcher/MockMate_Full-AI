/**
 * useAuth hook — public auth bridge.
 *
 * Returns { user, isLoading, error, login, logout, getAccessToken }.
 * Backed by Appwrite in production, synthetic user in dev bypass.
 * Consumers unchanged — same shape, same semantics.
 */

import { useState } from "react";
import type { AppwriteUser } from "../core/appwrite";
import { createJWT, login, logout } from "../core/appwrite";
import { useAuthContext } from "../lib/auth/AuthProvider";
import type { Auth0User } from "../types/user";

interface UseAuthResult {
	user: Auth0User | null;
	isLoading: boolean;
	error: Error | null;
	login: () => Promise<void>;
	logout: () => Promise<void>;
	getAccessToken: () => Promise<string>;
}

function mapAppwriteUser(u: AppwriteUser): Auth0User {
	return {
		id: u.$id,
		sub: u.$id,
		email: u.email,
		email_verified: u.emailVerification,
		name: u.name,
		picture: u.avatar || "",
		updated_at: u.$updatedAt,
	};
}

function devBypassUser(): Auth0User {
	return {
		id: "appwrite-dev-bypass",
		sub: "appwrite-dev-bypass",
		email: "dev@mockmate.local",
		email_verified: true,
		name: "Dev Bypass",
		picture: "",
		updated_at: new Date().toISOString(),
	};
}

let devUserMem: Auth0User | null = null;

export function useAuth(): UseAuthResult {
	const bypass = process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS === "true";

	// Dev bypass: synthetic user, no Appwrite calls
	const [devUser, setDevUser] = useState<Auth0User | null>(() => {
		if (bypass) {
			if (!devUserMem) devUserMem = devBypassUser();
			return devUserMem;
		}
		return null;
	});
	const [actionError, setActionError] = useState<Error | null>(null);

	// Always call this hook unconditionally (React hook rules).
	// In bypass mode the returned values are ignored.
	const {
		user: appwriteUser,
		isLoading: appwriteLoading,
		refetch,
	} = useAuthContext();

	if (bypass) {
		return {
			user: devUser,
			isLoading: false,
			error: actionError,
			login: async () => {
				devUserMem = devBypassUser();
				setDevUser(devUserMem);
			},
			logout: async () => {
				devUserMem = null;
				setDevUser(null);
			},
			getAccessToken: async () => "dev-bypass-access-token",
		};
	}

	// Real mode: read from Appwrite context
	const user = appwriteUser ? mapAppwriteUser(appwriteUser) : null;

	return {
		user,
		isLoading: appwriteLoading,
		error: actionError,
		login: async () => {
			try {
				setActionError(null);
				const ok = await login();
				if (ok) {
					await refetch();
				} else {
					setActionError(new Error("Google login failed"));
				}
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : String(err);
				setActionError(new Error(message));
			}
		},
		logout: async () => {
			try {
				await logout();
				// Refetch to clear user state
				await refetch();
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : String(err);
				setActionError(new Error(message));
			}
		},
		getAccessToken: async () => {
			const jwt = await createJWT();
			if (!jwt) {
				throw new Error("Unable to create Appwrite JWT");
			}
			return jwt;
		},
	};
}
