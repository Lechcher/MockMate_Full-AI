/**
 * @file Appwrite configuration, auth service, and session helpers.
 * Use `import { login, logout, getCurrentUser } from "~/core/appwrite"`.
 */

import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import {
	Account,
	Avatars,
	Client,
	ID,
	OAuthProvider,
	Storage,
} from "react-native-appwrite";

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const bucketId = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID;

const CURRENT_SESSION_ID = "current";
const isDevelopment = __DEV__;

export interface AppwriteUser {
	$id: string;
	$createdAt: string;
	$updatedAt: string;
	name: string;
	email: string;
	emailVerification: boolean;
	prefs: Record<string, unknown>;
	avatar: string;
}

export const config = {
	endpoint: endpoint || "",
	projectId: projectId || "",
	bucketId: bucketId || "",
};

export const client = new Client()
	.setEndpoint(config.endpoint)
	.setProject(config.projectId);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const storage = new Storage(client);

if (!endpoint && process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS !== "true") {
	console.error("Missing EXPO_PUBLIC_APPWRITE_ENDPOINT. Auth will fail.");
}

/**
 * Google OAuth login via Appwrite.
 * Creates OAuth2 token → opens browser sheet → creates session.
 */
export const login = async (): Promise<boolean> => {
	try {
		const redirectUrl = Linking.createURL("/");

		const response = await account.createOAuth2Token({
			provider: OAuthProvider.Google,
			success: redirectUrl,
		});

		if (!response) throw new Error("Failed to create OAuth2 token");

		const browserResult = await openAuthSessionAsync(
			response.toString(),
			redirectUrl,
		);

		if (isDevelopment) {
			console.log("OAuth2 token created successfully");
		}

		if (browserResult.type !== "success") {
			throw new Error("Browser authentication was cancelled or failed");
		}

		const url = new URL(browserResult.url);

		const secret = url.searchParams.get("secret")?.toString();
		const userId = url.searchParams.get("userId")?.toString();

		if (!secret || !userId) {
			throw new Error("Missing authentication credentials from OAuth callback");
		}

		await account.createSession({ userId, secret });

		if (isDevelopment) {
			console.log("Session created successfully");
		}

		return true;
	} catch (error) {
		console.error("Login error:", error);
		return false;
	}
};

/**
 * Logs out the current user by deleting the current session.
 */
export const logout = async (): Promise<boolean> => {
	try {
		await account.deleteSession({ sessionId: CURRENT_SESSION_ID });
		return true;
	} catch (error) {
		console.error("Logout error:", error);
		return false;
	}
};

/**
 * Retrieves the current authenticated user with avatar URL.
 */
export const getCurrentUser = async (): Promise<AppwriteUser | null> => {
	try {
		const result = await account.get();

		if (result.$id) {
			const fallbackAvatarUrl = avatar.getInitialsURL(result.name);

			return {
				...result,
				avatar: fallbackAvatarUrl.toString(),
			} as AppwriteUser;
		}

		return null;
	} catch (error) {
		console.error("Get current user error:", error);
		return null;
	}
};

/**
 * Creates a JWT for backend bearer-token calls.
 */
export const createJWT = async (): Promise<string | null> => {
	try {
		const jwtResponse = await account.createJWT();
		return jwtResponse.jwt;
	} catch (error) {
		console.error("JWT creation error:", error);
		return null;
	}
};

/**
 * Avatar file upload to Appwrite storage bucket.
 * Returns public file URL or null on failure.
 */
export const uploadAvatarToAppwrite = async (
	fileUri: string,
): Promise<string | null> => {
	try {
		if (!bucketId) throw new Error("EXPO_PUBLIC_APPWRITE_BUCKET_ID is not set");

		const fileName = `avatar_${Date.now()}.jpg`;
		const uploadedFile = await storage.createFile({
			bucketId,
			fileId: ID.unique(),
			file: {
				uri: fileUri,
				name: fileName,
				type: "image/jpeg",
				size: 0,
			},
		});

		const fileUrl = storage.getFileView({
			bucketId,
			fileId: uploadedFile.$id,
		});

		if (isDevelopment) {
			console.log("Avatar uploaded successfully:", fileUrl.toString());
		}

		return fileUrl.toString();
	} catch (error) {
		console.error("Avatar upload error:", error);
		return null;
	}
};
