import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "OddsScanner - Melhores Odds e Surebets do Brasileirão 2026",
  description: "Comparador de odds em tempo real. Encontre as melhores odds, value bets e surebets com lucro garantido. Alertas gratuitos para oportunidades imperdíveis.",
  keywords: "melhores odds, odds brasileirão, comparador de odds, surebets brasil, value bet, dropping odds, apostas esportivas",
  authors: [{ name: "OddsScanner" }],
  openGraph: {
    title: "OddsScanner - Melhores Odds do Brasileirão",
    description: "Encontre surebets e value bets em tempo real. Lucro garantido!",
    url: "https://odds-scanner.vercel.app/",
    siteName: "OddsScanner",
    images: [
      {
        url: "https://odds-scanner.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OddsScanner - Comparador de Odds",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OddsScanner - Melhores Odds do Brasileirão",
    description: "Surebets e value bets em tempo real!",
    images: ["https://odds-scanner.vercel.app/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "seu-codigo-google-search-console",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        {/* OneSignal Script */}
        <Script
          src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignal = window.OneSignal || [];
            OneSignal.push(function() {
              OneSignal.init({
                appId: "a9cd52e5-01ff-4605-a1f0-9d8ab2adff1e",
                safari_web_id: "web.onesignal.auto",
                notifyButton: {
                  enable: false,
                },
                allowLocalhostAsSecureOrigin: true, 
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}