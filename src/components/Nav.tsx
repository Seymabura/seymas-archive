import Link from "next/link";
import { SITE_NAME, X_HANDLE } from "@/lib/config";
import { XLogo } from "./Icons";

export function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo" aria-label={`${SITE_NAME} ana sayfa`}>
          <span className="logo-mark" aria-hidden>S</span>
          <span>{SITE_NAME}</span>
        </Link>
        <nav className="nav-links" aria-label="Site menüsü">
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
