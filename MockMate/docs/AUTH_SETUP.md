# Appwrite Authentication Setup

MockMate uses Appwrite for Google OAuth authentication. This guide covers
how to configure an Appwrite project for local development and production.

## 1. Create an Appwrite Project

1. Go to [Appwrite Cloud](https://cloud.appwrite.io/) and create a new project.
2. Note the **Project ID** (shown in Settings → General).

## 2. Add a Platform

1. Go to **Settings → Platforms**.
2. Add a platform:
   - **Type**: Android / iOS / Web (add all platforms you target)
   - **Package name / Bundle ID**: match your `app.json`:
     - iOS: `com.liberian.mockmate`
     - Android: `com.anonymous.MockMate`
   - **Name**: MockMate

This step is **required** for OAuth redirect back to the app.

## 3. Configure Google OAuth

1. Go to **Auth → Settings → OAuth Providers**.
2. Enable **Google**.
3. Add the **redirect URI**:
   - For Expo Go / dev: the Appwrite callback URL plus your app scheme `mockmate://`
   - In Google Cloud Console, add `[YOUR_APPWRITE_ENDPOINT]/v1/account/sessions/oauth2/callback/google/[PROJECT_ID]`
4. Copy the **App ID** and **App Secret** from Google Cloud Console into
   the Appwrite Google provider form.

## 4. Get API Credentials and JWT Secret

1. Go to **Settings → API Credentials**.
2. Copy:
   - **Endpoint** (e.g., `https://cloud.appwrite.io/v1`)
   - **Project ID**
   - **API Key** (if needed for server functions)
3. Go to **Auth → Settings**, scroll to **JWT Settings**:
   - Copy the **JWT Secret** — this is the `APPWRITE_JWT_SECRET` env var.

## 5. Create a Storage Bucket

1. Go to **Storage** and create a new bucket.
2. Note the **Bucket ID** → `EXPO_PUBLIC_APPWRITE_BUCKET_ID`.
3. Set permissions to allow authenticated users to read/write files.

## 6. Environment Variables

Copy these into your `.env` (never commit `.env`):

```bash
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=67xxxxxxxxxxxxxxx
EXPO_PUBLIC_APPWRITE_BUCKET_ID=67xxxxxxxxxxxxxxx
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
APPWRITE_JWT_SECRET=your_appwrite_jwt_secret_here
EXPO_PUBLIC_DEV_AUTH_BYPASS=false
```

## 7. Deep Link Scheme

The app scheme is `mockmate` (configured in `app.json`). Ensure:

- `app.json` has `"scheme": "mockmate"`
- Appwrite OAuth callback handles `mockmate://` deep link
- The `expo-linking` `createURL("/")` call returns `mockmate://` on native

## 8. Run

```bash
npx expo start --clear
```

Open Expo Go (iOS) or Expo Go (Android). Tap **Continue with Google**.
A browser sheet opens, you authenticate with Google, and the session is
persisted.

To bypass auth in local dev:

```bash
EXPO_PUBLIC_DEV_AUTH_BYPASS=true
```

Returns a synthetic user — no Appwrite calls.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| "Missing EXPO_PUBLIC_APPWRITE_ENDPOINT" | Confirm `.env` is loaded; restart Expo |
| OAuth browser doesn't open | Verify `expo-web-browser` is in `app.json` plugins |
| "secret / userId missing from callback" | Verify Appwrite Google provider has correct redirect URI |
| Session lost after Metro reload | Appwrite SDK persists via cookies — check platform config |
| JWT verification fails | Ensure `APPWRITE_JWT_SECRET` matches Appwrite Console JWT secret |