"use client"

import { Search, Zap } from "lucide-react"
import MarketplaceLogo from "./MarketplaceLogo"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
  const currentMarketplace = searchParams.get('marketplace') || "Tudo";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "Tudo") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      const query = createQueryString('q', searchTerm);
      router.push(`${pathname}?${query}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, createQueryString, router, pathname]);

  const handleFilterClick = (label: string) => {
    const query = createQueryString('marketplace', label);
    router.push(`${pathname}?${query}`, { scroll: false });
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Explorador de <span style={{ 
              background: 'linear-gradient(120deg, var(--vibrant-orange), #FF9E00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900
            }}>Produtos</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Encontre as melhores oportunidades para lucrar hoje.
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '10px 24px',
          width: '500px',
          boxShadow: 'var(--soft-shadow)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          border: '1px solid var(--border-light)'
        }}>
          <Search size={22} color="var(--vibrant-orange)" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou link do produto..."
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              width: '100%',
              color: 'var(--text-main)',
              fontWeight: 500
            }}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', alignItems: 'center' }}>
        <FilterChip 
          label="Tudo" 
          active={currentMarketplace === "Tudo"} 
          onClick={() => handleFilterClick("Tudo")} 
        />
        <FilterChip 
          label="" 
          active={currentMarketplace === "Amazon"} 
          onClick={() => handleFilterClick("Amazon")}
          icon={<MarketplaceLogo type="amazon" size={24} />} 
          style={{ padding: '10px 25px' }}
        />
        <FilterChip 
          label="" 
          active={currentMarketplace === "M. Livre"} 
          onClick={() => handleFilterClick("M. Livre")}
          icon={<MarketplaceLogo type="ml" size={24} />} 
          style={{ padding: '10px 25px' }}
        />
        <FilterChip 
          label="" 
          active={currentMarketplace === "Shopee"} 
          onClick={() => handleFilterClick("Shopee")}
          icon={<MarketplaceLogo type="shopee" size={32} />} 
          style={{ padding: '10px 25px' }}
        />
        <FilterChip 
          label="Mais Virais" 
          active={currentMarketplace === "Mais Virais"} 
          onClick={() => handleFilterClick("Mais Virais")}
          icon={<Zap size={20} fill="#FFD700" color="#FF6B00" />} 
        />
      </div>
    </div>
  )
}

interface FilterChipProps {
  label: string;
  active?: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
}

function FilterChip({ label, active = false, icon = null, onClick, style }: FilterChipProps) {
  return (
    <div 
      onClick={onClick}
      style={{
        padding: label ? '10px 25px' : '8px 30px',
        borderRadius: '30px',
        background: active ? 'rgba(255, 107, 0, 0.1)' : 'white',
        color: active ? 'var(--vibrant-orange)' : 'var(--text-muted)',
        fontWeight: 700,
        fontSize: '1rem',
        boxShadow: active ? '0 4px 12px rgba(255, 107, 0, 0.1)' : 'var(--soft-shadow)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        border: active ? '2px solid var(--vibrant-orange)' : '1px solid var(--border-light)',
        whiteSpace: 'nowrap',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style
      }}
    >
      {icon}
      {label}
    </div>
  )
}
