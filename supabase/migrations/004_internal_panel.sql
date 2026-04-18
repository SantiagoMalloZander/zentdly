-- Internal panel schema: court types, WhatsApp config, bot prompt

-- Bot prompt on tenants
alter table public.tenants
  add column if not exists bot_prompt       text,
  add column if not exists contact_name     text,
  add column if not exists contact_phone    text,
  add column if not exists address          text;

-- Court types: simplified model for the internal panel
-- Each row = one "type" of court (e.g. "Fútbol 5 - 10 canchas")
create table public.court_types (
  id                     uuid        primary key default gen_random_uuid(),
  tenant_id              uuid        not null references public.tenants(id) on delete cascade,
  sport_name             text        not null,
  slot_duration_minutes  integer     not null default 60,
  open_time              time        not null,
  close_time             time        not null,
  quantity               integer     not null default 1 check (quantity > 0),
  price_per_slot         numeric(10,2),
  days_of_week           integer[]   not null default '{1,2,3,4,5,6,0}', -- 0=Sun 6=Sat
  active                 boolean     not null default true,
  created_at             timestamptz not null default now(),
  constraint court_types_valid_hours check (close_time > open_time)
);
create index court_types_tenant_idx on public.court_types(tenant_id);

-- WhatsApp connection config per tenant
create table public.whatsapp_config (
  id                      uuid        primary key default gen_random_uuid(),
  tenant_id               uuid        not null references public.tenants(id) on delete cascade unique,
  provider                text        not null check (provider in ('evolution', 'meta')),
  connected               boolean     not null default false,

  -- Evolution API
  evolution_api_url       text,
  evolution_api_key       text,
  evolution_instance_name text,

  -- Meta Cloud API
  meta_phone_number_id    text,
  meta_access_token       text,
  meta_verify_token       text,
  meta_app_secret         text,
  meta_business_id        text,

  updated_at              timestamptz not null default now()
);

-- RLS
alter table public.court_types     enable row level security;
alter table public.whatsapp_config enable row level security;

create policy "tenant_isolation" on public.court_types
  using (tenant_id = public.current_tenant_id());

create policy "tenant_isolation" on public.whatsapp_config
  using (tenant_id = public.current_tenant_id());
