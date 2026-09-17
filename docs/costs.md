# Infrastructure & Development Costs

Per spec section 60, this document tracks all infrastructure costs and is kept current during development.

Updated: 2026-09-16

## Development Phase (MVP Build)

| Service | Purpose | Free Tier | MVP Est. | Scaling Trigger | Replacement Option |
|---------|---------|-----------|----------|-----------------|-------------------|
| **Supabase** | Postgres + Auth + Storage + pgvector | 500MB DB, 1GB storage, 50K MAU | $0 | DB size >500MB or MAU >50K | Self-hosted Postgres ($6/mo VPS, adds ops work) |
| **Vercel** | Next.js web + API | Free tier (hobby) | $0 dev / $20/mo prod | Function invocations or bandwidth surge | Self-hosted Next.js on Railway/Render ($10–20/mo) |
| **Render** | Background worker (graphile-worker) | Spins down (unusable for poller) | ~$7/mo | 2+ concurrent workers or sustained CPU spike | Railway ($7/mo similar), AWS ECS (more expensive) |
| **Anthropic API** | AI extraction + reasoning | None (pay per token) | ~$20–50 dev | Token spend >$500/mo | Cheaper model (Haiku), smaller contexts, more pre-filtering |
| **Deepgram** | Speech-to-text (voice, deferred) | $200 one-time credit | $0 dev (using free tier credit) | Credit exhausted or >100k audio minutes | Whisper API (~similar), Azure Speech ($0.006/min) |
| **Resend** | Transactional email | 3,000 emails/mo free | $0 | Email volume >3,000/mo | SES ($0.10 per 1,000), Postmark (similar cost) |
| **Sentry** | Error monitoring | Developer tier (free) | $0 | Error volume >10k/mo | Self-hosted Sentry (adds ops), Rollbar (similar cost) |
| **PostHog** | Analytics | 1M events/mo free | $0 | Event volume >1M/mo | Plausible ($20/mo), Fathom ($19/mo), self-hosted Plausible |

**Total MVP Dev Cost:** ~$7–30/mo (mostly Render worker + incidental AI usage)

**Total MVP Prod Cost:** ~$50–80/mo (Vercel Pro $20 + Render $7 + Supabase Pro $25 when DB is outgrown, plus AI usage)

## Production Phase (After Launch)

Once paying users come onboard, cost categories:

### 1. Supabase (Database, Auth, Storage)
- **Why:** One platform for Postgres + Auth + Vector search + File storage
- **Can we avoid?** No — core infrastructure
- **Cheaper option?** Self-hosted Postgres ($6/mo VPS) + Auth0 ($30/mo) + S3 ($1/mo) = $37/mo + ops overhead. Supabase wins for startup speed.
- **When outgrown:** Sustained DB size >50GB or MAU >100k, consider self-hosted or upgrade to Supabase Pro ($25/mo) → Enterprise (~$1000+/mo)
- **Estimate at scale:**
  - 1,000 users: ~$25/mo (free tier)
  - 10,000 users: ~$25/mo (Pro tier)
  - 100,000 users: ~$100+/mo (enterprise or self-hosted)

### 2. Vercel (Web App)
- **Why:** Next.js is the framework; Vercel is the official host with best CWV for SEO
- **Can we avoid?** Yes — self-host Next.js on Render/Railway (~$10–20/mo)
- **Cheaper option?** Self-hosted, but you lose Vercel's DX (deployments, edge functions, git integration)
- **When outgrown:** Function invocation limits hit (millions of invocations/mo) — move to AWS Lambda (more expensive than Vercel at that scale)
- **Estimate at scale:**
  - 1,000 users: $20/mo (Pro)
  - 10,000 users: $20–50/mo (Pro + overages)
  - 100,000 users: ~$100–500/mo (scale depends on traffic patterns)

### 3. Worker Host (Render/Railway)
- **Why:** Background jobs (email ingestion, extraction, notifications) must run continuously
- **Can we avoid?** Could defer background jobs to AWS Lambda (pay per invocation), but polling isn't a good fit for Lambda
- **Cheaper option?** Self-hosted VPS ($5–10/mo Hetzner) + ops overhead (patching, monitoring)
- **When outgrown:** Worker CPU/memory ceiling from concurrent job volume. Scales linearly with users and ingestion frequency.
- **Estimate at scale:**
  - 1,000 users (1 worker): ~$7/mo
  - 10,000 users (2–3 workers): ~$20–30/mo
  - 100,000 users (5–10 workers): ~$50–100/mo

### 4. Anthropic API (AI Extraction + Reasoning)
- **Why:** Core product value — extracting memories from text
- **Can we avoid?** No — this is the product
- **Cheaper option?** Use cheaper model (Haiku for extraction is already cheap; ~$0.8 per 1M input tokens). Aggressive pre-filtering to reduce tokens sent.
- **When outgrown:** Never — this is a variable cost that scales with usage. Optimized at the design level (pre-filtering, caching, model tier selection).
- **Cost levers per spec 13:**
  - Deterministic pre-filtering (most emails never reach the model)
  - Content-hash caching (unchanged content not re-processed)
  - Model tier selection (Haiku for simple extraction, Sonnet for reasoning)
  - Compact, structured prompts
  - Batching where possible
- **Estimate at scale:**
  - 1,000 users (5 memories/user/week): ~$20/mo
  - 10,000 users: ~$100–150/mo
  - 100,000 users: ~$1000–2000/mo (this becomes a major cost driver; heavy optimization required)

### 5. Deepgram (STT)
- **Why:** Voice capture requires speech-to-text with multilingual accuracy (Hindi, Arabic)
- **Can we avoid?** Yes — defer voice capture post-MVP
- **Cheaper option?** Whisper API (~similar pricing), Azure Speech ($0.006/min), self-hosted Whisper (adds ops)
- **When outgrown:** >100k audio minutes/mo
- **Estimate at scale:**
  - If 10% of users use voice 5x/week (1 min each): 1,000 users → 260 min/mo → $2/mo. At 100k users: $200/mo.

### 6. Resend (Email)
- **Why:** Digest emails + transactional notifications
- **Can we avoid?** No — user communication required
- **Cheaper option?** AWS SES (~$0.10 per 1,000), Postmark (similar cost), Mailgun (similar)
- **When outgrown:** >100k emails/mo
- **Estimate at scale:**
  - 1,000 users (1 digest/week): ~200 emails/mo → $0/mo (free tier)
  - 10,000 users: ~2,000 emails/mo → $0/mo
  - 100,000 users: ~20,000 emails/mo → $2/mo

## Cost Control Levers During Build

1. **Use free tiers extensively.** We're budget-approved for ~$30–50/mo during dev; stay there.
2. **Monitor AI usage weekly.** Track tokens/cost in `ai_usage` table. Set alerts if monthly spend exceeds budget.
3. **Pre-filter before AI invocation.** Section 13's pre-filtering is the #1 cost control. Cheap heuristics save expensive token calls.
4. **Cache aggressively.** Content hash prevents re-processing.
5. **Model tier selection.** Haiku for extraction (100x cheaper than Sonnet), Sonnet only for Ask Recall reasoning.
6. **Batch where possible.** Process multiple captures in one AI call if they're similar.

## Known Cost Risks

1. **Anthropic API token creep:** If users capture high-volume sources (Gmail with thousands of emails), per-user token cost could spike. Mitigation: aggressive pre-filtering, per-user token budgets with soft alerts.
2. **Storage growth:** File/voice uploads accumulate. Supabase storage is limited at free tier. Mitigation: retention policies (delete old captures), user quotas.
3. **Worker concurrency:** If polling frequency increases or ingestion lag happens, worker need could spike. Mitigation: scale horizontally (add workers), optimize job processing.
4. **Search/vector embedding:** If every memory is embedded for semantic search, token cost spikes. Mitigation: embed only high-confidence memories or defer embedding to a cron job.

## Monitoring

Add these to observability (section 67):
- Weekly AI cost report (tokens, models, cost by capability)
- Database storage growth (trigger alert at 80% of tier limit)
- Email sent count (trigger alert if >80% of free tier)
- Worker job backlog (trigger alert if queue depth grows)

## Review Cadence

- **Weekly:** Check AI token usage and cost (during active development)
- **Monthly:** Review all costs, look for anomalies or new vendors
- **Quarterly:** Re-evaluate tier choices and scaling triggers
