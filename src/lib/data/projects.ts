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
    title: "JobTracker",
    shortDescription:
      "Native macOS app for local job-search email classification with on-device ML and a trackable application pipeline.",
    fullDescription:
      "An email-powered job application tracker that syncs Gmail and iCloud Mail, identifies job-related messages (rejections, interviews, offers) using a 3-layer hybrid ML classifier, and organizes them into a local pipeline with a native SwiftUI dashboard.",
    techStack: [
      { name: "Python", color: "#3776ab" },
      { name: "FastAPI", color: "#009688" },
      { name: "SwiftUI", color: "#0071e3" },
      { name: "SQLite", color: "#003b57" },
      { name: "SetFit", color: "#ff6f00" },
      { name: "sentence-transformers", color: "#ff9800" },
    ],
    githubUrl: "https://github.com/yadava5/jobtracker",
    liveUrl: "https://jobtracker-web-five.vercel.app",
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
      "Privacy-first: all ML processing happens locally on-device",
      "3-layer hybrid classifier (rules -> e5 embeddings -> SetFit), 0.98 macro-F1",
      "Ported to run entirely in-browser via quantized ONNX (huggingface.co/spaces/yadava5/jobtracker-classifier)",
      "Gmail OAuth2 & iCloud IMAP async integration",
      "Native macOS SwiftUI dashboard",
      "Background sync via SMAppService + launchd",
    ],
    isPrivate: false,
    metrics: [
      { label: "ML Layers", value: "3-layer hybrid classifier" },
      { label: "Processing", value: "Local on-device" },
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
      "A private GitHub repository named ai-augmented-auto-ml-toolchain that turns datasets and domain documents into structured, reproducible ML workflows. The platform uses LangGraph and MCP tools for agentic orchestration with human-in-the-loop approval gates.",
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
    liveUrl: null,
    image: withBasePath("/images/projects/automl.png"),
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
      "Built-in Playwright and eval-runner validation paths",
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
    metrics: [
      { label: "Accessibility", value: "Computer vision powered" },
      { label: "Sensors", value: "LiDAR obstacle detection" },
    ],
    proofIds: ["visual-assist-tests"],
  },
  {
    id: "taskflow-calendar",
    title: "Dynamic Calendar Application",
    shortDescription:
      "Full-stack calendar app with notes, reminders, location-aware scheduling, and conflict detection.",
    fullDescription:
      "A full-stack calendar and task management platform with intelligent NLP for natural language input, multi-calendar support, and conflict detection.",
    techStack: [
      { name: "React 19", color: "#61dafb" },
      { name: "TypeScript", color: "#3178c6" },
      { name: "PostgreSQL", color: "#336791" },
      { name: "Vercel", color: "#000000" },
      { name: "Tailwind CSS", color: "#06b6d4" },
    ],
    githubUrl: "https://github.com/yadava5/taskflow-calendar",
    liveUrl: "https://taskflow-calendar-ashy.vercel.app",
    image: withBasePath("/images/projects/taskflow.png"),
    imageKind: "real-screenshot",
    imageAlt: "Real Taskflow local demo calendar screenshot",
    imageDisclosure:
      "Real local frontend screenshot captured with the repository mock-login flow and demo user state.",
    featured: false,
    category: "full-stack",
    startDate: "2023-09",
    endDate: "2025-05",
    highlights: [
      "NLP smart input with chrono-node and compromise",
      "1,145 automated tests (634 frontend + 511 backend), all passing",
      "Multi-pane task workspace with Kanban board",
      "Code splitting and indexed PostgreSQL queries",
    ],
    isPrivate: false,
    metrics: [
      { label: "Interface", value: "Kanban + multi-calendar workspace" },
      { label: "NLP", value: "Smart natural language input" },
    ],
    proofIds: ["taskflow-tests"],
  },
  {
    id: "fast-mnist-nn",
    title: "Fast MNIST Neural Network",
    shortDescription:
      "C++ neural network for MNIST: 97%+ accuracy, benchmarked SIMD/OpenMP kernels, and an interactive React workbench.",
    fullDescription:
      "A high-performance C++ neural network for MNIST digit recognition featuring SIMD-accelerated matrix operations and OpenMP parallelization, with an interactive React web frontend.",
    techStack: [
      { name: "C++", color: "#00599c" },
      { name: "SIMD", color: "#ff6b6b" },
      { name: "OpenMP", color: "#92d050" },
      { name: "React", color: "#61dafb" },
      { name: "TypeScript", color: "#3178c6" },
    ],
    githubUrl: "https://github.com/yadava5/fast-mnist-nn",
    liveUrl: "https://fast-mnist.vercel.app",
    image: withBasePath("/images/projects/mnist.png"),
    imageKind: "real-screenshot",
    imageAlt: "Real Fast MNIST React workbench screenshot",
    imageDisclosure:
      "Real local web workbench screenshot; native inference server was offline during capture, so benchmark claims are sourced from committed benchmark data.",
    featured: true,
    category: "ai-ml",
    startDate: "2025-10",
    endDate: "2026-01",
    highlights: [
      "97%+ accuracy on MNIST dataset",
      "SIMD acceleration (AVX2/AVX-512/NEON)",
      "Interactive React + TypeScript web app",
      "Comprehensive benchmark suite",
    ],
    isPrivate: false,
    metrics: [
      { label: "Accuracy", value: "97%+ on MNIST" },
      // Attribution per BENCHMARKS.md: the 3.5x is the openmp+simd
      // parallel configuration vs the -O3 baseline, not SIMD alone.
      { label: "Kernel Speedup", value: "3.5x openmp+simd dot kernel" },
    ],
    proofIds: ["fast-mnist-benchmark"],
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
    image: withBasePath("/images/projects/advocacy.png"),
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
