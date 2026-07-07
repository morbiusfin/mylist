-- ============================================================
-- Mylist — conta compartilhada (Supabase)
-- Rode isto no SQL Editor do seu projeto Supabase.
-- Modelo: um "grupo" (conta compartilhada) guarda TODA a lista + histórico
-- num documento JSON. Membros do grupo veem/editam ao vivo (realtime).
-- ============================================================

-- Extensão p/ uuid
create extension if not exists "pgcrypto";

-- Grupo = conta compartilhada (você + seu par)
create table if not exists public.grupos (
  id          uuid primary key default gen_random_uuid(),
  criado_por  uuid not null references auth.users(id) on delete cascade,
  data        jsonb not null default '{"lista":[],"compras":[]}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

-- Membros do grupo
create table if not exists public.membros (
  grupo_id  uuid not null references public.grupos(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  papel     text not null default 'membro',
  entrou_em timestamptz not null default now(),
  primary key (grupo_id, user_id)
);

-- Convites (código curto p/ o par entrar)
create table if not exists public.convites (
  codigo    text primary key,
  grupo_id  uuid not null references public.grupos(id) on delete cascade,
  criado_por uuid not null references auth.users(id) on delete cascade,
  criado_em timestamptz not null default now()
);

-- ---------- helper: sou membro deste grupo? ----------
create or replace function public.sou_membro(g uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.membros m where m.grupo_id = g and m.user_id = auth.uid());
$$;

-- ---------- RLS ----------
alter table public.grupos   enable row level security;
alter table public.membros  enable row level security;
alter table public.convites enable row level security;

-- grupos: membro vê e edita; autenticado cria
drop policy if exists grupos_sel on public.grupos;
create policy grupos_sel on public.grupos for select using (public.sou_membro(id));
drop policy if exists grupos_upd on public.grupos;
create policy grupos_upd on public.grupos for update using (public.sou_membro(id)) with check (public.sou_membro(id));
drop policy if exists grupos_ins on public.grupos;
create policy grupos_ins on public.grupos for insert with check (auth.uid() = criado_por);

-- membros: vejo minhas linhas; criador do grupo entra sozinho (o par entra via RPC)
drop policy if exists membros_sel on public.membros;
create policy membros_sel on public.membros for select using (user_id = auth.uid() or public.sou_membro(grupo_id));
drop policy if exists membros_ins on public.membros;
create policy membros_ins on public.membros for insert with check (
  user_id = auth.uid() and exists (select 1 from public.grupos g where g.id = grupo_id and g.criado_por = auth.uid())
);

-- convites: membro do grupo cria e lê
drop policy if exists convites_sel on public.convites;
create policy convites_sel on public.convites for select using (public.sou_membro(grupo_id));
drop policy if exists convites_ins on public.convites;
create policy convites_ins on public.convites for insert with check (public.sou_membro(grupo_id));

-- ---------- RPC: entrar por código ----------
create or replace function public.entrar_por_codigo(p_codigo text)
returns uuid language plpgsql security definer set search_path = public as $$
declare g uuid;
begin
  select grupo_id into g from public.convites where codigo = p_codigo;
  if g is null then raise exception 'convite inválido'; end if;
  insert into public.membros (grupo_id, user_id, papel)
    values (g, auth.uid(), 'membro')
    on conflict (grupo_id, user_id) do nothing;
  return g;
end; $$;

-- ---------- Realtime ----------
alter publication supabase_realtime add table public.grupos;
