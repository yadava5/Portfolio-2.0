import {
  Accessibility,
  Brain,
  Code2,
  Cpu,
  Database,
  FileText,
  Github,
  Layers3,
  Linkedin,
  Mail,
  Map,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import {
  ActionLink,
  AtlasSectionHeading,
  EvidenceChecklist,
  MetricCard,
  PipelineMap,
  ProjectEvidenceCard,
} from "@/components/atlas/AtlasEvidence";
import {
  awards,
  education,
  personalInfo,
  socialLinks,
} from "@/lib/data/personal";
import { experiences } from "@/lib/data/experience";
import { getPublicProjects, projects } from "@/lib/data/projects";
import {
  getCaseStudyById,
  projectCaseStudies,
} from "@/lib/data/projectCaseStudies";
import { skillCategories } from "@/lib/data/skills";
import { testimonials } from "@/lib/data/testimonials";

const github = socialLinks.find((link) => link.name === "GitHub");
const linkedIn = socialLinks.find((link) => link.name === "LinkedIn");

const proofMetrics = [
  {
    icon: Database,
    value: "1M+",
    label: "Rows processed",
    detail: "Python and SQL pipelines for operational datasets",
  },
  {
    icon: Workflow,
    value: "738",
    label: "Automated tests",
    detail: "Dynamic Calendar frontend, backend, and integration proof",
  },
  {
    icon: Mail,
    value: "500+",
    label: "Emails/month",
    detail: "Local classification volume in JobTracker",
  },
  {
    icon: FileText,
    value: "50+ docs",
    label: "Policy sources",
    detail: "Institutional documents indexed for cited retrieval",
  },
];

const pipelineSteps = [
  { label: "Ingest", detail: "APIs, email, reports, datasets", icon: Database },
  {
    label: "Validate",
    detail: "Schemas, quality checks, tests",
    icon: ShieldCheck,
  },
  { label: "Transform", detail: "Python, SQL, pandas, ETL", icon: Layers3 },
  { label: "Model", detail: "ML workflows and evaluation", icon: Brain },
  { label: "Serve", detail: "Dashboards, apps, APIs", icon: Code2 },
  { label: "Monitor", detail: "Usage, regressions, outcomes", icon: Map },
];

const depthAreas = [
  {
    title: "Data systems",
    icon: Database,
    points: ["Python/SQL ETL", "Snowflake and Tableau", "API integration"],
  },
  {
    title: "ML evaluation",
    icon: Brain,
    points: [
      "RAG + MCP orchestration",
      "HPO and multi-model search",
      "On-device classifiers",
    ],
  },
  {
    title: "Performance",
    icon: Cpu,
    points: ["C++ SIMD paths", "OpenMP parallelism", "Benchmark-driven proof"],
  },
  {
    title: "Accessibility",
    icon: Accessibility,
    points: [
      "VoiceOver-first flows",
      "LiDAR obstacle detection",
      "On-device privacy",
    ],
  },
];

function getSocialUrl(name: string) {
  return socialLinks.find((link) => link.name === name)?.url ?? "#contact";
}

function formatEducationEndDate(endDate: string) {
  const [year, month] = endDate.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function TechnicalOperationsAtlas() {
  const currentExperience = experiences[0];
  const graduationDate = formatEducationEndDate(education[0].endDate);
  const publicProjects = getPublicProjects();
  const caseStudyProjects = projectCaseStudies
    .map((study) => projects.find((project) => project.id === study.projectId))
    .filter(Boolean);
  const privateProjects = projects.filter((project) => project.isPrivate);
  const topSkills = skillCategories.flatMap((category) =>
    category.skills.slice(0, 3).map((skill) => ({
      ...skill,
      category: category.name,
    }))
  );

  return (
    <div className="min-h-screen bg-[#090b0d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_32rem),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.10),transparent_26rem),linear-gradient(180deg,rgba(9,11,13,0.2),#090b0d_80%)]" />

      <div className="relative z-10">
        <section
          id="hero"
          className="mx-auto grid w-full max-w-7xl gap-6 px-5 pt-24 pb-12 md:min-h-screen md:grid-cols-[0.9fr_1.1fr] md:px-8 lg:px-10"
        >
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-amber-400 uppercase">
              Role target / {graduationDate}
            </p>
            <p className="mb-4 text-lg font-semibold text-zinc-100 md:text-2xl">
              Software / Data / ML Engineering
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-5xl 2xl:text-6xl">
              Ayush Yadav builds reliable data, ML, and software systems.
            </h1>
            <div className="mt-5 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
              <p>
                <span className="block text-xs tracking-[0.2em] text-zinc-600 uppercase">
                  Current role
                </span>
                {personalInfo.title}
              </p>
              <p>
                <span className="block text-xs tracking-[0.2em] text-zinc-600 uppercase">
                  Availability
                </span>
                <span className="text-emerald-400">
                  {personalInfo.availability}
                </span>
              </p>
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-400 md:text-lg md:leading-7">
              <span className="sm:hidden">
                Senior CS student building data pipelines, ML workflows,
                full-stack systems, and accessible native products.
              </span>
              <span className="hidden sm:inline">
                Senior CS student focused on data pipelines, applied ML,
                full-stack systems, performance work, and accessible native
                products. Current work processes 1M+ operational rows into
                trusted datasets and dashboards.
              </span>
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <ActionLink
                href={personalInfo.resumeUrl}
                label="Resume"
                primary
              />
              <ActionLink href={getSocialUrl("GitHub")} label="GitHub" />
              <ActionLink href={getSocialUrl("LinkedIn")} label="LinkedIn" />
              <ActionLink href="#contact" label="Contact" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
              {proofMetrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </div>
          </div>

          <div className="hidden flex-col justify-center gap-4 md:flex">
            <PipelineMap steps={pipelineSteps} />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded border border-zinc-800 bg-zinc-950/80 p-4">
                <p className="font-mono text-xs tracking-[0.22em] text-zinc-500 uppercase">
                  JobTracker
                </p>
                <p className="mt-3 text-2xl font-semibold text-emerald-400">
                  500+ emails/month
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Local ML classification for job-search signals.
                </p>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950/80 p-4">
                <p className="font-mono text-xs tracking-[0.22em] text-zinc-500 uppercase">
                  Visual Assist
                </p>
                <p className="mt-3 text-2xl font-semibold text-emerald-400">
                  68 tests
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Unit coverage for iOS accessibility models and utilities.
                </p>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950/80 p-4">
                <p className="font-mono text-xs tracking-[0.22em] text-zinc-500 uppercase">
                  PolicyBot
                </p>
                <p className="mt-3 text-2xl font-semibold text-emerald-400">
                  50+ docs
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Institutional policy retrieval with cited sources.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="border-y border-zinc-900 bg-zinc-950/50">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:grid-cols-[0.8fr_1.2fr] md:px-8 lg:px-10">
            <AtlasSectionHeading
              eyebrow="Profile"
              title="Senior CS student shipping data, ML, native, and full-stack systems."
              description="The site uses one source-truth identity, not generated concept copy."
            />
            <div className="grid gap-5">
              {personalInfo.bio.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-base leading-7 text-zinc-300"
                >
                  {paragraph}
                </p>
              ))}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded border border-zinc-800 bg-zinc-950/70 p-5">
                  <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">
                    Education
                  </p>
                  <p className="mt-2 font-semibold text-zinc-100">
                    {education[0].degree} in {education[0].field}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {education[0].school} - Expected {graduationDate}
                  </p>
                </div>
                <div className="rounded border border-zinc-800 bg-zinc-950/70 p-5">
                  <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">
                    Recognition
                  </p>
                  <p className="mt-2 font-semibold text-zinc-100">
                    Dean&apos;s List x{awards.length}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Miami University academic recognition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="projects"
          className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:px-10"
        >
          <AtlasSectionHeading
            eyebrow="Selected Work"
            title="Evidence records for the projects that best explain the engineering."
            description="Public and private-safe case studies use source-truth data, representative visuals, metrics, and explicit private/public link state."
          />
          <div className="grid gap-5">
            {caseStudyProjects.map((project, index) =>
              project ? (
                <ProjectEvidenceCard
                  key={project.id}
                  project={project}
                  study={getCaseStudyById(project.id)}
                  index={index}
                />
              ) : null
            )}
          </div>
        </section>

        <section
          id="experience"
          className="border-y border-zinc-900 bg-zinc-950/50"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:px-10">
            <AtlasSectionHeading
              eyebrow="Experience"
              title="Operational data work with production-facing constraints."
              description="The Miami ITSM role anchors the Atlas identity because it connects data quality, pipelines, dashboards, APIs, and real organizational use."
            />
            <article className="grid gap-8 rounded border border-zinc-800 bg-zinc-950/75 p-5 md:grid-cols-[0.7fr_1.3fr] md:p-8">
              <div>
                <p className="text-sm tracking-[0.2em] text-amber-400 uppercase">
                  {currentExperience.company}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-zinc-50">
                  {currentExperience.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  {currentExperience.startDate} - {currentExperience.endDate} /{" "}
                  {currentExperience.location}
                </p>
              </div>
              <div className="grid gap-6">
                <EvidenceChecklist items={currentExperience.achievements} />
                <div className="flex flex-wrap gap-2">
                  {currentExperience.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </section>

        <section
          id="skills"
          className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:px-10"
        >
          <AtlasSectionHeading
            eyebrow="Technical Depth"
            title="Proof categories instead of a generic skill wall."
            description="The categories line up with the work: data quality, ML evaluation, performance engineering, accessibility, backend systems, and shipping discipline."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {depthAreas.map((area) => {
              const Icon = area.icon;
              return (
                <article
                  key={area.title}
                  className="rounded border border-zinc-800 bg-zinc-950/75 p-5"
                >
                  <Icon
                    className="mb-5 text-amber-300"
                    size={24}
                    aria-hidden="true"
                  />
                  <h3 className="text-xl font-semibold text-zinc-50">
                    {area.title}
                  </h3>
                  <ul className="mt-4 grid gap-2">
                    {area.points.map((point) => (
                      <li key={point} className="text-sm text-zinc-400">
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
          <div className="mt-8 rounded border border-zinc-800 bg-zinc-950/60 p-5">
            <p className="mb-4 text-xs tracking-[0.2em] text-zinc-500 uppercase">
              Source-truth skills
            </p>
            <div className="flex flex-wrap gap-2">
              {topSkills.map((skill) => (
                <span
                  key={`${skill.category}-${skill.name}`}
                  className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-400"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-900 bg-zinc-950/50">
          <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:px-10">
            <AtlasSectionHeading
              eyebrow="Project Index"
              title="Public links where they exist, private proof where they do not."
              description="This keeps the portfolio honest about what can be inspected directly and what comes from work-related source truth."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {publicProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-4 rounded border border-zinc-800 bg-zinc-950/70 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-zinc-50">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {project.category}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {getCaseStudyById(project.id) ? (
                      <a
                        href={`/projects/${project.id}`}
                        className="text-sky-300 hover:text-sky-200"
                      >
                        Case study
                      </a>
                    ) : null}
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-300 hover:text-zinc-100"
                      >
                        GitHub
                      </a>
                    ) : null}
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-300 hover:text-zinc-100"
                      >
                        Live
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
              {privateProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded border border-zinc-800 bg-zinc-950/70 p-5"
                >
                  <h3 className="font-semibold text-zinc-50">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {project.shortDescription}
                  </p>
                  <p className="mt-3 text-xs tracking-[0.2em] text-amber-400 uppercase">
                    Private/work-related proof
                  </p>
                  {getCaseStudyById(project.id) ? (
                    <a
                      href={`/projects/${project.id}`}
                      className="mt-4 inline-flex text-sm font-semibold text-sky-300 hover:text-sky-200"
                    >
                      Private-safe case study
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:px-10"
        >
          <AtlasSectionHeading
            eyebrow="Recommendations"
            title="People who worked with the output, not just the portfolio."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <blockquote
                key={testimonial.id}
                className="rounded border border-zinc-800 bg-zinc-950/75 p-5"
              >
                <p className="line-clamp-6 text-sm leading-6 text-zinc-300">
                  &quot;{testimonial.quote}&quot;
                </p>
                <footer className="mt-5 border-t border-zinc-800 pt-4">
                  <p className="font-semibold text-zinc-50">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section id="contact" className="border-t border-zinc-900 bg-zinc-950">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:grid-cols-[1fr_0.9fr] md:px-8 lg:px-10">
            <div>
              <p className="mb-4 text-xs font-semibold tracking-[0.28em] text-amber-400 uppercase">
                Contact
              </p>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
                Open a channel for software, data, or ML engineering work.
              </h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <ActionLink
                  href={`mailto:${personalInfo.email}`}
                  label={personalInfo.email}
                  primary
                />
                <ActionLink href={personalInfo.resumeUrl} label="Resume PDF" />
                <ActionLink href={getSocialUrl("GitHub")} label="GitHub" />
                <ActionLink href={getSocialUrl("LinkedIn")} label="LinkedIn" />
              </div>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-950/80 p-5">
              <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">
                Resume preview
              </p>
              <dl className="mt-5 grid gap-4 text-sm">
                <div>
                  <dt className="text-zinc-500">Education</dt>
                  <dd className="mt-1 text-zinc-100">
                    Miami University, B.S. Computer Science, {graduationDate}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Current role</dt>
                  <dd className="mt-1 text-zinc-100">{personalInfo.title}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Links</dt>
                  <dd className="mt-2 flex flex-wrap gap-3">
                    <a
                      href={github?.url}
                      className="inline-flex items-center gap-2 text-zinc-300 hover:text-zinc-100"
                    >
                      <Github size={16} aria-hidden="true" /> GitHub
                    </a>
                    <a
                      href={linkedIn?.url}
                      className="inline-flex items-center gap-2 text-zinc-300 hover:text-zinc-100"
                    >
                      <Linkedin size={16} aria-hidden="true" /> LinkedIn
                    </a>
                    <a
                      href={`mailto:${personalInfo.email}`}
                      className="inline-flex items-center gap-2 text-zinc-300 hover:text-zinc-100"
                    >
                      <Mail size={16} aria-hidden="true" /> Email
                    </a>
                    <a
                      href={personalInfo.resumeUrl}
                      className="inline-flex items-center gap-2 text-zinc-300 hover:text-zinc-100"
                    >
                      <FileText size={16} aria-hidden="true" /> Resume
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
