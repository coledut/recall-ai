# Recall AI - Production Deployment Guide

**Status:** MVP Ready (85% complete)  
**Build Date:** 2026-09-20  
**Version:** 1.0.0

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier is fine)
- SendGrid account (free tier: 100 emails/day)
- Claude API key (Anthropic)
- Google OAuth credentials (for Gmail/Calendar)
- Slack App credentials (optional, for Slack sync)

### Environment Setup

```bash
# Copy environment variables
cp .env.example .env.local

# Required variables:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key

ANTHROPIC_API_KEY=your-key
GOOGLE_GEMINI_API_KEY=your-key

SENDGRID_API_KEY=your-key
SENDGRID_FROM_EMAIL=noreply@your-domain.com

# Cron security
CRON_SECRET=your-random-secret-string

# OAuth (for Gmail/Calendar/Slack)
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
SLACK_CLIENT_ID=your-id
SLACK_CLIENT_SECRET=your-secret
```

### Database Setup

1. Create Supabase project
2. Run migrations:

```bash
# The following tables need to be created:
# - auth.users (handled by Supabase)
# - memories (extraction results)
# - user_settings (preferences)
# - gmail_credentials (optional, for Gmail sync)

# Run in Supabase SQL editor:
# migrations/add_user_settings.sql
```

### Installation & Running

```bash
# Install dependencies
npm install

# Development
npm run dev
# Open http://localhost:3000

# Production build
npm run build
npm run start
```

## Architecture

### Frontend
- **Next.js 15** + **React 19** + **TypeScript**
- **Tailwind CSS** for styling
- Responsive design (mobile-first)
- Client-side OCR (Tesseract.js)
- Voice recording (browser MediaRecorder API)

### Backend
- **Next.js API Routes** (serverless functions)
- **Supabase PostgreSQL** for data storage
- **Supabase Auth** for user management
- **Claude AI** for memory extraction
- **SendGrid** for email delivery

### External APIs
- Google Gmail/Calendar (OAuth2)
- Slack (OAuth2)
- Anthropic Claude (text generation)
- Google Gemini (text extraction)
- SendGrid (email)

## Core Features

### 1. Universal Capture
- **Quick Text:** Manual entry with AI extraction
- **Voice:** Browser-based recording → transcription
- **Gmail:** OAuth sync → email parsing
- **Calendar:** Google Calendar events → extraction
- **Slack:** Slack messages → capture
- **Files:** Images (OCR) + PDFs → text extraction

### 2. Memory Engine
- **AI Extraction:** Claude AI parses user input
- **Date Parsing:** Converts relative dates to ISO dates
- **Deduplication:** Prevents duplicate memories
- **Prioritization:** High/medium/low priority

### 3. Today View
- **Categorization:**
  - Needs Attention (high priority, no due date)
  - Due Today (due date = today)
  - Coming Up (due in next 7 days)
  - Other (everything else)
- **Sorting:** By due date, created date, priority
- **Search:** Full-text search across title + content

### 4. Ask Recall
- **Conversational Q&A:** Ask questions about your memories
- **Context:** Uses your 50 recent memories as context
- **Citations:** References which memories were used
- **Smart Answers:** Grounded in your actual data

### 5. Daily Brief
- **Scheduled Emails:** Automated daily summary
- **Categorization:** Overdue/Due Today/Coming Up
- **Customizable:** Time, frequency, quiet hours, timezone
- **User Settings:** Full preferences UI

### 6. Notifications
- **In-app Alerts:** Badge counts for urgent items
- **Categorized:** Overdue, Due Today, Coming Up
- **Sorted by Priority:** High priority items first

## API Endpoints

### Memory Operations
- `POST /api/extract` - Extract memory from text
- `GET /api/memories` - List all memories
- `GET /api/search` - Search memories

### Integrations
- `POST /api/gmail/fetch` - Fetch Gmail emails
- `POST /api/calendar/sync` - Sync Google Calendar
- `POST /api/slack/messages` - Fetch Slack messages
- `POST /api/upload` - Upload files with OCR

### AI Features
- `POST /api/ask` - Ask Recall Q&A
- `POST /api/email/daily-brief` - Generate daily brief

### User Management
- `GET /api/user/settings` - Get user preferences
- `PUT /api/user/settings` - Update preferences
- `GET /api/notifications` - Get notifications

### Automation
- `GET /api/cron/daily-brief` - Send scheduled emails

## Deployment to Vercel

### Automatic Deploy
1. Push to GitHub
2. Vercel auto-deploys on push to main branch

### Environment Variables
Set in Vercel dashboard under Project Settings → Environment Variables

### Database Migrations
Manual: Run SQL in Supabase dashboard
OR use Supabase CLI: `supabase db push`

### Cron Setup
Use EasyCron.com or cron-job.org:
- **URL:** `https://your-app.vercel.app/api/cron/daily-brief?secret=[CRON_SECRET]`
- **Frequency:** Hourly (for time-based sending)

## Security Checklist

- [ ] All environment variables set (never in code)
- [ ] CORS configured properly
- [ ] RLS policies verified on all tables
- [ ] Rate limiting configured (optional)
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Database backups enabled (Supabase)
- [ ] Audit logging configured (optional)
- [ ] OAuth scopes minimal (Gmail, Calendar only need readonly)
- [ ] SendGrid API key rotated (if leaked)

## Monitoring & Observability

### Recommended Tools
- **Error Tracking:** Sentry.io (free tier available)
- **Analytics:** PostHog (open source available)
- **Monitoring:** Vercel Analytics (built-in)
- **Database:** Supabase Studio dashboard

### Key Metrics to Track
- API response times
- Error rates by endpoint
- Memory extraction success rate
- Email delivery rate
- User session duration
- Storage usage (Supabase)

## Troubleshooting

### Common Issues

**"Unauthorized" errors**
- Check auth token is valid
- Verify SUPABASE_ANON_KEY is correct
- Check RLS policies allow the operation

**Memory not extracting**
- Check GOOGLE_GEMINI_API_KEY or ANTHROPIC_API_KEY
- Verify API quota not exceeded
- Check API response in server logs

**Emails not sending**
- Check SENDGRID_API_KEY is valid
- Verify SENDGRID_FROM_EMAIL is whitelisted
- Check SendGrid dashboard for bounce/spam reports
- Ensure CRON_SECRET is set for cron endpoint

**OAuth failures**
- Check OAuth credentials in Supabase
- Verify redirect URLs match exactly
- Check browser console for error details

## Performance Optimization

### Database
- Add indexes on frequently queried columns (user_id, created_at)
- Use pagination on memory lists (avoid SELECT *)
- Archive old memories after 2+ years

### Frontend
- Enable next/image optimization
- Use dynamic imports for large components
- Implement pagination on Today view

### API
- Cache extraction results (avoid re-extracting)
- Implement request deduplication
- Rate limit API calls to external services

## Scaling Considerations

Current setup handles ~1000 active users:

**Database:** Supabase generous free tier (500MB storage, unlimited API calls)
**Compute:** Vercel serverless (auto-scales, free tier includes generous allowance)
**Email:** SendGrid free tier (100/day) → upgrade as needed
**Storage:** Consider AWS S3 when file storage exceeds Supabase limits

### When to Upgrade
- Memory table > 100k rows → add indexes
- Email volume > 5k/day → SendGrid paid plan
- Concurrent users > 100 → monitor latency
- Daily API calls > 1M → implement caching

## Maintenance Tasks

### Weekly
- Monitor error rates in Sentry/logs
- Check SendGrid bounce rate
- Review memory extraction quality

### Monthly
- Review usage metrics (storage, API calls)
- Update dependencies (npm audit)
- Check for security advisories

### Quarterly
- Performance benchmarking
- User feedback review
- Feature prioritization

## Support & Resources

- **Documentation:** See /docs folder
- **Issues:** GitHub issues for bugs
- **Features:** GitHub discussions for requests
- **API Docs:** See inline API route comments

## License

MIT License - see LICENSE file

---

**Last Updated:** 2026-09-20  
**Next Review:** 2026-10-20
