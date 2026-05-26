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
      "Native macOS app processing 500+ emails/month with on-device ML to replace my manual job-search tracking workflow.",
    fullDescription:
      "An email-powered job application tracker that syncs your Gmail and iCloud Mail, identifies job-related messages (rejections, interviews, offers) using a 3-layer hybrid ML classifier, and organizes them into a trackable pipeline with a beautiful Liquid Glass dashboard.",
    techStack: [
      { name: "Python", color: "#3776ab" },
      { name: "FastAPI", color: "#009688" },
      { name: "SwiftUI", color: "#0071e3" },
      { name: "SQLite", color: "#003b57" },
      { name: "SetFit", color: "#ff6f00" },
      { name: "sentence-transformers", color: "#ff9800" },
    ],
    githubUrl: "https://github.com/yadava5/jobtracker",
    liveUrl: null,
    image: withBasePath("/images/projects/jobtracker.png"),
    imageKind: "representative-visual",
    imageAlt: "Representative macOS dashboard visual for JobTracker",
    imageDisclosure:
      "Representative portfolio visual; source code is linked for public inspection.",
    featured: true,
    category: "ai-ml",
    startDate: "2026-02",
    endDate: "Present",
    highlights: [
      "Privacy-first: all ML processing happens locally on-device",
      "3-layer hybrid classifier (rules → embeddings → SetFit)",
      "Gmail OAuth2 & iCloud IMAP async integration",
      "Native macOS 15+ Liquid Glass UI with SF Symbols 7",
      "Background sync via SMAppService + launchd",
    ],
    isPrivate: false,
    metrics: [
      { label: "ML Layers", value: "3-layer hybrid classifier" },
      { label: "Processing", value: "Local on-device" },
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
    imageKind: "representative-visual",
    imageAlt:
      "Representative ML workflow visual for the Agentic AutoML Platform",
    imageDisclosure:
      "Representative portfolio visual; GitHub repository ai-augmented-auto-ml-toolchain is private, so no public source link is shown.",
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
  },
  {
    id: "visual-assist",
    title: "Visual Assist",
    shortDescription:
      "Privacy-first iOS accessibility app using LiDAR, Vision, Core ML, haptics, and voice guidance.",
    fullDescription:
      "A native iOS accessibility app designed to help visually impaired users navigate their environment safely. Built with ARKit, Vision, and Core ML for on-device processing with complete privacy.",
    techStack: [
      { name: "Swift", color: "#fa7343" },
      { name: "SwiftUI", color: "#0071e3" },
      { name: "ARKit", color: "#000000" },
      { name: "Core ML", color: "#34c759" },
      { name: "Vision", color: "#5856d6" },
    ],
    githubUrl: "https://github.com/yadava5/VisualAssist",
    liveUrl: null,
    image: withBasePath("/images/projects/visual-assist.png"),
    imageKind: "representative-visual",
    imageAlt: "Representative iOS accessibility app visual for Visual Assist",
    imageDisclosure:
      "Representative portfolio visual; public repository details provide inspection context.",
    featured: true,
    category: "mobile",
    startDate: "2026-01",
    endDate: "Present",
    highlights: [
      "LiDAR obstacle detection with haptic feedback",
      "Vision OCR with speech synthesis for text reading",
      "On-device Core ML for privacy-first processing",
      "VoiceOver-first accessibility with voice commands",
      "68 unit tests for models and utilities",
    ],
    isPrivate: false,
    metrics: [
      { label: "Accessibility", value: "Computer vision powered" },
      { label: "Sensors", value: "LiDAR obstacle detection" },
    ],
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
    liveUrl: null,
    image: withBasePath("/images/projects/taskflow.png"),
    imageKind: "representative-visual",
    imageAlt:
      "Representative calendar planning interface visual for the Dynamic Calendar Application",
    imageDisclosure:
      "Representative portfolio visual; source code is linked for public inspection.",
    featured: true,
    category: "full-stack",
    startDate: "2023-12",
    endDate: "2023-12",
    highlights: [
      "NLP smart input with chrono-node and compromise",
      "738 automated tests (frontend/backend/integration)",
      "Multi-pane task workspace with Kanban board",
      "Code splitting and indexed PostgreSQL queries",
    ],
    isPrivate: false,
    metrics: [
      { label: "Tests", value: "738 automated tests" },
      { label: "NLP", value: "Smart natural language input" },
    ],
  },
  {
    id: "fast-mnist-nn",
    title: "Fast MNIST Neural Network",
    shortDescription:
      "SIMD-accelerated C++ neural network: 97%+ accuracy, 5x faster inference with AVX-512 optimization.",
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
    liveUrl: null,
    image: withBasePath("/images/projects/mnist.png"),
    imageKind: "representative-visual",
    imageAlt: "Representative neural network benchmark visual for Fast MNIST",
    imageDisclosure:
      "Representative portfolio visual; source code is linked for public inspection.",
    featured: false,
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
      { label: "Speedup", value: "5x with AVX-512 SIMD" },
    ],
  },
  {
    id: "master-inventory",
    title: "Master Inventory Pipeline",
    shortDescription:
      "Python/SQL pipeline processing 1M+ operational rows/datasets, reducing manual reconciliation effort.",
    fullDescription:
      "Proprietary pipeline consolidating Tableau Cloud metadata and Workday report exports into a unified master inventory for Tableau Prep and dashboards.",
    techStack: [
      { name: "Python", color: "#3776ab" },
      { name: "pandas", color: "#150458" },
      { name: "SQL", color: "#f29111" },
      { name: "Tableau", color: "#e97627" },
    ],
    githubUrl: null,
    liveUrl: null,
    image: withBasePath("/images/projects/pipeline.png"),
    imageKind: "representative-visual",
    imageAlt:
      "Private-safe representative architecture visual for the Master Inventory Pipeline",
    imageDisclosure:
      "Private-safe representative visual; real institutional data and UI are not shown.",
    featured: false,
    category: "data",
    startDate: "2025-06",
    endDate: "Present",
    highlights: [
      "Processes 1M+ rows of operational data",
      "Unified schema with deterministic inventory IDs",
      "Tableau REST API integration",
      "Timestamped run artifacts for auditing",
    ],
    isPrivate: true,
    metrics: [
      { label: "Data Volume", value: "1M+ operational rows" },
      { label: "Impact", value: "Reduced manual reconciliation effort" },
    ],
  },
  {
    id: "policybot",
    title: "PolicyBot",
    shortDescription:
      "RAG-powered policy chatbot on Slack: answers queries with cited sources from 50+ institutional documents.",
    fullDescription:
      "A policy support chatbot that helps users interpret and apply Miami University data policies using OpenAI's Responses API with File Search and Slack Socket Mode integration.",
    techStack: [
      { name: "Python", color: "#3776ab" },
      { name: "OpenAI", color: "#412991" },
      { name: "Slack API", color: "#4a154b" },
      { name: "RAG", color: "#00d4aa" },
    ],
    githubUrl: null,
    liveUrl: null,
    image: withBasePath("/images/projects/policybot.png"),
    imageKind: "representative-visual",
    imageAlt:
      "Private-safe representative retrieval workflow visual for PolicyBot",
    imageDisclosure:
      "Private-safe representative visual; real institutional policy content and Slack data are not shown.",
    featured: false,
    category: "ai-ml",
    startDate: "2025-06",
    endDate: "Present",
    highlights: [
      "RAG with OpenAI File Search",
      "Slack Socket Mode integration",
      "Local validation for quote verification",
      "Supports DOCX, PDF, and Markdown policies",
    ],
    isPrivate: true,
    metrics: [
      { label: "Knowledge Base", value: "50+ institutional documents" },
      { label: "Tech", value: "OpenAI RAG + Slack integration" },
    ],
  },
  {
    id: "paid-internships",
    title: "Paid Internships Advocacy",
    shortDescription:
      "Research-backed advocacy site with 3D scroll effects, peer-reviewed sources, and interactive data visualizations.",
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
    imageKind: "representative-visual",
    imageAlt: "Representative advocacy website visual for Paid Internships",
    imageDisclosure:
      "Representative portfolio visual; public source and live site are linked where available.",
    featured: false,
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
  },
];

/**
 * Get featured projects for the bento grid
 */
export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured && p.portfolioVisible !== false);
}

/**
 * Get all public projects
 */
export function getPublicProjects(): Project[] {
  return projects.filter((p) => !p.isPrivate && p.portfolioVisible !== false);
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
    (p) => p.category === category && p.portfolioVisible !== false
  );
}
