-- Premium Features Schema

-- Teams table
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  plan text default 'free', -- free, pro, enterprise
  api_key text unique default gen_random_uuid()::text,
  api_key_created_at timestamp default now(),
  members_count integer default 1,
  storage_gb integer default 1,
  max_api_calls_monthly integer default 1000,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Team members
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text default 'member', -- owner, admin, member, viewer
  joined_at timestamp default now(),
  unique(team_id, user_id)
);

-- Shared memories
create table if not exists memory_shares (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references memories(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  shared_by uuid not null references auth.users(id),
  shared_at timestamp default now(),
  is_public boolean default false
);

-- Comments on memories
create table if not exists memory_comments (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references memories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- API usage tracking
create table if not exists api_usage (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  endpoint text,
  calls_count integer default 1,
  month text, -- YYYY-MM format
  created_at timestamp default now()
);

-- Enable RLS
alter table teams enable row level security;
alter table team_members enable row level security;
alter table memory_shares enable row level security;
alter table memory_comments enable row level security;
alter table api_usage enable row level security;

-- RLS Policies
create policy "Users can view their teams"
  on teams using (auth.uid() = owner_id OR auth.uid() in (select user_id from team_members where team_id = id));

create policy "Users can view team members"
  on team_members using (auth.uid() in (select owner_id from teams where id = team_id) OR auth.uid() = user_id);

create policy "Users can view memory shares for their team"
  on memory_shares using (auth.uid() in (select user_id from team_members where team_id = memory_shares.team_id));

create policy "Users can comment on shared memories"
  on memory_comments using (auth.uid() = user_id);

-- Indexes
create index idx_team_members_team_id on team_members(team_id);
create index idx_team_members_user_id on team_members(user_id);
create index idx_memory_shares_team_id on memory_shares(team_id);
create index idx_api_usage_team_id on api_usage(team_id);
