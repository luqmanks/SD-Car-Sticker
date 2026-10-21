-- SD Car Sticker schema. Run once in Supabase Dashboard > SQL Editor.
-- All access goes through Next.js route handlers using the secret key, so RLS is
-- enabled with no policies: the publishable (anon) key cannot read or write anything.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  pin_hash      text,
  phone_number  text,
  created_at    timestamptz not null default now()
);

-- Migration for databases created by earlier versions (safe to re-run):
alter table public.users drop column if exists telegram_chat_id;
alter table public.users drop column if exists telegram_link_token;
alter table public.users drop column if exists callmebot_apikey;

create table if not exists public.cars (
  plate_number text primary key,
  user_id      uuid not null references public.users(id) on delete cascade,
  car_status   boolean not null default false,
  activated_at timestamptz,
  nfc_code     uuid not null unique default gen_random_uuid(),
  created_at   timestamptz not null default now()
);
create index if not exists cars_user_id_idx on public.cars(user_id);

-- One row per SMS / call attempt. Used for rate limiting and an audit trail.
create table if not exists public.scan_events (
  id           bigint generated always as identity primary key,
  plate_number text not null,
  kind         text not null,
  alert_type   text,
  status       text not null,
  detail       text,
  created_at   timestamptz not null default now()
);
alter table public.scan_events drop constraint if exists scan_events_kind_check;

create index if not exists scan_events_plate_kind_idx on public.scan_events(plate_number, kind, created_at desc);

alter table public.users       enable row level security;
alter table public.cars        enable row level security;
alter table public.scan_events enable row level security;
