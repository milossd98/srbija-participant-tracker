-- Klijenti
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  company text,
  phone text,
  notes text,
  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Više Google Drive linkova po klijentu (naziv + datum)
create table if not exists public.client_drive_links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  label text not null,
  url text not null,
  link_date date not null default (current_date),
  created_at timestamptz not null default now()
);

create index if not exists client_drive_links_client_id_idx
  on public.client_drive_links (client_id);

alter table public.clients enable row level security;
alter table public.client_drive_links enable row level security;

-- Zameni sa restriktivnim politikama kada dodaš auth (npr. auth.uid()).
create policy "clients_all" on public.clients for all using (true) with check (true);
create policy "client_drive_links_all" on public.client_drive_links for all using (true) with check (true);
