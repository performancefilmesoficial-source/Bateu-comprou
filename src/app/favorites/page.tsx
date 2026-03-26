import Sidebar from "@/components/dashboard/Sidebar";
import ProductCard from "@/components/dashboard/ProductCard";
import { getFavoritedProducts } from "@/app/actions";
import { Heart } from "lucide-react";

export default async function FavoritesPage() {
  const products = await getFavoritedProducts();

  return (
    <div className="main-wrapper">
      <Sidebar />

      <main className="content-area-wide">
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
            Meus <span style={{ 
              background: 'linear-gradient(120deg, var(--vibrant-blue), #00A3FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900
            }}>Favoritos</span>
            <Heart size={40} color="var(--vibrant-blue)" fill="var(--vibrant-blue)" />
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            Sua lista personalizada de achados prontos para divulgar.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2.5rem'
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
              <span style={{ fontSize: '3rem' }}>❤️</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Você ainda não tem favoritos</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px' }}>
                Comece a explorar o dashboard e salve os melhores achados para vê-los aqui.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
