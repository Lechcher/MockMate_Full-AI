# MockMate Authentication Flow

Detailed authentication architecture using Auth0 with Google OAuth for MockMate.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTH0 + GOOGLE OAUTH FLOW                     │
└─────────────────────────────────────────────────────────────────┘

Mobile App                Auth0 Service           Google OAuth
(React Native)            (auth0.com)             (accounts.google.com)
    │                          │                         │
    │                          │                         │
```

## System Components

### 1. Auth0 Configuration

```yaml
Auth0 Application:
  Type: Native Application
  Name: MockMate
  Domain: mockmate.us.auth0.com
  Client ID: <YOUR_CLIENT_ID>
  
Connections Enabled:
  - google-oauth2 (ONLY this connection)
  
Connections Disabled:
  - Username-Password-Authentication
  - All other social providers
  
Callback URLs:
  - mockmate://mockmate.us.auth0.com/ios/com.yourcompany.mockmate/callback
  - mockmate://mockmate.us.auth0.com/android/com.yourcompany.mockmate/callback
  
Logout URLs:
  - mockmate://mockmate.us.auth0.com/ios/com.yourcompany.mockmate/callback
  - mockmate://mockmate.us.auth0.com/android/com.yourcompany.mockmate/callback

Grant Types:
  - Authorization Code
  - Refresh Token
```

### 2. Google OAuth Configuration

```yaml
Google Cloud Console:
  Project: MockMate
  
OAuth 2.0 Client IDs:
  - iOS Application
    Bundle ID: com.yourcompany.mockmate
    
  - Android Application
    Package Name: com.yourcompany.mockmate
    SHA-1: <FROM_YOUR_KEYSTORE>
    
Authorized Redirect URIs:
  - https://mockmate.us.auth0.com/login/callback
  
Scopes Requested:
  - openid
  - profile
  - email
```

### 3. Expo App Configuration

```json
// app.json
{
  "expo": {
    "name": "MockMate",
    "slug": "mockmate",
    "ios": {
      "bundleIdentifier": "com.yourcompany.mockmate",
      "supportsTablet": true
    },
    "android": {
      "package": "com.yourcompany.mockmate",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png"
      }
    },
    "plugins": [
      [
        "react-native-auth0",
        {
          "domain": "mockmate.us.auth0.com",
          "customScheme": "mockmate"
        }
      ],
      "expo-dev-client"
    ]
  }
}
```

## Detailed Authentication Flow

### Phase 1: Initial App Launch

```
┌─────────────────────────────────────────────────────────────────┐
│                    COLD START FLOW                              │
└─────────────────────────────────────────────────────────────────┘

App Opens
    │
    └─▶ app/_layout.tsx renders
        │
        ├─▶ Auth0Provider initializes
        │   ├─ domain: "mockmate.us.auth0.com"
        │   └─ clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID
        │
        └─▶ Check for existing session
            │
            ├─ getCredentials()
            │  │
            │  ├─ HAS TOKEN? ───────────┐
            │  │                         │
            │  └─ NO TOKEN? ────────┐   │
            │                       │   │
            │                       ▼   ▼
            │              ┌─────────────────────┐
            │              │  Token Validation   │
            │              │                     │
            │              │  Check expiry time  │
            │              └─────────────────────┘
            │                       │
            │                       ├─ VALID ──▶ HOME TAB
            │                       │
            │                       ├─ EXPIRED ──▶ Silent Refresh
            │                       │              │
            │                       │              ├─ Success ──▶ HOME TAB
            │                       │              │
            │                       │              └─ Failed ──▶ WELCOME SCREEN
            │                       │
            │                       └─ NO TOKEN ──▶ WELCOME SCREEN
```

### Phase 2: Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│               GOOGLE LOGIN FLOW (Step-by-Step)                  │
└─────────────────────────────────────────────────────────────────┘

WELCOME SCREEN
    │
    │ User sees: "Continue with Google" button
    │
    └─▶ User taps button
        │
        └─▶ authorize() called
            │
            └─▶ Parameters:
                {
                  connection: 'google-oauth2',  // Force Google
                  scope: 'openid profile email',
                  audience: undefined  // Use default
                },
                {
                  customScheme: 'mockmate'
                }

            ┌─────────────────────────────────────────┐
            │         App Side (React Native)         │
            └─────────────────────────────────────────┘
                            │
                            │ 1. Build Auth URL
                            ▼
            https://mockmate.us.auth0.com/authorize?
              response_type=code
              &client_id=YOUR_CLIENT_ID
              &redirect_uri=mockmate://mockmate.us.auth0.com/ios/.../callback
              &scope=openid%20profile%20email
              &connection=google-oauth2
              &code_challenge=PKCE_CHALLENGE
              &code_challenge_method=S256
              &state=RANDOM_STATE
                            │
                            │ 2. Opens in Safari/Chrome (iOS/Android)
                            ▼
            ┌─────────────────────────────────────────┐
            │      Auth0 Universal Login Page         │
            │      (auth0.com - Hosted by Auth0)      │
            └─────────────────────────────────────────┘
                            │
                            │ 3. Detects connection=google-oauth2
                            │    Skips email/password form
                            │    Redirects immediately to Google
                            ▼
            ┌─────────────────────────────────────────┐
            │       Google Account Picker              │
            │    (accounts.google.com)                │
            │                                          │
            │  [user@gmail.com]                       │
            │  [another@gmail.com]                    │
            │  [Use another account]                  │
            └─────────────────────────────────────────┘
                            │
                            │ 4. User selects account
                            ▼
            ┌─────────────────────────────────────────┐
            │      Google Permission Consent           │
            │                                          │
            │  MockMate wants to:                     │
            │  ✓ Know who you are on Google          │
            │  ✓ See your email address               │
            │  ✓ See your basic profile info          │
            │                                          │
            │     [Cancel]        [Allow]             │
            └─────────────────────────────────────────┘
                            │
                            │ 5. User clicks "Allow"
                            ▼
            ┌─────────────────────────────────────────┐
            │         Google OAuth Callback            │
            │     (Returns to Auth0 with code)        │
            └─────────────────────────────────────────┘
                            │
                            │ 6. Auth0 exchanges Google code for tokens
                            │    Retrieves user profile from Google
                            ▼
            ┌─────────────────────────────────────────┐
            │           Auth0 Backend                  │
            │                                          │
            │  • Validates Google ID token            │
            │  • Creates/updates Auth0 user:          │
            │    - user_id: google-oauth2|123...      │
            │    - email: user@gmail.com              │
            │    - name: John Doe                     │
            │    - picture: https://lh3...            │
            │  • Issues Auth0 tokens                  │
            └─────────────────────────────────────────┘
                            │
                            │ 7. Redirect back to app
                            ▼
            mockmate://mockmate.us.auth0.com/.../callback?
              code=AUTHORIZATION_CODE
              &state=RANDOM_STATE
                            │
                            │ 8. App intercepts deep link
                            ▼
            ┌─────────────────────────────────────────┐
            │         App Side (React Native)         │
            │                                          │
            │  • Validates state parameter            │
            │  • Exchanges code for tokens (PKCE)     │
            │  • Receives:                             │
            │    - access_token (JWT)                 │
            │    - id_token (JWT with user info)      │
            │    - refresh_token                      │
            │    - expires_in (typically 86400s)      │
            └─────────────────────────────────────────┘
                            │
                            │ 9. Store tokens securely
                            │    (Expo SecureStore / Keychain)
                            │
                            │ 10. Decode ID token
                            ▼
            {
              "sub": "google-oauth2|123456789",
              "email": "user@gmail.com",
              "email_verified": true,
              "name": "John Doe",
              "picture": "https://lh3.googleusercontent.com/...",
              "updated_at": "2026-07-01T13:50:00.000Z",
              "iss": "https://mockmate.us.auth0.com/",
              "aud": "YOUR_CLIENT_ID",
              "iat": 1719844200,
              "exp": 1719930600
            }
                            │
                            │ 11. Create/Update Sanity Profile
                            ▼
            ┌─────────────────────────────────────────┐
            │          Sanity CMS Write                │
            │                                          │
            │  client.createOrReplace({                │
            │    _type: 'userProfile',                │
            │    _id: user.sub,                       │
            │    email: user.email,                   │
            │    name: user.name,                     │
            │    picture: user.picture,               │
            │    provider: 'google',                  │
            │    lastLoginAt: new Date(),             │
            │    gamificationState: {                 │
            │      streak: 0,                         │
            │      gems: 0,                           │
            │      xp: 0,                             │
            │      level: 1                           │
            │    }                                    │
            │  })                                     │
            └─────────────────────────────────────────┘
                            │
                            │ 12. Navigate to Home
                            ▼
                      HOME TAB SCREEN
```

### Phase 3: Token Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                              │
└─────────────────────────────────────────────────────────────────┘

Initial Login
    │
    ├─ Tokens Received:
    │  ├─ access_token (expires in 24h)
    │  ├─ id_token (expires in 24h)
    │  └─ refresh_token (expires in 30 days)
    │
    └─ Stored in SecureStore
       └─ Encrypted by OS (Keychain/KeyStore)


During App Session
    │
    ├─ API Request Needs Auth
    │  │
    │  └─▶ Check access_token expiry
    │      │
    │      ├─ VALID (not expired)
    │      │  └─▶ Use existing token
    │      │     └─▶ Authorization: Bearer <access_token>
    │      │
    │      └─ EXPIRED or about to expire
    │         │
    │         └─▶ Silent Refresh Flow
    │             │
    │             ├─ Call Auth0 /oauth/token
    │             │  └─ With refresh_token
    │             │
    │             ├─ Success
    │             │  ├─ Receive new tokens
    │             │  ├─ Update SecureStore
    │             │  └─ Retry API request
    │             │
    │             └─ Failed (refresh_token expired/invalid)
    │                ├─ Clear all tokens
    │                ├─ Clear app state
    │                └─ Navigate to WELCOME SCREEN
    │                   └─ Show: "Session expired, please log in"


App Backgrounded/Closed
    │
    └─ Tokens remain in SecureStore
       └─ No expiration while app closed


App Reopened
    │
    └─▶ Check stored tokens
        │
        ├─ access_token valid
        │  └─▶ Continue session (HOME TAB)
        │
        ├─ access_token expired, refresh_token valid
        │  └─▶ Silent refresh
        │     ├─ Success ──▶ HOME TAB
        │     └─ Failed ──▶ WELCOME SCREEN
        │
        └─ No tokens / refresh_token expired
           └─▶ WELCOME SCREEN
```

### Phase 4: Logout Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      LOGOUT FLOW                                │
└─────────────────────────────────────────────────────────────────┘

User Taps "Log Out" in Profile
    │
    ├─ Show Confirmation Modal
    │  "Are you sure you want to log out?"
    │  [Cancel] [Log Out]
    │
    └─▶ User confirms
        │
        └─▶ clearSession() called
            │
            ├─ Parameters: { customScheme: 'mockmate' }
            │
            ├─ 1. Opens browser to Auth0 logout URL
            │     https://mockmate.us.auth0.com/v2/logout?
            │       client_id=YOUR_CLIENT_ID
            │       &returnTo=mockmate://...
            │
            ├─ 2. Auth0 clears SSO session cookies
            │
            ├─ 3. Redirects back to app
            │
            ├─ 4. App clears local data:
            │  ├─ Delete tokens from SecureStore
            │  ├─ Clear Zustand state
            │  │  ├─ gamificationStore.reset()
            │  │  └─ authStore.reset()
            │  └─ Clear AsyncStorage (optional)
            │
            └─ 5. Navigate to WELCOME SCREEN
               └─ Fresh state, ready for new login
```

## Authentication State Management

### Auth Context Structure

```typescript
// contexts/AuthContext.tsx
interface AuthContextValue {
  // From Auth0
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  
  // From Sanity
  sanityUser: SanityUser | null;
  sanityLoading: boolean;
  
  // Actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface User {
  sub: string;              // "google-oauth2|123456789"
  email: string;            // "user@gmail.com"
  email_verified: boolean;  // true
  name: string;             // "John Doe"
  picture: string;          // Google avatar URL
  updated_at: string;       // ISO timestamp
}

interface SanityUser {
  _id: string;              // Same as user.sub
  email: string;
  name: string;
  picture: string;
  provider: 'google';
  gamificationState: {
    streak: number;
    gems: number;
    xp: number;
    streakFreezes: number;
    level: number;
  };
  lastLoginAt: string;
  createdAt: string;
}
```

### Hook Usage Pattern

```typescript
// In any component
import { useAuth0 } from 'react-native-auth0';
import { useSanityUser } from '@/hooks/useSanityUser';

function ProfileScreen() {
  // Auth0 user (from JWT)
  const { user, isLoading } = useAuth0();
  
  // Extended user data from Sanity
  const { data: sanityUser } = useSanityUser();
  
  return (
    <View>
      <Text>Email: {user.email}</Text>
      <Text>Gems: {sanityUser?.gamificationState.gems}</Text>
    </View>
  );
}
```

## Security Considerations

### 1. Token Storage

```
┌─────────────────────────────────────────────────────────────────┐
│                   SECURE TOKEN STORAGE                          │
└─────────────────────────────────────────────────────────────────┘

iOS (Keychain)
    │
    ├─ Stored with kSecAttrAccessibleAfterFirstUnlock
    ├─ Encrypted by Secure Enclave
    └─ Not accessible without device passcode

Android (EncryptedSharedPreferences)
    │
    ├─ Encrypted with Android Keystore
    ├─ Hardware-backed on supported devices
    └─ Isolated per-app sandbox

Access Pattern:
    │
    ├─ Read: SecureStore.getItemAsync('auth0-tokens')
    ├─ Write: SecureStore.setItemAsync('auth0-tokens', JSON.stringify(tokens))
    └─ Delete: SecureStore.deleteItemAsync('auth0-tokens')
```

### 2. PKCE (Proof Key for Code Exchange)

```
Login Flow Uses PKCE to Prevent Interception:

1. App generates random code_verifier
   └─ 43-128 character random string

2. App creates code_challenge
   └─ SHA256(code_verifier) → base64url encoded

3. Authorization request includes:
   └─ code_challenge + code_challenge_method=S256

4. Auth0 stores code_challenge

5. Token exchange includes:
   └─ code_verifier (plain text)

6. Auth0 validates:
   └─ SHA256(code_verifier) === stored code_challenge

Result: Even if authorization code is intercepted,
        attacker cannot exchange it without code_verifier
```

### 3. State Parameter

```
Protects Against CSRF:

1. App generates random state
   └─ Stored in memory before redirect

2. Auth0 echoes it back in callback

3. App validates:
   └─ received state === stored state

4. Mismatch = reject the response
```

### 4. Sanity Access Control

```
┌─────────────────────────────────────────────────────────────────┐
│                   SANITY DATA ISOLATION                         │
└─────────────────────────────────────────────────────────────────┘

WRONG: Direct client query (insecure)
    │
    const history = await client.fetch(
      `*[_type == "interviewHistory" && userId == "${user.sub}"]`
    );
    │
    └─ ❌ User can modify query to see other users' data


RIGHT: Query through authenticated API
    │
    const history = await fetch('/api/interviews/history', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    │
    └─ API route:
       1. Verify JWT signature (Auth0 public key)
       2. Extract user.sub from JWT payload
       3. Query Sanity with server-provided userId
       4. Return only that user's data
```

### 5. Token Validation

```typescript
// API route validates every request
import { jwtVerify } from 'jose';

async function validateToken(token: string) {
  // 1. Fetch Auth0 public keys (cached)
  const jwks = await fetchJWKS('https://mockmate.us.auth0.com/.well-known/jwks.json');
  
  // 2. Verify signature
  const { payload } = await jwtVerify(token, jwks, {
    issuer: 'https://mockmate.us.auth0.com/',
    audience: 'YOUR_CLIENT_ID'
  });
  
  // 3. Check expiration (automatic in jwtVerify)
  // 4. Extract user ID
  return payload.sub; // "google-oauth2|123456789"
}
```

## Environment Variables

```bash
# .env.example (NEVER commit real values)

# Auth0 Configuration
EXPO_PUBLIC_AUTH0_DOMAIN=mockmate.us.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=YOUR_CLIENT_ID_HERE

# Sanity Configuration
EXPO_PUBLIC_SANITY_PROJECT_ID=your_project_id
EXPO_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_write_token  # Server-side only, NOT EXPO_PUBLIC_

# RevenueCat Configuration
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key
```

## Error Handling

### Common Auth Errors

```typescript
try {
  await authorize({ connection: 'google-oauth2' });
} catch (error) {
  if (error.error === 'a0.session.user_cancelled') {
    // User closed browser before completing login
    // Show: "Login cancelled"
    
  } else if (error.error === 'login_required') {
    // Session expired, need fresh login
    // Clear tokens, show welcome screen
    
  } else if (error.error === 'consent_required') {
    // Google consent was denied
    // Show: "Google permission required to continue"
    
  } else if (error.message.includes('network')) {
    // Network error
    // Show: "Check your internet connection"
    
  } else {
    // Unknown error
    // Log to error tracking service
    // Show: "Login failed. Please try again"
  }
}
```

## Testing Authentication

### Development Mode

```typescript
// For testing without browser redirects (dev only)
const DEV_MODE = __DEV__ && process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true';

if (DEV_MODE) {
  // Mock user for development
  const mockUser = {
    sub: 'dev|123',
    email: 'dev@test.com',
    name: 'Dev User',
    picture: 'https://i.pravatar.cc/150'
  };
  
  // Skip Auth0, use mock
  setUser(mockUser);
}
```

### Test Accounts

```
Google Test Account:
  Email: mockmate.test@gmail.com
  Password: <secure-test-password>
  
Auth0 Test User:
  user_id: google-oauth2|test123
  email: mockmate.test@gmail.com
```

## Production Checklist

- [ ] Auth0 domain configured (mockmate.us.auth0.com)
- [ ] Google OAuth credentials created (iOS + Android)
- [ ] Callback URLs registered in Auth0
- [ ] Bundle IDs match across Expo/Auth0/Google
- [ ] Env vars in `.env` (never committed)
- [ ] Expo dev client installed (`expo-dev-client`)
- [ ] SecureStore tested on physical devices
- [ ] Token refresh works after 24h
- [ ] Logout clears all local data
- [ ] PKCE flow enabled in Auth0
- [ ] Sanity API secured (no direct client writes)
- [ ] Error tracking integrated (Sentry)

## Summary

MockMate's authentication is a **Google-only OAuth flow** powered by Auth0:

1. **Single button UX**: "Continue with Google"
2. **Auth0 handles security**: PKCE, token management, refresh
3. **Google provides identity**: Email, name, avatar
4. **Sanity stores everything else**: History, preferences, gamification
5. **Secure by default**: SecureStore, JWT validation, isolated queries

The flow is simple for users (one tap → Google picker → done) but robust under the hood (PKCE, refresh tokens, secure storage, validated API calls).

For app flow details, see `app-flow.md`.
