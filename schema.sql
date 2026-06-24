drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.settings    cascade;
drop table if exists public.orders      cascade;
drop table if exists public.accounts    cascade;
drop table if exists public.packages    cascade;
drop table if exists public.services    cascade;
drop table if exists public.users       cascade;
drop table if exists public.admin_users cascade;

drop function if exists public.handle_new_user();
drop function if exists public.add_existing_staff(text);
drop function if exists public.create_public_order(text, uuid, text, text);
drop function if exists public.get_public_order(uuid);
drop function if exists public.import_accounts(uuid, uuid, text);
drop function if exists private.is_admin_user();
drop function if exists private.is_staff_user();

create table public.services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.admin_users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text unique not null,
  role          text not null default 'staff' check (role in ('admin', 'staff')),
  is_active     boolean not null default true,
  is_protected  boolean not null default false,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.packages (
  id            uuid primary key default gen_random_uuid(),
  service_id    uuid references public.services(id) on delete set null,
  name          text not null,
  description   text,
  price         bigint not null check (price > 0),
  duration_days int not null check (duration_days > 0),
  features      text[] not null default '{}',
  badge         text,
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.accounts (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid references public.services(id) on delete set null,
  package_id  uuid references public.packages(id) on delete set null,
  email       text not null,
  password    text not null,
  status      text not null default 'available' check (status in ('available', 'used')),
  used_at     timestamptz,
  used_order  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  customer_email text,
  package_id     uuid references public.packages(id) on delete set null,
  package_name   text not null,
  amount         bigint not null check (amount > 0),
  status         text not null default 'pending' check (status in ('pending', 'paid', 'completed', 'awaiting_stock', 'cancelled')),
  delivery_type  text not null default 'mail' check (delivery_type in ('mail', 'zalo')),
  account_id     uuid references public.accounts(id) on delete set null,
  zalo_phone     text,
  created_at     timestamptz not null default now(),
  paid_at        timestamptz,
  completed_at   timestamptz,
  cancelled_at   timestamptz
);

create table public.settings (
  id           boolean primary key default true,
  bank_id      text not null,
  account_no   text not null,
  account_name text not null,
  template     text not null default 'compact2',
  constraint settings_one_row check (id)
);

alter table public.accounts
  add constraint accounts_used_order_fkey
  foreign key (used_order) references public.orders(id) on delete set null;

create index idx_orders_status       on public.orders(status);
create index idx_orders_created_at   on public.orders(created_at desc);
create index idx_orders_package_id   on public.orders(package_id);
create index idx_orders_account_id   on public.orders(account_id);
create index idx_packages_service_id on public.packages(service_id);
create index idx_accounts_lookup     on public.accounts(service_id, package_id, status);
create index idx_accounts_email      on public.accounts(email);
create index idx_services_sort       on public.services(sort_order);

grant usage on schema public to anon, authenticated;
grant usage on schema public to service_role;

create schema if not exists private;
grant usage on schema private to authenticated;
grant usage on schema private to service_role;

grant select                on public.services  to anon, authenticated;
grant select                on public.packages  to anon, authenticated;
grant select                on public.settings  to anon, authenticated;

grant select, insert, update, delete              on public.orders       to authenticated;
grant select, insert, update, delete              on public.accounts     to authenticated;
grant select, insert, update, delete              on public.packages     to authenticated;
grant select, insert, update, delete              on public.services     to authenticated;
grant select, insert, update, delete              on public.admin_users  to authenticated;
grant select, insert, update                      on public.settings     to authenticated;

grant select, insert, update, delete on public.admin_users to service_role;
grant select, insert, update, delete on public.orders      to service_role;
grant select, insert, update, delete on public.accounts    to service_role;
grant select, insert, update, delete on public.packages    to service_role;
grant select, insert, update, delete on public.services    to service_role;
grant select, insert, update        on public.settings    to service_role;

create or replace function private.is_staff_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where id = (select auth.uid()) and is_active = true
  );
$$;

revoke all on function private.is_staff_user() from public;
grant execute on function private.is_staff_user() to authenticated;

create or replace function private.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where id = (select auth.uid()) and is_active = true and role = 'admin'
  );
$$;

revoke all on function private.is_admin_user() from public;
grant execute on function private.is_admin_user() to authenticated;

create or replace function public.add_existing_staff(staff_email text)
returns public.admin_users
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
  target_user_email text;
  target_admin public.admin_users%rowtype;
begin
  if not (select private.is_admin_user()) then
    raise exception 'forbidden';
  end if;

  select id, email into target_user_id, target_user_email
  from auth.users
  where lower(email) = lower(trim(staff_email))
  limit 1;

  if target_user_id is null then
    raise exception 'user not found';
  end if;

  select * into target_admin
  from public.admin_users
  where id = target_user_id;

  if target_admin.role = 'admin' then
    raise exception 'cannot add protected admin';
  end if;

  insert into public.admin_users (id, email, role, is_active, is_protected, created_by)
  values (target_user_id, target_user_email, 'staff', true, false, (select auth.uid()))
  on conflict (id) do update set
    email = excluded.email,
    role = 'staff',
    is_active = true,
    is_protected = false,
    updated_at = now()
  returning * into target_admin;

  return target_admin;
end;
$$;

revoke all on function public.add_existing_staff(text) from public;
grant execute on function public.add_existing_staff(text) to authenticated;

create or replace function public.import_accounts(
  p_service_id uuid,
  p_package_id uuid,
  p_content text
)
returns table (
  line_number int,
  email text,
  ok boolean,
  reason text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  raw_line text;
  parts text[];
  parsed_email text;
  parsed_password text;
  line_idx int := 0;
begin
  if not (select private.is_admin_user()) then
    raise exception 'forbidden';
  end if;

  for raw_line in
    select * from unnest(string_to_array(p_content, E'\n')) as l
  loop
    line_idx := line_idx + 1;
    raw_line := btrim(raw_line);
    if raw_line = '' then
      continue;
    end if;

    if position(E'\r' in raw_line) > 0 then
      raw_line := replace(raw_line, E'\r', '');
    end if;

    parts := string_to_array(raw_line, '|');
    if array_length(parts, 1) is null or array_length(parts, 1) < 2 then
      line_number := line_idx; email := null; ok := false;
      reason := 'invalid format';
      return next;
      continue;
    end if;

    parsed_email := lower(btrim(parts[1]));
    parsed_password := parts[2];

    if parsed_email = '' or parsed_password = '' then
      line_number := line_idx; email := parsed_email; ok := false;
      reason := 'missing email or password';
      return next;
      continue;
    end if;

    if exists (
      select 1 from public.accounts a
      where lower(a.email) = parsed_email and a.package_id = p_package_id
    ) then
      line_number := line_idx; email := parsed_email; ok := false;
      reason := 'duplicate';
      return next;
      continue;
    end if;

    begin
      insert into public.accounts (service_id, package_id, email, password, status)
      values (p_service_id, p_package_id, parsed_email, parsed_password, 'available');
    exception when others then
      line_number := line_idx; email := parsed_email; ok := false;
      reason := sqlerrm;
      return next;
      continue;
    end;

    line_number := line_idx; email := parsed_email; ok := true; reason := null;
    return next;
  end loop;
end;
$$;

revoke all on function public.import_accounts(uuid, uuid, text) from public;
grant execute on function public.import_accounts(uuid, uuid, text) to authenticated;

create or replace function public.create_public_order(
  p_customer_email text,
  p_package_id uuid,
  p_delivery_type text default 'mail',
  p_zalo_phone text default null
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_package public.packages%rowtype;
  created_order public.orders%rowtype;
  clean_email text;
  clean_delivery_type text;
  clean_zalo_phone text;
begin
  clean_email := nullif(lower(btrim(coalesce(p_customer_email, ''))), '');
  clean_delivery_type := coalesce(nullif(btrim(p_delivery_type), ''), 'mail');
  clean_zalo_phone := nullif(btrim(coalesce(p_zalo_phone, '')), '');

  if clean_delivery_type = 'mail' and (clean_email is null or position('@' in clean_email) <= 1) then
    raise exception 'invalid email';
  end if;

  if clean_delivery_type = 'zalo' and clean_email is not null and position('@' in clean_email) <= 1 then
    raise exception 'invalid email';
  end if;

  if clean_delivery_type not in ('mail', 'zalo') then
    raise exception 'invalid delivery type';
  end if;

  if clean_delivery_type = 'zalo' and clean_zalo_phone is null then
    raise exception 'missing zalo phone';
  end if;

  select * into target_package
  from public.packages
  where id = p_package_id and is_active = true
  limit 1;

  if target_package.id is null then
    raise exception 'package not found';
  end if;

  insert into public.orders (
    customer_email,
    package_id,
    package_name,
    amount,
    status,
    delivery_type,
    zalo_phone
  ) values (
    clean_email,
    target_package.id,
    target_package.name,
    target_package.price,
    'pending',
    clean_delivery_type,
    case when clean_delivery_type = 'zalo' then clean_zalo_phone else null end
  )
  returning * into created_order;

  return created_order;
end;
$$;

revoke all on function public.create_public_order(text, uuid, text, text) from public;
grant execute on function public.create_public_order(text, uuid, text, text) to anon, authenticated;

create or replace function public.get_public_order(p_order_id uuid)
returns public.orders
language sql
stable
security definer
set search_path = ''
as $$
  select *
  from public.orders
  where id = p_order_id
  limit 1;
$$;

revoke all on function public.get_public_order(uuid) from public;
grant execute on function public.get_public_order(uuid) to anon, authenticated;

create or replace function public.count_available_by_package()
returns table (package_id uuid, available_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select package_id, count(*)::bigint
  from public.accounts
  where status = 'available' and package_id is not null
  group by package_id;
$$;

grant execute on function public.count_available_by_package() to anon, authenticated;

alter table public.services enable row level security;
create policy "svc_sel" on public.services for select to anon, authenticated using (true);
create policy "svc_ins" on public.services for insert to authenticated with check ((select private.is_admin_user()));
create policy "svc_upd" on public.services for update to authenticated using ((select private.is_admin_user())) with check ((select private.is_admin_user()));
create policy "svc_del" on public.services for delete to authenticated using ((select private.is_admin_user()));

alter table public.admin_users enable row level security;
create policy "adm_sel" on public.admin_users for select    to authenticated using (id = (select auth.uid()) or (select private.is_admin_user()));
create policy "adm_ins" on public.admin_users for insert    to authenticated with check ((select private.is_admin_user()));
create policy "adm_upd" on public.admin_users for update    to authenticated using ((select private.is_admin_user())) with check ((select private.is_admin_user()));
create policy "adm_del" on public.admin_users for delete    to authenticated using ((select private.is_admin_user()) and is_protected = false);

alter table public.packages enable row level security;
create policy "pkg_sel"   on public.packages for select  to anon, authenticated using (true);
create policy "pkg_ins"   on public.packages for insert  to authenticated with check ((select private.is_admin_user()));
create policy "pkg_upd"   on public.packages for update  to authenticated using ((select private.is_admin_user())) with check ((select private.is_admin_user()));
create policy "pkg_del"   on public.packages for delete  to authenticated using ((select private.is_admin_user()));

alter table public.accounts enable row level security;
create policy "acc_sel"   on public.accounts for select  to authenticated using ((select private.is_staff_user()));
create policy "acc_ins"   on public.accounts for insert  to authenticated with check ((select private.is_admin_user()));
create policy "acc_upd"   on public.accounts for update to authenticated using ((select private.is_staff_user())) with check ((select private.is_staff_user()));
create policy "acc_del"   on public.accounts for delete  to authenticated using ((select private.is_admin_user()));

alter table public.orders enable row level security;
create policy "ord_sel"      on public.orders for select to authenticated using ((select private.is_staff_user()));
create policy "ord_upd_staff" on public.orders for update to authenticated using  ((select private.is_staff_user())) with check ((select private.is_staff_user()) and status <> 'cancelled');
create policy "ord_upd_admin" on public.orders for update to authenticated using  ((select private.is_admin_user())) with check ((select private.is_admin_user()));
create policy "ord_del"      on public.orders for delete to authenticated using ((select private.is_admin_user()));

alter table public.settings enable row level security;
create policy "set_sel"   on public.settings for select  to anon, authenticated using (true);
create policy "set_ins"   on public.settings for insert  to authenticated with check ((select private.is_admin_user()));
create policy "set_upd"   on public.settings for update  to authenticated using ((select private.is_admin_user())) with check ((select private.is_admin_user()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email = 'ovftank@gmail.com' then
    insert into public.admin_users (id, email, role, is_active, is_protected)
    values (new.id, new.email, 'admin', true, true)
    on conflict (id) do update set
      email = excluded.email,
      role = 'admin',
      is_active = true,
      is_protected = true,
      updated_at = now();
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.admin_users (id, email, role, is_active, is_protected)
select au.id, au.email, 'admin', true, true
from auth.users au
where au.email = 'ovftank@gmail.com'
on conflict (id) do update set
  email = excluded.email,
  role = 'admin',
  is_active = true,
  is_protected = true,
  updated_at = now();
