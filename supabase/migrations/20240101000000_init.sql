-- Create tables based on cdc.md

-- Establishments
create table public.establishments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  owner_email text not null,
  phone text,
  address text,
  subscription_status text default 'trial',
  trial_ends_at timestamp with time zone
);

-- Clients
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  establishment_id uuid references public.establishments(id) not null,
  name text not null,
  phone text,
  email text
);

-- Repairs
create type repair_status as enum ('nouveau', 'diagnostic', 'en_reparation', 'pret_recup', 'recupere', 'annule');

create table public.repairs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  establishment_id uuid references public.establishments(id) not null,
  client_id uuid references public.clients(id) not null,
  code varchar(12) not null unique,
  item text not null,
  description text,
  status repair_status default 'nouveau',
  ready_at timestamp with time zone,
  price decimal(10,2),
  paid boolean default false,
  photos text[] -- Array of URLs
);

-- Payments
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  establishment_id uuid references public.establishments(id) not null,
  stripe_id text,
  amount decimal(10,2),
  status text
);

-- Enable RLS
alter table public.establishments enable row level security;
alter table public.clients enable row level security;
alter table public.repairs enable row level security;
alter table public.payments enable row level security;
