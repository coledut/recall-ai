# ADR-001: Monorepo + pnpm Workspaces

**Status:** Accepted  
**Date:** 2026-09-16

## Context

Recall AI comprises multiple logical packages:
- Web application (Next.js) + API
- Background worker (graphile-worker)
- Shared libraries: core domain logic, database, AI capabilities, UI components, i18n, config

Initially, we could organize these as:
1. Monorepo (single repo, multiple packages, pnpm workspaces)
2. Polyrepo (separate Git repos per package)

## Decision

**Use monorepo + pnpm workspaces**, organized as:
```
apps/
  web/        (Next.js application)
  worker/     (Node.js background jobs)
packages/
  core/       (memory logic, types, dedup)
  capture/    (source adapters)
  ai/         (AI capability service, model adapters)
  db/         (Drizzle schema, migrations, client)
  ui/         (shadcn-based components, design system)
  i18n/       (locale catalogs and l10n logic)
  config/     (env validation, shared config)
```

Manage all with `pnpm workspaces` and `turbo` for task orchestration (lint, typecheck, build, test).

## Alternatives Considered

1. **Polyrepo:** Separate GitHub repositories per package
   - **Rejected:** Makes shared dependency management harder (version alignment, release coordination). Requires publishing internal packages to npm, adding complexity and cost. Hurts developer ergonomics during refactor (multiple repos to change). Harder to enforce consistency.

2. **Monolith (no packages):** Everything in one `src/` folder
   - **Rejected:** Makes separation of concerns harder as codebase grows. Complicates testing (can't test packages independently). Makes it harder to swap out providers (e.g., AI, STT).

## Trade-offs

**Gains:**
- Single dependency version source of truth (pnpm's strict resolution)
- Refactoring across package boundaries is cheap (same repo, no cross-npm publish cycles)
- Consistent TypeScript/ESLint/Prettier across all code
- Easier to enforce architectural boundaries via imports (e.g., core can never import from web)
- Simplifies CI/CD (one build matrix, one GitHub Actions setup)
- Cleaner local dev: one `pnpm install`, one watch command

**Sacrifices:**
- Monorepo tooling overhead (turbo, pnpm workspace management)
- Can't independently deploy packages (but we don't need to — web and worker deploy together)
- Slightly higher cognitive load (need to understand package boundaries)

## Cost

**Development:**
- pnpm + turbo overhead is negligible (~100ms per `pnpm install`, turbo is very fast)

**Deployment:**
- CI/CD is cheaper (single pipeline, not N pipelines for N repos)
- No npm publishing cost (internal packages are never published)

## Security/Privacy

No security/privacy implications. This is a structural choice, not a data-flow choice.

## Reversibility

**Low reversibility.** Migrating from monorepo to polyrepo is possible but disruptive — requires republishing internal packages to npm, rewriting imports, setting up N new GitHub repos. **Do not expect to reverse this decision** without significant refactoring.

If we later spin off a commercially independent product (e.g., selling "Recall Lite" as a separate SaaS), we can extract that package into a separate repo at that time.

## Review Trigger

- If internal packages grow to >5 and dependency management becomes a burden, revisit.
- If we need to independently version/deploy a package, revisit.
- If the team grows to >10 people and monorepo overhead becomes noticeable, revisit.

Currently: none of these conditions apply.
