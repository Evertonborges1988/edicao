-- Cole este arquivo inteiro no "SQL Editor" do Supabase e clique em RUN (uma única vez).
create table if not exists lancamentos (
  id         text primary key,
  dados      jsonb   not null,
  atualizado bigint  not null,
  apagado    boolean not null default false
);
create index if not exists lancamentos_atualizado_idx on lancamentos (atualizado);

-- Só quem entrou com o e-mail/senha da família enxerga ou altera os dados.
alter table lancamentos enable row level security;
drop policy if exists familia on lancamentos;
create policy familia on lancamentos for all to authenticated using (true) with check (true);
