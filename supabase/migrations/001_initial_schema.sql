create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'payment_status'
  ) then
    create type payment_status as enum ('paid', 'partial', 'pending', 'overdue');
  end if;
end $$;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  total_amount numeric(12, 2) not null default 0,
  outstanding_amount numeric(12, 2) not null default 0,
  payment_status payment_status not null default 'pending',
  sale_date date not null default current_date,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null default 0
);

create index if not exists customers_name_idx on public.customers using btree (name);
create index if not exists sales_customer_id_idx on public.sales using btree (customer_id);
create index if not exists sales_due_date_idx on public.sales using btree (due_date);
create index if not exists sale_items_sale_id_idx on public.sale_items using btree (sale_id);

create or replace function public.handle_customer_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;

create trigger customers_set_updated_at
before update on public.customers
for each row
execute procedure public.handle_customer_updated_at();

alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

drop policy if exists "authenticated_customers_select" on public.customers;
drop policy if exists "authenticated_customers_insert" on public.customers;
drop policy if exists "authenticated_customers_update" on public.customers;
drop policy if exists "authenticated_sales_select" on public.sales;
drop policy if exists "authenticated_sales_insert" on public.sales;
drop policy if exists "authenticated_sales_update" on public.sales;
drop policy if exists "authenticated_sale_items_select" on public.sale_items;
drop policy if exists "authenticated_sale_items_insert" on public.sale_items;
drop policy if exists "authenticated_sale_items_update" on public.sale_items;

create policy "authenticated_customers_select"
on public.customers
for select
to authenticated
using (true);

create policy "authenticated_customers_insert"
on public.customers
for insert
to authenticated
with check (true);

create policy "authenticated_customers_update"
on public.customers
for update
to authenticated
using (true)
with check (true);

create policy "authenticated_sales_select"
on public.sales
for select
to authenticated
using (true);

create policy "authenticated_sales_insert"
on public.sales
for insert
to authenticated
with check (true);

create policy "authenticated_sales_update"
on public.sales
for update
to authenticated
using (true)
with check (true);

create policy "authenticated_sale_items_select"
on public.sale_items
for select
to authenticated
using (true);

create policy "authenticated_sale_items_insert"
on public.sale_items
for insert
to authenticated
with check (true);

create policy "authenticated_sale_items_update"
on public.sale_items
for update
to authenticated
using (true)
with check (true);

insert into public.customers (name, phone, email, is_active)
values
  ('Ana Souza', '(11) 99111-0001', 'ana@cliente.com', true),
  ('Beatriz Lima', '(11) 99111-0002', 'beatriz@cliente.com', true),
  ('Carla Mendes', '(11) 99111-0003', 'carla@cliente.com', false)
on conflict do nothing;

with seeded_customers as (
  select id, name
  from public.customers
  where email in ('ana@cliente.com', 'beatriz@cliente.com', 'carla@cliente.com')
),
seeded_sales as (
  insert into public.sales (customer_id, total_amount, outstanding_amount, payment_status, sale_date, due_date)
  select
    id,
    case
      when name = 'Ana Souza' then 450
      when name = 'Beatriz Lima' then 890
      else 320
    end,
    case
      when name = 'Ana Souza' then 0
      when name = 'Beatriz Lima' then 240
      else 80
    end,
    case
      when name = 'Ana Souza' then 'paid'::payment_status
      when name = 'Beatriz Lima' then 'overdue'::payment_status
      else 'partial'::payment_status
    end,
    current_date - interval '10 day',
    current_date - interval '2 day'
  from seeded_customers
  where not exists (
    select 1
    from public.sales s
    where s.customer_id = seeded_customers.id
  )
  returning id, customer_id
)
insert into public.sale_items (sale_id, product_name, quantity, unit_price)
select
  seeded_sales.id,
  case
    when customers.name = 'Ana Souza' then 'Kit de maquiagem'
    when customers.name = 'Beatriz Lima' then 'Bolsa premium'
    else 'Camiseta basica'
  end,
  case
    when customers.name = 'Beatriz Lima' then 2
    else 1
  end,
  case
    when customers.name = 'Ana Souza' then 450
    when customers.name = 'Beatriz Lima' then 445
    else 320
  end
from seeded_sales
join public.customers on customers.id = seeded_sales.customer_id
where not exists (
  select 1
  from public.sale_items items
  where items.sale_id = seeded_sales.id
);
