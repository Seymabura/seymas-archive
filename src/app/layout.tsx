import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, X_HANDLE } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: "Arşivlenmiş, etiketlenmiş ve aranabilir Türkçe caps koleksiyonu. Aradığın caps'i saniyeler içinde bul.",
  openGraph: { siteName: SITE_NAME, type: "website", locale: "tr_TR" },
  twitter: { card: "summary_large_image", creator: X_HANDLE ? `@${X_HANDLE}` : undefined },
};

export const viewport: Viewport = {
  themeColor: "#060608",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;800&family=Manrope:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&display=swap"
        />
      </head>
      <body>
        <Nav />
        {children}
        <footer className="footer">
          <div className="container">
            <span>© {new Date().getFullYear()} {SITE_NAME}</span>
            <span>Caps'ler eğlence amaçlı arşivlenmiştir. Kaldırılmasını istediğin bir içerik varsa X üzerinden yaz.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
