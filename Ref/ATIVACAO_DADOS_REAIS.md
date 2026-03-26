# Guia de Ativação: Dados Reais 🚀

Atualmente o dashboard está exibindo **dados simulados (mock)** para que você possa ver o design. Para usar produtos reais, precisamos conectar seu banco de dados Supabase.

## Passo 1: Configurar Variáveis de Ambiente
Crie um arquivo chamado `.env.local` na raiz do projeto e adicione as seguintes chaves (que você encontra no seu painel do Supabase em **Project Settings > API**):

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

## Passo 2: Criar as Tabelas no Supabase
Vá ao seu dashboard do Supabase, abra o **SQL Editor** e execute o código abaixo para criar a estrutura necessária:

```sql
-- 1. Tabela de Produtos
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  discount_pct numeric default 0,
  marketplace text not null, -- 'amazon', 'ml', 'shopee'
  original_url text,
  video_url text,
  thumbnail_url text,
  viral_score integer default 0,
  sales_volume integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Favoritos
create table user_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references products on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- 3. Habilitar RLS (Segurança)
alter table products enable row level security;
alter table user_favorites enable row level security;

-- Políticas de Acesso
create policy "Produtos são públicos" on products for select using (true);
create policy "Usuários podem ver seus favoritos" on user_favorites for select using (auth.uid() = user_id);
create policy "Usuários podem gerenciar favoritos" on user_favorites for all using (auth.uid() = user_id);
```

## Passo 3: Como popular os dados?
Após configurar o banco, você pode:
1.  **Inserir manualmente**: Via painel do Supabase.
2.  **Script de Importação**: Posso criar um script para você rodar e importar produtos de uma lista ou CSV.
3.  **Crawler Automatizado**: Para um sistema profissional, você precisará de um rastreador (ex: via n8n ou script Python) que salve as ofertas diretamente na tabela `products`.

---
**Precisa de ajuda com o SQL ou com o arquivo .env?**
Se você me mandar as chaves do Supabase, eu mesmo posso criar o arquivo `.env.local` para você!
