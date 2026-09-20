-- Integrations & Webhooks Schema

-- Webhooks table
create table if not exists webhooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  events text[] default array['memory.created', 'memory.completed'],
  active boolean default true,
  failed_count integer default 0,
  last_triggered_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Integration connections
create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, -- zapier, make, slack, discord, etc
  name text,
  access_token text,
  refresh_token text,
  config jsonb default '{}',
  active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- API logs for monitoring
create table if not exists api_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  endpoint text,
  method text,
  status_code integer,
  response_time_ms integer,
  error_message text,
  created_at timestamp default now()
);

-- Enable RLS
alter table webhooks enable row level security;
alter table integrations enable row level security;
alter table api_logs enable row level security;

-- RLS Policies
create policy "Users can manage their webhooks"
  on webhooks using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their integrations"
  on integrations using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Teams can view their API logs"
  on api_logs using (auth.uid() in (select user_id from team_members where team_id = api_logs.team_id));

-- Indexes
create index idx_webhooks_user_id on webhooks(user_id);
create index idx_webhooks_active on webhooks(active);
create index idx_integrations_user_id on integrations(user_id);
create index idx_integrations_provider on integrations(provider);
create index idx_api_logs_team_id on api_logs(team_id);
create index idx_api_logs_created_at on api_logs(created_at);
