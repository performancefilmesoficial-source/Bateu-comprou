import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bateu Comprou V2 | Smart Affiliate Scout",
  description: "Encontre os melhores produtos virais, preços e vendedores para ganhar como afiliado.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
