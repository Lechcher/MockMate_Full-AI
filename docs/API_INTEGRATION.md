# API Integration Guide

**Date:** July 3, 2026  
**MockMate Version:** 0.8.5  
**Status:** Complete Reference

---

## Overview

This guide covers integrating all external services used in MockMate:
- **Auth0** - Authentication (Google OAuth)
- **Sanity** - CMS and database
- **RevenueCat** - Subscription management
- **AI SDK** - OpenAI-compatible AI features (Chat, TTS, STT)

---

## Table of Contents

1. [Auth0 Setup](#auth0-setup)
2. [Sanity Setup](#sanity-setup)
3. [RevenueCat Setup](#revenuecat-setup)
4. [AI SDK Setup](#ai-sdk-setup)
5. [Environment Variables](#environment-variables)
6. [Testing Integrations](#testing-integrations)

---

## Auth0 Setup

### 1. Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create new application → **Native**
3. Note your **Domain** and **Client ID**

### 2. Configure OAuth

**Allowed Callback URLs:**
```
exp://localhost:8081,
mockmate://auth,
com.yourdomain.mockmate://auth
```

**Allowed Logout URLs:**
```
exp://localhost:8081,
mockmate://,
com.yourdomain.mockmate://
```

**Allowed Web Origins:**
```
exp://localhost:8081
```

### 3. Enable Google OAuth

1. Go to **Authentication** → **Social**
2. Enable **Google**
3. Configure Google OAuth credentials from Google Cloud Console

### 4. Configure in Expo

**app.json:**
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-auth0",
        {
          "domain": "your-tenant.auth0.com"
        }
      ]
    ],
    "scheme": "mockmate",
    "ios": {
      "bundleIdentifier": "com.yourdomain.mockmate"
    },
    "android": {
      "package": "com.yourdomain.mockmate"
    }
  }
}
```

**Environment variables:**
```bash
EXPO_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=your_client_id_here
```

### 5. Usage in App

**Login:**
```typescript
import { useAuth } from '@/hooks/useAuth';

function WelcomeScreen() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
      // User is redirected to home on success
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <Button onPress={handleLogin} disabled={isLoading}>
      Continue with Google
    </Button>
  );
}
```

**Logout:**
```typescript
const { logout } = useAuth();

await logout();
// Clears session and returns to welcome screen
```

**Get User Info:**
```typescript
const { user, isAuthenticated } = useAuth();

if (isAuthenticated) {
  console.log(user.email, user.name, user.picture);
}
```

---

## Sanity Setup

### 1. Create Sanity Project

```bash
npm create sanity@latest
# Follow prompts to create project
```

### 2. Get Credentials

1. Go to [Sanity Dashboard](https://www.sanity.io/manage)
2. Note your **Project ID**
3. Create API token with **Editor** role

### 3. Configure Schemas

**Required document types:**

```javascript
// schemas/user.js
export default {
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    { name: 'auth0Id', type: 'string', validation: Rule => Rule.required() },
    { name: 'email', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'picture', type: 'string' },
    { name: 'xp', type: 'number', initialValue: 0 },
    { name: 'level', type: 'number', initialValue: 1 },
    { name: 'gems', type: 'number', initialValue: 0 },
    { name: 'streak', type: 'number', initialValue: 0 },
    { name: 'lastLoginDate', type: 'date' },
    { name: 'isVIP', type: 'boolean', initialValue: false },
    { name: 'vipUpdatedAt', type: 'datetime' },
  ],
};
```

```javascript
// schemas/interview.js
export default {
  name: 'interview',
  title: 'Interview',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'industry', type: 'string', validation: Rule => Rule.required() },
    { name: 'difficulty', type: 'string', validation: Rule => Rule.required() },
    { name: 'description', type: 'text' },
    { name: 'focusArea', type: 'string' },
    { name: 'estimatedDuration', type: 'number' },
    { name: 'isPremium', type: 'boolean', initialValue: false },
    { name: 'rating', type: 'number', initialValue: 0 },
    {
      name: 'questions',
      type: 'array',
      of: [{ type: 'string' }],
      validation: Rule => Rule.min(3).max(10),
    },
  ],
};
```

```javascript
// schemas/interviewCompletion.js
export default {
  name: 'interviewCompletion',
  title: 'Interview Completion',
  type: 'document',
  fields: [
    {
      name: 'user',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: Rule => Rule.required(),
    },
    {
      name: 'interview',
      type: 'reference',
      to: [{ type: 'interview' }],
      validation: Rule => Rule.required(),
    },
    { name: 'score', type: 'number', validation: Rule => Rule.min(0).max(100) },
    { name: 'rating', type: 'string' },
    {
      name: 'answers',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'question', type: 'string' },
          { name: 'answer', type: 'text' },
        ],
      }],
    },
    { name: 'feedback', type: 'object' },
    { name: 'xpEarned', type: 'number' },
    { name: 'gemsEarned', type: 'number' },
    { name: 'completedAt', type: 'datetime', validation: Rule => Rule.required() },
  ],
};
```

### 4. Deploy Schemas

```bash
cd your-sanity-studio
sanity deploy
```

### 5. Environment Variables

```bash
# Public (read-only CDN)
EXPO_PUBLIC_SANITY_PROJECT_ID=your_project_id
EXPO_PUBLIC_SANITY_DATASET=production

# Server-only (write token)
SANITY_API_TOKEN=sk_your_write_token_here
```

### 6. Usage in App

**Query data (client-side):**
```typescript
import { sanityClient } from '@/lib/sanity/client';

// Fetch all interviews
const interviews = await sanityClient.fetch(`
  *[_type == "interview"] {
    _id,
    title,
    industry,
    difficulty,
    isPremium,
    rating
  }
`);
```

**Mutate data (API routes only):**
```typescript
import { sanityWriteClient } from '@/lib/sanity/client';

// Create user profile (in API route)
const user = await sanityWriteClient.create({
  _type: 'user',
  auth0Id: userId,
  email: 'user@example.com',
  name: 'John Doe',
});
```

**React Query hook:**
```typescript
import { useInterviews } from '@/hooks/useInterviews';

function ExploreScreen() {
  const { data: interviews, isLoading } = useInterviews();

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <FlatList
      data={interviews}
      renderItem={({ item }) => <InterviewCard interview={item} />}
    />
  );
}
```

---

## RevenueCat Setup

### 1. Create RevenueCat Account

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Create new project
3. Add iOS and Android apps

### 2. Configure App Store Connect (iOS)

1. Create subscription in App Store Connect
2. Add in-app purchase ID (e.g., `mockmate_vip_monthly`)
3. Copy **Shared Secret** to RevenueCat

### 3. Configure Google Play Console (Android)

1. Create subscription in Google Play Console
2. Add product ID (e.g., `mockmate_vip_monthly`)
3. Link to RevenueCat

### 4. Create Entitlements

1. In RevenueCat: **Entitlements** → **New Entitlement**
2. ID: `vip`
3. Attach products: `mockmate_vip_monthly`, `mockmate_vip_yearly`

### 5. Environment Variables

```bash
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=your_ios_key
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=your_android_key
```

### 6. Initialize in App

**Root layout:**
```typescript
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

useEffect(() => {
  const apiKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!,
  });

  Purchases.configure({ apiKey });
}, []);
```

### 7. Usage in App

**Check VIP status:**
```typescript
import { useVIPStatus } from '@/hooks/useVIPStatus';

function ProfileScreen() {
  const { isVIP, isLoading } = useVIPStatus();

  return (
    <View>
      {isVIP ? (
        <Badge>VIP Member</Badge>
      ) : (
        <Button onPress={navigateToVIP}>Upgrade to VIP</Button>
      )}
    </View>
  );
}
```

**Purchase subscription:**
```typescript
import Purchases from 'react-native-purchases';

async function handlePurchase(packageToPurchase: Package) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    if (customerInfo.entitlements.active.vip) {
      // User is now VIP
      // Sync to Sanity
      await fetch('/api/user/vip', {
        method: 'PATCH',
        body: JSON.stringify({ isVIP: true }),
      });
    }
  } catch (error) {
    if (error.userCancelled) {
      // User cancelled - no action needed
    } else {
      // Handle other errors
    }
  }
}
```

**Restore purchases:**
```typescript
const handleRestore = async () => {
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    
    if (customerInfo.entitlements.active.vip) {
      Alert.alert('Success', 'VIP membership restored!');
    } else {
      Alert.alert('No purchases found');
    }
  } catch (error) {
    console.error('Restore failed:', error);
  }
};
```

---

## AI SDK Setup

### 1. Choose Provider

MockMate uses OpenAI-compatible endpoints:
- OpenAI
- OpenRouter
- Local models (LM Studio, Ollama)
- Any OpenAI-compatible API

### 2. Environment Variables

```bash
# API Configuration
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4

# TTS Configuration
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=alloy

# STT Configuration
OPENAI_STT_MODEL=whisper-1
```

### 3. API Routes

**Chat endpoint:**
```typescript
// MockMate/src/app/api/chat+api.ts
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: process.env.OPENAI_BASE_URL!,
  });

  const result = await streamText({
    model: openai(process.env.OPENAI_MODEL!),
    messages,
  });

  return result.toDataStreamResponse();
}
```

**TTS endpoint:**
```typescript
// MockMate/src/app/api/tts+api.ts
export async function POST(request: Request) {
  const { text } = await request.json();

  const response = await fetch(`${process.env.OPENAI_BASE_URL}/audio/speech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL,
      voice: process.env.OPENAI_TTS_VOICE || 'alloy',
      input: text,
    }),
  });

  const audioBuffer = await response.arrayBuffer();
  const base64Audio = Buffer.from(audioBuffer).toString('base64');

  return Response.json({ audio: base64Audio });
}
```

**STT endpoint:**
```typescript
// MockMate/src/app/api/stt+api.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get('file');

  const response = await fetch(`${process.env.OPENAI_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  const { text } = await response.json();

  return Response.json({ text });
}
```

### 4. Usage in App

**Text-to-Speech:**
```typescript
import { useTTS } from '@/hooks/useTTS';

function VoiceInterviewScreen() {
  const { generateAndPlay, stop, isGenerating } = useTTS();

  const handleReadQuestion = async () => {
    await generateAndPlay(currentQuestion);
  };

  return (
    <View>
      <Text>{currentQuestion}</Text>
      <Button onPress={handleReadQuestion} disabled={isGenerating}>
        Listen Again
      </Button>
    </View>
  );
}
```

**Speech-to-Text:**
```typescript
import { useSTT } from '@/hooks/useSTT';

function VoiceInterviewScreen() {
  const { startRecording, stopRecording, transcribeAudio, isRecording } = useSTT();

  const handleRecord = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri) {
        const text = await transcribeAudio(uri);
        setUserAnswer(text);
      }
    } else {
      await startRecording();
    }
  };

  return (
    <Button onPress={handleRecord}>
      {isRecording ? 'Stop Recording' : 'Start Recording'}
    </Button>
  );
}
```

---

## Environment Variables

### Complete .env Example

```bash
# Auth0
EXPO_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=abc123def456

# Sanity
EXPO_PUBLIC_SANITY_PROJECT_ID=abc123def
EXPO_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk_abc123def456...

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_abc123
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_abc123

# OpenAI
OPENAI_API_KEY=sk-abc123def456...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=alloy
OPENAI_STT_MODEL=whisper-1
```

### Variable Naming Rules

- **EXPO_PUBLIC_*** - Embedded in client bundle (public)
- **No prefix** - Server-only, never exposed to client

---

## Testing Integrations

### Auth0
```bash
# 1. Build dev client
npx expo run:ios

# 2. Launch app
# 3. Tap "Continue with Google"
# 4. Complete OAuth flow
# 5. Should redirect to home tab
```

### Sanity
```bash
# 1. Check connection
curl https://${PROJECT_ID}.api.sanity.io/v1/data/query/${DATASET}?query=*[_type=="interview"]

# 2. Test write token
curl -X POST https://${PROJECT_ID}.api.sanity.io/v1/data/mutate/${DATASET} \
  -H "Authorization: Bearer ${SANITY_API_TOKEN}" \
  -d '{"mutations":[{"create":{"_type":"user","email":"test@example.com"}}]}'
```

### RevenueCat
```bash
# 1. Build dev client with RevenueCat
# 2. Navigate to VIP screen
# 3. Should see offerings loaded
# 4. Test purchase (use sandbox account)
# 5. Verify entitlement activated
```

### AI SDK
```bash
# 1. Test TTS
curl -X POST http://localhost:8081/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}'

# 2. Test STT
curl -X POST http://localhost:8081/api/stt \
  -F "file=@audio.m4a"

# 3. Test Chat
curl -X POST http://localhost:8081/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

---

## Troubleshooting

### Auth0 "Invalid callback"
- Verify callback URL matches Auth0 dashboard
- Check `scheme` in app.json matches bundle ID
- Rebuild dev client after changing app.json

### Sanity "Permission denied"
- Ensure token has Editor role
- Check token is server-only (no EXPO_PUBLIC_ prefix)
- Verify dataset name matches

### RevenueCat "Product not found"
- Ensure product IDs match App Store/Play Console
- Check entitlement ID is exactly "vip"
- Test on real device (not simulator)

### AI SDK "Invalid API key"
- Verify OPENAI_API_KEY is set
- Check OPENAI_BASE_URL includes /v1
- Test endpoint with curl first

---

**Last Updated:** July 3, 2026  
**Status:** Complete Reference Guide
