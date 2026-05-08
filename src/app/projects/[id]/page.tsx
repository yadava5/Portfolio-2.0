import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyPage } from "@/components/case-study/CaseStudyPage";
import {
  caseStudyIds,
  getCaseStudyById,
  getCaseStudyProject,
} from "@/lib/data/projectCaseStudies";

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
