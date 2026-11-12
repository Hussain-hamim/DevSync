import type { MetadataRoute } from "next";
import { siteUrl } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Project and team routes require sign-in.
  return [{ url: `${siteUrl}/` }];
}
