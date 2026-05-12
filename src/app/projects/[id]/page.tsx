import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyPage } from "@/components/case-study/CaseStudyPage";
import {
  caseStudyIds,
  getCaseStudyById,
  getCaseStudyProject,
} from "@/lib/data/projectCaseStudies";
import { siteMetadata } from "@/lib/data/personal";

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

  return {
    title: `${project.title} Case Study | Ayush Yadav`,
    description: study.summary,
    alternates: {
      canonical: `${siteMetadata.url}/projects/${project.id}`,
    },
    openGraph: {
      title: `${project.title} Case Study | Ayush Yadav`,
      description: study.summary,
      url: `${siteMetadata.url}/projects/${project.id}`,
      siteName: siteMetadata.title,
      images: [
        {
          url: project.image || siteMetadata.ogImage,
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
      images: [project.image || siteMetadata.ogImage],
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
