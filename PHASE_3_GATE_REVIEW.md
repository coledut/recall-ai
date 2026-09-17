# Phase 3 Gate Review: Foundation

**Status:** ✅ COMPLETE — Ready for Phase 4  
**Date:** 2026-09-16  
**Commit:** `23d4e38`

---

## What Was Built

### Repository & Monorepo Structure
- ✅ GitHub-ready repository structure (`recall-ai`)
- ✅ pnpm workspaces + Turbo orchestration
- ✅ 7 internal packages properly scoped and separated:
  - `@recall/config` — Environment validation (Zod)
  - `@recall/core` — Domain logic (memory, types, dedup, capture scoring)
  - `@recall/ai` — AI Capability Service abstraction + Anthropic provider
  - `@recall/db` — Drizzle ORM schema + migrations
  - `@recall/ui` — Design system foundation (placeholder for shadcn/ui)
  - `@recall/i18n` — Internationalization structure (en-IN, hi-IN, ar-SA)
  - `@recall/capture` — Structure for source adapters (not implemented)
- ✅ 2 application layers:
  - `apps/web` — Next.js structure (stub)
  - `apps/worker` — Node.js background job structure (stub)

### Core Domain & Types
- ✅ **Universal Capture contract:** `RawCaptureEvent` — every source normalizes to this shape
- ✅ **Memory types & lifecycle:** COMMITMENT, FOLLOW_UP, DEADLINE, WAITING_FOR, DECISION, TASK, IMPORTANT_FACT
- ✅ **Memory status machine:** DETECTED → OPEN → DUE_SOON → DUE → OVERDUE → COMPLETED/DISMISSED/ARCHIVED/CANCELLED
- ✅ **AI Capability Service interface:** Language-agnostic service definition with capabilities:
  - `extractMemory` — structure extraction from captures
  - `classifyMemory` — type classification
  - `summarizeContext` — text summarization
  - `answerMemoryQuery` — retrieval augmented generation
  - `prioritizeMemories` — ranking/sorting
  - `draftFollowup` — AI-assisted drafting (human review required)
  - `transcribeVoice` — voice-to-text delegation
- ✅ **Memory logic (core/src/memory.ts):**
  - State transition machine with validation
  - Deduplication scoring algorithm (conservative merge policy)
  - Memory validation rules (type-specific constraints)
  - Low-confidence memory flagging
- ✅ **Capture pre-filtering (core/src/capture.ts):**
  - Cost-control scoring (cheap heuristics before AI invocation)
  - Content hashing for dedup/caching
  - Recent capture detection (don't reprocess old messages)
- ✅ **Zod schemas:** Every contract (capture, extraction, query) has typed validation

### Database Foundation
- ✅ **Drizzle ORM schema** with:
  - `users` — authentication + locale + timezone
  - `workspaces` — future team support (nullable workspace_id on all user-scoped tables)
  - `memories` — core memory table with RLS-ready `user_id` column
  - `people` — lightweight people records (not a CRM)
  - `oauth_connections` — encrypted token storage
  - `ai_usage` — cost tracking table
  - `capture_sources` — raw evidence/provenance
  - `notification_preferences` — notification settings
- ✅ **Indexes:** User, status, due date, person, full-text search prep
- ✅ **RLS-ready:** Every table has `user_id` for database-level row security
- ✅ **pgvector & tsvector support** — schema ready for semantic + full-text search

### AI Architecture
- ✅ **Anthropic provider (default):**
  - `extractMemory` → Claude Haiku for cost control
  - `answerMemoryQuery` → Claude Sonnet for reasoning
  - All responses validated against Zod schemas
  - Usage tracking (tokens, cost estimate, latency)
  - No source content treated as instructions
  - AI output never directly executes side effects
- ✅ **Capability abstraction:** Business logic never knows about model IDs or API details
- ✅ **Cost control built-in:**
  - Pre-filtering before AI calls
  - Usage tracking per capability
  - Token budget infrastructure
  - Caching callback support

### Security & Privacy
- ✅ **Security architecture documented** (docs/security/SECURITY.md):
  - Threat model covering: cross-user leakage, broken auth, prompt injection, token theft, CSRF, file upload, SQL injection, XSS, rate limiting
  - Defense-in-depth: app layer + database RLS + validation
  - Source content is always data (never instructions)
  - AI output never directly triggers side effects
  - Encrypted token storage, narrow OAuth scopes
- ✅ **Testing strategy:** Explicit security tests for User A ↔ User B isolation (section 68)
- ✅ **No compliance claims:** Reserved until actually certified (section 29)

### Cost & Infrastructure
- ✅ **Cost tracking doc** (docs/costs.md):
  - Service-by-service breakdown (Supabase, Vercel, Render, Anthropic, etc.)
  - Free tier inventory
  - MVP estimate (~$7–30/mo dev, $50–80/mo prod)
  - Scaling triggers for each service
  - Cost levers documented
- ✅ **Budget:** $50/mo approved; staying within that for Phase 3

### Engineering Documentation
- ✅ **ADRs established:**
  - [ADR-001: Monorepo + pnpm](docs/decisions/adr-001-monorepo.md) — reversibility, trade-offs, review triggers
  - [ADR-002: Drizzle ORM](docs/decisions/adr-002-drizzle-orm.md) — pgvector/tsvector native support rationale
- ✅ **Architecture docs:**
  - [MONOREPO.md](docs/architecture/MONOREPO.md) — package structure, dependency graph, build pipeline
  - Main [architecture plan](docs/recall-ai-architecture-plan.md) — complete spec (approved in Phase 0–2)
- ✅ **README.md** — project overview, quick start, stack summary

### CI/CD & Quality
- ✅ **GitHub Actions workflow** (.github/workflows/ci.yml):
  - Lint (ESLint)
  - Type-check (TypeScript)
  - Build (via Turbo)
  - Test (via Vitest)
  - Dependency audit (pnpm audit)
- ✅ **Turbo config** — task orchestration, caching, parallel builds
- ✅ **Test examples:** Memory lifecycle, dedup, validation (packages/core/src/memory.test.ts)
- ✅ **Code quality:** ESLint + Prettier configs (shared, consistent across monorepo)

### Internationalization Foundation
- ✅ **i18n structure** — locale catalogs ready (en-IN, hi-IN, ar-SA)
- ✅ **RTL support** — infrastructure in place (Tailwind logical properties)
- ✅ **Architecture:** UI language independent of content language

---

## Files Materially Changed

**New files created:** 38  
**Total lines:** ~2,490  

Key files:
- `packages/core/src/types.ts` — canonical types (380 LOC)
- `packages/core/src/memory.ts` — memory lifecycle (180 LOC)
- `packages/core/src/capture.ts` — pre-filtering (150 LOC)
- `packages/ai/src/capabilities.ts` — AI service interface (100 LOC)
- `packages/ai/src/providers/anthropic.ts` — Anthropic adapter (350 LOC)
- `packages/db/src/schema.ts` — Drizzle schema (250 LOC)
- `docs/security/SECURITY.md` — threat model (300 LOC)
- `docs/costs.md` — cost tracking (250 LOC)
- All configuration files (tsconfig, eslint, prettier, turbo, pnpm-workspace)
- GitHub Actions workflow

---

## Tests Performed

### Unit Tests
- ✅ Memory lifecycle state transitions (valid/invalid)
- ✅ Deduplication scoring (type match, person match, string overlap)
- ✅ Memory validation (required fields, type-specific constraints, low-confidence flagging)
- ✅ Capture pre-filtering (scoring logic across source types)

### Type Safety
- ✅ TypeScript compilation (`tsc --noEmit`) — no errors
- ✅ All Zod schemas parse/validate correctly

### Manual Verification
- ✅ Repository structure matches spec (section 3)
- ✅ Package dependencies form a DAG (no cycles)
- ✅ Imports use path aliases (@recall/*)
- ✅ Database schema supports RLS (user_id on every user-scoped table)
- ✅ pgvector/tsvector columns present (for future search)

---

## Unresolved Issues

None blocking Phase 4.

**Open questions/deferred:**
1. **Supabase provisioning** — project not yet created; credentials not configured. Needed before Phase 5 (Gmail + Calendar integration).
2. **GitHub repository** — currently in scratch workspace. Ready to push when repo path is provided.
3. **Styling system** — design tokens not yet configured in `@recall/ui` (will add proper shadcn/ui + Tailwind setup in Phase 3 completion or Phase 4).
4. **Next.js app structure** — `apps/web` is a stub directory; actual page/component scaffolding deferred to Phase 4.

---

## New Recurring Costs

None incurred yet (still in development, using free tiers).

**Approved costs for Phase 4+:**
- Vercel Pro (web): $20/mo (when moving to production domain)
- Render/Railway (worker): ~$7/mo (always-on necessary for polling)
- Supabase (as needed): $0 free tier through MVP, $25/mo when outgrown

See [docs/costs.md](docs/costs.md) for full breakdown.

---

## Documentation Updates

- ✅ [README.md](README.md) — project overview, stack, quick start
- ✅ [docs/architecture/MONOREPO.md](docs/architecture/MONOREPO.md) — structure, dependencies, build pipeline
- ✅ [docs/decisions/](docs/decisions/) — ADRs on monorepo and ORM
- ✅ [docs/security/SECURITY.md](docs/security/SECURITY.md) — threat model, mitigations
- ✅ [docs/costs.md](docs/costs.md) — cost tracking and control strategies
- ✅ [.env.example](.env.example) — environment template

All key architectural decisions documented and reversibility noted.

---

## Recommended Next Phase: Phase 4 — Manual Recall Loop

**Objective:** Prove the core value proposition end-to-end.

**Scope (English-only):**
1. Authentication foundation (Supabase Auth with Google OAuth + email)
2. Next.js application shell (navigation, settings, auth guards)
3. Quick Capture UI (persistent "+ Recall" input)
4. Memory extraction (user captures text → AI extracts structure → memory persisted)
5. Today view (displays memories by status/due date)
6. Memory detail page (view, edit, complete/snooze/dismiss)
7. Basic observability (error logging, AI usage tracking)

**Test the hypothesis:** "Will users trust Recall to identify important commitments and return them at the right time?"

**Success criteria:**
- ✅ User can sign up with email/Google
- ✅ User can capture text via Quick Capture
- ✅ AI extracts commitment/deadline/task from capture
- ✅ Memory persists and appears in Today
- ✅ User can mark complete/snooze/dismiss
- ✅ No unhandled errors; AI usage is tracked
- ✅ Core flows have automated tests

**Do NOT build in Phase 4:**
- Gmail/Calendar ingestion (defer to Phase 5)
- Voice/File/Image capture (defer to Phase 7)
- Arabic/Hindi UIs (defer to Phase 10)
- Ask Recall feature (defer to Phase 6)
- Team Recall (defer to Phase 12)
- Meeting preparation (defer to Phase 20)

---

## Recommendation

✅ **PHASE 3 COMPLETE — PROCEED TO PHASE 4**

The foundation is solid. Core types, AI abstraction, database schema, and cost controls are all in place. Security architecture is documented. No blocking issues.

Phase 4 will prove whether users want this product, before investing in integrations (Gmail, Calendar, voice, etc.).

---

**By:** Claude Haiku 4.5  
**Signed-off:** Ready for build approval
