-- Add user settings table for email preferences
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Email preferences
  email_daily_brief boolean default true,
  daily_brief_time text default '08:00', -- HH:MM format, UTC
  daily_brief_frequency text default 'daily', -- daily, weekdays, weekly
  timezone text default 'UTC',
  quiet_hours_enabled boolean default false,
  quiet_hours_start text default '21:00', -- HH:MM format
  quiet_hours_end text default '08:00', -- HH:MM format

  -- Push notifications
  notifications_enabled boolean default true,

  -- Created/updated
  created_at timestamp default now(),
  updated_at timestamp default now(),

  unique(user_id)
);

-- Enable RLS
alter table user_settings enable row level security;

-- RLS Policy: Users can only read/write their own settings
create policy "Users can manage their own settings"
  on user_settings
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create trigger to update updated_at
create or replace function update_user_settings_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_settings_timestamp
  before update on user_settings
  for each row
  execute function update_user_settings_timestamp();
