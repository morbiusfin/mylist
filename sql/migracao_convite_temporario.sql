-- ============================================================
-- Mylist — migração: convite temporário (prazo de acesso)
-- Rode no SQL Editor do Supabase (projeto já existente).
-- ============================================================

alter table public.convites add column if not exists acesso_horas int not null default 0;
alter table public.convites add column if not exists expira_em timestamptz;
alter table public.membros  add column if not exists expira_em timestamptz;

-- membro só conta se não venceu
create or replace function public.sou_membro(g uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.membros m where m.grupo_id = g and m.user_id = auth.uid()
    and (m.expira_em is null or m.expira_em > now()));
$$;

-- entrar por código: valida validade do código e grava o prazo de acesso do membro
create or replace function public.entrar_por_codigo(p_codigo text)
returns uuid language plpgsql security definer set search_path = public as $$
declare g uuid; h int; exp timestamptz;
begin
  select grupo_id, acesso_horas, expira_em into g, h, exp from public.convites where codigo = p_codigo;
  if g is null then raise exception 'convite inválido'; end if;
  if exp is not null and exp < now() then raise exception 'convite expirado'; end if;
  insert into public.membros (grupo_id, user_id, papel, expira_em)
    values (g, auth.uid(), 'membro', case when coalesce(h,0) > 0 then now() + (h || ' hours')::interval else null end)
    on conflict (grupo_id, user_id) do update set expira_em = excluded.expira_em;
  return g;
end; $$;
