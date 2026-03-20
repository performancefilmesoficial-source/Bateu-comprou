import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url:
    # Try the one from scraper .env
    load_dotenv("scraper/.env")
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)

res = supabase.table("produtos_monitorados").select("loja", count="exact").execute()
counts = {}
for item in res.data:
    loja = item['loja']
    counts[loja] = counts.get(loja, 0) + 1

print(f"Total: {res.count}")
print(f"Stats: {counts}")

# Check latest executions
exec_res = supabase.table("scraper_execucoes").select("*").order("iniciado_em", desc=True).limit(5).execute()
print("\nRecent Executions:")
for e in exec_res.data:
    print(f"ID: {e['id']} | Status: {e['status']} | Lojas: {e['lojas_varridas']} | Salvos: {e['total_salvos']}")
