import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";
import { Analytics } from "@vercel/analytics/react";
import AnalyticsTracker from "./components/AnalyticsTracker";
import HeaderShell from "@/components/HeaderShell";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "DevSync",
  description: "For Developers",
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
