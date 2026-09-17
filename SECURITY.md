# Security & Hardening

This document outlines the security measures implemented in Recall AI.

## Authentication & Authorization

- **Supabase Auth**: Built-in email/password and OAuth2 (Google)
- **Row-Level Security (RLS)**: Database enforces user isolation via `user_id` on all tables
- **OAuth Token Encryption**: Sensitive tokens stored encrypted in `oauthConnections` table
- **Session Management**: HTTP-only cookies via Supabase client
- **Resource Ownership Verification**: All API endpoints verify user ownership before returning/modifying data

## Input Validation

- **Zod Schemas**: All request bodies validated against strict schemas
  - Text input: max 10,000 characters
  - Queries: max 500 characters
  - File size: max 10MB
  - Time formats: HH:mm validation
  - Email addresses: RFC 5322 validation
- **Type Coercion Prevention**: Explicit type checking, no implicit conversions
- **Sanitization**: User input sanitized before any database operations

## Rate Limiting

- **Upstash Redis**: Sliding window rate limiting
- **Endpoints Protected**:
  - General API: 1,000 requests/hour per user
  - Auth: 5 attempts/15 minutes per email
  - Fallback: Allowed if Redis unavailable (fail open)

## HTTP Security Headers

- **Content-Security-Policy**: Restricts script sources, prevents XSS
- **Strict-Transport-Security (HSTS)**: Enforces HTTPS, 1-year max age
- **X-Content-Type-Options**: `nosniff` prevents MIME sniffing
- **X-Frame-Options**: `SAMEORIGIN` prevents clickjacking
- **X-XSS-Protection**: Legacy XSS filter enabled
- **Referrer-Policy**: `strict-origin-when-cross-origin` limits referrer leakage
- **Permissions-Policy**: Restricts microphone/camera/payment access

## Data Protection

- **At Rest**: Supabase provides encryption at rest (AES-256)
- **In Transit**: TLS 1.3 enforced via HSTS + middleware
- **OAuth Tokens**: Encrypted using Supabase or environment key
- **Sensitive Data**: No PII in logs, no passwords in database, no API keys in code

## OAuth Security

- **Narrow Scopes**: Only `gmail.readonly` and `calendar.readonly` requested
- **Token Refresh**: Refresh tokens rotated on each use
- **Expiration Handling**: Tokens marked as expired and rejected
- **Connection Status**: Tracks `active`, `revoked`, `expired` states

## SQL Injection Prevention

- **Drizzle ORM**: Parameterized queries, type-safe database access
- **Prepared Statements**: All dynamic queries use parameter binding
- **Query Builders**: No string concatenation for SQL

## XSS Prevention

- **React Escaping**: React automatically escapes template content
- **Content-Security-Policy**: Blocks inline scripts and suspicious sources
- **No `dangerouslySetInnerHTML`**: Except for structured data (JSON-LD)

## CSRF Protection

- **Same-Site Cookies**: Supabase enforces SameSite=Strict for auth cookies
- **State Tokens**: OAuth flows use state parameter validation
- **POST-Only**: State-changing operations require POST/PATCH/DELETE (not GET)

## API Security

- **Authentication Required**: All protected routes verify user session
- **User ID Validation**: Endpoints verify user_id in request matches session
- **No Excessive Data**: Responses include only necessary fields
- **Error Messages**: Generic error messages prevent information leakage

## Dependency Security

- **Dependency Scanning**: Use `npm audit` and `pnpm audit` regularly
- **Minimal Dependencies**: Prefer built-in Node APIs when possible
- **Pinned Versions**: All dependencies pinned to patch versions in package-lock

## Monitoring & Logging

- **Error Logging**: Console errors logged server-side (not user-facing)
- **Audit Logging**: AI usage tracked for cost/abuse monitoring
- **Rate Limit Tracking**: Failed rate limits logged for anomaly detection
- **No Sensitive Data in Logs**: Passwords, tokens, PII never logged

## Environment Security

- **Secrets Management**: All sensitive values in .env (never in code)
- **Environment Separation**: Different credentials for dev/staging/production
- **Service Accounts**: Worker processes use service role with limited scopes

## Deployment Security

- **HTTPS Only**: Production enforces TLS
- **Security Headers**: Applied via Next.js middleware
- **SRI (Subresource Integrity)**: External scripts verified (CDN hosted)
- **Dependency Updates**: Regular updates for critical vulnerabilities

## Incident Response

- **Rate Limit Monitoring**: Auto-blocks brute force attempts
- **OAuth Revocation**: Users can disconnect integrations instantly
- **Account Recovery**: Email-based password reset via Supabase
- **Data Deletion**: Users can request full account deletion (GDPR compliance)

## Third-Party Security

- **Supabase**: Enterprise-grade Postgres + auth infrastructure
- **Anthropic API**: TLS encryption for all AI requests, no data retention
- **Deepgram**: Secure audio transcription, no storage
- **Upstash**: Managed Redis with encryption, DDoS protection
- **PostHog**: GDPR-compliant analytics (can opt-out)

## Future Hardening

- [ ] 2FA/MFA for user accounts
- [ ] API key management for programmatic access
- [ ] IP whitelisting for integrations
- [ ] Encrypted file storage in Supabase Storage
- [ ] Webhook signature verification
- [ ] Rate limiting by IP for public endpoints
- [ ] Request signing for worker-to-API communication

## Reporting Security Issues

Please email security@recall.ai with details of any vulnerabilities found. Do not file public issues for security problems.
