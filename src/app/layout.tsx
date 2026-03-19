import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bateu, Comprou | Dashboard de Afiliados",
  description: "Gerencie seus produtos, links e ganhe comissões com vídeos virais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <div className="flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 lg:ml-64 min-h-screen">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
