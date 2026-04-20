create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  barcode text not null unique,
  price numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sale_items
add column if not exists product_id uuid references public.products(id) on delete set null;

create table if not exists public.sale_installments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  installment_number integer not null check (installment_number > 0),
  total_installments integer not null check (total_installments > 0),
  amount numeric(12, 2) not null default 0,
  paid_amount numeric(12, 2) not null default 0,
  due_date date not null,
  status payment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create unique index if not exists sale_installments_sale_id_number_idx
on public.sale_installments using btree (sale_id, installment_number);

create index if not exists products_barcode_idx on public.products using btree (barcode);
create index if not exists products_name_idx on public.products using btree (name);
create index if not exists sale_items_product_id_idx on public.sale_items using btree (product_id);
create index if not exists sale_installments_sale_id_idx on public.sale_installments using btree (sale_id);
create index if not exists sale_installments_due_date_idx on public.sale_installments using btree (due_date);

create or replace function public.handle_product_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute procedure public.handle_product_updated_at();

alter table public.products enable row level security;
alter table public.sale_installments enable row level security;

drop policy if exists "authenticated_products_select" on public.products;
drop policy if exists "authenticated_products_insert" on public.products;
drop policy if exists "authenticated_products_update" on public.products;
drop policy if exists "authenticated_sale_installments_select" on public.sale_installments;
drop policy if exists "authenticated_sale_installments_insert" on public.sale_installments;
drop policy if exists "authenticated_sale_installments_update" on public.sale_installments;

create policy "authenticated_products_select"
on public.products
for select
to authenticated
using (true);

create policy "authenticated_products_insert"
on public.products
for insert
to authenticated
with check (true);

create policy "authenticated_products_update"
on public.products
for update
to authenticated
using (true)
with check (true);

create policy "authenticated_sale_installments_select"
on public.sale_installments
for select
to authenticated
using (true);

create policy "authenticated_sale_installments_insert"
on public.sale_installments
for insert
to authenticated
with check (true);

create policy "authenticated_sale_installments_update"
on public.sale_installments
for update
to authenticated
using (true)
with check (true);

insert into public.products (name, barcode, price, is_active)
values
  ('Vestido Midi Azul', '789100000001', 189.90, true),
  ('Blusa Linho Off White', '789100000002', 119.90, true),
  ('Calca Alfaiataria Bege', '789100000003', 159.90, true),
  ('Saia Jeans Clara', '789100000004', 129.90, true)
on conflict (barcode) do nothing;

update public.sale_items
set product_id = products.id
from public.products
where sale_items.product_id is null
  and sale_items.product_name = products.name;

insert into public.sale_installments (
  sale_id,
  installment_number,
  total_installments,
  amount,
  paid_amount,
  due_date,
  status
)
select
  sales.id,
  1,
  1,
  sales.total_amount,
  greatest(sales.total_amount - sales.outstanding_amount, 0),
  coalesce(sales.due_date, sales.sale_date),
  case
    when sales.outstanding_amount <= 0 then 'paid'::payment_status
    when sales.total_amount - sales.outstanding_amount > 0 then 'partial'::payment_status
    when coalesce(sales.due_date, sales.sale_date) < current_date then 'overdue'::payment_status
    else 'pending'::payment_status
  end
from public.sales
where not exists (
  select 1
  from public.sale_installments installments
  where installments.sale_id = sales.id
);
