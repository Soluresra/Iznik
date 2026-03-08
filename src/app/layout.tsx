import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0ea5b8",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.iznikle.com"),
  title: "İznikle - Yerel İşletme Rehberi",
  description:
    "İznik'in yerel işletmelerini, esnaflarını ve el sanatı ustalarını keşfedin. Çini sanatçılarından yöresel lezzetlere, tüm İznik bir arada.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  openGraph: {
    title: "İznikle - Yerel İşletme Rehberi",
    description:
      "İznik'in yerel işletmelerini, esnaflarını ve el sanatı ustalarını keşfedin.",
    url: "https://www.iznikle.com",
    siteName: "İznikle",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
