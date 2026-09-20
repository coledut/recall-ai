import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  real,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  vector,
  customType,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums - per spec section 10/13
export const memoryTypeEnum = pgEnum('memory_type', [
  'COMMITMENT',
  'FOLLOW_UP',
  'DEADLINE',
  'WAITING_FOR',
  'DECISION',
  'TASK',
  'IMPORTANT_FACT',
]);

export const memoryStatusEnum = pgEnum('memory_status', [
  'DETECTED',
  'OPEN',
  'DUE_SOON',
  'DUE',
  'OVERDUE',
  'COMPLETED',
  'DISMISSED',
  'SNOOZED',
  'ARCHIVED',
  'CANCELLED',
]);

export const sourceTypeEnum = pgEnum('source_type', [
  'GMAIL',
  'CALENDAR',
  'QUICK_CAPTURE',
  'VOICE',
  'FILE',
  'IMAGE',
  'FORWARD',
]);

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

// Users table (via Supabase Auth, but we maintain our own profile record)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  locale: text('locale').default('en-IN'),
  timezone: text('timezone').default('Asia/Kolkata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Workspaces for future Team Recall support (section 33)
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Core memories table - per spec section 5/11
export const memories = pgTable(
  'memories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    workspaceId: uuid('workspace_id').references(() => workspaces.id),
    type: memoryTypeEnum('type').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    personId: uuid('person_id').references(() => people.id),
    personRaw: text('person_raw'), // Unresolved name
    dueAt: timestamp('due_at', { withTimezone: true }),
    status: memoryStatusEnum('status').default('DETECTED').notNull(),
    importance: text('importance').default('MEDIUM'), // LOW, MEDIUM, HIGH
    confidence: real('confidence').notNull(),
    language: text('language').default('en'), // ISO 639-1
    sourceType: sourceTypeEnum('source_type').notNull(),
    sourceRef: text('source_ref').notNull(), // External ID / thread ID
    sourceExcerpt: text('source_excerpt').notNull(), // Provenance - non-negotiable per spec
    sourceUrl: text('source_url'),
    embedding: vector('embedding', { dimensions: 1536 }), // For semantic search
    dedupeHash: text('dedupe_hash').notNull(),
    parentMemoryId: uuid('parent_memory_id').references(() => memories.id), // For merge tracking
    detectedAt: timestamp('detected_at', { withTimezone: true }).defaultNow().notNull(),
    extractedAt: timestamp('extracted_at', { withTimezone: true }).defaultNow().notNull(),
    snoozedUntil: timestamp('snoozed_until', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    dismissedAt: timestamp('dismissed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('memories_user_id_idx').on(table.userId),
    index('memories_status_idx').on(table.status),
    index('memories_due_at_idx').on(table.dueAt),
    index('memories_person_id_idx').on(table.personId),
    uniqueIndex('memories_user_source_ref_idx').on(table.userId, table.sourceRef),
    index('memories_search_idx').on(sql`to_tsvector('english', ${table.title} || ' ' || ${table.summary})`),
  ]
);

// People - lightweight people management per spec section 16
export const people = pgTable(
  'people',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    emails: text('emails').array(),
    phone: text('phone'),
    lastInteractionAt: timestamp('last_interaction_at', { withTimezone: true }),
    openMemoryCount: integer('open_memory_count').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('people_user_id_idx').on(table.userId),
    uniqueIndex('people_user_normalized_name_idx').on(table.userId, table.normalizedName),
  ]
);

// OAuth connections - per spec section 17/29
export const oauthConnections = pgTable(
  'oauth_connections',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'google', 'outlook', etc.
    scopes: text('scopes').array().notNull(),
    accessToken: text('access_token').notNull(), // Encrypted
    refreshToken: text('refresh_token'), // Encrypted
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    status: text('status').default('active').notNull(), // active, revoked, expired
    connectedAt: timestamp('connected_at', { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [
    index('oauth_connections_user_id_idx').on(table.userId),
    uniqueIndex('oauth_connections_user_provider_idx').on(table.userId, table.provider),
  ]
);

// AI usage tracking - per spec section 13/24
export const aiUsage = pgTable(
  'ai_usage',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    capability: text('capability').notNull(), // 'extractMemory', 'answerQuery', etc.
    provider: text('provider').notNull(), // 'anthropic', 'openai', etc.
    model: text('model').notNull(),
    inputTokens: integer('input_tokens').notNull(),
    outputTokens: integer('output_tokens').notNull(),
    costUsdEstimate: real('cost_usd_estimate').notNull(),
    latencyMs: integer('latency_ms').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('ai_usage_user_id_idx').on(table.userId),
    index('ai_usage_capability_idx').on(table.capability),
    index('ai_usage_created_at_idx').on(table.createdAt),
  ]
);

// Raw capture events - evidence storage per spec section 5/12
export const captureSources = pgTable(
  'capture_sources',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sourceType: sourceTypeEnum('source_type').notNull(),
    externalId: text('external_id').notNull(),
    contentPointer: text('content_pointer'), // Reference to Supabase Storage
    contentHash: text('content_hash').notNull(),
    receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('capture_sources_user_id_idx').on(table.userId),
    index('capture_sources_external_id_idx').on(table.externalId),
    uniqueIndex('capture_sources_user_external_id_idx').on(table.userId, table.externalId),
  ]
);

// Background job tracking - via graphile-worker tables (created by graphile-worker library)
// We reference it here for documentation

// Notification preferences - per spec section 21
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  emailDigestFrequency: text('email_digest_frequency').default('daily'), // daily, weekly, off
  pushNotificationsEnabled: boolean('push_notifications_enabled').default(true),
  quietHourStart: text('quiet_hour_start'), // HH:mm format, timezone-aware via user.timezone
  quietHourEnd: text('quiet_hour_end'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Push subscriptions - Web Push Protocol subscriptions for browser notifications
export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(), // Web Push endpoint URL
    auth: text('auth').notNull(), // Subscription auth secret (encrypted)
    p256dh: text('p256dh').notNull(), // Client public key (encrypted)
    userAgent: text('user_agent'), // For debugging duplicate subscriptions
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  },
  (table) => [
    index('push_subscriptions_user_id_idx').on(table.userId),
    uniqueIndex('push_subscriptions_endpoint_idx').on(table.endpoint),
  ]
);

// RLS policies are enforced at the database level via Supabase
// See migrations/ for the actual RLS setup
// Key principle per spec 18: every user_id column enforces RLS
