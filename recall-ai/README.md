# Recall AI

> Never forget what matters. AI-powered memory assistant that captures commitments from email, calendar, voice, and files.

## Overview

Recall AI is an intelligent memory assistant that:

- **Captures** commitments, deadlines, and follow-ups from multiple sources (email, calendar, voice, files, quick text)
- **Extracts** structured data using Claude AI (commitments, people, dates, importance)
- **Reminds** you via email digest and push notifications
- **Answers** questions about your memories with grounded sources

### Tech Stack

**Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS  
**Backend**: Node.js, Express (worker), Next.js API routes  
**Database**: PostgreSQL 15, Supabase (auth + RLS)  
**AI**: Anthropic Claude (extraction, reasoning)  
**Voice**: Deepgram STT  
**Queue**: Graphile Worker (PostgreSQL-backed)  
**Deployment**: Docker, Kubernetes, GitHub Actions  

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase account
- Anthropic API key

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/recall-ai.git
cd recall-ai

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run dev server
pnpm dev

# Open http://localhost:3000
```

### Using Docker

```bash
# Build images
docker-compose build

# Start all services (web, worker, postgres, redis)
docker-compose up -d

# Open http://localhost:3000
```

## Project Structure

This is a **monorepo** with:
- **`apps/web`** — Next.js web application + API routes (frontend, landing page, settings)
- **`apps/worker`** — Graphile Worker for background jobs (Gmail sync, Calendar sync, notifications)
- **`packages/core`** — Memory lifecycle, state machine, dedup, validation
- **`packages/ai`** — AI Capability Service (Anthropic adapter with Haiku + Sonnet)
- **`packages/db`** — Drizzle ORM schema (PostgreSQL), migrations
- **`packages/config`** — Environment validation, shared configuration

## Key Architecture Decisions

### Universal Capture
Every input source (Gmail, Calendar, voice, files) normalizes to a common `RawCaptureEvent` shape before the Memory Engine processes it. The Memory Engine has zero source-specific logic.

### AI Capability Service
Application code requests capabilities (e.g., `extractMemory`) via an abstraction layer. Model provider, model version, and cost controls are invisible to business logic. Easy to swap providers or change models without touching the app.

### Privacy First
- Data residency: primary data stays in India (Mumbai).
- Narrow OAuth scopes: `gmail.readonly`, no write/send permissions in MVP.
- No compliance claims until actually certified.
- Every AI-created memory retains provenance (original excerpt + confidence score).

### Monorepo + Turbo
Single repository, multiple packages managed by pnpm workspaces + turbo orchestration. Faster local dev, consistent tooling, cleaner imports via path aliases.

## Development

### Common Commands

```bash
# Lint all packages
pnpm lint

# Type-check all packages
pnpm type-check

# Run tests
pnpm test

# Watch mode (for active development)
pnpm dev

# Database: generate migrations
pnpm db:generate

# Database: run migrations
pnpm db:migrate
```

### Architecture Principles

1. **Simplest working solution wins** — no premature infrastructure (Kafka, Redis, microservices).
2. **Source content is always data** — user emails/documents are never treated as instructions; AI output never directly triggers side effects.
3. **Cost is a product constraint** — AI calls are pre-filtered; cheaper models used where sufficient; aggressive caching.
4. **Security by default** — RLS at the database layer, zod validation at boundaries, OAuth token encryption.
5. **Universal Capture principle** — future integrations (Outlook, Slack, WhatsApp, etc.) must normalize through the same pipeline; no source-specific logic in core.

## Documentation

- **[Architecture Plan](docs/recall-ai-architecture-plan.md)** — Phase 0–2 design (approved, this is the spec)
- **[Monorepo Guide](docs/architecture/MONOREPO.md)** — Package structure, build pipeline, how to add packages
- **[Engineering Decisions](docs/decisions/)** — ADRs on ORM, stack, providers (reversibility, trade-offs)
- **[Security](docs/security/SECURITY.md)** — Threat model, RLS policies, secret handling
- **[Costs](docs/costs.md)** — Infrastructure cost breakdown and control levers

## Stack

| Component | Technology |
|-----------|-----------|
| Web + API | Next.js 15, React 19, TypeScript |
| UI | Tailwind CSS, shadcn/ui (Radix primitives) |
| Database | PostgreSQL (Supabase), Drizzle ORM |
| Background jobs | Node.js, graphile-worker (Postgres-native queue) |
| AI | Anthropic Claude (via capability abstraction) |
| Auth | Supabase Auth (Google OAuth + email) |
| Internationalization | next-intl (en-IN, hi-IN, ar-SA) |
| Testing | Vitest (unit), Playwright (E2E) |
| Build | pnpm, Turbo, Next.js |
| CI/CD | GitHub Actions |
| Monitoring | Sentry (errors), PostHog (analytics) |

## Deployment

- **Web:** Vercel (Mumbai region)
- **Worker:** Render or Railway
- **Database/Auth/Storage:** Supabase (Mumbai)

See [architecture plan section 21](docs/recall-ai-architecture-plan.md#21-deployment-recommendation) for details.

## Security & Privacy

- **RLS:** Every user-scoped table enforces row-level security; no cross-user data leakage even if app layer is bypassed.
- **OAuth:** Narrow scopes, encrypted token storage, revocation support.
- **Encryption:** User secrets encrypted at rest (pgcrypto).
- **Compliance:** No claims until certified. Privacy policy disclosed to users.

See [Security Documentation](docs/security/SECURITY.md) for the full threat model and mitigations.

## Cost Control

Development phase: ~$7–30/mo (mostly worker host).
Production phase: ~$50–80/mo at small scale, scales as $0.8/user/month for AI usage at volume.

Cost levers:
- Deterministic pre-filtering (most emails don't reach the model)
- Content-hash caching (unchanged content not re-processed)
- Model tier selection (Haiku for extraction, Sonnet for reasoning)
- Aggressive deduplication

See [costs.md](docs/costs.md) for breakdown and monitoring strategies.

## Testing

- **Unit tests:** Memory logic, dedup, date extraction (Vitest)
- **Integration tests:** Database, OAuth, ingestion adapters (Vitest)
- **E2E tests:** Sign-up, capture, view, edit (Playwright)
- **Security tests:** User A cannot read User B's data (explicit test)
- **AI evaluation:** Multilingual extraction accuracy (golden dataset)

Run tests with `pnpm test`.

## Phase Roadmap

Currently in **Phase 3 (Foundation)**:
- ✅ Repository scaffold, monorepo structure
- ✅ Shared types, core domain logic
- ✅ Database schema (Drizzle + Supabase)
- ✅ AI Capability Service abstraction
- ✅ Design system foundation
- ✅ i18n scaffolding
- ✅ CI/CD setup
- Next: **Phase 4 (Manual Recall)** — Quick Capture → AI extraction → Today → Complete/Snooze/Edit

Full roadmap in [architecture plan section 31](docs/recall-ai-architecture-plan.md#32-phased-implementation).

## Contributing

Per the architecture spec:
- **Before implementing deferred features**, check section 33 (do not build these in MVP)
- **Before new infrastructure decisions**, document an ADR in `docs/decisions/`
- **Before new vendors**, update `docs/costs.md` with WHY / Can We Avoid / Cheaper / Outgrow Trigger
- **Before committing**, run `pnpm lint`, `pnpm type-check`, `pnpm test`

## Support & Issues

For questions about the codebase, architecture, or decisions, see the relevant ADR or architecture doc.

For bugs or feature requests, open a GitHub issue (when repo is public/shared).

---

**Built by humans. Remembered by AI.**
