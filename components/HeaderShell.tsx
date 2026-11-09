"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

// 11 pages historically imported <Header/> and now use this shell.
// Landing ("/") keeps its per-page <Header/> because landing.module.css
// scopes `.landing > header` styles that require the header inside the
// .landing container (moving it to the layout would restyle the page).
// Everything else (/login, /admin*, /dashboard, /test) never had the global
// Header and must stay without it. /projects/new has its own custom header
// (X close button) and intentionally gets no global Header.
export default function HeaderShell() {
  const pathname = usePathname();

  // Landing + /projects/new must run before the prefix checks.
  if (pathname === "/" || pathname === "/projects/new") {
    return null;
  }

  const shouldShowHeader =
    pathname.startsWith("/projects/") ||
    pathname === "/projects" ||
    pathname.startsWith("/teams/") ||
    pathname === "/teams" ||
    pathname.startsWith("/profile/") ||
    pathname === "/profile" ||
    pathname === "/rankings" ||
    pathname === "/notifications" ||
    pathname === "/sponsors";

  if (!shouldShowHeader) {
    return null;
  }

  return <Header />;
}
