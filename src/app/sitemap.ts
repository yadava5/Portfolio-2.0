import type { MetadataRoute } from "next";
import {
  caseStudyIds,
  projectCaseStudies,
} from "@/lib/data/projectCaseStudies";
import { siteMetadata } from "@/lib/data/personal";

export const dynamic = "force-static";

/* CRITIC-LEDGER F50: `lastModified` was `new Date("2026-06-07")` — one
   hardcoded constant on all nine URLs, seven weeks stale, on a site
   whose case files each print `last verified 2026-07` in their own
   kicker. The sitemap was contradicting the pages it indexes.

   Each case file now reports ITS OWN `verified` date — the same field
   the kicker prints, so the two can never disagree again — and the two
   index pages report the newest of them, which is exactly what they
   are: a view over the files. `verified` is YYYY-MM (the precision on
   record), so it resolves to the first of that month rather than
   inventing a day. */
function verifiedDate(verified: string): Date {
  return new Date(`${verified}-01T00:00:00Z`);
}

const caseStudyModified = new Map(
  projectCaseStudies.map((study) => [
    study.projectId,
    verifiedDate(study.verified),
  ])
);

const newestVerified = new Date(
  Math.max(...[...caseStudyModified.values()].map((date) => date.getTime()))
);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteMetadata.url}/`,
      lastModified: newestVerified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...caseStudyIds.map((id) => ({
      url: `${siteMetadata.url}/projects/${id}/`,
      lastModified: caseStudyModified.get(id) ?? newestVerified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${siteMetadata.url}/evidence/`,
      lastModified: newestVerified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
