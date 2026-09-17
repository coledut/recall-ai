# ADR-002: Drizzle ORM vs. Prisma

**Status:** Accepted  
**Date:** 2026-09-16

## Context

Recall AI uses PostgreSQL. We need an ORM/query builder for:
- Type-safe database access (TypeScript first-class integration)
- Schema definition and migrations
- Queries: memory CRUD, searches, aggregations, RLS enforcement
- Full-text search (`tsvector`)
- Vector similarity searches (`pgvector`)

Two main candidates:
1. **Drizzle:** SQL-first, lightweight, Postgres-native features first-class
2. **Prisma:** Schema-first, more ORM-like, larger ecosystem

## Decision

**Use Drizzle ORM** for the following reasons:

1. **Postgres-native features:** pgvector and tsvector are first-class citizens in Drizzle. Prisma requires workarounds or raw SQL for both.
2. **SQL-first philosophy:** Closer to database semantics, easier to understand and optimize queries.
3. **Lightweight runtime:** Drizzle ships minimal code; Prisma has a larger footprint.
4. **Better for RLS:** RLS policies are enforced at the database layer. Drizzle makes it easy to read the schema and understand security constraints; Prisma abstracts these away.
5. **Migration control:** Drizzle's migrations are SQL files you control; Prisma's are opaque.

## Alternatives Considered

1. **Prisma:**
   - **Pros:** Better DX (schema DSL is cleaner), great migrations UI, strong ecosystem.
   - **Rejected:** pgvector support is hacky (no first-class integration). Full-text search requires raw SQL. Larger runtime footprint. Opaque migrations make it harder to reason about database state.

2. **No ORM, raw SQL + query builder (sql.js or similar):**
   - **Pros:** Full control, minimal overhead.
   - **Rejected:** Loses type safety. More boilerplate for every query.

3. **SQLAlchemy (Python) or Ecto (Elixir):**
   - **Rejected:** We're using TypeScript/Node.js, not Python/Elixir.

## Trade-offs

**Gains:**
- Native pgvector and tsvector support
- Smaller runtime footprint (~50KB vs Prisma's ~1MB)
- SQL migrations are human-readable and debuggable
- Type-safe queries without losing SQL expressiveness
- Easy to inspect actual SQL being generated

**Sacrifices:**
- Smaller ecosystem (fewer integrations, fewer ORMs for competing use cases)
- Schema DSL is slightly less polished than Prisma's
- Migration UI is less fancy than Prisma's Migrate UI (but migrations themselves are better)

## Cost

**Development:**
- Learning curve: Drizzle is simpler to learn (it's closer to raw SQL)
- Development speed: Slight loss in productivity compared to Prisma (less magical, more explicit), but offset by not fighting pgvector/tsvector

**Runtime:**
- Drizzle: ~50KB (minimal)
- Prisma: ~1MB
- Negligible cost difference at our scale, but Drizzle is lighter.

## Security/Privacy

**Positive:** Drizzle encourages reading raw SQL and understanding RLS policies. This is a security-conscious choice.

**No negative implications.**

## Reversibility

**Medium reversibility.** Switching from Drizzle to Prisma would require:
- Rewriting schema from Drizzle types to Prisma schema
- Converting all queries (Drizzle query builder → Prisma client calls)
- Rethinking pgvector/tsvector integration
- Migration rewrite

This is doable but would take ~1–2 weeks of engineering time. **Not a decision to make lightly**, but not irreversible.

If pgvector/tsvector become unusable with Drizzle, revisit.

## Review Trigger

- If we find pgvector or tsvector queries are harder to express than expected, revisit.
- If the Drizzle ecosystem becomes significantly smaller or unsupported, revisit.
- If we outgrow the query builder and need more complex ORM features, revisit.

Currently: none of these conditions apply. Drizzle is actively maintained, and Postgres support is excellent.
