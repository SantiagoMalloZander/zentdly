-- Add court_type_id to reservations (simplified model, replaces venue/court/sport FKs)
alter table public.reservations
  add column if not exists court_type_id uuid references public.court_types(id) on delete set null,
  alter column venue_id  drop not null,
  alter column court_id  drop not null,
  alter column sport_id  drop not null;

create index if not exists reservations_court_type_idx on public.reservations(court_type_id);
create index if not exists reservations_tenant_starts_idx on public.reservations(tenant_id, starts_at);
