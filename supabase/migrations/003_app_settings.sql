-- Key-value store for app-level configuration (credentials, tokens, etc.)
-- Values are stored encrypted at rest via Supabase vault or as plaintext for non-sensitive config.
-- In production, rotate any secrets stored here regularly.

create table public.app_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- Seed default empty rows so the settings page always has rows to upsert into
insert into public.app_settings (key, value) values
  ('tenant_name', ''),
  ('tenant_timezone', 'America/Argentina/Buenos_Aires'),
  ('whatsapp_phone_number_id', ''),
  ('whatsapp_access_token', ''),
  ('whatsapp_verify_token', ''),
  ('meta_app_secret', ''),
  ('openai_api_key', ''),
  ('google_client_email', ''),
  ('google_private_key', ''),
  ('google_sheets_spreadsheet_id', ''),
  ('google_calendar_id', ''),
  ('default_tenant_id', '')
on conflict (key) do nothing;
