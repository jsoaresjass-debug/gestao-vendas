alter table public.products
add column if not exists stock_quantity integer not null default 0;

alter table public.sales
add column if not exists installment_interval_days integer not null default 30;

update public.products
set stock_quantity = case
  when barcode = '789100000001' then 8
  when barcode = '789100000002' then 12
  when barcode = '789100000003' then 10
  when barcode = '789100000004' then 14
  else stock_quantity
end
where stock_quantity = 0;
