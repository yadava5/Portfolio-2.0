import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/data/personal";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* CRITIC-LEDGER F24: `/world-preview/` is the day-arc test bench —
         6,465px of stub chapters, no <h1>, titled "world preview —
         day-arc bench". It carries `noindex` in its own metadata, but
         robots.txt said `Allow: /` and nothing else, so the one file
         that tells a crawler where NOT to go was silent about the only
         page on the site that is not for readers. The page itself stays
         exported: day-arc.spec.ts and docs/design-lab/shoot-arc.mjs
         both drive it against the real static build, and a bench you
         cannot screenshot is a bench you stop trusting. */
      disallow: "/world-preview/",
    },
    sitemap: `${siteMetadata.url}/sitemap.xml`,
  };
}
