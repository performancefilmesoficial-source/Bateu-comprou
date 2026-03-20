import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppWrapper } from "@/components/layout/AppWrapper";

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
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-background text-foreground selection:bg-primary/20`}>
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
