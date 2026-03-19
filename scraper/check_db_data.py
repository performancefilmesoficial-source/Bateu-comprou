import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)
res = supabase.table("produtos_monitorados").select("*").eq("loja", "mercadolivre").order("encontrado_em", desc=True).limit(5).execute()

for p in res.data:
    print(f"Nome: {p['nome'][:30]}")
    print(f"Preço: {p['preco']} | Original: {p['preco_original']}")
    print(f"Imagem: {p['imagem_url']}")
    print("-" * 20)
