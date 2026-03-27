import Sidebar from "@/components/dashboard/Sidebar";
import ProductCard from "@/components/dashboard/ProductCard";
import Header from "@/components/dashboard/Header";
import { getProducts, getUserSettings } from "./actions";

export default async function Home(props: {
  searchParams: Promise<{ q?: string; marketplace?: string }>
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const marketplace = searchParams.marketplace || "Tudo";

  const products = await getProducts(q, marketplace);
  const apiKeys = await getUserSettings();

  return (
    <div className="main-wrapper">
      <Sidebar />

      <main className="content-area-wide">
        <Header />

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2.5rem',
          marginTop: '2rem'
        }}>
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard 
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                marketplace={product.marketplace as any}
                viralScore={product.viral_score}
                imageUrl={product.thumbnail_url || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400`}
                discount={product.discount_pct}
                videoUrl={product.video_url}
                originalUrl={product.original_url}
                apiKeys={apiKeys}
              />
            ))
          ) : (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '8rem 2rem',
              background: 'white',
              borderRadius: '32px',
              border: '2px dashed var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{ fontSize: '3rem' }}>🔍</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Nenhum produto encontrado</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px' }}>
                O motor de rastreio inteligente está trabalhando para encontrar as melhores ofertas para você.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
