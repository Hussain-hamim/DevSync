import type { Metadata } from "next";
import Home from "./home-client";
import { siteDescription, siteTitle, siteUrl } from "./lib/site";

const preview = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "DevSync — Find your next project. Build it with a team.",
};

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "DevSync",
    url: "/",
    title: siteTitle,
    description: siteDescription,
    images: [preview],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [preview],
  },
};

export default function Page() {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DevSync",
    url: siteUrl,
    description: siteDescription,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website).replace(/</g, "\\u003c") }} />
      <Home />
    </>
  );
}
