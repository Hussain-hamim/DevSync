import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";
import { Analytics } from "@vercel/analytics/react";
import AnalyticsTracker from "./components/AnalyticsTracker";
import HeaderShell from "@/components/HeaderShell";
import { Suspense } from "react";

import { siteDescription, siteTitle, siteUrl } from "./lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: "%s | DevSync" },
  description: siteDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>
          <HeaderShell />
          {children}
          <Analytics />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
