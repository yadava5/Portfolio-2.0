import type { MetadataRoute } from "next";
import { caseStudyIds } from "@/lib/data/projectCaseStudies";
import { siteMetadata } from "@/lib/data/personal";

export const dynamic = "force-static";

const lastModified = new Date("2026-06-07");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteMetadata.url}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...caseStudyIds.map((id) => ({
      url: `${siteMetadata.url}/projects/${id}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${siteMetadata.url}/evidence/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
