import { Clock, ChevronRight } from "lucide-react"
import { getRecentProducts } from "@/app/actions";

export default async function RecentProducts() {
  const recentProducts = await getRecentProducts();

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '2.5rem',
      boxShadow: 'var(--soft-shadow)',
      border: '1px solid var(--border-light)',
      height: 'fit-content',
      position: 'sticky',
      top: '2rem',
      width: '380px'
    }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>Achados Recentes</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Últimos rastreados pelo motor.</p>
        </div>
        <Clock size={24} color="var(--vibrant-orange)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {recentProducts.length > 0 ? (
          recentProducts.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              borderRadius: '16px',
              background: 'var(--bg-secondary)',
              border: '1px solid transparent',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              
              <img 
                src={item.thumbnail_url || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100`} 
                alt={item.name} 
                style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} 
              />
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 700, 
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--vibrant-orange)', margin: '2px 0' }}>
                  R$ {item.price}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(item.created_at).toLocaleTimeString()}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <ChevronRight size={18} />
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem' }}>
            Nenhum rastreamento recente.
          </p>
        )}
      </div>

      <button style={{
        width: '100%',
        marginTop: '2rem',
        padding: '14px',
        borderRadius: '12px',
        border: '2px solid var(--vibrant-orange)',
        background: 'transparent',
        color: 'var(--vibrant-orange)',
        fontWeight: 800,
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        Ver Histórico Completo
      </button>
    </div>
  )
}
