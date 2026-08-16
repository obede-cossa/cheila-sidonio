-- Run this in the Supabase SQL editor.
-- Without it, the anon key shipped to the browser can delete every gift.

create table if not exists public.gifts (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  description text,
  category    text        not null default 'Casa',
  image_url   text,
  link_url    text,
  price       numeric(10, 2),
  is_reserved boolean     not null default false,
  reserved_at timestamptz,
  created_at  timestamptz not null default now()
);

-- The public list sorts by is_reserved then created_at.
create index if not exists gifts_listing_idx
  on public.gifts (is_reserved, created_at);

alter table public.gifts enable row level security;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------

drop policy if exists "gifts are publicly readable" on public.gifts;
create policy "gifts are publicly readable"
  on public.gifts for select
  to anon, authenticated
  using (true);

-- Writes are restricted to signed-in users (the couple). Guests reserve only
-- through reserve_gift(), which is security definer.
drop policy if exists "couple can insert" on public.gifts;
create policy "couple can insert"
  on public.gifts for insert
  to authenticated
  with check (true);

drop policy if exists "couple can update" on public.gifts;
create policy "couple can update"
  on public.gifts for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "couple can delete" on public.gifts;
create policy "couple can delete"
  on public.gifts for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Atomic reservation
-- ---------------------------------------------------------------------------
-- The WHERE clause is what prevents two guests reserving the same gift at the
-- same time. Doing this as a client-side read-then-update would race.

create or replace function public.reserve_gift(gift_id uuid)
returns public.gifts
language plpgsql
security definer
set search_path = public
as $$
declare
  reserved public.gifts;
begin
  update public.gifts
     set is_reserved = true,
         reserved_at = now()
   where id = gift_id
     and is_reserved = false
  returning * into reserved;

  if not found then
    raise exception 'GIFT_ALREADY_RESERVED'
      using errcode = 'P0001';
  end if;

  return reserved;
end;
$$;

revoke all on function public.reserve_gift(uuid) from public;
grant execute on function public.reserve_gift(uuid) to anon, authenticated;
