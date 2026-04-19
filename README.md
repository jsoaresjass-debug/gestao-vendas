# Gestao de Vendas

Projeto em `Next.js` com `Supabase` para autenticao, dashboard comercial e cadastro de clientes.

## Configuracao

1. Copie `.env.example` para `.env.local`.
2. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Rode a migration `supabase/migrations/001_initial_schema.sql` no SQL Editor do Supabase.
4. Crie pelo menos um usuario no `Supabase Auth` com e-mail e senha para acessar `/login`.

## Comandos

- `npm run dev`
- `npm run lint`
- `npm run build`

## Rotas

- `/login`
- `/home`
- `/cadastro`
