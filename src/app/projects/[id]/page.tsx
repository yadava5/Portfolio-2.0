import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyPage } from "@/components/case-study/CaseStudyPage";
import {
  caseStudyIds,
  getCaseStudyById,
  getCaseStudyProject,
} from "@/lib/data/projectCaseStudies";
import { siteMetadata } from "@/lib/data/personal";
import { absoluteSiteUrl, caseStudyGraph, jsonLdHtml } from "@/lib/seo";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export function generateStaticParams() {
  return caseStudyIds.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const study = getCaseStudyById(id);
  const project = study ? getCaseStudyProject(study) : undefined;

  if (!study || !project) {
    return {
      title: "Project Not Found | Ayush Yadav",
    };
  }

  const projectUrl = `${siteMetadata.url}/projects/${project.id}/`;
  /* CRITIC-LEDGER F25: this was `project.image`, which for jobtracker,
     visual-assist, master-inventory and policybot is an
     `*-architecture.svg` — declared 1200×630 and rejected outright by
     every major platform, so the flagship first row shared as a bare
     link. Each case file now has its own rendered raster card
     (public/og/case-<id>.png, `npm run assets:render-og`): the site's
     paper, the file number, the title and this same summary. */
  const projectImage = absoluteSiteUrl(`/og/case-${project.id}.png`);
  /* Fix round 4: `’`, not `'`. This string is the og:image alt on all
     seven case files — the line a screen reader gets when a shared card
     will not load — and the round-3 apostrophe sweep could not see it,
     because an attribute is not painted prose. */
  const projectImageAlt = `Case file card — ${project.title}, from Ayush Yadav’s portfolio`;

  return {
    title: `${project.title} Case Study | Ayush Yadav`,
    description: study.summary,
    alternates: {
      canonical: projectUrl,
    },
    openGraph: {
      title: `${project.title} Case Study | Ayush Yadav`,
      description: study.summary,
      url: projectUrl,
      siteName: siteMetadata.title,
      images: [
        {
          url: projectImage,
          width: 1200,
          height: 630,
          alt: projectImageAlt,
        },
      ],
      type: "article",
      publishedTime: study.filed,
      modifiedTime: study.verified,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} Case Study | Ayush Yadav`,
      description: study.summary,
      images: [projectImage],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const study = getCaseStudyById(id);
  const project = study ? getCaseStudyProject(study) : undefined;

  if (!study || !project) {
    notFound();
  }

  return (
    <>
      {/* CRITIC-LEDGER F23: the case file as a TechArticle about a
          typed project node (SoftwareSourceCode where a public repo
          exists, WebApplication where only a demo does, neither
          promised where the repo is private). Dates are the kicker's
          own filed/verified. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(caseStudyGraph(project, study)),
        }}
      />
      <CaseStudyPage project={project} study={study} />
    </>
  );
}
