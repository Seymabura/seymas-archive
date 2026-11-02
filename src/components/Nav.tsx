import Link from "next/link";
import { SITE_NAME, X_HANDLE } from "@/lib/config";
import { XLogo } from "./Icons";
import { Mascot } from "./Mascot";

export function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo" aria-label={`${SITE_NAME} ana sayfa`}>
          <Mascot size={34} />
          <span>{SITE_NAME}</span>
        </Link>
        <nav className="nav-links" aria-label="Site menüsü">
          <Link href="/rastgele" className="btn btn-sm btn-ghost" prefetch={false}>
            <span className="dice" aria-hidden>🎲</span> <span className="hide-sm">Rastgele</span>
          </Link>
          {X_HANDLE && (
            <a className="btn btn-sm" href={`https://x.com/${X_HANDLE}`} target="_blank" rel="noopener noreferrer">
              <XLogo size={13} /> <span className="hide-sm">@{X_HANDLE}</span>
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
