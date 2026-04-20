alter table public.products
add column if not exists size text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_size_check'
  ) then
    alter table public.products
    add constraint products_size_check
    check (size is null or size in ('P', 'M', 'G'));
  end if;
end $$;

