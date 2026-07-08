# Clerk Authentication Setup

MockMate uses Clerk for user authentication and session lifecycle management. It uses browser-based OAuth (`useSSO` + `expo-web-browser`) to integrate Google login without requiring native development builds, making it fully compatible with Expo Go.

## Clerk Dashboard Configuration

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/) and create a project (e.g., "MockMate").
2. Open **User Authentication → Social Connections**.
   - Enable **Google**.
   - (Optional but recommended for production) Toggle **Use custom credentials** and supply your own Google OAuth client IDs.
3. Open **Paths & Redirects**.
   - Configure your development instance callback and redirect schemes to allow deep-linking back to your app.
   - For MockMate, the app uses `scheme: "mockmate"` in `app.json`. The deep-link scheme callback url will be `mockmate://sso-callback`.
4. Open **API Keys**.
   - Copy the **Publishable Key** (`pk_test_...`).

## Environment Variables

Copy your key into `MockMate/.env`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## How It Works

1. `useAuth().login()` triggers Clerk's `useSSO().startSSOFlow({ strategy: 'oauth_google' })`.
2. The browser helper (`expo-web-browser`) opens a Safari or Chrome Custom Tab to your Clerk login subdomain.
3. The user picks their Google Account, Clerk logs them in, and redirects the session credentials to the deep link: `mockmate://sso-callback`.
4. Clerk's custom `<ClerkProvider>` catches the callback and sets the active session.
5. Tokens are cached in `expo-secure-store` via Clerk's bundled token cache.

## Troubleshooting

- **Session not persisting across app restarts**
  - Verify that `<ClerkProvider>` has the `tokenCache` prop passed in `src/app/_layout.tsx`.
- **Redirect does not return to app**
  - Make sure `app.json` has `"scheme": "mockmate"` configured.
  - Verify the redirect url passed to `startSSOFlow` resolves to `Linking.createURL('/sso-callback', { scheme: 'mockmate' })`.
- **Dev Bypass Mode**
  - To skip authentication entirely in local development, set `EXPO_PUBLIC_DEV_AUTH_BYPASS=true` in your `.env`.
