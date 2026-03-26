"use client"

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Settings, User, Key, Bell, Shield, Save, RefreshCcw, Camera, Lock, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Perfil");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile State
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    bio: "",
    avatar_url: ""
  });

  // Affiliate IDs State
  const [apiKeys, setApiKeys] = useState({
    amazon_tag: "",
    shopee_key: "",
    ml_credentials: ""
  });

  // Password State
  const [password, setPassword] = useState({
    new: "",
    confirm: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch profile
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileData) {
            setProfile({
              full_name: profileData.full_name || "",
              email: user.email || "",
              bio: profileData.bio || "",
              avatar_url: profileData.avatar_url || "/logo.png"
            });
            
            if (profileData.api_keys) {
              setApiKeys({
                amazon_tag: profileData.api_keys.amazon_tag || "",
                shopee_key: profileData.api_keys.shopee_key || "",
                ml_credentials: profileData.api_keys.ml_credentials || ""
              });
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autorizado");

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
        })
        .eq('id', user.id);

      if (error) throw error;
      showMessage('success', 'Perfil atualizado com sucesso!');
    } catch (err: any) {
      showMessage('error', err.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKeys = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autorizado");

      const { error } = await supabase
        .from('profiles')
        .update({
          api_keys: apiKeys
        })
        .eq('id', user.id);

      if (error) throw error;
      showMessage('success', 'IDs de Afiliado atualizados!');
    } catch (err: any) {
      showMessage('error', err.message || 'Erro ao salvar chaves');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      showMessage('error', 'As senhas não coincidem');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password.new
      });
      if (error) throw error;
      showMessage('success', 'Senha alterada com sucesso!');
      setPassword({ new: "", confirm: "" });
    } catch (err: any) {
      showMessage('error', err.message || 'Erro ao alterar senha');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autorizado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('thumbs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('thumbs')
        .getPublicUrl(filePath);

      // Update Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      showMessage('success', 'Foto de perfil atualizada!');
    } catch (err: any) {
      console.error(err);
      showMessage('error', 'Erro ao fazer upload da imagem');
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="card-light" style={{ padding: '5rem', textAlign: 'center' }}>
          <RefreshCcw size={48} className="animate-spin" color="var(--vibrant-blue)" style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Carregando dados...</h3>
        </div>
      );
    }

    switch (activeTab) {
      case "Perfil":
        return (
          <div className="card-light" style={{ padding: '3.5rem' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2.5rem' }}>Dados do Perfil</h3>
            
            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#F1F5F9', border: '4px solid white', boxShadow: 'var(--soft-shadow)', overflow: 'hidden' }}>
                     <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--vibrant-blue)', color: 'white', border: '3px solid white', borderRadius: '50%', padding: '8px', cursor: 'pointer', boxShadow: 'var(--soft-shadow)' }}
                  >
                    <Camera size={20} />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} hidden accept="image/*" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: 800 }}>{profile.full_name || "Usuário"}</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{profile.email}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '10px', fontSize: '1.1rem' }}>Nome Completo</label>
                  <input 
                    type="text" 
                    value={profile.full_name} 
                    onChange={e => setProfile({...profile, full_name: e.target.value})}
                    placeholder="Seu nome"
                    style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)', fontSize: '1.1rem' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '10px', fontSize: '1.1rem' }}>E-mail de Contato</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    disabled
                    style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)', fontSize: '1.1rem', background: '#f8fafc', cursor: 'not-allowed' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '10px', fontSize: '1.1rem' }}>Bio / Descrição do Canal</label>
                <textarea 
                  rows={4} 
                  value={profile.bio}
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  placeholder="Conte um pouco sobre seu canal de ofertas..."
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)', fontSize: '1.1rem' }} 
                />
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button type="submit" className="btn-modern btn-copy" style={{ minWidth: '240px', fontSize: '1.1rem' }} disabled={saving}>
                  {saving ? <RefreshCcw size={20} className="animate-spin" /> : <Save size={20} />} 
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
                {message.text && (
                  <span style={{ color: message.type === 'success' ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                    {message.text}
                  </span>
                )}
              </div>
            </form>
          </div>
        );
      case "ID Afiliado":
        return (
          <div className="card-light" style={{ padding: '3.5rem' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>IDs de Afiliado</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Insira seus identificadores para que os links sejam gerados com sua referência.</p>
            
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div className="card-light" style={{ padding: '1.5rem', borderStyle: 'dashed' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px', fontSize: '1.1rem' }}>Amazon Associates Tag</label>
                <input 
                  type="text" 
                  value={apiKeys.amazon_tag}
                  onChange={e => setApiKeys({...apiKeys, amazon_tag: e.target.value})}
                  placeholder="ex: meunome-20" 
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)', fontSize: '1.1rem' }} 
                />
              </div>
              <div className="card-light" style={{ padding: '1.5rem', borderStyle: 'dashed' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px', fontSize: '1.1rem' }}>Shopee App Key / ID</label>
                <input 
                  type="text" 
                  value={apiKeys.shopee_key}
                  onChange={e => setApiKeys({...apiKeys, shopee_key: e.target.value})}
                  placeholder="Insira sua chave Shopee" 
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)', fontSize: '1.1rem' }} 
                />
              </div>
              <div className="card-light" style={{ padding: '1.5rem', borderStyle: 'dashed' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px', fontSize: '1.1rem' }}>Mercado Livre (App ID / Secret)</label>
                <input 
                  type="text" 
                  value={apiKeys.ml_credentials}
                  onChange={e => setApiKeys({...apiKeys, ml_credentials: e.target.value})}
                  placeholder="Insira suas credenciais ML" 
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)', fontSize: '1.1rem' }} 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={handleSaveApiKeys} className="btn-modern btn-copy" style={{ justifySelf: 'start' }} disabled={saving}>
                  {saving ? <RefreshCcw size={20} className="animate-spin" /> : "Atualizar IDs"}
                </button>
                {message.text && (
                  <span style={{ color: message.type === 'success' ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                    {message.text}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      case "Segurança":
        return (
          <div className="card-light" style={{ padding: '3.5rem' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>Segurança da Conta</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Mantenha sua conta protegida atualizando sua senha regularmente.</p>
            
            <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gap: '2rem', maxWidth: '500px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '10px' }}>Nova Senha</label>
                <input 
                  type="password" 
                  value={password.new}
                  onChange={e => setPassword({...password, new: e.target.value})}
                  placeholder="••••••••" 
                  required
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)', fontSize: '1.1rem' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '10px' }}>Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  value={password.confirm}
                  onChange={e => setPassword({...password, confirm: e.target.value})}
                  placeholder="••••••••" 
                  required
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)', fontSize: '1.1rem' }} 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button type="submit" className="btn-modern btn-copy" style={{ justifySelf: 'start' }} disabled={saving}>
                   {saving ? <RefreshCcw size={20} className="animate-spin" /> : <Lock size={20} />} 
                   {saving ? "Alterando..." : "Alterar Senha"}
                </button>
                {message.text && (
                  <span style={{ color: message.type === 'success' ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                    {message.text}
                  </span>
                )}
              </div>
            </form>

            <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid var(--border-light)' }} />

            <div>
              <h4 style={{ color: '#EF4444', fontWeight: 800, marginBottom: '1rem' }}>Zona de Perigo</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Ao excluir sua conta, todos os seus dados e produtos salvos serão removidos permanentemente.</p>
              <button className="btn-modern" style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2' }}>
                <Trash2 size={18} /> Excluir Minha Conta
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="card-light" style={{ padding: '5rem', textAlign: 'center' }}>
            <RefreshCcw size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Em breve...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Esta seção está sendo preparada para você.</p>
          </div>
        );
    }
  }

  return (
    <div className="main-wrapper">
      <Sidebar />

      <main className="content-area-wide">
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
            Minhas <span style={{ 
              background: 'linear-gradient(120deg, var(--vibrant-blue), #00A3FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900
            }}>Configurações</span>
            <Settings size={40} color="var(--vibrant-blue)" />
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            Personalize sua conta e gerencie sua identificação de afiliado.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '3rem' }}>
          {/* Menu de Configurações */}
          <div className="card-light" style={{ padding: '1.5rem', alignSelf: 'start' }}>
            <SettingsNavItem 
              icon={<User size={20} />} 
              label="Perfil" 
              active={activeTab === "Perfil"} 
              onClick={() => setActiveTab("Perfil")}
            />
            <SettingsNavItem 
              icon={<Key size={20} />} 
              label="ID Afiliado" 
              active={activeTab === "ID Afiliado"} 
              onClick={() => setActiveTab("ID Afiliado")}
            />
            <SettingsNavItem 
              icon={<Bell size={20} />} 
              label="Notificações" 
              active={activeTab === "Notificações"} 
              onClick={() => setActiveTab("Notificações")}
            />
            <SettingsNavItem 
              icon={<Shield size={20} />} 
              label="Segurança" 
              active={activeTab === "Segurança"} 
              onClick={() => setActiveTab("Segurança")}
            />
          </div>

          {/* Conteúdo Dinâmico */}
          {renderContent()}
        </div>
      </main>
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

function SettingsNavItem({ icon, label, active = false, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 20px',
        borderRadius: '12px',
        background: active ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
        color: active ? 'var(--vibrant-blue)' : 'var(--text-muted)',
        fontWeight: 700,
        fontSize: '1.1rem',
        cursor: 'pointer',
        marginBottom: '8px',
        transition: 'all 0.2s ease',
        border: active ? '1px solid rgba(0, 123, 255, 0.2)' : '1px solid transparent'
      }}
      onMouseEnter={(e) => { if(!active) e.currentTarget.style.background = '#F8FAFC' }}
      onMouseLeave={(e) => { if(!active) e.currentTarget.style.background = 'transparent' }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
