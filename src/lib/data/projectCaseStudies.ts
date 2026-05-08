import { Project, projects } from "@/lib/data/projects";
import { withBasePath } from "@/lib/utils";

export type CaseStudyNodeKind =
  | "client"
  | "api"
  | "data"
  | "ml"
  | "system"
  | "validation";

export interface CaseStudyNode {
  id: string;
  label: string;
  detail: string;
  kind: CaseStudyNodeKind;
}

export interface CaseStudyEdge {
  from: string;
  to: string;
  label: string;
}

export interface CaseStudyDecision {
  decision: string;
  reason: string;
  tradeoff: string;
}

export interface CaseStudyEvidence {
  label: string;
  evidence: string;
}

export interface CaseStudyArtifact {
  type: "screenshot" | "diagram" | "benchmark" | "repo" | "demo";
  label: string;
  href: string;
}

export interface ProjectCaseStudy {
  projectId: string;
  treatment: "evidence-ledger" | "native-intelligence" | "field-systems";
  role: string;
  timeframe: string;
  summary: string;
  problem: string;
  constraints: string[];
  architecture: {
    summary: string;
    nodes: CaseStudyNode[];
    edges: CaseStudyEdge[];
  };
  decisions: CaseStudyDecision[];
  validation: CaseStudyEvidence[];
  outcomes: CaseStudyEvidence[];
  artifacts: CaseStudyArtifact[];
}

export const projectCaseStudies: ProjectCaseStudy[] = [
  {
    projectId: "jobtracker",
    treatment: "native-intelligence",
    role: "Designer and engineer",
    timeframe: "2026-02 to Present",
    summary:
      "A native macOS job-application tracker that syncs email, classifies job-search signals locally, and turns noisy inbox updates into a usable application pipeline.",
    problem:
      "Job-search status lives across Gmail, iCloud Mail, employer systems, and one-off messages. Manual tracking misses updates and creates duplicate spreadsheet work.",
    constraints: [
      "Keep job-search email classification local and privacy-first.",
      "Support both Gmail OAuth2 and iCloud IMAP sources.",
      "Classify noisy inbox messages into useful application states.",
      "Fit the workflow into a native macOS dashboard instead of another web tab.",
    ],
    architecture: {
      summary:
        "Email sources feed an async sync layer, then a three-layer classifier, then local SQLite storage and a SwiftUI dashboard.",
      nodes: [
        { id: "gmail", label: "Gmail", detail: "OAuth2 sync", kind: "api" },
        { id: "icloud", label: "iCloud Mail", detail: "IMAP sync", kind: "api" },
        { id: "classifier", label: "Classifier", detail: "Rules, embeddings, SetFit", kind: "ml" },
        { id: "store", label: "SQLite", detail: "Local application state", kind: "data" },
        { id: "ui", label: "SwiftUI", detail: "Native macOS dashboard", kind: "client" },
        { id: "sync", label: "SMAppService", detail: "Real-time background sync", kind: "system" },
      ],
      edges: [
        { from: "gmail", to: "classifier", label: "messages" },
        { from: "icloud", to: "classifier", label: "messages" },
        { from: "classifier", to: "store", label: "classified events" },
        { from: "store", to: "ui", label: "pipeline state" },
        { from: "sync", to: "store", label: "background updates" },
      ],
    },
    decisions: [
      {
        decision: "Use on-device classification",
        reason: "The project handles personal job-search email.",
        tradeoff: "Local ML reduces hosted-service convenience but keeps sensitive messages private.",
      },
      {
        decision: "Use a three-layer classifier",
        reason: "Rules, embeddings, and SetFit cover different levels of signal quality.",
        tradeoff: "More moving parts than a single model, but easier to debug and tune.",
      },
      {
        decision: "Use SQLite for local state",
        reason: "The product is a native personal workflow tool.",
        tradeoff: "Local persistence is simpler than multi-user cloud sync, but intentionally device-scoped.",
      },
    ],
    validation: [
      { label: "Email volume", evidence: "Project data describes processing 500+ emails per month." },
      { label: "Classifier design", evidence: "Project data lists rules, embeddings, and SetFit as the classifier layers." },
      { label: "Privacy model", evidence: "Project data states that ML processing happens locally on-device." },
    ],
    outcomes: [
      { label: "Manual tracking", evidence: "Job updates are organized into a trackable pipeline instead of copied into spreadsheets." },
      { label: "Provider coverage", evidence: "Gmail OAuth2 and iCloud IMAP are both represented in the project data." },
      { label: "Native workflow", evidence: "The app targets macOS 15+ with SwiftUI and SF Symbols." },
    ],
    artifacts: [
      { type: "screenshot", label: "Portfolio screenshot", href: withBasePath("/images/projects/jobtracker.png") },
      { type: "repo", label: "Source code", href: "https://github.com/yadava5/jobtracker" },
    ],
  },
  {
    projectId: "automl",
    treatment: "evidence-ledger",
    role: "Senior capstone engineer",
    timeframe: "2025-09 to Present",
    summary:
      "An LLM-orchestrated automated data scientist platform that turns datasets and domain documents into auditable ML pipeline decisions.",
    problem:
      "Raw datasets require many repetitive steps before useful modeling: ingestion, feature decisions, training, evaluation, and deployment packaging.",
    constraints: [
      "Make pipeline decisions auditable instead of opaque.",
      "Support domain documents through RAG and MCP-based orchestration.",
      "Keep training workflows reproducible with containerized execution.",
      "Validate the product flow with browser-level checks.",
    ],
    architecture: {
      summary:
        "A React and TypeScript interface coordinates Node/PostgreSQL services, LLM-assisted orchestration, training workflows, Docker runtime, and Playwright evaluation.",
      nodes: [
        { id: "ui", label: "React UI", detail: "Dataset and workflow surface", kind: "client" },
        { id: "api", label: "Node.js API", detail: "Pipeline orchestration", kind: "api" },
        { id: "rag", label: "RAG + MCP", detail: "Structured decisions", kind: "ml" },
        { id: "runtime", label: "Docker runtime", detail: "Reproducible runs", kind: "system" },
        { id: "store", label: "PostgreSQL", detail: "Run metadata", kind: "data" },
        { id: "evals", label: "Playwright evals", detail: "Workflow validation", kind: "validation" },
      ],
      edges: [
        { from: "ui", to: "api", label: "workflow requests" },
        { from: "api", to: "rag", label: "domain context" },
        { from: "api", to: "runtime", label: "training jobs" },
        { from: "runtime", to: "store", label: "run records" },
        { from: "evals", to: "ui", label: "browser proof" },
      ],
    },
    decisions: [
      {
        decision: "Use RAG + MCP for orchestration",
        reason: "The platform needs structured, auditable decisions tied to domain context.",
        tradeoff: "More infrastructure than a simple model runner, but better for traceable workflows.",
      },
      {
        decision: "Containerize execution",
        reason: "Training runs need reproducible environments.",
        tradeoff: "Docker adds setup cost but reduces machine-specific drift.",
      },
    ],
    validation: [
      { label: "Workflow coverage", evidence: "Project data lists HPO, multi-model search, and automated training workflows." },
      { label: "Evaluation", evidence: "Project data lists built-in evaluation and benchmarking with Playwright." },
      { label: "Runtime", evidence: "Project data lists Dockerized execution runtime." },
    ],
    outcomes: [
      { label: "Pipeline speed", evidence: "Project data frames the platform as a faster path from raw datasets to ML pipelines." },
      { label: "Auditability", evidence: "Pipeline decisions are structured through RAG and MCP rather than free-form output." },
    ],
    artifacts: [
      { type: "screenshot", label: "Portfolio screenshot", href: withBasePath("/images/projects/automl.png") },
    ],
  },
  {
    projectId: "visual-assist",
    treatment: "field-systems",
    role: "iOS accessibility engineer",
    timeframe: "2025-03 to Present",
    summary:
      "A privacy-first iOS accessibility app with LiDAR obstacle detection, Vision OCR, Core ML processing, haptics, and voice guidance.",
    problem:
      "Visually impaired users need fast environmental feedback without sending sensitive camera or location context to a remote service.",
    constraints: [
      "Prioritize on-device processing for privacy.",
      "Support real-time LiDAR obstacle detection and haptic feedback.",
      "Respect VoiceOver-first interaction patterns.",
      "Use native iOS frameworks for performance and accessibility.",
    ],
    architecture: {
      summary:
        "ARKit, Vision, and Core ML process device context locally, then SwiftUI and VoiceOver expose guidance through speech, haptics, and commands.",
      nodes: [
        { id: "sensor", label: "LiDAR", detail: "Depth and obstacle signals", kind: "system" },
        { id: "vision", label: "Vision OCR", detail: "Text reading", kind: "ml" },
        { id: "coreml", label: "Core ML", detail: "On-device inference", kind: "ml" },
        { id: "feedback", label: "Haptics + speech", detail: "Guided feedback", kind: "client" },
        { id: "voiceover", label: "VoiceOver", detail: "Accessible controls", kind: "client" },
      ],
      edges: [
        { from: "sensor", to: "coreml", label: "environment signal" },
        { from: "vision", to: "feedback", label: "text context" },
        { from: "coreml", to: "feedback", label: "local inference" },
        { from: "voiceover", to: "feedback", label: "interaction layer" },
      ],
    },
    decisions: [
      {
        decision: "Use native iOS frameworks",
        reason: "LiDAR, Vision, Core ML, haptics, and VoiceOver are first-class platform capabilities.",
        tradeoff: "The app targets capable iOS devices rather than every phone.",
      },
      {
        decision: "Keep processing on-device",
        reason: "Camera and navigation context is sensitive.",
        tradeoff: "Local inference constrains model and compute choices.",
      },
    ],
    validation: [
      { label: "Unit coverage", evidence: "Project data lists 68 unit tests for models and utilities." },
      { label: "Accessibility", evidence: "Project data lists VoiceOver-first accessibility and voice commands." },
      { label: "Privacy", evidence: "Project data states on-device Core ML processing." },
    ],
    outcomes: [
      { label: "Real-time detection", evidence: "LiDAR obstacle detection and haptic feedback are core project highlights." },
      { label: "Text access", evidence: "Vision OCR with speech synthesis is part of the project data." },
    ],
    artifacts: [
      { type: "screenshot", label: "Portfolio screenshot", href: withBasePath("/images/projects/visual-assist.png") },
      { type: "repo", label: "Source code", href: "https://github.com/yadava5/VisualAssist" },
    ],
  },
  {
    projectId: "taskflow-calendar",
    treatment: "evidence-ledger",
    role: "Full-stack engineer",
    timeframe: "2023-09 to 2025-05",
    summary:
      "A production-style calendar and task management app with natural-language scheduling, conflict detection, PostgreSQL, and broad automated test coverage.",
    problem:
      "Calendar and task planning becomes brittle when notes, reminders, scheduling language, and conflict detection are split across tools.",
    constraints: [
      "Support natural language input for scheduling.",
      "Keep full-stack behavior tested across frontend, backend, and integration layers.",
      "Use PostgreSQL and indexed queries for calendar data.",
      "Keep the workspace usable across multiple planning views.",
    ],
    architecture: {
      summary:
        "A React and TypeScript interface sends scheduling workflows through a full-stack app backed by PostgreSQL and tested across 738 automated checks.",
      nodes: [
        { id: "ui", label: "React 19", detail: "Task and calendar workspace", kind: "client" },
        { id: "nlp", label: "NLP input", detail: "chrono-node and compromise", kind: "ml" },
        { id: "api", label: "App services", detail: "Scheduling and conflict logic", kind: "api" },
        { id: "db", label: "PostgreSQL", detail: "Indexed calendar data", kind: "data" },
        { id: "tests", label: "738 tests", detail: "Frontend, backend, integration", kind: "validation" },
      ],
      edges: [
        { from: "ui", to: "nlp", label: "natural language" },
        { from: "nlp", to: "api", label: "parsed intent" },
        { from: "api", to: "db", label: "calendar records" },
        { from: "tests", to: "api", label: "regression coverage" },
      ],
    },
    decisions: [
      {
        decision: "Use NLP for smart input",
        reason: "Scheduling should accept natural language instead of only rigid forms.",
        tradeoff: "Parsing ambiguity requires validation and clear fallbacks.",
      },
      {
        decision: "Build broad automated tests",
        reason: "Calendar behavior has many edge cases and regressions are expensive.",
        tradeoff: "More test maintenance, but higher confidence in app behavior.",
      },
    ],
    validation: [
      { label: "Automated tests", evidence: "Project data lists 738 automated tests." },
      { label: "Scheduling", evidence: "Project data lists NLP smart input with chrono-node and compromise." },
      { label: "Data model", evidence: "Project data lists indexed PostgreSQL queries." },
    ],
    outcomes: [
      { label: "Planning workspace", evidence: "Project data lists multi-pane task workspace and Kanban board." },
      { label: "Conflict detection", evidence: "Project description includes real-time conflict detection." },
    ],
    artifacts: [
      { type: "screenshot", label: "Portfolio screenshot", href: withBasePath("/images/projects/taskflow.png") },
      { type: "repo", label: "Source code", href: "https://github.com/yadava5/taskflow-calendar" },
    ],
  },
  {
    projectId: "fast-mnist-nn",
    treatment: "evidence-ledger",
    role: "C++ performance engineer",
    timeframe: "2025-10 to 2026-01",
    summary:
      "A C++ neural network for MNIST digit recognition with SIMD matrix operations, OpenMP parallelism, benchmarks, and a React/TypeScript frontend.",
    problem:
      "MNIST inference is small enough to understand but useful for proving whether low-level matrix optimization and benchmark discipline are real.",
    constraints: [
      "Keep the implementation in C++ with explicit SIMD and OpenMP paths.",
      "Measure speedup without overstating unverified exact benchmark details.",
      "Expose the model through an interactive React and TypeScript frontend.",
      "Keep benchmark and accuracy claims traceable to source data.",
    ],
    architecture: {
      summary:
        "Input preprocessing feeds C++ matrix kernels and OpenMP parallel paths, then the React demo displays inference behavior and benchmark proof.",
      nodes: [
        { id: "input", label: "MNIST input", detail: "Digit preprocessing", kind: "data" },
        { id: "kernels", label: "SIMD kernels", detail: "AVX2, AVX-512, NEON", kind: "system" },
        { id: "parallel", label: "OpenMP", detail: "Parallel hot paths", kind: "system" },
        { id: "model", label: "Neural network", detail: "C++ inference", kind: "ml" },
        { id: "demo", label: "React demo", detail: "Interactive visualization", kind: "client" },
        { id: "bench", label: "Benchmarks", detail: "Performance suite", kind: "validation" },
      ],
      edges: [
        { from: "input", to: "model", label: "normalized digits" },
        { from: "kernels", to: "model", label: "matrix ops" },
        { from: "parallel", to: "model", label: "threaded paths" },
        { from: "model", to: "demo", label: "prediction output" },
        { from: "bench", to: "model", label: "performance proof" },
      ],
    },
    decisions: [
      {
        decision: "Use hand-tuned SIMD paths",
        reason: "The project is meant to demonstrate performance engineering beyond framework use.",
        tradeoff: "Hardware-specific paths need careful fallbacks and benchmarking.",
      },
      {
        decision: "Expose a React demo",
        reason: "Recruiters can inspect the behavior without reading only C++ code.",
        tradeoff: "The frontend is secondary to the C++ benchmark proof.",
      },
    ],
    validation: [
      { label: "Accuracy", evidence: "Project data lists 97%+ accuracy on MNIST." },
      { label: "Speedup", evidence: "Project data lists 5x speedup with AVX-512 SIMD." },
      { label: "Benchmarks", evidence: "Project data lists a comprehensive benchmark suite." },
    ],
    outcomes: [
      { label: "Performance proof", evidence: "The project demonstrates SIMD acceleration across AVX2, AVX-512, and NEON paths." },
      { label: "Interactive inspection", evidence: "Project data lists an interactive React and TypeScript web app." },
    ],
    artifacts: [
      { type: "screenshot", label: "Portfolio screenshot", href: withBasePath("/images/projects/mnist.png") },
      { type: "diagram", label: "Vector project asset", href: withBasePath("/images/projects/fast-mnist-nn.svg") },
      { type: "repo", label: "Source code", href: "https://github.com/yadava5/fast-mnist-nn" },
    ],
  },
];

export const caseStudyIds = projectCaseStudies.map((study) => study.projectId);

export function getCaseStudyById(id: string): ProjectCaseStudy | undefined {
  return projectCaseStudies.find((study) => study.projectId === id);
}

export function getCaseStudyProject(study: ProjectCaseStudy): Project | undefined {
  return projects.find((project) => project.id === study.projectId);
}
