# Engineering Decision Records (ADRs)

This directory contains significant architectural decisions for Recall AI, following the format:

- **Status:** Proposed | Accepted | Deprecated | Superseded
- **Context:** The issue or problem that motivated the decision
- **Decision:** What was decided and why
- **Alternatives:** Other options considered and why they were rejected
- **Trade-offs:** What we gained, what we sacrificed
- **Cost:** Infrastructure/engineering cost implications
- **Security/Privacy:** Any security or privacy implications
- **Reversibility:** How easily can this be changed later
- **Review Trigger:** When should we revisit this decision

## Navigation

- [ADR-001: Monorepo + pnpm workspaces vs. polyrepo](./adr-001-monorepo.md)
- [ADR-002: Drizzle ORM vs. Prisma](./adr-002-drizzle-orm.md)
- [ADR-003: Anthropic Claude as default AI provider](./adr-003-anthropic-provider.md)
- [ADR-004: PostgreSQL pgvector vs. separate vector database](./adr-004-pgvector.md)

New ADRs should be added as they arise during implementation, particularly for:

- Technology selections with vendor lock-in implications
- Cost-impacting infrastructure decisions
- Security/privacy trade-offs
- Feature architecture choices with data residency impact
