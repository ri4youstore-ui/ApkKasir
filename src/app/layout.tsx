import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './globals.css';
  
import ClientProviders from "@/components/providers/client-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ApkKasir - Modern POS System",
  description: "Professional Point of Sale System for Your Business",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ApkKasir",
  },
  formatDetection: {
    telephone: false,
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#1f2937",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#1f2937" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
