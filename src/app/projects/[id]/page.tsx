import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyPage } from "@/components/case-study/CaseStudyPage";
import {
  caseStudyIds,
  getCaseStudyById,
  getCaseStudyProject,
} from "@/lib/data/projectCaseStudies";
import { siteMetadata } from "@/lib/data/personal";
import { absoluteSiteUrl } from "@/lib/seo";

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
  const projectImage = absoluteSiteUrl(project.image || siteMetadata.ogImage);

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
          alt: project.imageAlt,
        },
      ],
      type: "article",
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

  return <CaseStudyPage project={project} study={study} />;
}
