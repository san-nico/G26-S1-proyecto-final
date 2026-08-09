import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMF Bancos",
  description: "Consulta estados de situación financiera y estados de resultado de bancos de Chile.",
  openGraph: {
    title: "CMF Bancos",
    description: "Consulta estados de situación financiera y estados de resultado de bancos de Chile.",
    url: "https://tu-sitio-web.cl", // Reemplaza con tu dominio real
    siteName: "CMF Bancos",
    images: [
      {
        url: "https://tu-sitio-web.cl/og-image.png", // URL absoluta de tu imagen (recomendado 1200x630px)
        width: 1200,
        height: 630,
        alt: "CMF Bancos - Consulta de estados financieros",
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
