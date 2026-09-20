# RECALL AI — ARCHITECTURE & BUILD PLAN (v1.0, Phase 0–2 output)

Status: **DRAFT — awaiting approval**. No product code has been written. This document is the required output of Phase 0 (Discovery) + Phase 1 (Brand direction) + Phase 2 (Architecture) per the Master Build Spec.

---

## 1. Proposed Stack

| Layer | Choice | Why |
|---|---|---|
| Web + API | Next.js 15 (App Router), React 19, TypeScript | One deployable for marketing site + product UI + API routes/server actions. Best Core Web Vitals story for the marketing site (SEO matters — section 51). |
| UI | Tailwind CSS + shadcn/ui (Radix primitives) | Accessible-by-default primitives, no template look, full control over theming/RTL. |
| Background workers | Node.js/TypeScript, `graphile-worker` (Postgres-native queue) | Durable jobs with retry/backoff without adding Redis/Kafka. |
| Database | PostgreSQL (managed, via Supabase) | One database does relational + full-text (`tsvector`) + vector (`pgvector`) + auth + object storage. Avoids 3–4 separate services. |
| Auth | Supabase Auth (Google OAuth + email) | Don't hand-roll session/crypto (section 32). |
| Object storage | Supabase Storage (S3-compatible) | Same vendor as DB — one bill, one region. |
| AI | Anthropic Claude API via internal "AI Capability Service" | Capability abstraction, not a single hardcoded call (section 23). Haiku-class model for extraction/classification, Sonnet-class for Ask Recall reasoning. |
| Speech-to-text | Provider-agnostic adapter — Deepgram (nova-2/3, strong multilingual incl. Hindi) as default, swappable | Needs credible Hindi/Hinglish + Arabic accuracy; kept behind the same capability abstraction as AI. |
| Transactional email | Resend | Cheap, good deliverability, simple API for the daily digest. |
| Error monitoring | Sentry (free/dev tier) | Section 67 observability without building one. |
| Analytics | PostHog | Privacy-conscious, self-hostable later, event-only (no memory content). |
| Monorepo tooling | pnpm workspaces + Turborepo | Fast, standard for this shape of app. |

This is a **modular monolith + background workers** (section 37), not microservices. One codebase, two runtime processes (web, worker), one database.

---

## 2. Architecture Diagram

```
                         ┌─────────────────────────────┐
                         │        USERS (browser)       │
                         └──────────────┬───────────────┘
                                         │ HTTPS
                         ┌──────────────▼───────────────┐
                         │   Next.js App (Vercel, bom1)  │
                         │  - Marketing site (SSR/SSG)   │
                         │  - Product UI (React)         │
                         │  - API routes / Server Actions│
                         │  - Auth via Supabase           │
                         └──────┬───────────────┬────────┘
                                │               │
                 writes/reads   │               │ enqueue jobs
                                ▼               ▼
                    ┌───────────────────┐   ┌─────────────────────────┐
                    │  Supabase Postgres │◄──┤  Worker (Render/Railway) │
                    │  - relational data │   │  graphile-worker jobs:  │
                    │  - RLS per user    │   │  - gmail ingest         │
                    │  - tsvector search │   │  - calendar ingest      │
                    │  - pgvector        │   │  - voice/file process   │
                    │  - job queue tables│   │  - memory extraction    │
                    └───────┬────────────┘   │  - daily brief/notify   │
                            │                 └────────┬─────────────┘
                    ┌───────▼────────┐                 │
                    │ Supabase Storage│                 │ calls
                    │ (files/images)  │                 ▼
                    └─────────────────┘     ┌───────────────────────────┐
                                             │   AI Capability Service    │
                                             │ extract / classify /       │
                                             │ summarize / answer /       │
                                             │ prioritize / draft_followup│
                                             └─────────┬─────────┬───────┘
                                                        │         │
                                              ┌─────────▼──┐  ┌───▼──────────┐
                                              │ Anthropic   │  │ Deepgram STT │
                                              │ Claude API  │  │ (voice)      │
                                              └─────────────┘  └──────────────┘

External capture sources → normalized at the edge before touching the Memory Engine:
Gmail API · Google Calendar API · Quick Capture (web) · Voice · File/Image upload
                    │
                    ▼
         ┌─────────────────────┐
         │ Capture Normalizer   │  →  common "RawCaptureEvent" shape
         └─────────┬────────────┘
                    ▼
         ┌─────────────────────┐
         │   Memory Engine       │ (candidate detection → AI extraction →
         │                       │  schema validation → confidence check →
         │                       │  dedup → entity resolution → memory
         │                       │  create/update → scheduling)
         └─────────────────────┘
```

---

## 3. Repository Structure

```
recall-ai/
  apps/
    web/                 # Next.js — marketing + product UI + API routes
    worker/               # graphile-worker process, job definitions
  packages/
    core/                 # domain logic: memory engine, lifecycle, dedup, entity resolution (framework-agnostic)
    capture/               # per-source adapters (gmail, calendar, quick-capture, voice, file) → common shape
    ai/                     # AI Capability Service + model adapters (Anthropic, Deepgram) + prompts + evals
    db/                     # Drizzle schema, migrations, typed client
    ui/                     # shared design-system components (shadcn-based), theming, RTL utilities
    i18n/                   # locale catalogs: en-IN, hi-IN, ar-SA
    config/                 # shared eslint/tsconfig/zod env schema
  docs/
    product/                # product spec, personas, this brief
    architecture/           # this document, diagrams
    decisions/              # ADRs (numbered)
    security/                # threat model, privacy notes
    costs.md
  .github/workflows/        # CI: lint, typecheck, test, build
```

Rationale: `packages/core` and `packages/capture` contain the Memory Engine and normalization logic with **zero Gmail-specific assumptions inside core** — satisfies "Universal Capture" (section 7) directly in the repo shape, not just in prose.

---

## 4. Database Approach

Single managed PostgreSQL instance (Supabase, `ap-south-1`/Mumbai) using:
- Relational tables for all structured data (RLS enabled on every user-scoped table as defense-in-depth beyond app checks).
- Native `tsvector` full-text search for keyword search over memories/summaries.
- `pgvector` extension for semantic similarity — same database, no separate vector store, satisfies section 34/35 directly.
- `graphile-worker`'s own tables (`graphile_worker.*`) for the job queue — no Redis.

Revisit only if: query load or vector corpus size genuinely outgrows Postgres (evidence-based, not speculative) — documented as an ADR review trigger.

ORM: **Drizzle** (SQL-first, lightweight runtime, first-class Postgres/pgvector types) over Prisma — recorded as an ADR since it's a real tradeoff (Prisma has a nicer DX but heavier runtime and weaker raw-SQL/pgvector ergonomics).

---

## 5. Memory Schema (conceptual)

```
memories
  id, user_id, workspace_id (nullable, future team support)
  type            enum: COMMITMENT | FOLLOW_UP | DEADLINE | WAITING_FOR | DECISION | TASK | IMPORTANT_FACT
  title           text
  summary         text
  person_id       fk → people (nullable)
  person_raw      text (unresolved name, if not yet linked)
  due_at          timestamptz (nullable)
  status          enum: DETECTED | OPEN | DUE_SOON | DUE | OVERDUE | COMPLETED | DISMISSED | SNOOZED | ARCHIVED | CANCELLED
  importance      smallint (1–3) or enum LOW/MEDIUM/HIGH
  confidence      float 0–1
  language        text (detected source language, independent of UI locale)
  source_type     enum: GMAIL | CALENDAR | QUICK_CAPTURE | VOICE | FILE | IMAGE | FORWARD
  source_ref      text (external id / thread id / storage key)
  source_excerpt  text (verbatim evidence, preserved — non-negotiable per section 12)
  source_url      text (nullable)
  embedding       vector(1536) (nullable — populated for search)
  dedupe_hash     text (indexed)
  parent_memory_id fk → memories (nullable, for merges/supersession)
  detected_at, extracted_at, snoozed_until, completed_at, dismissed_at, cancelled_at, created_at, updated_at

people
  id, user_id, name, normalized_name, emails text[], phone (nullable),
  last_interaction_at, open_memory_count (derived/cached), created_at, updated_at

oauth_connections
  id, user_id, provider (google), scopes text[], access_token (encrypted),
  refresh_token (encrypted), expires_at, status, connected_at, revoked_at

ai_usage
  id, user_id, capability, provider, model, input_tokens, output_tokens,
  cost_usd_estimate, latency_ms, created_at

capture_sources  (raw evidence store, referenced by memories.source_ref)
  id, user_id, source_type, external_id, content_pointer, content_hash, received_at
```

The AI never writes directly to `memories`. It returns a validated (zod-schema-checked) structured object; the Memory Engine performs dedup/entity-resolution and commits — satisfying "the LLM is not the database" (section 11/14).

---

## 6. Universal Capture Architecture

Every source adapter (`packages/capture/gmail`, `/calendar`, `/quick-capture`, `/voice`, `/file`) converts source-specific input into one shape:

```
RawCaptureEvent {
  userId, sourceType, externalId, occurredAt,
  text, language?, attachments?, participants?, threadId?, rawMetadata
}
```

The Memory Engine (`packages/core`) only ever consumes `RawCaptureEvent` — it has no knowledge of Gmail, Calendar, or file formats. Adding Outlook, Slack, or WhatsApp later means writing one new adapter, not touching the engine. This is the concrete mechanism behind section 7.

---

## 7. Gmail Architecture

- OAuth scopes: start with `gmail.readonly` only (narrowest that supports detection). No `gmail.modify`/`gmail.send` in MVP — AI-drafted follow-ups require explicit human send (section 22), so no send scope needed yet.
- Ingestion: **polling**, not Gmail push/Pub-Sub, for MVP. A worker job runs per-user on an interval (e.g., every 10–15 min) using `historyId` cursors to fetch only new messages. Avoids provisioning Google Cloud Pub/Sub (extra vendor, extra cost, extra complexity) for an MVP-scale user base. Revisit push notifications once polling latency/cost is a measured problem.
- On first connect: process a **limited recent window** (e.g., last 7–14 days), not full history (section 56).
- Each fetched message → `RawCaptureEvent` → cheap deterministic pre-filter (keyword/heuristic scoring: dates, commitment verbs, question patterns) → only messages that pass the filter go to the LLM extraction capability. This is the primary cost lever (section 24).

---

## 8. Calendar Architecture

- Scope: `calendar.readonly`.
- Poll upcoming + recently-changed events on the same interval as Gmail.
- Calendar events feed two things: (a) direct `RawCaptureEvent`s for meeting-based commitments, (b) context for "Meeting Preparation" (deferred feature, section 20) — architecture supports it without building the UI now.

---

## 9. Quick Capture

- Persistent "+ Recall" entry point (web, mobile-web-first).
- Free text → `RawCaptureEvent(sourceType=QUICK_CAPTURE)` → straight to AI extraction (no pre-filter needed; user explicitly chose to capture).
- Synchronous-feeling UX: extraction runs as a fast background job, UI optimistically shows "Processing…" then the structured memory within ~1–2s target.

---

## 10. Voice Architecture

- Mobile-first recording UI → audio blob uploaded to Supabase Storage → worker job: STT (Deepgram, language auto-detect across en/hi/ar) → text → same `RawCaptureEvent` → AI extraction pipeline.
- No custom task forms — voice → structured memory directly, with a confirm/edit step before it's fully "Open" if confidence is low (section 26/27).

---

## 11. File/Image Architecture

- Restricted upload types (PDF, PNG/JPG, common doc formats — explicit allowlist, not "anything").
- Size limits enforced client- and server-side.
- Randomized storage keys in Supabase Storage (never trust/use original filenames as paths).
- Processing happens in the isolated worker process, never inline in a web request.
- Image/PDF → OCR/text-extraction step → same normalization → AI extraction. Original file retained as source evidence (section 12).

---

## 12. AI Architecture

```
Product Feature → AI Capability Service → Context/Policy → Model Adapter → Provider
```

Capabilities exposed by `packages/ai`: `extract_memory`, `classify_memory`, `summarize_context`, `answer_memory_query`, `prioritize_memories`, `draft_followup`, `transcribe_voice`.

- Each capability has: a fixed input contract, a zod output schema, a policy (which model tier, max tokens, temperature), and a swappable model adapter.
- Structured extraction uses Claude's tool-use/function-calling to force schema-conformant JSON — never free-text parsing.
- All prompts treat source content as **data**, never as instructions (ties directly into section 65 — prompt injection).
- This stays intentionally thin: no generic "AI gateway," no multi-provider routing engine, no agent framework — just a typed capability interface. Add complexity only when a second provider is actually needed.

---

## 13. AI Cost-Control Strategy

1. Deterministic pre-filtering before any LLM call (regex/heuristic scoring on emails — most emails never reach the model).
2. Content-hash based dedup/caching — unchanged content is never re-extracted.
3. Cheapest capable model per capability: Haiku-tier for `extract_memory`/`classify_memory` (high volume, simple), Sonnet-tier only for `answer_memory_query`/`summarize_context` (harder reasoning, lower volume).
4. Compact, structured prompts — no dumping full email threads; only the relevant message + minimal thread context.
5. Batching where multiple candidate events from the same user/poll cycle can share one call.
6. Per-user and per-capability token budgets with soft alerts before hard cutoffs.
7. `ai_usage` table tracks user, capability, provider, model, tokens, estimated cost, latency — queryable for cost review (section 24) and CI-adjacent cost dashboards later.

---

## 14. Ask Recall Retrieval Architecture

Hybrid retrieval, in order:
1. **Structured filters** from the query (person, type, status, date range) — resolved cheaply (small/fast model call or rule-based parsing of the question).
2. **Full-text search** (`tsvector`) over memory title/summary/excerpt for keyword matches.
3. **Semantic similarity** (`pgvector`) over memory embeddings for fuzzy/conceptual matches.
4. Merge + rank candidates → pass only the top-N structured memories (with their source excerpts) into the `answer_memory_query` capability.
5. The answer is grounded strictly in retrieved memories; if nothing relevant is retrieved, Recall says so rather than answering from general model knowledge (section 18/prohibits unsupported answers).

Every answer can show its sources (memory + excerpt) — same provenance requirement as section 12, applied to retrieval.

---

## 15. Multilingual Architecture

- UI strings: `next-intl` (or `next-intl`-equivalent) with locale catalogs in `packages/i18n` (`en-IN`, `hi-IN`, `ar-SA`) — no hardcoded strings in components.
- **UI language is independent of content language.** Every memory stores its own detected `language`. AI capabilities accept a target "respond in" locale separate from the source content's language, so Arabic email → English UI → English summary works by design, not as a special case.
- Voice/OCR/extraction pipelines are language-agnostic at the type level; language is data, not branching logic.

---

## 16. Arabic RTL Strategy

- `dir="rtl"` set at the document root when locale = `ar-SA`; Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`) used throughout instead of physical `pl-`/`pr-`, so the same component code mirrors correctly.
- Directional icons (arrows, chevrons) flipped via a small CSS utility keyed off `dir`.
- Arabic typography: a proper Arabic web font (e.g., IBM Plex Sans Arabic or Noto Sans Arabic) paired with the Latin font (Inter) for consistent weight/x-height — never fall back to a Latin font rendering Arabic glyphs.
- Locale-aware date/number formatting via `Intl.DateTimeFormat`/`Intl.NumberFormat`, not manual formatting.
- Playwright E2E includes an Arabic/RTL pass (layout mirroring, focus order, form direction) per section 68.

---

## 17. Authentication

- Supabase Auth: Google OAuth (primary, reduces friction and doubles as the Gmail-connect consent where scopes allow) + email/password fallback.
- Session handling, revocation, and secure logout via Supabase's SDK — no custom crypto (section 32).
- V1 user model: individual accounts. `workspace_id` exists on core tables (nullable, defaults to a personal workspace) so **Team Recall is a later data-model no-op, not a migration crisis** (section 33), without building any team UI now.

---

## 18. Security

- RLS policies on every user-scoped table (`user_id = auth.uid()`) as a second enforcement layer beneath application-level checks — defends against broken authorization even if an app-layer check is missed.
- OAuth tokens encrypted at rest (Supabase Vault/pgcrypto).
- Zod validation at every API boundary (route handlers and server actions).
- File upload hardening per section 11 (type allowlist, size caps, randomized keys, isolated processing, no execution of uploaded content).
- Prompt-injection defense: source content is always data inside prompts; the model's output can never itself trigger a side-effecting action — any action (sending a message, connecting an integration) requires a deterministic, app-level authorization step plus explicit human confirmation for outbound communication (section 22/65).
- CSRF mitigated via Next.js same-site cookies + server action conventions; rate limiting on public/API and AI-invoking routes.
- Dependency scanning via GitHub Dependabot (free) in CI.
- Security tests proving User A cannot read/act on User B's data (RLS + API-level) are part of the test suite, not optional (section 68).

---

## 19. Privacy

- Data minimization: narrowest OAuth scopes that support the feature (section 7/29).
- Explainable onboarding before any connection: what's read, why, what's stored, what the AI receives, how to disconnect, how to delete data (section 57).
- User-facing data export and full account deletion (cascades through memories, sources, tokens).
- Configurable retention (e.g., raw source excerpts prunable after N days while structured memory metadata persists, or full purge on disconnect).
- No compliance claims (SOC2/ISO/DPDP-certified) until actually true — copy explicitly avoided in product/marketing until earned (section 29/30).
- India-first: primary data region Mumbai (`ap-south-1`) end-to-end for DB/storage/auth; the AI provider call is the one leg that leaves the region (Anthropic API) — this is disclosed plainly in the privacy explainer rather than hidden, and is a named risk below.

---

## 20. Background Jobs

`graphile-worker` running in `apps/worker`, sharing `packages/core`/`packages/ai`/`packages/db` with the web app.

Job types: `ingest_gmail_message`, `ingest_calendar_event`, `process_voice_capture`, `process_file_upload`, `extract_memory`, `generate_daily_brief`, `send_notification`.

- Idempotency via unique job keys derived from `content_hash`/`external_id` — reprocessing a message is a no-op, not a duplicate.
- Retry with exponential backoff (built into graphile-worker).
- Failure tracking queryable from the jobs table; surfaced in observability (Sentry breadcrumbs on job failure).
- No Kafka, no separate event bus — Postgres is the durability layer, matching section 36.

---

## 21. Deployment Recommendation

| Component | Host | Region | Why |
|---|---|---|---|
| Web app (Next.js) | Vercel | Mumbai (`bom1`) functions | Best DX + performance for the marketing site (SEO/CWV matter), generous free tier for dev. |
| Worker | Render or Railway | Singapore (closest to India offered by either) | Needs a genuine long-running process; Vercel isn't built for that. |
| Database/Auth/Storage | Supabase | Mumbai (`ap-south-1`) | India-first data residency, three services under one vendor/bill. |
| AI | Anthropic API | N/A (managed) | No self-hosting an LLM for a team this size. |
| STT | Deepgram | N/A (managed) | Multilingual accuracy without building STT. |

Environments: local (docker-compose for Postgres if not using a Supabase branch), a Supabase free-tier project for automated tests/CI, and production. Staging deferred until deployment complexity actually warrants a fourth environment (section 70).

---

## 22. Estimated Development-Phase Infrastructure Costs

Using free/dev tiers wherever viable:

| Service | Dev-tier cost | Notes |
|---|---|---|
| Supabase | $0 (Free tier: 500MB DB, 1GB storage, 50K MAU) | Sufficient through Phase 3–7 |
| Vercel | $0 (Hobby) during build; **Pro ($20/mo) required before commercial launch** — Hobby's ToS excludes commercial use | Switch when leaving pure dev/prototype |
| Render/Railway worker | ~$7/mo (smallest always-on instance) | Free tiers spin down, unusable for a poller/worker |
| Anthropic API | Pay-as-you-go, no meaningful free tier | Budget ~$20–50 for development/testing volume |
| Deepgram | Free tier (~$200 one-time credit) | Covers dev/testing voice volume comfortably |
| Resend | $0 (3,000 emails/mo free) | Fine through MVP |
| Sentry | $0 (Developer tier) | Fine through MVP |
| PostHog | $0 (1M events/mo free) | Fine through MVP |

**Estimated total to get through Phase 10 (Hardening): ~$30–80/month**, mostly the worker host once it needs to run continuously, plus incidental AI usage.

---

## 23. Production Cost Categories (at small live scale, illustrative)

| Category | Driver | Notes |
|---|---|---|
| Supabase | DB size, storage, MAU | Free tier likely exhausted first on storage (file/voice uploads) or MAU once past ~50K users — far beyond MVP. Pro tier is $25/mo when outgrown. |
| Vercel | Function invocations, bandwidth | Pro at $20/mo covers a meaningful early user base. |
| Worker host | Always-on compute | Scales with polling frequency × connected accounts; the real lever is ingestion interval, not user count directly. |
| Anthropic API | Tokens (extraction + Ask Recall) | Largest variable cost at scale — this is why section 13's cost controls matter more than any infra choice. |
| Deepgram | Audio minutes | Scales with voice-capture adoption. |
| Resend | Email volume | Digest emails scale linearly with active users. |

A living `/docs/costs.md` (service, purpose, free tier, MVP estimate, scaling trigger, replacement option) will be created in Phase 3 and kept current — this satisfies section 60 as a repo artifact, not a one-time estimate.

### Per-service justification (section-required format)

**Supabase** — *Why:* one vendor for Postgres+Auth+Storage+pgvector, Mumbai region. *Avoidable?* No — hand-rolling auth/storage/vector infra separately costs far more engineering time than it saves. *Cheaper option?* Self-hosted Postgres (e.g., on a $6/mo VPS) — viable but reintroduces auth/storage/backup work Supabase gives for free; not worth it pre-revenue. *Outgrow point:* sustained DB size/connection limits or MAU near free/Pro ceiling — evidence-based, not before.

**Vercel** — *Why:* best Next.js DX and CWV story for the SEO-dependent marketing site. *Avoidable?* Could self-host Next.js on Render/Railway too — reduces vendor count by one. *Cheaper option?* Yes, that consolidation is real; flagged as an open decision (see Blocking Questions). *Outgrow point:* N/A cost-wise at MVP scale — Pro tier is fixed $20/mo regardless of the small early user base.

**Render/Railway (worker)** — *Why:* only host offering a genuine always-on background process near India. *Avoidable?* No — polling/extraction must run continuously somewhere. *Cheaper option?* A single small always-on VPS (Hetzner/DigitalOcean, ~$5/mo) is cheaper but adds ops overhead (patching, monitoring) a managed platform absorbs. *Outgrow point:* worker CPU/memory ceiling from concurrent job volume.

**Anthropic API** — *Why:* the extraction/reasoning engine — the product's actual intelligence. *Avoidable?* No, this is the core value prop. *Cheaper option?* Use the cheapest model tier that meets accuracy in the eval harness (section 13's whole point). *Outgrow point:* never "outgrown" — cost is managed continuously via usage tracking, not replaced.

**Deepgram** — *Why:* credible multilingual (Hindi/Hinglish/Arabic) STT without building one. *Avoidable?* Could defer voice capture entirely from MVP — real option, see Phase discussion. *Cheaper option?* OpenAI Whisper API is comparable/cheaper per-minute but weaker on Hindi code-switching in practice; worth a small eval before committing. *Outgrow point:* N/A — usage-based from day one.

**Resend** — *Why:* transactional email (digest, notifications) needs reliable deliverability, which is genuinely hard to DIY. *Avoidable?* No. *Cheaper option?* Free tier is likely sufficient through MVP; alternatives (Postmark, SES) similar cost profile. *Outgrow point:* email volume near 3,000/mo free ceiling.

**Sentry / PostHog** — *Why:* observability and privacy-conscious analytics are both explicit spec requirements (sections 67, 72). *Avoidable?* Could defer both to post-MVP — real option if minimizing vendor count is a priority pre-launch. *Cheaper option?* Free tiers already the cheapest option available. *Outgrow point:* event/error volume ceilings, far past MVP.

---

## 24. Brand Direction

Recall AI should feel **calm, intelligent, premium, personal, trustworthy, effortless** — explicitly not "AI-flavored" (no neon gradients, robots, glowing brains, glassmorphism).

- Personality axes: quiet confidence over hype; a trusted colleague, not a chatbot; precise, not chatty.
- Visual language: generous whitespace, restrained color, one accent color reserved specifically for "needs attention" states (so it stays meaningful instead of decorative).
- Voice: "Recall found something" not "Our AI has detected an entity." Short, declarative, never robotic or salesy — matches the "signature question" framing (section 4).

Copy (hero line, supporting line, brand line) stays **exploratory, not locked**, per section 2 — the lines given in the spec are strong starting candidates, final wording deferred to the Phase 1 brand exercise together with the logo.

---

## 25. Logo Direction

Concept: a geometric mark built from an **"R" formed by a returning path** — a stroke that curves back on itself (the "recall"/"return" motion) terminating in a small filled dot (the "recalled signal" / memory point). Reads as a monogram at large sizes, reduces cleanly to just the loop+dot at favicon size (16–32px) when the R's negative space would otherwise disappear.

Deliverables to produce in Phase 1 (kept deliberately small per section 81 — no dozens of variants): primary lockup, horizontal lockup, symbol-only mark, dark/light/monochrome variants, favicon, app icon. One direction refined, not many directions generated.

---

## 26. Design System

- **Color:** deep indigo/navy neutral base + warm paper/cream surface + a single reserved accent (e.g., amber) for due/overdue/needs-attention states only — never decorative.
- **Typography:** Inter (Latin/UI), Noto Sans Devanagari (Hindi), IBM Plex Sans Arabic or Noto Sans Arabic (Arabic) — paired for consistent weight and x-height so no language "feels bolted on."
- **Spacing/elevation:** a small restrained scale (4/8/12/16/24/32), subtle shadows, no heavy glassmorphism.
- **Components:** shadcn/ui primitives (accessible by default) themed to the above tokens — never left in default template appearance (section 39/40).
- **Motion:** minimal, purposeful (state transitions, the "commitment detected → remembered" moment), always respecting `prefers-reduced-motion`.
- **Iconography:** one consistent icon set (e.g., Lucide, already shadcn-aligned), mirrored appropriately in RTL.

Design tokens live in `packages/ui` as the single source of truth consumed by both marketing site and product UI.

---

## 27. Complete Application Screen Map

**Onboarding:** Welcome → Language → Timezone → Connect Gmail → Connect Calendar → Privacy explainer → Initial (limited-window) processing → First memories review → Today.

**Core app (nav: Today · Memories · Ask Recall · People · Capture · Connections · Settings):**
- Today — Needs Attention, Due Today, Waiting for Others, Coming Up, Recently Remembered.
- Memories — filterable/searchable list + detail (with provenance/source excerpt, edit, complete/snooze/dismiss/not-a-memory/wrong-date/wrong-person actions).
- Ask Recall — conversational retrieval, grounded answers with citations.
- People — list + detail (open memories, last interaction, next follow-up). Deliberately not a CRM.
- Capture — Quick Capture modal (always accessible) + Voice Capture + File/Image upload.
- Connections — manage Gmail/Calendar (status, scopes, disconnect).
- Settings — Profile, Language, Timezone, Connections, Notifications (frequency/quiet hours), Privacy, Data & Retention, AI preferences, Account.
- Daily Brief — in-app view mirroring the email digest.

---

## 28. Marketing-Site Structure

Home · Product/How It Works · Security · Pricing · Sign In · Start Free · Privacy · Terms. Eight pages for MVP — no more (section 47).

Hero: **"Never forget what matters."** Supporting: *"Recall AI finds commitments, follow-ups and deadlines hidden across your work — and brings them back when they matter."* CTA: Start Free / See How It Works. Hero demonstration is the email→detection→remembered animation (section 46), built lightweight (CSS/SVG-driven, not video), respecting reduced-motion.

---

## 29. SEO / Keyword Strategy

Technical SEO built correctly from day one: semantic HTML, metadata, canonical URLs, sitemap.xml, robots.txt, Open Graph, structured data (Organization/SoftwareApplication schema where legitimate), fast CWV, accessible markup.

Seed themes only (from the spec) — **not final keyword targets**: global ("AI memory assistant," "AI follow-up assistant," "email follow-up assistant"), India ("AI reminder app India," "automatic follow-up app"), Arabic/GCC (مساعد ذكي، تذكير ذكي، متابعة المهام). Actual keyword research (volume/competition via a proper tool) is explicitly deferred to Phase 9 per spec section 49 — no invented search-volume numbers in this plan. Programmatic SEO explicitly **not** built for MVP (section 50).

---

## 30. Analytics

PostHog, event-only: onboarding completion, connection success/failure, memories detected/confirmed/rejected/completed, Ask Recall usage, DAU, retention. No memory content, no email content ever sent to the analytics provider (section 72).

North star: **useful memories acted upon**. Supporting: confirmation rate, false-positive rate, follow-through rate, weekly retention, Ask Recall success rate (section 73).

---

## 31. Testing

- Unit: memory lifecycle transitions, date extraction, dedup logic, priority scoring (Vitest).
- Integration: DB (RLS enforcement), OAuth flows, ingestion adapters, AI capability adapters (mocked provider).
- E2E (Playwright): sign-up, connect Gmail/Calendar, Quick Capture → memory → Today, complete a memory, Ask Recall query, language switch, Arabic RTL pass.
- AI evaluation: a small golden dataset (`packages/ai/evals`) across English/Hindi/Hinglish/Arabic covering memory detection, type classification, date/person extraction, false positives, dedup, grounded-answer correctness — run manually/on-schedule, not on every commit (cost control, section 25/69).
- Security: explicit tests proving User A cannot read/act on User B's data.

---

## 32. Phased Implementation

Following the spec's phases exactly (0–11): Discovery (this document) → Brand & Product System → Architecture (this document) → Foundation (shell, auth, DB, i18n/RTL, nav, settings skeleton, CI) → Manual Recall loop (Quick Capture → extraction → Today → complete/snooze/edit, English-only) → Gmail + Calendar (controlled ingestion) → Ask Recall → Voice + Files → Daily Brief + Notifications → Marketing + SEO → Hardening → Production/beta launch.

Each phase ends with a build-gate summary (files changed, tests run, unresolved issues, new recurring costs, doc updates, next-phase recommendation) before proceeding — per section 81.

---

## 33. What Should Be Deferred

Everything in spec section 78 (native mobile, microservices, Kubernetes, Kafka, custom foundation model, workflow builder, enterprise SSO, full CRM, project-management suite, self-training AI, autonomous sending, knowledge graph), plus: Outlook/Microsoft 365/Drive/Teams/Zoom/WhatsApp/Slack/Notion integrations, browser extension, PWA (unless a concrete quick-capture UX gap demands it), programmatic SEO, staging environment (until warranted), Meeting Preparation UI (schema supports it, UI doesn't ship in MVP), Team Recall UI (data model supports it via `workspace_id`, UI doesn't ship).

---

## 34. Risks

1. **Google OAuth verification timeline** — sensitive Gmail/Calendar scopes require Google's app-verification review, which can take days to weeks and needs a real business identity, privacy policy, and domain in place. This can silently become the critical-path bottleneck if not started early (Phase 3, not Phase 5).
2. **Multilingual extraction accuracy** — Hindi/Hinglish code-switching and Arabic dialectal variation are genuinely hard for structured extraction; the eval harness (section 25/31) needs to catch regressions early, not be an afterthought.
3. **AI cost drift** — without the pre-filtering/caching discipline in section 13 actually being enforced (not just designed), per-user cost can scale faster than revenue.
4. **Data residency vs. AI provider** — DB/storage/auth stay in Mumbai, but the Anthropic API call is a US-based processing leg; this must be disclosed plainly in onboarding (section 57), not glossed over.
5. **Scope breadth of the master spec itself** — 36 required planning sections and a very wide feature surface invite scope creep during build; the phase-gate discipline (section 81) is the actual mitigation, and should be enforced strictly.

---

## 35. Blocking Questions (need your decision before Phase 3 starts)

1. **Project location** — no existing repo/folder was specified. Where should the actual `recall-ai` repository live on this machine (and should I `git init` it now), and is there a GitHub org/account it should be pushed to?
2. **Anthropic API access** — do you already have an Anthropic API key/billing set up for this project, or should that be provisioned first?
3. **Vercel vs. consolidating web+worker on one host** — Vercel is recommended for the marketing site's SEO/CWV story, but running the worker on Render/Railway means two hosting vendors. Are you fine with that split, or would you prefer everything (web + worker) on a single platform (Render/Railway) to simplify ops at the cost of some marketing-site performance headroom?
4. **Budget posture during development** — should the whole build stay strictly on free tiers until Phase 10 (Hardening), or is a small monthly budget (~$30–80, per section 22) approved now so the worker/AI usage isn't artificially constrained during build?
5. **Business identity for OAuth verification** — Google's verification needs a real support email, privacy policy URL, and domain. Is there already a domain/company entity for Recall AI, or does that need to be set up before Phase 5?
6. **Voice capture provider** — comfortable defaulting to Deepgram, or should Whisper (OpenAI) be evaluated side-by-side first given it's a second AI vendor either way?

---

## 36. Recommended First Implementation Milestone

**Phase 3 (Foundation) + Phase 4 (Manual Recall loop), English-only, combined into one milestone.**

Concretely: repo scaffold, Supabase project + schema + RLS, Auth, i18n scaffolding (catalogs present, only `en-IN` populated), base navigation/design system, CI (lint/typecheck/test/build) — then prove the actual product loop end-to-end: **Quick Capture → AI extraction (`extract_memory`) → structured Memory → Today → Complete/Snooze/Edit**, with provenance visible on every memory.

This is the smallest slice that tests the real hypothesis in section 75 ("will users trust Recall to identify commitments and return them") without yet touching Gmail/Calendar OAuth, voice, files, or Arabic — each of which is a real subsystem in its own right and shouldn't gate proving the core loop.

---

# PLANNING COMPLETE — AWAITING APPROVAL TO BUILD
