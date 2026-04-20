alter table public.sale_items enable row level security;

drop policy if exists "authenticated_sale_items_delete" on public.sale_items;

create policy "authenticated_sale_items_delete"
on public.sale_items
for delete
to authenticated
using (true);

