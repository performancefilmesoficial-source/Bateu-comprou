"use client"

import { useState } from "react"
import { Heart, Copy, MessageCircle, Download, Zap, Loader2 } from "lucide-react"
import MarketplaceLogo from "./MarketplaceLogo"
import { toggleFavorite } from "@/app/actions"

interface ProductCardProps {
  id: string
  name: string
  price: number | string
  marketplace: 'amazon' | 'ml' | 'shopee'
  viralScore?: number
  imageUrl: string
  discount?: number
}

export default function ProductCard({ id, name, price, marketplace, viralScore, imageUrl, discount }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await toggleFavorite(id)
      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error("Erro ao favoritar:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://bateucomprou.com/p/${id}`)
    alert("Link copiado com sucesso! 🎉")
  }

  const handleWhatsApp = () => {
    const text = `🔥 Olha esse achado que vi no Bateu Comprou!\n\n📦 ${name}\n💰 Por apenas R$ ${price}\n\nConfira aqui: https://bateucomprou.com/p/${id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <div className="card-light" style={{ 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Product Image & Overlays */}
      <div style={{ position: 'relative', height: '240px', background: '#f8f9fa' }}>
        <img 
          src={imageUrl} 
          alt={name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        
        {/* Marketplace Overlay (Top Right) */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '8px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <MarketplaceLogo type={marketplace} size={20} />
        </div>

        {/* Viral Score (Bottom Left) */}
        {viralScore && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8A00 100%)',
            color: 'white',
            padding: '5px 12px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 15px rgba(255, 107, 0, 0.4)',
            zIndex: 2
          }}>
            <Zap size={14} fill="white" /> {viralScore}% VIRAL
          </div>
        )}

        {/* Favorite Button (Top Left) */}
        <button 
          onClick={handleFavorite}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'white',
            border: 'none',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFavorited ? '#EF4444' : '#64748B',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 2
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Heart size={20} fill={isFavorited ? "#EF4444" : "none"} />}
        </button>
      </div>

      {/* Product Content */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ 
          fontSize: '1.15rem', 
          fontWeight: 700, 
          marginBottom: '0.75rem', 
          lineHeight: '1.4', 
          height: '3.2rem', 
          overflow: 'hidden', 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical',
          color: 'var(--text-main)'
        }}>
          {name}
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--vibrant-orange)' }}>
            R$ {typeof price === 'number' ? price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : price}
          </span>
          {discount && (
            <span style={{ fontSize: '0.95rem', color: 'var(--success-green)', fontWeight: 800, background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Modern Buttons Stack */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={copyToClipboard} className="btn-modern btn-copy" style={{ padding: '10px' }}>
              <Copy size={18} /> Link
            </button>
            <button onClick={handleWhatsApp} className="btn-modern btn-whatsapp" style={{ padding: '10px' }}>
              <MessageCircle size={18} /> Zap
            </button>
          </div>
          <button className="btn-modern btn-download" style={{ 
            width: '100%', 
            background: 'linear-gradient(135deg, #FFB800 0%, #FF9100 100%)',
            color: 'var(--text-main)'
          }}>
            <Download size={18} /> Baixar Vídeo
          </button>
        </div>
      </div>
    </div>
  )
}
