# Recall AI - Quick Start Guide

## 🎉 Complete 11-Phase Implementation

This repository contains the **full production-ready implementation** of Recall AI, an AI-powered memory assistant.

---

## **What's Included**

### ✅ All 11 Phases Complete:
- **Phase 3**: Monorepo foundation, core types, AI abstraction, database schema
- **Phase 4**: Manual recall loop (quick capture, today view, memory actions)
- **Phase 5**: Gmail + Calendar integration (background jobs)
- **Phase 6**: Ask Recall (conversational retrieval, grounded Q&A)
- **Phase 7**: Voice + File capture (universal input)
- **Phase 8**: Daily email digest + push notifications
- **Phase 9**: Landing page, SEO, analytics, marketing
- **Phase 10**: Security hardening, rate limiting, validation
- **Phase 11**: Docker, CI/CD, production deployment

---

## **Repository Structure**

```
recall-ai/
├── apps/
│   ├── web/                 # Next.js frontend + API routes
│   │   ├── src/app/        # Pages, layouts, routes
│   │   ├── src/components/ # React components
│   │   ├── src/lib/        # Utilities (auth, validation, rate-limit)
│   │   ├── Dockerfile      # Production container
│   │   └── package.json
│   └── worker/              # Background jobs (Graphile Worker)
│       ├── src/jobs/       # Job processors (Gmail, calendar, notifications)
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── core/               # Memory lifecycle, state machine, types
│   ├── db/                 # Drizzle ORM schema, migrations
│   ├── ai/                 # AI capabilities (Anthropic adapter)
│   ├── config/             # Environment + shared config
│   └── ui/                 # Shared UI components
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD pipeline
├── docker-compose.yml      # Local development setup
├── Dockerfile              # Production containers
├── SECURITY.md             # Security & hardening guide
├── DEPLOYMENT.md           # Deployment instructions
└── README.md               # Overview

```

---

## **Tech Stack**

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express (worker), Next.js API routes
- **Database**: PostgreSQL (Supabase) with Row-Level Security
- **AI**: Anthropic Claude (Haiku + Sonnet)
- **Voice**: Deepgram STT
- **Queue**: Graphile Worker (PostgreSQL-backed)
- **Deployment**: Docker, Kubernetes, GitHub Actions

---

## **Quick Start (Local Development)**

### Prerequisites
- Node.js 20+
- pnpm 8+
- Supabase account
- Anthropic API key

### Setup

```bash
# Install dependencies
pnpm install

# Create .env.local
cp .env.example .env.local

# Edit .env.local with your API keys:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# ANTHROPIC_API_KEY=...
# etc.

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

---

## **Core Features**

### 📸 **Universal Capture**
- Quick text entry
- Gmail sync (auto-ingest from email)
- Calendar event extraction
- Voice recording + transcription (Deepgram)
- File upload (PDF, images, documents)

### 🧠 **AI Extraction**
- Claude Haiku extracts structure (commitments, people, dates)
- Confidence scoring
- Importance classification
- Deduplication engine

### 📅 **Smart Reminders**
- Today view with context grouping
- Memory lifecycle state machine
- Email digest (daily/weekly)
- Push notifications (web)
- Timezone-aware quiet hours

### 💬 **Grounded Q&A**
- Conversational interface
- Hybrid search (full-text + keyword)
- Answers cite sources with links
- Confidence scores always shown

### 🔒 **Security & Hardening**
- Rate limiting (Upstash Redis)
- Input validation (Zod schemas)
- Security headers (CSP, HSTS, X-Frame-Options)
- OAuth hardening (narrow scopes, token encryption)
- Row-level security (RLS) at database

---

## **API Endpoints**

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/oauth/google/callback` - OAuth

### Capture
- `POST /api/memories/extract` - Quick text
- `POST /api/capture/voice` - Voice recording
- `POST /api/capture/file` - File upload

### Memories
- `GET /api/memories` - List all
- `GET /api/memories/search` - Hybrid search
- `PATCH /api/memories/[id]` - Complete/snooze/dismiss

### Ask Recall
- `POST /api/ask-recall` - Query with grounded answers

### Notifications
- `GET/PATCH /api/notifications/preferences` - Settings
- `POST /api/notifications/subscribe` - Push subscription

### Health
- `GET /api/health` - Health check

---

## **Deployment**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment options:
- Docker Compose (simple)
- Kubernetes (scalable)
- Railway, Vercel, Render
- AWS, GCP, Azure

### Quick Deploy to Railway

```bash
# 1. Create Railway project
# 2. Connect GitHub repository
# 3. Add environment variables (Supabase, Anthropic, etc.)
# 4. Deploy automatically on push
```

---

## **Security**

See [SECURITY.md](./SECURITY.md) for complete security documentation:
- Authentication & authorization
- Input validation
- Rate limiting
- Security headers
- OAuth hardening
- Data protection
- Incident response

---

## **Architecture Highlights**

### Universal Capture Principle
All input sources (email, calendar, voice, files, text) normalize to `RawCaptureEvent` before the Memory Engine.

### Memory Lifecycle State Machine
```
DETECTED → OPEN → DUE_SOON → DUE → OVERDUE → COMPLETED/SNOOZED/DISMISSED/ARCHIVED
```

### Grounded AI
- Every answer cites sources
- Confidence scores always shown
- Never invents answers, always grounded in user's memories

### Cost Control
- Pre-filtering before AI calls
- Haiku for extraction, Sonnet for reasoning
- Usage tracking per user

---

## **Environment Variables**

Required:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```

Optional (for full features):
```env
DEEPGRAM_API_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
SENDGRID_API_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
NEXT_PUBLIC_POSTHOG_KEY=...
```

See `.env.example` for complete list.

---

## **Development**

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test

# Build
pnpm build
```

---

## **Monitoring & Observability**

- Health checks: `GET /api/health`
- Error tracking: Sentry integration (optional)
- Analytics: PostHog (opt-in)
- Logs: Docker logs or kubectl logs

---

## **Roadmap**

- [ ] **Phase 12**: Team Recall (workspaces, sharing)
- [ ] **Phase 13**: Advanced Analytics (trends, insights)
- [ ] **Phase 14**: Mobile Apps (iOS, Android)
- [ ] **Phase 15**: Integrations Marketplace (Slack, Teams, Discord)

---

## **Support**

- **Docs**: See [DEPLOYMENT.md](./DEPLOYMENT.md) and [SECURITY.md](./SECURITY.md)
- **Issues**: GitHub Issues
- **Email**: hello@recall.ai

---

## **License**

MIT

---

## **Acknowledgments**

- [Anthropic](https://anthropic.com) - Claude AI
- [Supabase](https://supabase.com) - Database & Auth
- [Deepgram](https://deepgram.com) - Voice Transcription
- [Vercel](https://vercel.com) - Next.js hosting

---

**You now have a complete, production-ready AI memory assistant. Deploy with confidence.** 🚀
