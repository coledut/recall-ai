# Production Deployment Guide

This guide covers deploying Recall AI to production using Docker, Kubernetes, or cloud platforms.

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- PostgreSQL 15+ (production)
- Redis (Upstash or self-hosted)
- Supabase project
- GitHub account (for CI/CD)

## Environment Setup

### Production Environment Variables

Create a `.env.production` file with:

```env
# Supabase (production)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# API Keys
ANTHROPIC_API_KEY=sk-...
DEEPGRAM_API_KEY=...

# Database
DATABASE_URL=postgresql://user:password@prod-db.example.com:5432/recall_ai

# Email
SENDGRID_API_KEY=SG.xxx or SMTP configuration

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com

# Monitoring
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Other
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://recall.ai
APP_VERSION=1.0.0
```

## Option 1: Docker Compose (Simple Deployment)

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Run database migrations
docker-compose exec web pnpm run migrate

# Check logs
docker-compose logs -f
```

### Database Migrations

```bash
# Run migrations
pnpm run migrate

# Rollback to previous
pnpm run migrate:rollback
```

## Option 2: Kubernetes Deployment

### Create Kubernetes Manifests

```yaml
# k8s/web-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recall-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: recall-web
  template:
    metadata:
      labels:
        app: recall-web
    spec:
      containers:
      - name: web
        image: ghcr.io/your-org/recall/web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: recall-secrets
              key: database-url
        # ... other env vars from secrets
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 40
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: recall-web
spec:
  selector:
    app: recall-web
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic recall-secrets \
  --from-env-file=.env.production

# Apply manifests
kubectl apply -f k8s/

# Check status
kubectl get deployments
kubectl get pods
```

## Option 3: Cloud Platforms

### Vercel (Next.js optimized)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add SUPABASE_URL
vercel env add DATABASE_URL
# ... etc
```

### Railway

1. Connect GitHub repository
2. Create PostgreSQL service
3. Create Redis service (optional, or use Upstash)
4. Deploy web app with environment variables
5. Set domain/SSL

### Render

1. Connect GitHub repository
2. Create PostgreSQL database
3. Create web service (Docker)
4. Set environment variables
5. Enable auto-deploy on push

## Database Migrations

### Using Drizzle ORM

```bash
# Generate migration
pnpm run db:generate

# Run migrations
pnpm run db:migrate

# Rollback
pnpm run db:rollback
```

### Manual SQL Migrations

Place SQL files in `packages/db/migrations/`:

```sql
-- migrations/001_initial_schema.sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  ...
);
```

## Monitoring & Observability

### Sentry Error Tracking

Add to `apps/web/src/lib/sentry.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
});
```

### Health Checks

```bash
# Check web app
curl https://recall.ai/api/health

# Check worker
# Worker health checks would be via job queue monitoring
```

### Logging

- **Application Logs**: Via docker logs or kubectl logs
- **Database Logs**: PostgreSQL logs
- **Error Tracking**: Sentry
- **Analytics**: PostHog

## Performance Optimization

### Caching

```typescript
// Cache static assets (1 year)
response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');

// Cache dynamic content (5 minutes)
response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
```

### Database

```bash
# Create indexes for performance
CREATE INDEX idx_memories_user_due ON memories(user_id, due_at);
CREATE INDEX idx_memories_status ON memories(status);
```

### CDN Configuration

Use Cloudflare or similar:
- Cache static assets aggressively
- Enable compression (Brotli)
- Enable HTTP/2 Server Push
- Rate limiting at edge

## Backup & Recovery

### Database Backups

```bash
# Automated daily backups via Supabase
# Or manual backup:
pg_dump $DATABASE_URL > backup.sql

# Restore:
psql $DATABASE_URL < backup.sql
```

### Disaster Recovery

- **RTO (Recovery Time Objective)**: < 1 hour
- **RPO (Recovery Point Objective)**: < 1 day
- Test restore procedures monthly

## Security Checklist

- [ ] All environment variables set and secured
- [ ] Database backups automated and tested
- [ ] HTTPS/TLS enabled
- [ ] Security headers verified
- [ ] Rate limiting configured
- [ ] Log aggregation set up
- [ ] Error tracking configured (Sentry)
- [ ] Database encryption at rest
- [ ] OAuth tokens encrypted
- [ ] Monitoring alerts configured

## Scaling

### Horizontal Scaling

```yaml
# Increase web app replicas
kubectl scale deployment recall-web --replicas=5
```

### Vertical Scaling

Increase resource limits in Kubernetes manifests.

### Database Scaling

- Read replicas for scaling reads
- Connection pooling (PgBouncer)
- Caching layer (Redis)

## Rollback Procedure

```bash
# Rollback to previous Docker image
docker service update --image ghcr.io/your-org/recall/web:previous recall_web

# Or via Kubernetes
kubectl rollout undo deployment/recall-web

# Or via Vercel
vercel rollback
```

## Troubleshooting

### Web App Won't Start

```bash
# Check logs
docker logs recall_web

# Check health endpoint
curl http://localhost:3000/api/health
```

### Database Connection Errors

```bash
# Test connection
psql $DATABASE_URL

# Check credentials and firewall rules
```

### Worker Job Queue Issues

```bash
# Check job queue status
SELECT COUNT(*) FROM graphile_worker.jobs WHERE attempts < max_attempts;

# Retry failed jobs
UPDATE graphile_worker.jobs SET attempts = 0;
```

## Support

For deployment issues:
- Check logs with: `docker logs` / `kubectl logs`
- Monitor with Sentry
- Review health endpoint
- Contact deployment platform support
