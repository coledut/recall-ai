# Monorepo Architecture

Recall AI is organized as a monorepo using `pnpm workspaces` and `turbo` for task orchestration.

## Directory Structure

```
recall-ai/
├── apps/
│   ├── web/                 # Next.js web app + API
│   │   ├── app/              # App router pages
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # Utilities (auth, db queries, etc.)
│   │   │   └── app/          # Next.js app directory
│   │   └── package.json
│   └── worker/              # Node.js background job worker
│       ├── src/
│       │   └── jobs/         # Job definitions (Gmail ingest, extraction, etc.)
│       └── package.json
├── packages/
│   ├── core/                # Domain logic (memory lifecycle, types, dedup)
│   │   ├── src/
│   │   │   ├── types.ts     # Canonical types (RawCaptureEvent, ExtractedMemory)
│   │   │   ├── memory.ts    # Memory lifecycle, validation, dedup
│   │   │   ├── capture.ts   # Pre-filtering, scoring, content hashing
│   │   │   └── index.ts
│   │   └── package.json
│   ├── capture/             # Source adapters (Gmail, Calendar, QuickCapture, etc.)
│   │   ├── src/
│   │   │   ├── gmail/       # Gmail adapter
│   │   │   ├── calendar/    # Google Calendar adapter
│   │   │   ├── quick/       # Quick Capture
│   │   │   └── index.ts
│   │   └── package.json
│   ├── ai/                  # AI Capability Service + model adapters
│   │   ├── src/
│   │   │   ├── capabilities.ts  # Service interface
│   │   │   ├── providers/
│   │   │   │   ├── anthropic.ts # Anthropic Claude (default)
│   │   │   │   └── (future: openai.ts, etc.)
│   │   │   └── index.ts
│   │   └── package.json
│   ├── db/                  # Database schema, migrations, client
│   │   ├── src/
│   │   │   ├── schema.ts    # Drizzle schema definition
│   │   │   ├── client.ts    # DB client factory
│   │   │   └── index.ts
│   │   ├── migrations/      # Auto-generated Drizzle migrations
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   ├── ui/                  # Design system + components
│   │   ├── src/
│   │   │   ├── components/  # shadcn-based components
│   │   │   ├── themes/      # Design tokens, color schemes
│   │   │   ├── icons/       # Icon system
│   │   │   └── index.ts
│   │   └── package.json
│   ├── i18n/                # Internationalization
│   │   ├── src/
│   │   │   ├── locales/
│   │   │   │   ├── en-IN.json  # English (India)
│   │   │   │   ├── hi-IN.json  # Hindi (India)
│   │   │   │   └── ar-SA.json  # Arabic (Saudi Arabia)
│   │   │   ├── provider.tsx  # next-intl provider/hooks
│   │   │   └── index.ts
│   │   └── package.json
│   └── config/              # Environment validation, shared config
│       ├── src/
│       │   ├── env.ts       # Zod schema for env vars
│       │   └── index.ts
│       └── package.json
├── docs/
│   ├── product/             # Product specs, personas, flows
│   ├── architecture/        # Architecture docs (this file, diagrams)
│   ├── decisions/           # Engineering Decision Records (ADRs)
│   ├── security/            # Security architecture, threat model
│   └── costs.md             # Infrastructure cost tracking
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD
├── .env.example             # Environment variables template
├── .eslintrc.json           # ESLint config (shared)
├── .prettierrc.json         # Prettier config (shared)
├── package.json             # Root workspace package
├── pnpm-workspace.yaml      # pnpm workspaces definition
├── tsconfig.json            # Root TypeScript config
├── turbo.json               # Turbo build orchestration
└── README.md                # Project README
```

## Package Dependencies

```
apps/web
├── uses: @recall/core, @recall/db, @recall/ui, @recall/i18n, @recall/ai, @recall/config
└── (depends on: React, Next.js, Tailwind, next-intl)

apps/worker
├── uses: @recall/core, @recall/db, @recall/ai, @recall/capture, @recall/config
└── (depends on: node-postgres, graphile-worker, Anthropic SDK)

packages/core (no dependencies on other packages)
└── (depends on: zod only)

packages/capture
├── uses: @recall/core, @recall/config
└── (depends on: Google API libs, minimal)

packages/ai
├── uses: @recall/core
└── (depends on: Anthropic SDK, zod)

packages/db
├── uses: @recall/core
└── (depends on: Drizzle, pg)

packages/ui (no dependencies on other packages)
└── (depends on: React, Tailwind, shadcn/ui, Radix primitives)

packages/i18n
├── uses: @recall/config
└── (depends on: next-intl)

packages/config (no dependencies on other packages)
└── (depends on: zod only)
```

**Key principle:** Packages form a DAG (directed acyclic graph). No circular dependencies. `@recall/core` has no deps on other packages (it's the foundation).

## Workspace Commands

All commands are run at the root and orchestrated by `turbo`:

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run type checking across all packages
pnpm type-check

# Lint all packages
pnpm lint

# Format all packages
pnpm format

# Run tests in all packages
pnpm test

# Run E2E tests (only in apps/web)
pnpm test:e2e

# Watch mode (for development)
pnpm dev

# Database migrations
pnpm db:migrate
pnpm db:generate
```

## Build Pipeline (Turbo)

Turbo orchestrates tasks with caching and parallelization:

1. **`pnpm build`** builds all packages in dependency order:
   - `@recall/config` → `@recall/core`, `@recall/ui`, `@recall/i18n`
   - `@recall/capture`, `@recall/ai`, `@recall/db` (parallel)
   - `apps/web`, `apps/worker` (parallel, after their deps)

2. **Caching:** Build outputs (`dist/`) are cached if inputs (`src/`) haven't changed.

3. **Graph awareness:** If `@recall/core` changes, Turbo rebuilds only downstream packages (`@recall/capture`, `@recall/ai`, etc.), not `@recall/ui`.

## Import Conventions

Imports between packages use path aliases defined in root `tsconfig.json`:

```typescript
// In apps/web or any package:
import { RawCaptureEvent, MemoryStatus } from '@recall/core';
import { getDb } from '@recall/db';
import { Button } from '@recall/ui';
import { t } from '@recall/i18n';
```

No relative imports across package boundaries (`../../../packages/core` ❌).

## Adding a New Package

1. Create directory: `packages/my-package/`
2. Add `package.json` with:
   - `name: "@recall/my-package"`
   - `type: "module"`
   - Appropriate `dependencies` (use `workspace:*` for internal deps)
3. Create `src/index.ts` as entry point
4. Create `tsconfig.json` extending root config
5. Add `my-package` to `pnpm-workspace.yaml` (auto-detected by glob; should already be there)
6. Run `pnpm install` to update lock file

## Monorepo Maintenance

- **Keep package boundaries clean:** A package should have one clear responsibility.
- **Avoid circular deps:** Use `pnpm list --depth=10` to audit dependency tree.
- **Version consistency:** All packages share the same version (0.1.0 → 1.0.0 together).
- **Lock file:** `pnpm-lock.yaml` is committed; always use `pnpm install`, never `npm install`.

## CI/CD Integration

`.github/workflows/ci.yml` runs on every commit:

```
checkout → setup Node → pnpm install → lint → type-check → build → test → audit
```

All steps use Turbo caching, so subsequent runs are fast.
