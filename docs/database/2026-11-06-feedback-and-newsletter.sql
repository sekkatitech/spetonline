-- SPET Online: website feedback and newsletter sign-ups, 6 November 2026
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste all of this > Run.
-- It adds the feedback table and upgrades the existing newsletter table in place (keeping
-- every row). Running it twice is safe. Applied to the live database on 6 November 2026.
--
-- Who can see what:
--   * Visitors never read or write these tables directly. The forms post to the server
--     functions /api/feedback and /api/newsletter, which write with the service role.
--   * Admins (public.is_admin(), already in the database) can read both tables in the admin
--     page and change a feedback item's status and note.

begin;

-- 1. Feedback ---------------------------------------------------------------------------
create table if not exists public.site_feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  reason      text check (reason in ('browsing', 'buying', 'comparing_prices', 'testing')),
  ease        smallint check (ease between 1 and 5),          -- 1 very easy … 5 very difficult
  topic       text not null check (topic in ('suggestion', 'technical_problem', 'product_request', 'other')),
  message     text not null check (char_length(message) between 3 and 2000),
  email       text check (email is null or char_length(email) <= 254),
  page_path   text check (page_path is null or char_length(page_path) <= 500),
  device      text check (device in ('mobile', 'tablet', 'desktop')),
  source      text not null default 'widget' check (source in ('widget', 'tester_page')),
  status      text not null default 'new' check (status in ('new', 'reviewing', 'resolved')),
  admin_note  text check (admin_note is null or char_length(admin_note) <= 2000)
);

create index if not exists site_feedback_status_idx  on public.site_feedback (status, created_at desc);
create index if not exists site_feedback_created_idx on public.site_feedback (created_at desc);

alter table public.site_feedback enable row level security;

drop policy if exists site_feedback_admin_read   on public.site_feedback;
drop policy if exists site_feedback_admin_update on public.site_feedback;

create policy site_feedback_admin_read on public.site_feedback
  for select to authenticated
  using (public.is_admin());

create policy site_feedback_admin_update on public.site_feedback
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Admins may only move the status and write a note; what the visitor sent stays as sent.
create or replace function public.site_feedback_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.reason    := old.reason;
    new.ease      := old.ease;
    new.topic     := old.topic;
    new.message   := old.message;
    new.email     := old.email;
    new.page_path := old.page_path;
    new.device    := old.device;
    new.source    := old.source;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists site_feedback_guard on public.site_feedback;
create trigger site_feedback_guard
  before update on public.site_feedback
  for each row execute function public.site_feedback_guard();

-- 2. Newsletter subscribers -------------------------------------------------------------
-- One row per email address. It keeps the proof of consent the Information Regulator
-- expects: the exact wording agreed to, where and when, and when the address confirmed.
--
-- The table may already exist: the old homepage "Deals by email" form wrote to it straight
-- from the browser, with no consent box and no confirmation email. This section upgrades it
-- in place and keeps every row. Those earlier sign-ups become status 'legacy': kept, but
-- never counted as confirmed or exported for mailing. If one of them signs up again through
-- the new form, they get a confirmation email like anyone else.

create table if not exists public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  created_at  timestamptz not null default now()
);

alter table public.newsletter_subscribers
  add column if not exists status                 text,
  add column if not exists consent_text           text,
  add column if not exists consent_source         text,
  add column if not exists consent_page           text,
  add column if not exists consented_at           timestamptz,
  add column if not exists confirm_token_hash     text,
  add column if not exists confirm_sent_at        timestamptz,
  add column if not exists confirmed_at           timestamptz,
  add column if not exists unsubscribe_token_hash text,
  add column if not exists unsubscribed_at        timestamptz,
  add column if not exists created_at             timestamptz default now(),
  add column if not exists updated_at             timestamptz default now();

-- Old checks and required columns from the earlier form (for example a required `source`)
-- would block the new sign-ups, so they are relaxed here and the new rules added below.
do $$
declare
  c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.newsletter_subscribers'::regclass and contype = 'c'
  loop
    execute format('alter table public.newsletter_subscribers drop constraint %I', c.conname);
  end loop;

  for c in
    select column_name from information_schema.columns
    where table_schema = 'public' and table_name = 'newsletter_subscribers'
      and is_nullable = 'NO' and column_default is null
      and column_name not in ('id', 'email')
  loop
    execute format('alter table public.newsletter_subscribers alter column %I drop not null', c.column_name);
  end loop;
end;
$$;

-- Earlier sign-ups: no consent box, never confirmed.
update public.newsletter_subscribers
set status         = 'legacy',
    consent_text   = 'Signed up on the old homepage form before 6 November 2026: no consent box and no confirmation email.',
    consent_source = 'homepage_legacy',
    consented_at   = coalesce(created_at, now()),
    confirmed_at   = null
where status is null or status not in ('pending', 'confirmed', 'unsubscribed', 'legacy');

update public.newsletter_subscribers set consented_at = coalesce(created_at, now()) where consented_at is null;
update public.newsletter_subscribers set consent_text = 'Unknown' where consent_text is null;
update public.newsletter_subscribers set consent_source = 'homepage_legacy' where consent_source is null;
update public.newsletter_subscribers set created_at = now() where created_at is null;
update public.newsletter_subscribers set updated_at = now() where updated_at is null;

alter table public.newsletter_subscribers
  alter column status        set default 'pending',
  alter column status        set not null,
  alter column consent_text  set not null,
  alter column consent_source set not null,
  alter column consented_at  set default now(),
  alter column consented_at  set not null,
  alter column created_at    set not null,
  alter column updated_at    set not null;

alter table public.newsletter_subscribers
  add constraint newsletter_subscribers_status_check
    check (status in ('pending', 'confirmed', 'unsubscribed', 'legacy')),
  add constraint newsletter_subscribers_source_check
    check (consent_source in ('footer_band', 'side_panel', 'tester_page', 'homepage_legacy')),
  add constraint newsletter_subscribers_email_length
    check (char_length(email) <= 254),
  add constraint newsletter_subscribers_page_length
    check (consent_page is null or char_length(consent_page) <= 500);

-- One row per address, ignoring capitals. Skipped (with a notice) if the old data already
-- holds the same address twice in different capitals; the sign-up code copes either way.
do $$
begin
  if not exists (
    select 1 from public.newsletter_subscribers group by lower(email) having count(*) > 1
  ) then
    create unique index if not exists newsletter_subscribers_email_lower_key
      on public.newsletter_subscribers (lower(email));
  else
    raise notice 'Some addresses appear more than once; the case-insensitive unique index was not created.';
    create index if not exists newsletter_subscribers_email_lower_idx
      on public.newsletter_subscribers (lower(email));
  end if;
end;
$$;

create index if not exists newsletter_subscribers_confirm_idx on public.newsletter_subscribers (confirm_token_hash);
create index if not exists newsletter_subscribers_unsub_idx   on public.newsletter_subscribers (unsubscribe_token_hash);

-- Only the server function writes; only admins read. This removes whatever rules the old
-- form relied on, including the one that let anyone add rows straight from the browser.
alter table public.newsletter_subscribers enable row level security;

do $$
declare
  p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'newsletter_subscribers'
  loop
    execute format('drop policy %I on public.newsletter_subscribers', p.policyname);
  end loop;
end;
$$;

create policy newsletter_subscribers_admin_read on public.newsletter_subscribers
  for select to authenticated
  using (public.is_admin());

commit;
