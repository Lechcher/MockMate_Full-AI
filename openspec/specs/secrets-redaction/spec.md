# secrets-redaction Specification

## Purpose
TBD - created by archiving change cleanup-leftovers. Update Purpose after archive.
## Requirements
### Requirement: Placeholder Values Only
`MockMate/.env.example` MUST contain only placeholder credentials. No real API key, app id, project id, or endpoint SHALL appear in this file at any commit. Placeholders MUST be visibly fake.

#### Scenario: No real keys in committed env.example
- **WHEN** `MockMate/.env.example` is audited
- **THEN** no `sk-...` token of length 20 alphanumeric characters or more appears
- **AND** no Appwrite project id matching `^[0-9a-f]{20,}$` appears
- **AND** no hostnames tracing back to private infrastructure (proxies, tunnels) appear

#### Scenario: Fork-friendly placeholders
- **WHEN** a contributor copies `.env.example` to `.env` and runs the app
- **THEN** the app fails closed with a clear "missing real value" notice rather than silently using a stale real value

### Requirement: Inline Annotation of Example Values
`MockMate/.env.example` MUST include a short comment above each env-var block declaring the placeholder intent, so contributors do not paste real secrets into the file by mistake.

#### Scenario: Reviewer audits env.example
- **WHEN** a security review scans `MockMate/.env.example`
- **THEN** placeholder intent is obvious within 2 lines per variable group

### Requirement: CI Secret-Scanner Compatibility
`MockMate/.env.example` MUST produce zero high-severity findings from a standard secret scanner (gitleaks, trufflehog, or git-secrets) when run against the repo.

#### Scenario: CI scans for leaked credentials
- **WHEN** a secret scanner runs against the repo
- **THEN** `MockMate/.env.example` produces zero high-severity findings

### Requirement: Fail Closed on Missing Real Env Vars in API Routes
Server-side API routes that depend on `OPENAI_*` environment variables MUST throw a descriptive error on import-time if those variables are missing. Routes MUST NOT embed private-proxy URLs as fallback values.

#### Scenario: STT/TTS routes cannot fall back to private proxy
- **WHEN** `MockMate/src/app/api/stt+api.ts` and `tts+api.ts` are read
- **THEN** no literal hostname other than an env-derived value appears in their `baseURL` argument
- **AND** the route throws when `OPENAI_BASE_URL` is unset rather than silently using a hidden default

