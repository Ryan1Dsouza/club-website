-- 202610070002_recruitment.sql

-- Site settings for global flags
create table site_settings (
  id integer primary key check(id = 1),
  recruitment_open boolean not null default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Initialize settings
insert into site_settings (id, recruitment_open) values (1, false);

alter table site_settings enable row level security;
-- Admins can update, everyone can read
create policy "Allow public read-access on site_settings" on site_settings for select using (true);
create policy "Allow admins to update site_settings" on site_settings for update using (auth.role() = 'authenticated' and (select public.is_admin()));

-- Recruitment Forms Table
create table recruitment_forms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  domain text not null,
  year text not null,
  motivation text not null,
  portfolio text,
  linkedin text,
  github text,
  leetcode text,
  status text not null default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table recruitment_forms enable row level security;

-- Authenticated users (via Google OAuth) can insert their own forms, and read their own.
-- Note: the application logic will enforce sjec.ac.in on the frontend, but we can also add a check constraint.
alter table recruitment_forms add constraint check_email_domain check (email like '%@sjec.ac.in');

create policy "Allow authenticated users to insert their form" on recruitment_forms for insert with check (auth.role() = 'authenticated' and auth.jwt()->>'email' = email);
create policy "Allow authenticated users to read their form" on recruitment_forms for select using (auth.role() = 'authenticated' and auth.jwt()->>'email' = email);

-- Admins can read and update all forms
create policy "Allow admins to read all forms" on recruitment_forms for select using (auth.role() = 'authenticated' and (select public.is_admin()));
create policy "Allow admins to update forms" on recruitment_forms for update using (auth.role() = 'authenticated' and (select public.is_admin()));

