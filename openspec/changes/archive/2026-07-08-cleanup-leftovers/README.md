# cleanup-leftovers

End-to-end cleanup: remove dead Auth0/Clerk code paths; redact the real OPENAI_API_KEY leaked in .env.example; refresh stale README Auth0/Clerk references; restore tsc+Biome build green by fixing the pre-existing 130+ TS errors; prune the stale ClerkGoogleSignIn podspec from Pods cache (gitignored but disc-wasted).
