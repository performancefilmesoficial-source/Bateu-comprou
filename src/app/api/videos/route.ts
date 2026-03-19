/**
 * API Route: /api/videos
 * Viral Tracker — busca vídeos virais relacionados ao produto.
 * Usa YouTube Data API v3 se configurada, caso contrário retorna dados simulados.
 */
import { NextRequest, NextResponse } from "next/server";

interface VideoResult {
  id: string;
  titulo: string;
  thumbnail: string;
  canal: string;
  visualizacoes: string;
  url: string;
  plataforma: "youtube" | "simulado";
}

// Thumbnails placeholder reais do Unsplash para simular o feed
const SIMULATED_VIDEOS: Omit<VideoResult, "id">[] = [
  {
    titulo: "Testei o produto mais viral do momento! Vale a pena?",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=320&h=180&fit=crop",
    canal: "@achadadodia",
    visualizacoes: "1.2M",
    url: "#",
    plataforma: "simulado",
  },
  {
    titulo: "Review honesta: esse produto EXPLODIU nas redes sociais",
    thumbnail: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=320&h=180&fit=crop",
    canal: "@compreinaopsei",
    visualizacoes: "893K",
    url: "#",
    plataforma: "simulado",
  },
  {
    titulo: "Esse foi o MELHOR achado que já fiz na internet",
    thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=320&h=180&fit=crop",
    canal: "@ofertas_br",
    visualizacoes: "2.5M",
    url: "#",
    plataforma: "simulado",
  },
  {
    titulo: "Unboxing — produto chegou antes do prazo!",
    thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=320&h=180&fit=crop",
    canal: "@unboxingbrasil",
    visualizacoes: "456K",
    url: "#",
    plataforma: "simulado",
  },
];

async function buscarYouTube(query: string, maxResults = 4): Promise<VideoResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: `${query} review comprar`,
      type: "video",
      maxResults: String(maxResults),
      regionCode: "BR",
      relevanceLanguage: "pt",
      videoDuration: "short",
      order: "viewCount",
      key: apiKey,
    });

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      { next: { revalidate: 3600 } } // cache por 1h
    );

    if (!res.ok) return [];

    const data = await res.json();

    return (data.items ?? []).map((item: any) => ({
      id: item.id.videoId,
      titulo: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url ?? "",
      canal: item.snippet.channelTitle,
      visualizacoes: "—",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      plataforma: "youtube" as const,
    }));
  } catch (err) {
    console.error("[videos] Erro YouTube API:", err);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  let videos: VideoResult[] = [];

  // Tenta YouTube real primeiro
  if (process.env.YOUTUBE_API_KEY) {
    videos = await buscarYouTube(query, 4);
  }

  // Fallback ou sem API: retorna dados simulados contextualizados
  if (videos.length === 0) {
    videos = SIMULATED_VIDEOS.map((v, i) => ({
      ...v,
      id: `sim-${i}`,
      // Personaliza o título com o produto buscado quando possível
      titulo: query
        ? v.titulo.replace("produto", `"${query.split(" ").slice(0, 3).join(" ")}"`)
        : v.titulo,
    }));
  }

  return NextResponse.json({ videos, query, total: videos.length });
}
