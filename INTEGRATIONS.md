# Recall AI Integrations

Enable Recall AI to work with millions of apps via webhooks and pre-built integrations.

## Quick Start

### 1. Webhooks

Send real-time events to your systems.

```bash
# Create a webhook
curl -X POST https://recall-ai.vercel.app/api/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://your-app.com/webhook",
    "events": ["memory.created", "memory.completed"],
    "active": true
  }'
```

### 2. Available Events

- `memory.created` - New memory captured
- `memory.completed` - Memory marked complete
- `memory.updated` - Memory edited
- `memory.deleted` - Memory deleted
- `person.added` - New person tracked
- `person.updated` - Person info updated
- `team.member.added` - Team member invited
- `team.member.removed` - Team member removed
- `email.sent` - Daily brief sent

### 3. Webhook Payload

```json
{
  "event": "memory.created",
  "timestamp": "2026-09-20T10:30:00Z",
  "user_id": "user-uuid",
  "data": {
    "id": "memory-uuid",
    "title": "Meeting with Sarah",
    "content": "Discuss Q4 strategy",
    "priority": "high",
    "due_date": "2026-09-22"
  }
}
```

## Zapier Integration

### Triggers

**New Memory Created**
- Triggered when user captures a new memory
- Fields: ID, Title, Content, Priority, Due Date

**Memory Completed**
- Triggered when memory is marked complete
- Fields: ID, Title, Completed At

### Actions

**Create Memory**
```
Input: Title, Content, Priority, Due Date
Output: Created memory object
```

**Mark Memory Complete**
```
Input: Memory ID
Output: Updated memory object
```

**Get Memories**
```
Input: Status (optional), Limit
Output: Array of memories
```

### Setup

1. Search for "Recall AI" in Zapier
2. Authorize with your account
3. Create a Zap with any trigger/action
4. Example: Gmail → Create Memory in Recall AI

## Make Integration

### Available Modules

**New Memory Trigger**
- Monitors for new memories
- Use in any Make scenario

**Create Memory**
- Build custom automation
- Set title, content, priority, due date

**Get Memories**
- Retrieve existing memories
- Filter by status

### Setup

1. Add module in Make
2. Search "Recall AI"
3. Select trigger or action
4. Connect your account
5. Test & activate

## API Reference

### Webhooks

```
POST /api/webhooks
GET /api/webhooks
DELETE /api/webhooks/:id
```

### Zapier

```
GET /api/integrations/zapier?trigger=new_memory
GET /api/integrations/zapier?trigger=actions
POST /api/integrations/zapier
```

### Teams

```
GET /api/teams
POST /api/teams
GET /api/teams/:id/apikey
POST /api/teams/:id/apikey
```

## Popular Use Cases

### 1. Gmail → Recall AI
- Trigger: New email from boss
- Action: Create memory in Recall AI
- Benefit: Auto-capture important emails

### 2. Calendar → Recall AI
- Trigger: Calendar event 1 hour before
- Action: Create memory with event details
- Benefit: Prepare for meetings

### 3. Slack → Recall AI
- Trigger: Mention in important channel
- Action: Save to Recall AI
- Benefit: Archive important discussions

### 4. Recall AI → Google Sheets
- Trigger: Memory completed
- Action: Add row to Sheet
- Benefit: Track completions

### 5. Recall AI → Slack
- Trigger: Memory with high priority
- Action: Post to Slack channel
- Benefit: Team visibility

### 6. Recall AI → Email
- Trigger: Memory with due date today
- Action: Send email reminder
- Benefit: Daily reminders

## Webhook Signature Verification

All webhooks include an `X-Recall-Signature` header.

```javascript
function verifySignature(payload, signature) {
  const hash = crypto
    .createHmac('sha256', YOUR_WEBHOOK_SECRET)
    .update(payload)
    .digest('base64');
  return `sha256=${hash}` === signature;
}
```

## Rate Limits

- Webhooks: Unlimited (fire and forget)
- API calls: Per plan (100/month free, 10k/month pro)
- Retry policy: Up to 10 retries over 24 hours

## Support

- Docs: https://recall-ai.vercel.app/docs
- API Status: https://status.recall-ai.vercel.app
- Support: support@recall-ai.app

---

Built for integration. Ready to scale. 🚀
