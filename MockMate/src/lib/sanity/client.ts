/**
 * Sanity client configuration
 *
 * Two clients:
 * 1. publicClient - CDN client for reading public content (interviews)
 * 2. serverClient - Server-only client with write token for user data
 */

import { createClient } from "@sanity/client";

const projectId = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.EXPO_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.EXPO_PUBLIC_SANITY_API_VERSION || "2024-01-01";

if (!projectId) {
	throw new Error("EXPO_PUBLIC_SANITY_PROJECT_ID is required");
}

/**
 * Public CDN client - safe to use in client-side code
 * Read-only access to public content (interviews)
 */
export const publicClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: true,
	perspective: "published",
});

/**
 * Server-only client - MUST ONLY be used in API routes
 * Has write access via SANITY_API_TOKEN
 *
 * ⚠️ WARNING: Never import this in client-side code
 */
export const serverClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false,
	token: process.env.SANITY_API_TOKEN,
	perspective: "published",
});

/**
 * Get server client - throws if SANITY_API_TOKEN is missing
 * Use this in API routes to ensure token is present
 */
export function getServerClient() {
	if (!process.env.SANITY_API_TOKEN) {
		throw new Error("SANITY_API_TOKEN is required for server-side operations");
	}
	return serverClient;
}
