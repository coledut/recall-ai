-- People tracking table
create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Basic info
  name text not null,
  email text,
  phone text,
  company text,
  role text,

  -- Tracking
  first_contact_date timestamp default now(),
  last_contact_date timestamp default now(),
  interaction_count integer default 1,

  -- Relationship
  relationship text default 'contact', -- contact, colleague, mentor, friend, lead, investor, etc
  priority text default 'medium', -- high, medium, low

  -- Notes
  notes text,

  created_at timestamp default now(),
  updated_at timestamp default now(),

  constraint unique_person_per_user unique(user_id, name)
);

-- Enable RLS
alter table people enable row level security;

-- RLS Policy: Users can only access their own people
create policy "Users can manage their own people"
  on people
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create trigger to update updated_at
create or replace function update_people_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_people_timestamp
  before update on people
  for each row
  execute function update_people_timestamp();

-- Link memories to people (many-to-many)
create table if not exists memory_people (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references memories(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  created_at timestamp default now(),

  constraint unique_memory_person unique(memory_id, person_id)
);

-- Enable RLS on junction table
alter table memory_people enable row level security;

-- RLS Policy: Users can only link people to their own memories
create policy "Users can link their people to their memories"
  on memory_people
  using (
    exists (
      select 1 from memories m
      where m.id = memory_people.memory_id
      and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from memories m
      where m.id = memory_people.memory_id
      and m.user_id = auth.uid()
    )
  );

-- Index for faster queries
create index if not exists idx_people_user_id on people(user_id);
create index if not exists idx_people_last_contact on people(user_id, last_contact_date);
create index if not exists idx_memory_people_memory_id on memory_people(memory_id);
create index if not exists idx_memory_people_person_id on memory_people(person_id);
