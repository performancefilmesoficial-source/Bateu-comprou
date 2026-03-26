import Sidebar from "@/components/dashboard/Sidebar";
import { Send, Zap, Calendar, History, Play, Pause } from "lucide-react";

export default function AutomationPage() {
  return (
    <div className="main-wrapper">
      <Sidebar />

      <main className="content-area-wide">
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
            Postagem <span style={{ 
              background: 'linear-gradient(120deg, var(--vibrant-orange), #FF9E00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900
            }}>Automática</span>
            <Send size={40} color="var(--vibrant-orange)" />
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            Configure seus robôs para enviar as melhores ofertas automaticamente para seus grupos.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          <StatCard title="Total Enviado" value="1.240" icon={<History size={20} />} color="var(--vibrant-blue)" />
          <StatCard title="Posts Hoje" value="42" icon={<Calendar size={20} />} color="var(--success-green)" />
          <StatCard title="Status do Bot" value="Ativo" icon={<Zap size={20} />} color="var(--vibrant-orange)" />
        </div>

        <div className="card-light" style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Configuração do Robô</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-modern" style={{ background: '#FEE2E2', color: '#EF4444', boxShadow: 'none' }}>
                <Pause size={18} /> Pausar Bot
              </button>
              <button className="btn-modern btn-whatsapp">
                <Play size={18} /> Iniciar Bot
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px', fontSize: '1.1rem' }}>Intervalo de Envio (minutos)</label>
                <input type="number" defaultValue="30" style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)', fontSize: '1.1rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px', fontSize: '1.1rem' }}>Plataforma Alvo</label>
                <select style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)', fontSize: '1.1rem', appearance: 'none', background: 'white' }}>
                  <option>WhatsApp (Grupos)</option>
                  <option>Telegram (Canal)</option>
                  <option>Instagram (Stories)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px', fontSize: '1.1rem' }}>Categorias de Interesse</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {["Eletrônicos", "Cozinha", "Moda", "Beleza", "Brinquedos"].map(cat => (
                  <div key={cat} style={{ padding: '10px 20px', borderRadius: '30px', border: '1px solid var(--border-light)', fontSize: '1rem', fontWeight: 700, background: '#F8FAFC' }}>
                    {cat}
                  </div>
                ))}
                <button style={{ padding: '10px 24px', borderRadius: '30px', border: '2px dashed var(--vibrant-blue)', color: 'var(--vibrant-blue)', background: 'transparent', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }}>
                  + Adicionar Categoria
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="card-light" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '24px' }}>
      <div style={{ padding: '16px', borderRadius: '16px', background: `${color}10`, color: color }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>{title}</p>
        <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>{value}</span>
      </div>
    </div>
  )
}
