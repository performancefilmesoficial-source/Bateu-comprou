# 🏛️ ARQUITETURA TÉCNICA - BATEU COMPROU V2

Esta estrutura visa escalabilidade, performance e segurança, utilizando o **Next.js 15+** como frontend/backend e o **Supabase** como plataforma de infraestrutura (Database, Auth e Storage).

## 🚢 STACK TECNOLÓGICA
- **Framework**: Next.js (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (Supabase DB)
- **Autenticação**: Supabase Auth (SSR)
- **Armazenamento**: Supabase Storage
- **Estilização**: Tailwind CSS / Vanilla CSS (conforme design já implementado)
- **IA/Integrações**: Supabase Edge Functions (Deno)

## 🏗️ CAMADAS DE DADOS (DATABASE SCHEMA)
O banco de dados será estruturado para suportar o rastreamento em tempo real e a gestão de afiliados.

### Tabela: `profiles`
- Extensão do `auth.users`.
- Campos: `user_id`, `name`, `full_access (boolean)`, `api_keys (JSONB)`.

### Tabela: `products`
- Armazena os produtos encontrados pelo "motor".
- Campos: `id`, `name`, `price`, `discount`, `marketplace`, `viral_score`, `sales_volume`, `video_url`, `affiliate_link`.

### Tabela: `tracking_history`
- Registro histórico para geração de gráficos.
- Campos: `product_id`, `price_at_time`, `created_at`.

## 🔐 FLUXO DE AUTENTICAÇÃO
- Autenticação via **Supabase Auth Helper**.
- Middleware do Next.js para proteger rotas do Dashboard.
- Login via Email/Senha e Social (opcional).

## 📂 STORAGE (VÍDEOS E IMAGENS)
- **Bucket `videos`**: Armazenamento temporário ou permanente de vídeos baixados de fornecedores (Amazon/Shopee).
- **Bucket `thumbs`**: Cache de miniaturas de produtos para performance.

## 🚀 SERVERLESS E EDGE FUNCTIONS
- **Product Scraper**: Edge Functions disparadas via CRON para buscar novos produtos e atualizar o "Achados Recentes".
- **Link Generator**: Lógica server-side para converter links normais em links de afiliado usando as credenciais do usuário.

## 🌉 INTEGRAÇÃO FRONTEND/BACKEND
- **Server Components**: Buscam dados diretamente do Supabase no lado do servidor.
- **Client Components**: Gerenciam o estado da UI e interações (como o botão de WhatsApp e Download).
- **Zustand**: Para gerenciar o estado global leve da aplicação (ex: filtros ativos).
