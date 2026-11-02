import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Mascot } from "@/components/Mascot";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, X_HANDLE } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: "Arşivlenmiş, etiketlenmiş ve aranabilir Türkçe caps koleksiyonu. Aradığın caps'i saniyeler içinde bul.",
  openGraph: { siteName: SITE_NAME, type: "website", locale: "tr_TR" },
  twitter: { card: "summary_large_image", creator: X_HANDLE ? `@${X_HANDLE}` : undefined },
};

export const viewport: Viewport = {
  themeColor: "#0d0c12",
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
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap"
        />
      </head>
      <body>
        <Nav />
        {children}
        <footer className="footer">
          <div className="container">
            <span className="made"><Mascot size={22} /> © {new Date().getFullYear()} {SITE_NAME}</span>
            <span>Caps&apos;ler eğlence amacıyla arşivlenir. Kaldırılmasını istediğin bir içerik varsa X&apos;ten yaz.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
