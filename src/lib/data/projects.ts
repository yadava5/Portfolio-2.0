/**
 * @fileoverview Project data for the portfolio
 *
 * Contains all project information including metadata, tech stacks,
 * descriptions, and links. Projects are categorized as featured or standard.
 */

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
      "Native macOS app processing 500+ emails/month with on-device ML, eliminating manual job search tracking.",
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
    image: "/images/projects/jobtracker.png",
    featured: true,
    category: "ai-ml",
    startDate: "2026-02",
    endDate: "Present",
    highlights: [
      "Privacy-first: all ML processing happens locally on-device",
      "3-layer hybrid classifier (rules → embeddings → SetFit)",
      "Gmail OAuth2 & iCloud IMAP async integration",
      "Native macOS 15+ Liquid Glass UI with SF Symbols 7",
      "Real-time sync via SMAppService + launchd",
    ],
    isPrivate: false,
    metrics: [
      { label: "ML Layers", value: "3-layer hybrid classifier" },
      { label: "Processing", value: "Real-time on-device" },
    ],
  },
  {
    id: "automl",
    title: "AutoML Platform",
    shortDescription:
      "LLM-orchestrated platform turning raw datasets into production ML pipelines 10x faster with built-in monitoring.",
    fullDescription:
      "Building an automated data scientist platform that turns datasets and domain documents into deployed, monitored ML services. Features LLM-assisted orchestration using RAG + MCP for structured, auditable pipeline decisions.",
    techStack: [
      { name: "TypeScript", color: "#3178c6" },
      { name: "React", color: "#61dafb" },
      { name: "Node.js", color: "#339933" },
      { name: "PostgreSQL", color: "#336791" },
      { name: "Docker", color: "#2496ed" },
      { name: "Machine Learning", color: "#ff6f00" },
    ],
    githubUrl: null,
    liveUrl: null,
    image: "/images/projects/automl.png",
    featured: true,
    category: "ai-ml",
    startDate: "2025-09",
    endDate: "Present",
    highlights: [
      "LLM-assisted orchestration with RAG + MCP",
      "Automated training workflows with HPO and multi-model search",
      "Dockerized execution runtime with reproducible runs",
      "Built-in evaluation/benchmarking with Playwright",
    ],
    isPrivate: false,
    metrics: [
      { label: "Automation", value: "Drag-and-drop pipelines" },
      { label: "Orchestration", value: "LLM + RAG + MCP" },
    ],
  },
  {
    id: "visual-assist",
    title: "Visual Assist",
    shortDescription:
      "Privacy-first iOS accessibility app with real-time LiDAR obstacle detection and voice-guided navigation.",
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
    image: "/images/projects/visual-assist.png",
    featured: true,
    category: "mobile",
    startDate: "2025-03",
    endDate: "Present",
    highlights: [
      "Real-time LiDAR obstacle detection with haptic feedback",
      "Vision OCR with speech synthesis for text reading",
      "On-device Core ML for privacy-first processing",
      "VoiceOver-first accessibility with voice commands",
      "68 unit tests for models and utilities",
    ],
    isPrivate: false,
    metrics: [
      { label: "Accessibility", value: "Computer vision powered" },
      { label: "Real-time", value: "LiDAR obstacle detection" },
    ],
  },
  {
    id: "taskflow-calendar",
    title: "Taskflow Calendar",
    shortDescription:
      "Production full-stack calendar app with 738+ tests, NLP-powered natural language scheduling, and conflict detection.",
    fullDescription:
      "A production-ready full-stack calendar and task management platform with intelligent NLP for natural language input, multi-calendar support, and real-time conflict detection.",
    techStack: [
      { name: "React 19", color: "#61dafb" },
      { name: "TypeScript", color: "#3178c6" },
      { name: "PostgreSQL", color: "#336791" },
      { name: "Vercel", color: "#000000" },
      { name: "Tailwind CSS", color: "#06b6d4" },
    ],
    githubUrl: "https://github.com/yadava5/taskflow-calendar",
    liveUrl: null,
    image: "/images/projects/taskflow.png",
    featured: true,
    category: "full-stack",
    startDate: "2023-09",
    endDate: "2025-05",
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
    image: "/images/projects/mnist.png",
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
    id: "lifequest",
    title: "LifeQuest",
    shortDescription:
      "Tauri-powered productivity RPG turning daily routines into map quests, gamifying life transitions.",
    fullDescription:
      "A desktop-first rebuild of a map-based quest game that turns real-world routines into missions for people navigating job loss or retirement, with Quest Coins and practical rewards.",
    techStack: [
      { name: "Tauri", color: "#24c8db" },
      { name: "React", color: "#61dafb" },
      { name: "NestJS", color: "#e0234e" },
      { name: "PostgreSQL", color: "#336791" },
      { name: "Prisma", color: "#2d3748" },
    ],
    githubUrl: "https://github.com/yadava5/lifequest",
    liveUrl: null,
    image: "/images/projects/lifequest.png",
    featured: false,
    category: "full-stack",
    startDate: "2025-04",
    endDate: "2025-11",
    highlights: [
      "Quest loop with daily/weekly quests and Quest Coins",
      "Tauri 2 + React 19 desktop app",
      "NestJS API with PostgreSQL + Prisma",
      "Optional AI-generated quests via OpenAI",
    ],
    isPrivate: false,
    metrics: [
      { label: "Gamification", value: "Quest Coins + daily missions" },
      { label: "Stack", value: "Tauri 2 + React 19 + NestJS" },
    ],
  },
  {
    id: "master-inventory",
    title: "Master Inventory Pipeline",
    shortDescription:
      "Python/SQL pipeline processing 1M+ IT assets daily, reducing data reconciliation from hours to minutes.",
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
    image: "/images/projects/pipeline.png",
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
      { label: "Data Volume", value: "1M+ rows daily" },
      { label: "Impact", value: "Hours to minutes reconciliation" },
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
    image: "/images/projects/policybot.png",
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
      "Research-backed advocacy site with 3D scroll effects, 6+ peer-reviewed sources, 500+ views in launch month.",
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
    image: "/images/projects/advocacy.png",
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
      { label: "Impact", value: "500+ views on launch" },
      { label: "Design", value: "3D parallax scroll effects" },
    ],
  },
  {
    id: "job-automator",
    title: "Job Automator",
    shortDescription:
      "Automated job application system: applies to 50+ jobs/day with AI-generated cover letters and job matching.",
    fullDescription:
      "Automated job application system with Playwright browser automation, intelligent job matching, cover letter generation, and application tracking.",
    techStack: [
      { name: "JavaScript", color: "#f7df1e" },
      { name: "Playwright", color: "#2edb73" },
      { name: "Node.js", color: "#339933" },
    ],
    githubUrl: "https://github.com/yadava5/job-automator",
    liveUrl: null,
    image: "/images/projects/job-automator.png",
    featured: false,
    category: "other",
    startDate: "2026-03",
    endDate: "Present",
    highlights: [
      "Playwright browser automation for job application",
      "Intelligent job matching algorithms",
      "Automated cover letter generation",
      "Application tracking and monitoring",
    ],
    isPrivate: false,
    status: "recent",
    statusLabel: "Recently Updated",
    metrics: [
      { label: "Automation", value: "50+ jobs/day" },
      { label: "Tech", value: "Playwright + AI cover letters" },
    ],
  },
];

/**
 * Get featured projects for the bento grid
 */
export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

/**
 * Get all public projects
 */
export function getPublicProjects(): Project[] {
  return projects.filter((p) => !p.isPrivate);
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
  return projects.filter((p) => p.category === category);
}
