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
  type:
    | "real-screenshot"
    | "representative-visual"
    | "diagram"
    | "benchmark"
    | "repo"
    | "demo"
    | "poster"
    | "presentation";
  label: string;
  href: string;
}

export interface CaseStudyEvidenceDisclosure {
  label: string;
  detail: string;
}

export interface ProjectCaseStudy {
  projectId: string;
  treatment: "evidence-ledger" | "native-intelligence" | "field-systems";
  role: string;
  timeframe: string;
  summary: string;
  evidenceDisclosure?: CaseStudyEvidenceDisclosure;
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
    evidenceDisclosure: {
      label: "Private-safe proof: no email content",
      detail:
        "The source repository now documents that old screenshots were removed as outdated. This case study uses architecture, source, build, test, and benchmark evidence instead of inbox screenshots or private application data.",
    },
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
        {
          id: "icloud",
          label: "iCloud Mail",
          detail: "IMAP sync",
          kind: "api",
        },
        {
          id: "classifier",
          label: "Classifier",
          detail: "Rules, embeddings, SetFit",
          kind: "ml",
        },
        {
          id: "store",
          label: "SQLite",
          detail: "Local application state",
          kind: "data",
        },
        {
          id: "ui",
          label: "SwiftUI",
          detail: "Native macOS dashboard",
          kind: "client",
        },
        {
          id: "sync",
          label: "SMAppService",
          detail: "Background sync",
          kind: "system",
        },
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
        tradeoff:
          "Local ML reduces hosted-service convenience but keeps sensitive messages private.",
      },
      {
        decision: "Use a three-layer classifier",
        reason:
          "Rules, embeddings, and SetFit cover different levels of signal quality.",
        tradeoff:
          "More moving parts than a single model, but easier to debug and tune.",
      },
      {
        decision: "Use SQLite for local state",
        reason: "The product is a native personal workflow tool.",
        tradeoff:
          "Local persistence is simpler than multi-user cloud sync, but intentionally device-scoped.",
      },
    ],
    validation: [
      {
        label: "Provider integration",
        evidence:
          "Source docs and backend routers support Gmail OAuth2 and iCloud IMAP ingestion for job-search messages.",
      },
      {
        label: "Classifier design",
        evidence:
          "The ML strategy documents rules, embeddings, and SetFit as the classifier layers, with SetFit enabled only after training gates are met.",
      },
      {
        label: "Privacy model",
        evidence:
          "The app keeps job-search email classification local instead of sending message content to hosted inference.",
      },
      {
        label: "Backend test suite",
        evidence:
          "Local source validation passed 182 backend tests under the test/null-keyring environment.",
      },
      {
        label: "Classifier benchmark",
        evidence:
          "Rules and deterministic hybrid v3 gates both passed on 96 samples with macro-F1 0.9791.",
      },
      {
        label: "Native build",
        evidence:
          "The macOS Debug target built locally with xcodebuild against the JobTracker scheme.",
      },
      {
        label: "Web beta boundary",
        evidence:
          "The Next.js web beta typecheck, lint, build, and Playwright login smoke passed, but the dashboard remains a scaffold and is not shown as a finished product screenshot.",
      },
    ],
    outcomes: [
      {
        label: "Manual tracking",
        evidence:
          "Job updates are organized into a trackable pipeline instead of copied into spreadsheets.",
      },
      {
        label: "Provider coverage",
        evidence:
          "Public project data records Gmail OAuth2 and iCloud IMAP as supported providers.",
      },
      {
        label: "Native workflow",
        evidence: "The app targets a native macOS workflow with SwiftUI.",
      },
      {
        label: "Evidence posture",
        evidence:
          "Architecture and source links are shown publicly; private email and application records are not shown.",
      },
    ],
    artifacts: [
      {
        type: "diagram",
        label: "Local classification architecture",
        href: withBasePath("/images/projects/jobtracker-architecture.svg"),
      },
      {
        type: "repo",
        label: "Source-truth README",
        href: "https://github.com/yadava5/jobtracker/blob/integration/web-migration/README.md",
      },
      {
        type: "repo",
        label: "Architecture docs",
        href: "https://github.com/yadava5/jobtracker/blob/integration/web-migration/docs/ARCHITECTURE.md",
      },
      {
        type: "benchmark",
        label: "ML strategy and evaluation gates",
        href: "https://github.com/yadava5/jobtracker/blob/integration/web-migration/docs/ML_STRATEGY.md",
      },
      {
        type: "repo",
        label: "Backend test suite",
        href: "https://github.com/yadava5/jobtracker/tree/integration/web-migration/backend/tests",
      },
      {
        type: "repo",
        label: "Web beta scaffold",
        href: "https://github.com/yadava5/jobtracker/tree/integration/web-migration/apps/web",
      },
    ],
  },
  {
    projectId: "automl",
    treatment: "evidence-ledger",
    role: "Senior capstone engineer",
    timeframe: "2025-09 to Present",
    summary:
      "A private GitHub-backed agentic AutoML platform that turns datasets and domain documents into auditable ML pipeline decisions with human approval gates.",
    evidenceDisclosure: {
      label: "Private proof: GitHub evidence",
      detail:
        "The current GitHub repository is yadava5/ai-augmented-auto-ml-toolchain and its README identifies the product as Agentic AutoML Platform. The repository is private, so this portfolio shows a private-safe case study instead of a public source link.",
    },
    problem:
      "Raw datasets require many repetitive steps before useful modeling: ingestion, feature decisions, training, evaluation, and deployment packaging.",
    constraints: [
      "Make pipeline decisions auditable instead of opaque.",
      "Support domain documents through retrieval and MCP-based orchestration.",
      "Require human approval before generated actions alter workflow state.",
      "Keep training workflows reproducible with containerized execution.",
      "Validate the product flow with browser-level checks.",
    ],
    architecture: {
      summary:
        "A React and TypeScript interface coordinates Express/PostgreSQL services, LangGraph + MCP orchestration, notebook-based training workflows, Docker execution, and Playwright evaluation.",
      nodes: [
        {
          id: "ui",
          label: "React 19 UI",
          detail: "Dataset and workflow surface",
          kind: "client",
        },
        {
          id: "api",
          label: "Express 5 API",
          detail: "Pipeline orchestration",
          kind: "api",
        },
        {
          id: "orchestrator",
          label: "LangGraph + MCP",
          detail: "Agentic workflow routing",
          kind: "ml",
        },
        {
          id: "runtime",
          label: "Docker runtime",
          detail: "Reproducible runs",
          kind: "system",
        },
        {
          id: "store",
          label: "PostgreSQL 16",
          detail: "Run metadata",
          kind: "data",
        },
        {
          id: "evals",
          label: "Playwright evals",
          detail: "Workflow validation",
          kind: "validation",
        },
      ],
      edges: [
        { from: "ui", to: "api", label: "workflow requests" },
        { from: "api", to: "orchestrator", label: "approved actions" },
        { from: "api", to: "runtime", label: "training jobs" },
        { from: "runtime", to: "store", label: "run records" },
        { from: "evals", to: "ui", label: "browser proof" },
      ],
    },
    decisions: [
      {
        decision: "Use LangGraph + MCP for orchestration",
        reason:
          "The platform needs phase-aware routing, tool calls, and auditable decisions tied to domain context.",
        tradeoff:
          "More infrastructure than a simple model runner, but better for traceable workflows.",
      },
      {
        decision: "Keep human approval gates",
        reason:
          "Generated preprocessing, training, and deployment actions should be reviewed before they alter the workflow.",
        tradeoff:
          "Approval gates slow down full automation, but they make the system safer and easier to debug.",
      },
      {
        decision: "Containerize execution",
        reason: "Training runs need reproducible environments.",
        tradeoff: "Docker adds setup cost but reduces machine-specific drift.",
      },
    ],
    validation: [
      {
        label: "Repository identity",
        evidence:
          "Live GitHub metadata shows private repo yadava5/ai-augmented-auto-ml-toolchain; README title is Agentic AutoML Platform.",
      },
      {
        label: "Lifecycle coverage",
        evidence:
          "Project source records upload, EDA, NL-to-SQL, preprocessing, training, experiments, and deployment phases.",
      },
      {
        label: "Workflow coverage",
        evidence:
          "Portfolio source data records HPO, multi-model search, notebook training, and automated workflow evaluation.",
      },
      {
        label: "Evaluation",
        evidence:
          "Presenter slide 8 records the stack and validation posture: all-green tests, coverage, logs, packages, and migrations.",
      },
      {
        label: "Runtime",
        evidence:
          "Portfolio source data records a Dockerized execution runtime.",
      },
      {
        label: "Individual contribution",
        evidence:
          "Presenter artifact identifies Ayush's work on the Monaco/Jupyter runtime with live WebSocket sync, Docker sandbox constraints, eval runner, and Optuna study streaming UI.",
      },
      {
        label: "Expo artifact",
        evidence:
          "Senior design poster records the platform architecture, LangGraph workflow states, run ledger, validation metrics, and product screenshot.",
      },
    ],
    outcomes: [
      {
        label: "Pipeline speed",
        evidence:
          "Portfolio source data frames the platform as a structured path from raw datasets to ML workflows.",
      },
      {
        label: "Auditability",
        evidence:
          "Pipeline decisions are structured through LangGraph and MCP tool calls rather than free-form output.",
      },
    ],
    artifacts: [
      {
        type: "real-screenshot",
        label: "Private-safe experiment registry screenshot",
        href: withBasePath("/images/projects/automl.png"),
      },
      {
        type: "presentation",
        label: "Presenter stack proof",
        href: withBasePath("/images/projects/agentic-automl-stack-proof.png"),
      },
      {
        type: "poster",
        label: "Expo poster proof",
        href: withBasePath("/images/projects/agentic-automl-poster-proof.png"),
      },
    ],
  },
  {
    projectId: "visual-assist",
    treatment: "field-systems",
    role: "iOS accessibility engineer",
    timeframe: "2025-03 to Present",
    summary:
      "A privacy-first iOS accessibility app with LiDAR obstacle detection, Vision OCR, haptics, and voice guidance.",
    problem:
      "Visually impaired users need fast environmental feedback without sending sensitive camera or location context to a remote service.",
    constraints: [
      "Prioritize on-device processing for privacy.",
      "Support LiDAR obstacle detection and haptic feedback.",
      "Respect VoiceOver-first interaction patterns.",
      "Use native iOS frameworks for performance and accessibility.",
    ],
    architecture: {
      summary:
        "ARKit and Vision process device context locally, then SwiftUI and VoiceOver expose guidance through speech, haptics, and commands.",
      nodes: [
        {
          id: "sensor",
          label: "LiDAR",
          detail: "Depth and obstacle signals",
          kind: "system",
        },
        {
          id: "vision",
          label: "Vision OCR",
          detail: "Text reading",
          kind: "ml",
        },
        {
          id: "localvision",
          label: "Local Vision",
          detail: "On-device recognition",
          kind: "ml",
        },
        {
          id: "feedback",
          label: "Haptics + speech",
          detail: "Guided feedback",
          kind: "client",
        },
        {
          id: "voiceover",
          label: "VoiceOver",
          detail: "Accessible controls",
          kind: "client",
        },
      ],
      edges: [
        { from: "sensor", to: "localvision", label: "environment signal" },
        { from: "vision", to: "feedback", label: "text context" },
        { from: "localvision", to: "feedback", label: "local recognition" },
        { from: "voiceover", to: "feedback", label: "interaction layer" },
      ],
    },
    decisions: [
      {
        decision: "Use native iOS frameworks",
        reason:
          "LiDAR, Vision, haptics, and VoiceOver are first-class platform capabilities.",
        tradeoff:
          "The app targets capable iOS devices rather than every phone.",
      },
      {
        decision: "Keep processing on-device",
        reason: "Camera and navigation context is sensitive.",
        tradeoff: "Local inference constrains model and compute choices.",
      },
    ],
    validation: [
      {
        label: "Unit coverage",
        evidence:
          "Local repository audit found 71 VisualAssistTests test functions.",
      },
      {
        label: "Accessibility",
        evidence:
          "Portfolio source data records VoiceOver-first accessibility and voice commands.",
      },
      {
        label: "Computer vision",
        evidence:
          "Current code uses ARKit, Vision OCR, human rectangles, and animal recognition paths; no custom Core ML model file was present in the audited repo.",
      },
    ],
    outcomes: [
      {
        label: "LiDAR detection",
        evidence:
          "LiDAR obstacle detection and haptic feedback are core project highlights.",
      },
      {
        label: "Text access",
        evidence:
          "Portfolio source data records Vision OCR with speech synthesis.",
      },
    ],
    artifacts: [
      {
        type: "diagram",
        label: "On-device accessibility architecture",
        href: withBasePath("/images/projects/visual-assist-architecture.svg"),
      },
      {
        type: "repo",
        label: "Source code",
        href: "https://github.com/yadava5/VisualAssist",
      },
      {
        type: "repo",
        label: "README beta and LiDAR requirements",
        href: "https://github.com/yadava5/VisualAssist#-requirements",
      },
      {
        type: "repo",
        label: "XCTest source evidence",
        href: "https://github.com/yadava5/VisualAssist/tree/main/VisualAssistTests",
      },
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
        {
          id: "ui",
          label: "React 19",
          detail: "Task and calendar workspace",
          kind: "client",
        },
        {
          id: "nlp",
          label: "NLP input",
          detail: "chrono-node and compromise",
          kind: "ml",
        },
        {
          id: "api",
          label: "App services",
          detail: "Scheduling and conflict logic",
          kind: "api",
        },
        {
          id: "db",
          label: "PostgreSQL",
          detail: "Indexed calendar data",
          kind: "data",
        },
        {
          id: "tests",
          label: "738 tests",
          detail: "Frontend, backend, integration",
          kind: "validation",
        },
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
        reason:
          "Scheduling should accept natural language instead of only rigid forms.",
        tradeoff: "Parsing ambiguity requires validation and clear fallbacks.",
      },
      {
        decision: "Build broad automated tests",
        reason:
          "Calendar behavior has many edge cases and regressions are expensive.",
        tradeoff:
          "More test maintenance, but higher confidence in app behavior.",
      },
    ],
    validation: [
      {
        label: "Automated tests",
        evidence: "Portfolio source data records 738 automated tests.",
      },
      {
        label: "Scheduling",
        evidence:
          "Portfolio source data records NLP smart input with chrono-node and compromise.",
      },
      {
        label: "Data model",
        evidence: "Portfolio source data records indexed PostgreSQL queries.",
      },
    ],
    outcomes: [
      {
        label: "Planning workspace",
        evidence:
          "Portfolio source data records a multi-pane task workspace and Kanban board.",
      },
      {
        label: "Conflict detection",
        evidence: "Portfolio source data records conflict detection.",
      },
    ],
    artifacts: [
      {
        type: "real-screenshot",
        label: "Local mock-login calendar screenshot",
        href: withBasePath("/images/projects/taskflow.png"),
      },
      {
        type: "repo",
        label: "Source code",
        href: "https://github.com/yadava5/taskflow-calendar",
      },
    ],
  },
  {
    projectId: "master-inventory",
    treatment: "field-systems",
    role: "Data integration engineer",
    timeframe: "2025-06 to Present",
    summary:
      "Private proof from Miami University ITSM data work: a Python/pandas pipeline that consolidates Workday exports and Tableau metadata into a trusted 35-field master inventory.",
    evidenceDisclosure: {
      label: "Private-safe evidence",
      detail:
        "This case study describes the engineering shape, systems, and validation model without exposing institutional records, internal UI, or raw data.",
    },
    problem:
      "Operational reporting breaks down when asset identifiers, ownership fields, Tableau metadata, and Workday exports disagree across systems.",
    constraints: [
      "Keep institutional details private while explaining the engineering shape.",
      "Normalize large operational datasets without losing auditability.",
      "Create deterministic inventory identifiers across heterogeneous sources.",
      "Produce outputs that downstream Tableau Prep flows and dashboards can trust.",
    ],
    architecture: {
      summary:
        "Workday exports and Tableau metadata feed Python/pandas transforms, deterministic IDs, timestamped run artifacts, and dashboard-ready outputs.",
      nodes: [
        {
          id: "workday",
          label: "Workday exports",
          detail: "Operational report inputs",
          kind: "data",
        },
        {
          id: "tableau",
          label: "Tableau metadata",
          detail: "Cloud REST metadata",
          kind: "api",
        },
        {
          id: "python",
          label: "Python/pandas",
          detail: "Cleaning and transforms",
          kind: "system",
        },
        {
          id: "records",
          label: "Unified records",
          detail: "Unified schema and IDs",
          kind: "data",
        },
        {
          id: "audit",
          label: "Run artifacts",
          detail: "Timestamped validation outputs",
          kind: "validation",
        },
        {
          id: "dashboard",
          label: "Tableau Prep",
          detail: "Dashboard-ready inventory",
          kind: "client",
        },
      ],
      edges: [
        { from: "workday", to: "python", label: "report rows" },
        { from: "tableau", to: "python", label: "metadata" },
        { from: "python", to: "records", label: "normalized records" },
        { from: "records", to: "audit", label: "validation exports" },
        { from: "records", to: "dashboard", label: "trusted dataset" },
      ],
    },
    decisions: [
      {
        decision: "Use deterministic inventory IDs",
        reason:
          "Cross-system reconciliation needed stable keys instead of display names or inconsistent source IDs.",
        tradeoff:
          "ID logic adds up-front modeling work but makes downstream joins and audits more reliable.",
      },
      {
        decision: "Preserve timestamped run artifacts",
        reason:
          "Operational data changes over time and stakeholders need to inspect what a run produced.",
        tradeoff:
          "Artifact storage adds cleanup overhead but improves debugging and trust.",
      },
      {
        decision: "Keep the proof private but specific",
        reason:
          "The work is organizational and cannot expose raw institutional records.",
        tradeoff:
          "Recruiters cannot inspect source data, so the portfolio names the systems, constraints, and validation shape.",
      },
    ],
    validation: [
      {
        label: "Inventory outputs",
        evidence:
          "Local processed output audit found 3,731 Tableau rows and 6,743 Workday rows consolidated into a 10,453-row deduplicated master_inventory.csv.",
      },
      {
        label: "Unified schema",
        evidence:
          "Source docs and configs record a 35-field unified schema with deterministic inventory_id values generated from row fields.",
      },
      {
        label: "Audit trail",
        evidence:
          "The local source repo writes timestamped run folders plus cumulative processed outputs while keeping raw institutional exports out of version control.",
      },
      {
        label: "Local tests",
        evidence:
          "The source repo passed 3 extractor tests and critical ruff syntax/import checks in its local virtualenv during this audit.",
      },
    ],
    outcomes: [
      {
        label: "Private data boundary",
        evidence:
          "The portfolio shows counts, schema shape, and architecture only; raw CSV rows, owners, report names, PAT values, and institutional exports stay private.",
      },
      {
        label: "Trusted reporting",
        evidence:
          "The unified schema supports Tableau Prep and dashboard workflows without exposing institutional records.",
      },
    ],
    artifacts: [
      {
        type: "diagram",
        label: "Private-safe pipeline architecture",
        href: withBasePath("/images/projects/pipeline-architecture.svg"),
      },
      {
        type: "benchmark",
        label: "Processed output proof ledger",
        href: withBasePath("/images/projects/master-inventory-proof.svg"),
      },
    ],
  },
  {
    projectId: "policybot",
    treatment: "evidence-ledger",
    role: "RAG systems engineer",
    timeframe: "2025-06 to Present",
    summary:
      "Private proof from Miami University policy-support work: a Python RAG assistant that routes CLI and Slack questions through OpenAI File Search and cited-source guardrails.",
    evidenceDisclosure: {
      label: "Private-safe evidence",
      detail:
        "This case study uses a private-safe architecture diagram plus sanitized source-truth summaries. Real institutional policy content, raw validation transcripts, Slack messages, and private records are not shown.",
    },
    problem:
      "Policy answers were scattered across documents, pages, and team knowledge, making day-to-day interpretation slow and inconsistent.",
    constraints: [
      "Keep institutional policy content governed and source-cited.",
      "Support DOCX, PDF, and Markdown policy sources.",
      "Validate quoted passages before presenting answers.",
      "Meet users where they already work: Slack.",
    ],
    architecture: {
      summary:
        "Policy documents are indexed for retrieval, validated locally for quote grounding, and delivered through Slack Socket Mode with cited responses.",
      nodes: [
        {
          id: "docs",
          label: "Policy docs",
          detail: "DOCX, PDF, Markdown",
          kind: "data",
        },
        {
          id: "filesearch",
          label: "File Search",
          detail: "OpenAI retrieval",
          kind: "ml",
        },
        {
          id: "validator",
          label: "Quote validation",
          detail: "Local citation checks",
          kind: "validation",
        },
        {
          id: "slack",
          label: "Slack Socket Mode",
          detail: "Team workflow surface",
          kind: "client",
        },
        {
          id: "response",
          label: "Cited answer",
          detail: "Grounded policy guidance",
          kind: "api",
        },
      ],
      edges: [
        { from: "docs", to: "filesearch", label: "indexed sources" },
        { from: "filesearch", to: "validator", label: "candidate quotes" },
        { from: "validator", to: "response", label: "grounded evidence" },
        { from: "slack", to: "response", label: "user question" },
        { from: "response", to: "slack", label: "cited reply" },
      ],
    },
    decisions: [
      {
        decision: "Use retrieval with explicit citations",
        reason:
          "Policy support is only useful when users can see where guidance came from.",
        tradeoff:
          "Citations make answers more trustworthy but require stricter source handling.",
      },
      {
        decision: "Add local quote validation",
        reason: "Generated text should not invent or misquote policy language.",
        tradeoff:
          "Validation adds latency and implementation work, but reduces hallucination risk.",
      },
      {
        decision: "Use Slack as the delivery layer",
        reason:
          "The target workflow already happens in team communication channels.",
        tradeoff:
          "Slack integration adds event handling complexity but lowers adoption friction.",
      },
    ],
    validation: [
      {
        label: "Validation sweep",
        evidence:
          "Committed validation summary reports a 19/20 latest structured sweep, a 17/25 keyword sweep, 4 honest fallbacks, and locally rejected answers when quotes could not be verified.",
      },
      {
        label: "Citation safety",
        evidence:
          "Source code and docs show OpenAI Responses API with File Search, cited filenames, and local quote verification against policy files when available.",
      },
      {
        label: "Workflow fit",
        evidence:
          "The source repo includes CLI entry points and a Slack Socket Mode bridge; no production usage, workspace adoption, or always-on service claim is made here.",
      },
      {
        label: "Local tests",
        evidence:
          "The source repo passed 3 Slack adapter/formatting tests in a temporary audit virtualenv without calling OpenAI or Slack.",
      },
    ],
    outcomes: [
      {
        label: "Lookup time",
        evidence:
          "The assistant is designed to reduce policy lookup friction while preserving citations and fallback behavior.",
      },
      {
        label: "Governed answers",
        evidence:
          "Responses are framed around cited sources instead of uncited generated advice.",
      },
    ],
    artifacts: [
      {
        type: "diagram",
        label: "Retrieval and validation architecture",
        href: withBasePath("/images/projects/policybot-architecture.svg"),
      },
      {
        type: "benchmark",
        label: "Validation ledger proof",
        href: withBasePath("/images/projects/policybot-validation-proof.svg"),
      },
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
        {
          id: "input",
          label: "MNIST input",
          detail: "Digit preprocessing",
          kind: "data",
        },
        {
          id: "kernels",
          label: "SIMD kernels",
          detail: "AVX2, AVX-512, NEON",
          kind: "system",
        },
        {
          id: "parallel",
          label: "OpenMP",
          detail: "Parallel hot paths",
          kind: "system",
        },
        {
          id: "model",
          label: "Neural network",
          detail: "C++ inference",
          kind: "ml",
        },
        {
          id: "demo",
          label: "React demo",
          detail: "Interactive visualization",
          kind: "client",
        },
        {
          id: "bench",
          label: "Benchmarks",
          detail: "Performance suite",
          kind: "validation",
        },
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
        reason:
          "The project is meant to demonstrate performance engineering beyond framework use.",
        tradeoff:
          "Hardware-specific paths need careful fallbacks and benchmarking.",
      },
      {
        decision: "Expose a React demo",
        reason:
          "Recruiters can inspect the behavior without reading only C++ code.",
        tradeoff: "The frontend is secondary to the C++ benchmark proof.",
      },
    ],
    validation: [
      {
        label: "Accuracy",
        evidence: "Portfolio source data records 97%+ accuracy on MNIST.",
      },
      {
        label: "Speedup",
        evidence:
          "Committed benchmark data supports a 3.50x dot-kernel speedup; classify-throughput rows do not support the prior AVX-512 inference claim.",
      },
      {
        label: "Benchmarks",
        evidence: "Portfolio source data records a benchmark suite.",
      },
    ],
    outcomes: [
      {
        label: "Performance proof",
        evidence:
          "The project demonstrates SIMD acceleration across AVX2, AVX-512, and NEON paths.",
      },
      {
        label: "Interactive inspection",
        evidence:
          "Portfolio source data records an interactive React and TypeScript web app.",
      },
    ],
    artifacts: [
      {
        type: "real-screenshot",
        label: "Local React workbench screenshot",
        href: withBasePath("/images/projects/mnist.png"),
      },
      {
        type: "diagram",
        label: "Vector project asset",
        href: withBasePath("/images/projects/fast-mnist-nn.svg"),
      },
      {
        type: "repo",
        label: "Source code",
        href: "https://github.com/yadava5/fast-mnist-nn",
      },
      {
        type: "repo",
        label: "v1.0.0 release",
        href: "https://github.com/yadava5/fast-mnist-nn/releases/tag/v1.0.0",
      },
      {
        type: "benchmark",
        label: "Benchmark evidence",
        href: "https://github.com/yadava5/fast-mnist-nn",
      },
    ],
  },
];

export const caseStudyIds = projectCaseStudies.map((study) => study.projectId);

const atlasSelectedWorkOrder = [
  "automl",
  "fast-mnist-nn",
  "visual-assist",
  "jobtracker",
  "taskflow-calendar",
  "master-inventory",
  "policybot",
];

export const atlasProjectCaseStudies = atlasSelectedWorkOrder.map(
  (projectId) => {
    const study = projectCaseStudies.find(
      (caseStudy) => caseStudy.projectId === projectId
    );
    if (!study) {
      throw new Error(`Missing Atlas case study for project ${projectId}`);
    }
    return study;
  }
);

export function getCaseStudyById(id: string): ProjectCaseStudy | undefined {
  return projectCaseStudies.find((study) => study.projectId === id);
}

export function getCaseStudyProject(
  study: ProjectCaseStudy
): Project | undefined {
  return projects.find((project) => project.id === study.projectId);
}
