"use client";

import React, { useState, useEffect } from "react";
import { X, Play, Eye, Share2, Youtube, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Video {
  id: string;
  titulo: string;
  thumbnail: string;
  canal: string;
  visualizacoes: string;
  url: string;
}

interface VideoTrackerProps {
  productTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoTracker({ productTitle, isOpen, onClose }: VideoTrackerProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && productTitle) {
      const fetchVideos = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/videos?q=${encodeURIComponent(productTitle)}`);
          const data = await res.json();
          setVideos(data.videos || []);
        } catch (error) {
          console.error("Erro ao buscar vídeos:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchVideos();
    }
  }, [isOpen, productTitle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Youtube size={20} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">Viral Tracker</h3>
              <p className="text-xs text-muted-foreground mt-1">Vídeos recomendados para este produto</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6 scrollbar-hide">
          <div className="flex gap-4 mb-6 sticky top-0 bg-white py-2 z-10 border-b border-border/50">
            <button 
              onClick={() => setVideos(prev => [...prev])} // Just force re-render if needed
              className="flex-1 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100"
            >
              YouTube
            </button>
            <a 
              href={`https://www.tiktok.com/search?q=${encodeURIComponent(productTitle + " achados review")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest text-center"
            >
              TikTok (Busca Real)
            </a>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-sm font-medium text-muted-foreground">Buscando virais...</p>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid gap-6">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col md:flex-row gap-4 p-3 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/[0.02] transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full md:w-48 aspect-video rounded-xl overflow-hidden bg-muted">
                    <img 
                      src={video.thumbnail} 
                      alt={video.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg">
                        <Play size={20} fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {video.titulo}
                      </h4>
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        {video.canal}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                        <Eye size={12} />
                        {video.visualizacoes} 
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                        <Share2 size={12} />
                        Referência Viral
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6 space-y-4">
               <p className="text-muted-foreground text-sm italic">Nenhum vídeo específico carregado no Feed.</p>
               <a 
                href={`https://www.tiktok.com/search?q=${encodeURIComponent(productTitle + " review")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
               >
                 Abrir Busca no TikTok
               </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/10">
          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider font-bold">
            Vídeos extraídos via Viral Tracker Engine v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
