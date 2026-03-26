# 🔐 AUTENTICAÇÃO E PERMISSÕES - BATEU COMPROU V2

Segurança avançada utilizando **Supabase Auth** e **Row Level Security (RLS)** para garantir isolamento total de dados entre usuários.

## 🛡️ POLÍTICAS DE ACESSO (SQL RLS)

As políticas abaixo devem ser executadas no Editor SQL do Supabase para habilitar a proteção das tabelas.

### 1. Tabela `profiles`
*O usuário só pode ver e editar seu próprio perfil.*
```sql
alter table public.profiles enable row level security;

create policy "Usuários podem visualizar o próprio perfil"
on public.profiles for select
using ( auth.uid() = id );

create policy "Usuários podem atualizar o próprio perfil"
on public.profiles for update
using ( auth.uid() = id );
```

### 2. Tabela `products`
*Todos os usuários autenticados podem ler produtos, mas apenas o sistema (service_role) pode inserir/editar.*
```sql
alter table public.products enable row level security;

create policy "Qualquer usuário autenticado pode ver produtos"
on public.products for select
to authenticated
using ( true );
```

### 3. Tabela `user_favorites`
*Isolamento total: o usuário só vê e gerencia seus próprios favoritos.*
```sql
alter table public.user_favorites enable row level security;

create policy "Usuários gerenciam seus próprios favoritos"
on public.user_favorites for all
using ( auth.uid() = user_id );
```

## 🚀 MIDDLEWARE DE PROTEÇÃO (NEXT.JS)

Para proteger as rotas do Dashboard, utilizaremos o Middleware do Next.js com o cliente do Supabase para SSR.

### Regras de Roteamento:
- **Públicas**: `/login`, `/signup`, `/` (Landing Page).
- **Protegidas**: `/dashboard/*`, `/settings`, `/profile`.

### Lógica do Middleware:
1. Intercepta a requisição.
2. Verifica se existe uma sessão ativa via `getUser()`.
3. Se não autenticado e tentando acessar `/dashboard`, redireciona para `/login`.
4. Se autenticado e tentando acessar `/login`, redireciona para `/dashboard`.

## 🔑 GESTÃO DE CHAVES E PERMISSÕES
- **API Keys**: Armazenadas como `encrypted JSONB` na tabela `profiles`.
- **Service Role**: Utilizada apenas em Edge Functions ou Scripts de Admin para bypass de RLS (ex: motor de busca de produtos).

## 📝 FLUXO DE CADASTRO (TRIGGER)
Configurar uma trigger no banco para criar automaticamente um registro em `public.profiles` sempre que um novo usuário se registrar no `auth.users`.

```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```
