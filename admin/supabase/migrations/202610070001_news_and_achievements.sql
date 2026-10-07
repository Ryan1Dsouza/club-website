create table live_news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  image_url text,
  date text,
  created_at timestamptz not null default now()
);

create table achievements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  result text not null,
  year text not null,
  description text not null default '',
  href text,
  created_at timestamptz not null default now()
);

create table achievement_members (
  achievement_id uuid references achievements(id) on delete cascade not null,
  member_id text references team_members(id) on delete cascade not null,
  primary key (achievement_id, member_id)
);

-- Enable RLS
alter table live_news enable row level security;
alter table achievements enable row level security;
alter table achievement_members enable row level security;

-- Public read access
create policy "Public live_news are viewable by everyone." on live_news for select using (true);
create policy "Public achievements are viewable by everyone." on achievements for select using (true);
create policy "Public achievement_members are viewable by everyone." on achievement_members for select using (true);

-- Authenticated write access
create policy "Authenticated users can insert live_news" on live_news for insert to authenticated with check (true);
create policy "Authenticated users can update live_news" on live_news for update to authenticated using (true);
create policy "Authenticated users can delete live_news" on live_news for delete to authenticated using (true);

create policy "Authenticated users can insert achievements" on achievements for insert to authenticated with check (true);
create policy "Authenticated users can update achievements" on achievements for update to authenticated using (true);
create policy "Authenticated users can delete achievements" on achievements for delete to authenticated using (true);

create policy "Authenticated users can insert achievement_members" on achievement_members for insert to authenticated with check (true);
create policy "Authenticated users can delete achievement_members" on achievement_members for delete to authenticated using (true);
