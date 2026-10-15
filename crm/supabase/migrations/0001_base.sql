-- Perfil do profissional (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  whatsapp text,
  criado_em timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nome text not null,
  whatsapp text,
  observacoes text,
  criado_em timestamptz not null default now()
);
create index on public.clients (user_id, nome);

create type public.appointment_status as enum ('agendado', 'concluido', 'cancelado', 'faltou');

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  servico text not null,
  inicio timestamptz not null,
  duracao_min int not null default 60 check (duracao_min > 0),
  valor numeric(10,2),
  status public.appointment_status not null default 'agendado',
  observacoes text,
  criado_em timestamptz not null default now()
);
create index on public.appointments (user_id, inicio);
create index on public.appointments (client_id, inicio desc);

-- RLS: cada profissional só enxerga o que é seu
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;

create policy "perfil próprio" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
create policy "clientes próprios" on public.clients
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "atendimentos próprios" on public.appointments
  for all using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.clients c where c.id = client_id and c.user_id = auth.uid())
  );

-- Cria o perfil automaticamente no cadastro
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
