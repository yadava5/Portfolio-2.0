/**
 * @fileoverview Project data for the portfolio
 *
 * Contains all project information including metadata, tech stacks,
 * descriptions, and links. Projects are categorized as featured or standard.
 */

import { withBasePath } from "@/lib/utils";

/** Technology/skill tag */
export interface TechTag {
  name: string;
  color?: string;
}

/** Impact metric for a project */
export interface ProjectMetric {
  label: string;
  value: string;
}

export type ProjectImageKind =
  | "real-screenshot"
  | "representative-visual"
  | "diagram";

/** Project data structure */
export interface Project {
  /** Unique identifier (URL-safe slug) */
  id: string;
  /** Project title */
  title: string;
  /** Short description (1-2 sentences) */
  shortDescription: string;
  /** Full description for case study page */
  fullDescription: string;
  /** Technology stack used */
  techStack: TechTag[];
  /** GitHub repository URL (null for private) */
  githubUrl: string | null;
  /** Live demo URL (if available) */
  liveUrl: string | null;
  /** Project image path */
  image: string;
  /** Intrinsic pixel width of the image, when known (raster captures —
   *  lets the case-file hero render with explicit dimensions instead
   *  of `fill`; CLS regression hardening per PERF-AUDIT fix 4) */
  imageWidth?: number;
  /** Intrinsic pixel height of the image, when known */
  imageHeight?: number;
  /** What kind of visual the image represents */
  imageKind: ProjectImageKind;
  /** Accessible alt text for the project image */
  imageAlt: string;
  /** Public disclosure for representative/private-safe visuals */
  imageDisclosure: string;
  /** Whether this is a featured project (shows larger in bento grid) */
  featured: boolean;
  /** Project category */
  category: "ai-ml" | "full-stack" | "mobile" | "data" | "other";
  /** Start date (YYYY-MM) */
  startDate: string;
  /** End date (YYYY-MM or "Present") */
  endDate: string;
  /** Key highlights/achievements */
  highlights: string[];
  /** Whether the project is private/work-related */
  isPrivate: boolean;
  /** Whether the project is ready to appear in recruiter-facing portfolio lists */
  portfolioVisible?: boolean;
  /** Quantifiable impact metrics */
  metrics?: ProjectMetric[];
  /** Project status (e.g., "recent" for recently updated) */
  status?: string;
  /** Status label for display */
  statusLabel?: string;
  /** Source-truth proof manifest IDs for visible project metrics */
  proofIds?: string[];
}

/**
 * All portfolio projects
 *
 * Ordered by importance/recency. Featured projects appear larger in the grid.
 */
export const projects: Project[] = [
  {
    id: "jobtracker",
    title: "Applied",
    shortDescription:
      "A Next.js job-search tool: connect Gmail, fetch your inbox, and a 3-layer hybrid classifier turns it into a live dashboard of your real applications.",
    fullDescription:
      "Applied (formerly JobTracker) connects Gmail, fetches your inbox, and runs a 3-layer hybrid classifier (rules -> e5 similarity -> a gated SetFit model) to build a dashboard of your actual applications — with a pipeline snapshot, needs-review and ghosting flags, and a classify-and-train review queue. The same classifier is also shipped as an in-browser int8 ONNX model (22.8 MB, output-identical, zero servers).",
    techStack: [
      { name: "Next.js 16", color: "#000000" },
      { name: "TypeScript", color: "#3178c6" },
      { name: "PostgreSQL", color: "#336791" },
      { name: "Python", color: "#3776ab" },
      { name: "SetFit", color: "#ff6f00" },
      { name: "ONNX Runtime", color: "#8a2be2" },
    ],
    githubUrl: "https://github.com/yadava5/jobtracker",
    liveUrl: "https://getapplied.vercel.app",
    image: withBasePath("/images/projects/jobtracker-architecture.svg"),
    imageKind: "diagram",
    imageAlt: "JobTracker local email classification architecture diagram",
    imageDisclosure:
      "Architecture diagram generated from public repository structure; private email content is not shown.",
    featured: true,
    category: "ai-ml",
    startDate: "2026-02",
    endDate: "Present",
    highlights: [
      "Real Gmail connect -> fetch -> 3-layer hybrid classify (rules -> e5 similarity -> gated SetFit)",
      "Dashboard of your real applications: pipeline snapshot, needs-review and ghosting flags, review queue",
      "DB-enforced Postgres RLS: non-BYPASSRLS role + per-request JWT-claims GUC; user_credentials FORCE'd",
      "Least-privilege gmail.readonly scope with encrypted, revocable refresh tokens",
      "Also ships as an in-browser int8 ONNX classifier (22.8 MB, output-identical)",
    ],
    isPrivate: false,
    metrics: [
      { label: "Classifier", value: "3-layer hybrid — rules -> e5 -> SetFit" },
      { label: "Runs in-browser", value: "int8 ONNX, output-identical" },
    ],
    proofIds: [
      "jobtracker-local-classifier",
      "jobtracker-macro-f1",
      "jobtracker-backend-tests",
    ],
  },
  {
    id: "automl",
    title: "Agentic AutoML Platform",
    shortDescription:
      "Private GitHub-backed capstone platform for turning datasets and domain documents into LLM-orchestrated, auditable ML workflows.",
    fullDescription:
      "A senior-design platform (private repo ai-augmented-auto-ml-toolchain) that turns datasets and domain documents into production ML via LLM-orchestrated pipelines. It uses LangGraph and MCP tools for agentic orchestration with human-in-the-loop approval gates across a 7-phase ML lifecycle; its default model is GPT-5.4.",
    techStack: [
      { name: "TypeScript", color: "#3178c6" },
      { name: "React 19", color: "#61dafb" },
      { name: "Express 5", color: "#000000" },
      { name: "PostgreSQL", color: "#336791" },
      { name: "Docker", color: "#2496ed" },
      { name: "LangGraph", color: "#ff6f00" },
      { name: "MCP", color: "#00d4aa" },
    ],
    githubUrl: null,
    liveUrl: "https://agentic-automl-platform.vercel.app",
    // WebP derivative of the promoted capture (assets:derive) — the PNG
    // was 157KB eager+preloaded on the case page (PERF-AUDIT fix 4).
    image: withBasePath("/images/projects/automl.webp"),
    imageWidth: 1376,
    imageHeight: 768,
    imageKind: "real-screenshot",
    imageAlt:
      "Private-safe Agentic AutoML experiment registry screenshot with demo data",
    imageDisclosure:
      "Private-safe screenshot from the local AutoML repository demo data; source repository remains private.",
    featured: true,
    category: "ai-ml",
    startDate: "2025-09",
    endDate: "Present",
    highlights: [
      "LangGraph and MCP orchestration for agentic ML workflow phases",
      "Human-in-the-loop approval gates for generated actions",
      "Upload, EDA, NL-to-SQL, preprocessing, training, experiments, and deployment phases",
      "Dockerized execution runtime with reproducible notebook runs",
      "Default model GPT-5.4; built-in Playwright and eval-runner validation paths",
    ],
    isPrivate: true,
    metrics: [
      { label: "Workflow", value: "7-phase ML lifecycle" },
      { label: "Orchestration", value: "LangGraph + MCP" },
    ],
    proofIds: ["automl-workflow-proof"],
  },
  {
    id: "visual-assist",
    title: "Visual Assist",
    shortDescription:
      "Privacy-first iOS accessibility app using LiDAR, Vision, haptics, and voice guidance.",
    fullDescription:
      "A native iOS accessibility app designed to help visually impaired users navigate their environment safely. Built with ARKit, Vision, haptics, speech, and VoiceOver-first SwiftUI flows for local processing.",
    techStack: [
      { name: "Swift", color: "#fa7343" },
      { name: "SwiftUI", color: "#0071e3" },
      { name: "ARKit", color: "#000000" },
      { name: "Core Haptics", color: "#34c759" },
      { name: "Vision", color: "#5856d6" },
    ],
    githubUrl: "https://github.com/yadava5/VisualAssist",
    liveUrl: null,
    image: withBasePath("/images/projects/visual-assist-architecture.svg"),
    imageKind: "diagram",
    imageAlt: "Visual Assist on-device accessibility architecture diagram",
    imageDisclosure:
      "Architecture diagram generated from public repository structure; live camera and location context are not shown.",
    featured: true,
    category: "mobile",
    startDate: "2025-03",
    endDate: "Present",
    highlights: [
      "LiDAR obstacle detection with haptic feedback",
      "Vision OCR with speech synthesis for text reading",
      "On-device Vision workflows for privacy-first processing",
      "VoiceOver-first accessibility with voice commands",
      "71 unit tests for models and utilities",
    ],
    isPrivate: false,
    // Retired from recruiter-facing lists (not one of the six live
    // showcase projects) — data, case study, and route are preserved so
    // the private-safe dossier still resolves and nothing 404s.
    portfolioVisible: false,
    metrics: [
      { label: "Accessibility", value: "Computer vision powered" },
      { label: "Sensors", value: "LiDAR obstacle detection" },
    ],
    proofIds: ["visual-assist-tests"],
  },
  {
    id: "taskflow-calendar",
    title: "Cadence",
    shortDescription:
      "A calendar and task app you drive in plain English: type a sentence and it files the event or task — and now schedules Google Meet meetings with multi-attendee invites.",
    fullDescription:
      "Cadence (formerly TaskFlow) is a full-stack calendar and task manager that takes its scheduling in plain English — type a sentence and it files the event or task. It now schedules Google Meet meetings with multi-attendee Gmail invites and Meet links via the calendar.events scope. Built on React 19, serverless functions, and PostgreSQL (Supabase); NLP via chrono-node and compromise.",
    techStack: [
      { name: "React 19", color: "#61dafb" },
      { name: "TypeScript", color: "#3178c6" },
      { name: "PostgreSQL", color: "#336791" },
      { name: "Supabase", color: "#3ecf8e" },
      { name: "Google Calendar API", color: "#4285f4" },
      { name: "chrono-node", color: "#8b5cf6" },
    ],
    githubUrl: "https://github.com/yadava5/cadence",
    liveUrl: "https://usecadenceapp.vercel.app",
    image: withBasePath("/images/projects/taskflow.png"),
    imageWidth: 1376,
    imageHeight: 768,
    imageKind: "real-screenshot",
    imageAlt: "Real Taskflow local demo calendar screenshot",
    imageDisclosure:
      "Real local frontend screenshot captured with the repository mock-login flow and demo user state.",
    featured: true,
    category: "full-stack",
    startDate: "2023-09",
    endDate: "2025-05",
    highlights: [
      "Plain-English input parsed into events and tasks (chrono-node + compromise)",
      "Schedules Google Meet meetings with multi-attendee Gmail invites + Meet links",
      "1,145 automated tests (634 frontend + 511 backend), all passing",
      "React 19 + serverless + PostgreSQL (Supabase), CA-pinned TLS",
    ],
    isPrivate: false,
    metrics: [
      { label: "Input", value: "Plain-English -> events + tasks" },
      { label: "Meetings", value: "Google Meet + multi-attendee invites" },
    ],
    proofIds: ["taskflow-tests"],
  },
  {
    id: "fast-mnist-nn",
    title: "Glyph",
    shortDescription:
      "A course C++ MLP hand-optimized across four instruction sets (AVX-512, AVX2, NEON, wasm-simd128), with a live in-browser benchmark timing SIMD vs scalar on your machine.",
    fullDescription:
      /* CRITIC-LEDGER F59: this said "It reaches 97.01% on 10,000 test
         digits". The site's own ledger stamps that number HELD — the
         accuracy is documented in the repo's README training notes and
         no committed eval artifact reproduces it — and these three
         fields (fullDescription, highlights, metrics) have zero
         consumers today. A dead field is a loaded gun: the day someone
         renders it, the page ships a precise figure the ledger two
         clicks away refuses to make. They now say what the ledger
         says. */
      "Glyph (formerly Fast MNIST) is a course C++ MLP hand-optimized across four instruction sets — AVX-512, AVX2, NEON, and a hand-written wasm-simd128 kernel — shipped with a live in-browser benchmark that times SIMD against scalar on the visitor's own machine. Its README records ~97% test accuracy after ~30 epochs; that number is HELD until a committed eval run reproduces it.",
    techStack: [
      { name: "C++", color: "#00599c" },
      { name: "AVX-512 / AVX2", color: "#ff6b6b" },
      { name: "NEON", color: "#a5b4fc" },
      { name: "wasm-simd128", color: "#654ff0" },
      { name: "OpenMP", color: "#92d050" },
      { name: "React", color: "#61dafb" },
    ],
    githubUrl: "https://github.com/yadava5/glyph",
    liveUrl: "https://getglyph.vercel.app",
    // WebP derivative of the promoted capture (assets:derive, was a
    // 264KB PNG — PERF-AUDIT fix 4).
    image: withBasePath("/images/projects/mnist.webp"),
    imageWidth: 1376,
    imageHeight: 768,
    imageKind: "real-screenshot",
    imageAlt: "Real Fast MNIST React workbench screenshot",
    imageDisclosure:
      "Real local web workbench screenshot; native inference server was offline during capture, so benchmark claims are sourced from committed benchmark data.",
    featured: true,
    category: "ai-ml",
    startDate: "2025-10",
    endDate: "2026-01",
    highlights: [
      "Hand-optimized across 4 instruction sets: AVX-512, AVX2, NEON, wasm-simd128",
      "Live in-browser benchmark: SIMD vs scalar on the visitor's machine",
      "~97% test accuracy documented in the README — HELD until a committed eval run earns it",
      "Honest attribution: the 3.5x is the openmp+simd config vs the -O3 baseline (BENCHMARKS.md)",
    ],
    isPrivate: false,
    metrics: [
      { label: "Accuracy", value: "~97% (README) — held, no eval run" },
      // Attribution per BENCHMARKS.md: the 3.5x is the openmp+simd
      // parallel configuration vs the -O3 baseline, not SIMD alone.
      { label: "Kernel Speedup", value: "3.5x openmp+simd dot kernel" },
    ],
    /* W5 e-07 split: the kernel claim is earned (BENCHMARKS.md); the
       accuracy claim traces to its own HELD manifest entry (README-
       documented, no committed eval artifact yet). */
    proofIds: ["fast-mnist-benchmark", "fast-mnist-accuracy"],
  },
  {
    id: "lifequest",
    title: "LifeQuest",
    shortDescription:
      "A social-good concept for job-seekers: gamify the daily search into missions so momentum survives the grind. A playable prototype on a real full-stack backend.",
    fullDescription:
      "LifeQuest is a social-good concept for job-seekers that turns the daily search into missions so momentum survives the grind. It is a working prototype — a playable mission card and a tier ladder on a real full-stack backend — framed honestly as a concept that would need a partner or funder to scale, not a finished product.",
    techStack: [
      { name: "React", color: "#61dafb" },
      { name: "TypeScript", color: "#3178c6" },
      { name: "NestJS", color: "#e0234e" },
      { name: "PostgreSQL", color: "#336791" },
      { name: "Supabase", color: "#3ecf8e" },
    ],
    githubUrl: "https://github.com/yadava5/lifequest",
    liveUrl: "https://getlifequest.vercel.app",
    // Static fallback only: a project-specific animated scene replaces
    // this in the front-end pass. Reuses an existing diagram asset — the
    // disclosure is explicit that it does not depict LifeQuest.
    image: withBasePath("/images/projects/pipeline-architecture.svg"),
    imageKind: "representative-visual",
    imageAlt: "LifeQuest — placeholder visual, project scene pending",
    imageDisclosure:
      "Placeholder static visual reused from an existing diagram — not a depiction of LifeQuest. A project-specific scene is pending; the real prototype is at the live URL. LifeQuest is an early concept, not a finished product.",
    featured: true,
    category: "full-stack",
    startDate: "2025-03",
    endDate: "Present",
    highlights: [
      "Turns the daily job search into missions to keep momentum",
      "Playable mission card + tier ladder on a real full-stack backend",
      "A working prototype — a concept that needs a partner/funder to scale",
      "Full-stack persistence (Postgres); not a finished product",
    ],
    isPrivate: false,
    proofIds: [],
  },
  {
    id: "jetpack-compress",
    title: "jetpack-compress",
    shortDescription:
      "A JDK 25 parallel, gzip-compatible compression engine — virtual threads + Vector-API SIMD — with a live visualizing landing.",
    fullDescription:
      "jetpack-compress is a high-throughput, gzip-compatible parallel compression engine in JDK 25. Input is split into blocks, compressed concurrently on virtual threads, and stitched into one byte-valid gzip member (~6.5x vs single-threaded java.util.zip, +/-50% on the quick benchmark). It hand-vectorizes Adler-32 via the JDK Vector API (~2.8x vs scalar; honestly shown not to beat the JDK intrinsic), with FFM memory-mapped I/O, a CLI, and a JMH harness. DEFLATE entropy coding is delegated to zlib on purpose; a from-scratch encoder is future work.",
    techStack: [
      { name: "Java", color: "#f89820" },
      { name: "JDK 25", color: "#5382a1" },
      { name: "Vector API (SIMD)", color: "#ff6b6b" },
      { name: "Virtual Threads", color: "#6db33f" },
      { name: "Maven", color: "#c71a36" },
      { name: "JMH", color: "#007396" },
    ],
    githubUrl: "https://github.com/yadava5/jetpack-compress",
    liveUrl: "https://jetpack-compress.vercel.app",
    // Static fallback only: a project-specific animated scene replaces
    // this in the front-end pass. Reuses an existing diagram asset — the
    // disclosure is explicit that it does not depict jetpack-compress.
    image: withBasePath("/images/projects/pipeline-architecture.svg"),
    imageKind: "representative-visual",
    imageAlt: "jetpack-compress — placeholder visual, project scene pending",
    imageDisclosure:
      "Placeholder static visual reused from an existing diagram — not a depiction of jetpack-compress. A project-specific scene is pending; the real engine is at the live URL and public repo.",
    featured: true,
    category: "other",
    startDate: "2026-07",
    endDate: "Present",
    highlights: [
      "Parallel gzip on virtual threads: ~6.5x vs single-threaded java.util.zip (+/-50%)",
      "Hand-vectorized Adler-32 (~2.8x vs scalar) — honestly does NOT beat the JDK intrinsic",
      "FFM memory-mapped I/O, a CLI, and a JMH harness",
      "72 tests pass; DEFLATE entropy coding delegated to zlib on purpose",
    ],
    isPrivate: false,
    metrics: [
      { label: "Tests", value: "72 passing on JDK 25" },
      { label: "Throughput", value: "~6.5x vs 1-thread gzip (+/-50%)" },
    ],
    proofIds: ["jetpack-tests"],
  },
  {
    id: "master-inventory",
    title: "Master Inventory Pipeline",
    shortDescription:
      "Python/pandas pipeline consolidating Tableau metadata and Workday exports into a private-safe 10.5k-row master inventory.",
    fullDescription:
      "Proprietary pipeline consolidating Tableau metadata and Workday custom-report exports into a unified 35-field master inventory for Tableau Prep and dashboards.",
    techStack: [
      { name: "Python", color: "#3776ab" },
      { name: "pandas", color: "#150458" },
      { name: "Tableau", color: "#e97627" },
    ],
    githubUrl: null,
    liveUrl: null,
    image: withBasePath("/images/projects/pipeline-architecture.svg"),
    imageKind: "diagram",
    imageAlt:
      "Master Inventory Tableau and Workday pipeline architecture diagram",
    imageDisclosure:
      "Private-safe architecture diagram; institutional records, raw exports, and internal UI are not shown.",
    featured: false,
    category: "data",
    startDate: "2025-06",
    endDate: "2026-05",
    highlights: [
      "Consolidates 3,731 Tableau rows and 6,743 Workday rows",
      "35-field unified schema with deterministic inventory IDs",
      "Tableau REST API and file-mode extraction paths",
      "Timestamped run artifacts for auditing",
    ],
    isPrivate: true,
    // Retired from recruiter-facing lists (not one of the six live
    // showcase projects); private-safe case study + route preserved.
    portfolioVisible: false,
    metrics: [
      { label: "Inventory", value: "10,453 deduped rows" },
      { label: "Schema", value: "35-field master inventory" },
    ],
    proofIds: ["master-inventory-ledger"],
  },
  {
    id: "policybot",
    title: "PolicyBot",
    shortDescription:
      "RAG-powered policy assistant with OpenAI File Search, Slack Socket Mode, cited-source checks, and local quote validation.",
    fullDescription:
      "An internal policy support assistant that routes CLI and Slack questions through OpenAI Responses API with File Search, cites source filenames, and rejects answers whose quoted snippets cannot be verified when local policy files are available.",
    techStack: [
      { name: "Python", color: "#3776ab" },
      { name: "OpenAI", color: "#412991" },
      { name: "Slack API", color: "#4a154b" },
      { name: "RAG", color: "#00d4aa" },
    ],
    githubUrl: null,
    liveUrl: null,
    image: withBasePath("/images/projects/policybot-architecture.svg"),
    imageKind: "diagram",
    imageAlt: "PolicyBot retrieval and quote-validation architecture diagram",
    imageDisclosure:
      "Private-safe architecture diagram; real institutional policy text and Slack messages are not shown.",
    featured: false,
    category: "ai-ml",
    startDate: "2025-06",
    endDate: "2026-05",
    highlights: [
      "RAG with OpenAI File Search",
      "CLI and Slack Socket Mode entry points",
      "Local quote validation and safe fallback behavior",
      "Supports DOCX, PDF, and Markdown policies",
    ],
    isPrivate: true,
    // Retired from recruiter-facing lists (not one of the six live
    // showcase projects); private-safe case study + route preserved.
    portfolioVisible: false,
    metrics: [
      { label: "Validation", value: "19/20 structured sweep" },
      { label: "Tech", value: "OpenAI RAG + Slack integration" },
    ],
    proofIds: ["policybot-validation"],
  },
  {
    id: "paid-internships",
    title: "Paid Internships Advocacy",
    shortDescription:
      "Research-backed advocacy site with 3D scroll effects, cited sources, and interactive data visualizations.",
    fullDescription:
      "An advocacy website promoting fair compensation for student internships, featuring immersive design, 3D scroll effects, and research-backed Chart.js visualizations.",
    techStack: [
      { name: "HTML", color: "#e34f26" },
      { name: "CSS", color: "#1572b6" },
      { name: "JavaScript", color: "#f7df1e" },
      { name: "Chart.js", color: "#ff6384" },
      { name: "Bootstrap", color: "#7952b3" },
    ],
    githubUrl: "https://github.com/yadava5/paid-internships-advocacy",
    liveUrl: "https://yadava5.github.io/paid-internships-advocacy",
    // WebP derivative (assets:derive): the 940KB PNG was the largest
    // file in the export. This project is hidden (portfolioVisible:
    // false, no case study), so nothing fetches it today — converted
    // anyway per PERF-AUDIT fix 4 so no future surfacing re-ships it.
    image: withBasePath("/images/projects/advocacy.webp"),
    imageWidth: 1376,
    imageHeight: 768,
    imageKind: "real-screenshot",
    imageAlt:
      "Real Paid Internships Advocacy data visualization page screenshot",
    imageDisclosure:
      "Real screenshot from the public advocacy site data page with cited research charts.",
    featured: false,
    // Freshman ENG109 course project — kept in the repo but hidden from
    // recruiter-facing lists so it does not dilute the engineering ladder.
    portfolioVisible: false,
    category: "other",
    startDate: "2025-01",
    endDate: "2025-01",
    highlights: [
      "3D parallax scroll animations",
      "Interactive Chart.js dashboards",
      "6 academic research sources",
      "ENG109 Final Project at Miami University",
    ],
    isPrivate: false,
    metrics: [
      { label: "Research", value: "6 academic sources" },
      { label: "Design", value: "3D parallax scroll effects" },
    ],
    proofIds: ["paid-internships-sources"],
  },
];

function isPublicPortfolioProject(project: Project): boolean {
  return !project.isPrivate && project.portfolioVisible !== false;
}

/**
 * Get featured projects for the bento grid
 */
export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured && isPublicPortfolioProject(p));
}

/**
 * Get all public projects
 */
export function getPublicProjects(): Project[] {
  return projects.filter(isPublicPortfolioProject);
}

/**
 * Get a project by its ID
 */
export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

/**
 * Get projects by category
 */
export function getProjectsByCategory(
  category: Project["category"]
): Project[] {
  return projects.filter(
    (p) => p.category === category && isPublicPortfolioProject(p)
  );
}
