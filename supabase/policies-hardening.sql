-- Run after supabase/schema.sql. Safe to run more than once.
--
-- Fixes two things:
--   1. Columns the app selects that an older table may not have.
--   2. Policies that granted every write to any `authenticated` user. Supabase
--      allows public signup by default, so that meant a stranger could register
--      and delete the whole list.

-- ---------------------------------------------------------------------------
-- 1. Reconcile the table with lib/types.ts
-- ---------------------------------------------------------------------------

alter table public.gifts add column if not exists description text;
alter table public.gifts add column if not exists category    text not null default 'Casa';
alter table public.gifts add column if not exists image_url   text;
alter table public.gifts add column if not exists link_url    text;
alter table public.gifts add column if not exists price       numeric(10, 2);
alter table public.gifts add column if not exists is_reserved boolean not null default false;
alter table public.gifts add column if not exists reserved_at timestamptz;
alter table public.gifts add column if not exists created_at  timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- 2. Allowlist of accounts allowed to manage the list
-- ---------------------------------------------------------------------------

create table if not exists public.gift_owners (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

alter table public.gift_owners enable row level security;

-- Nobody reads or writes this table from the client. Manage it here in SQL.
drop policy if exists "owners readable by owners" on public.gift_owners;
create policy "owners readable by owners"
  on public.gift_owners for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.is_gift_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.gift_owners where user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. Replace the blanket `authenticated` write policies
-- ---------------------------------------------------------------------------

drop policy if exists "couple can insert" on public.gifts;
create policy "owners can insert"
  on public.gifts for insert
  to authenticated
  with check (public.is_gift_owner());

drop policy if exists "couple can update" on public.gifts;
create policy "owners can update"
  on public.gifts for update
  to authenticated
  using (public.is_gift_owner())
  with check (public.is_gift_owner());

drop policy if exists "couple can delete" on public.gifts;
create policy "owners can delete"
  on public.gifts for delete
  to authenticated
  using (public.is_gift_owner());

-- ---------------------------------------------------------------------------
-- 4. Enrol the couple
-- ---------------------------------------------------------------------------
-- Create the account first in Dashboard -> Authentication -> Users -> Add user
-- (tick "Auto Confirm User"), then run this with that email.

insert into public.gift_owners (user_id)
select id from auth.users where email = 'noivos@example.com'
on conflict (user_id) do nothing;

-- Verify. Should return one row.
select u.email, o.added_at
  from public.gift_owners o
  join auth.users u on u.id = o.user_id;

-- ---------------------------------------------------------------------------
-- 5. Sanity checks for the empty-list problem
-- ---------------------------------------------------------------------------

-- Is there actually data?
select count(*) as total, count(*) filter (where is_reserved) as reserved
  from public.gifts;

-- Can an anonymous visitor read it? Should return rows, not an error.
set local role anon;
select id, title from public.gifts limit 5;
reset role;
