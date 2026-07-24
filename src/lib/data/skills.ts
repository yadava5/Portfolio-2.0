/**
 * @fileoverview Skills data organized by category
 *
 * Contains all technical and soft skills with proficiency levels
 * and visual metadata for display.
 */

/** Skill proficiency level */
export type SkillLevel = "expert" | "advanced" | "intermediate" | "learning";

/** Individual skill entry */
export interface Skill {
  /** Skill name */
  name: string;
  /** Lucide icon name (for lucide-react) */
  icon?: string;
  /** Proficiency level */
  level: SkillLevel;
  /** Years of experience */
  yearsOfExperience?: number;
  /** Projects/roles where this skill was actually used (provenance) */
  usedIn?: string[];
}

/** Skill category */
export interface SkillCategory {
  /** Category identifier */
  id: string;
  /** Category display name */
  name: string;
  /** Category description */
  description: string;
  /** Skills in this category */
  skills: Skill[];
}

/**
 * Skills organized by category
 *
 * Provenance (`usedIn`) is sourced from the project and experience data,
 * not from self-reported endorsement counts.
 */
export const skillCategories: SkillCategory[] = [
  {
    id: "languages",
    name: "Languages",
    description: "Programming languages I work with",
    skills: [
      {
        name: "TypeScript",
        level: "advanced",
        usedIn: ["Agentic AutoML", "Applied", "Cadence", "Glyph", "LifeQuest"],
      },
      {
        name: "Python",
        level: "advanced",
        usedIn: ["Applied", "Master Inventory", "PolicyBot", "Miami ITSM"],
      },
      {
        name: "JavaScript",
        level: "advanced",
        usedIn: ["Cadence", "Glyph"],
      },
      {
        name: "Swift",
        level: "intermediate",
        usedIn: ["Visual Assist"],
      },
      { name: "C++", level: "intermediate", usedIn: ["Glyph"] },
      { name: "Java", level: "advanced", usedIn: ["jetpack-compress"] },
      {
        name: "SQL",
        level: "advanced",
        usedIn: ["Miami ITSM", "Master Inventory", "Cadence"],
      },
    ],
  },
  {
    id: "frontend",
    name: "Frontend",
    description: "UI frameworks and tools",
    skills: [
      {
        name: "React",
        level: "advanced",
        usedIn: ["Agentic AutoML", "Applied", "Cadence", "Glyph", "LifeQuest"],
      },
      { name: "Next.js", level: "advanced", usedIn: ["Applied", "Portfolio"] },
      {
        name: "Tailwind CSS",
        level: "advanced",
        usedIn: ["Cadence", "Portfolio"],
      },
      {
        name: "SwiftUI",
        level: "intermediate",
        usedIn: ["Visual Assist"],
      },
      { name: "Framer Motion", level: "intermediate", usedIn: ["Portfolio"] },
      { name: "GSAP", level: "intermediate", usedIn: ["Portfolio"] },
    ],
  },
  {
    id: "backend",
    name: "Backend",
    description: "Server-side technologies",
    skills: [
      {
        name: "Node.js",
        level: "advanced",
        usedIn: ["Agentic AutoML", "LifeQuest"],
      },
      { name: "NestJS", level: "intermediate", usedIn: ["LifeQuest"] },
      {
        name: "PostgreSQL",
        level: "advanced",
        usedIn: ["Agentic AutoML", "Applied", "Cadence", "LifeQuest"],
      },
      { name: "Prisma", level: "intermediate" },
      {
        name: "REST APIs",
        level: "advanced",
        usedIn: ["Agentic AutoML", "Miami ITSM"],
      },
    ],
  },
  {
    id: "data",
    name: "Data & ML",
    description: "Data engineering and machine learning",
    skills: [
      {
        name: "Data Pipelines",
        level: "advanced",
        usedIn: ["Miami ITSM", "Master Inventory"],
      },
      {
        name: "ETL",
        level: "advanced",
        usedIn: ["Miami ITSM", "Master Inventory"],
      },
      {
        name: "Machine Learning",
        level: "intermediate",
        usedIn: ["Agentic AutoML", "Applied", "Glyph"],
      },
      {
        name: "Tableau",
        level: "advanced",
        usedIn: ["Miami ITSM", "Master Inventory"],
      },
      { name: "Snowflake", level: "intermediate", usedIn: ["Miami ITSM"] },
      {
        name: "pandas",
        level: "advanced",
        usedIn: ["Master Inventory", "Miami ITSM"],
      },
    ],
  },
  {
    id: "mobile",
    name: "Mobile & Native",
    description: "iOS and desktop development",
    skills: [
      { name: "ARKit", level: "intermediate", usedIn: ["Visual Assist"] },
      {
        name: "Core ML",
        level: "intermediate",
        usedIn: ["Visual Assist"],
      },
      { name: "Vision", level: "intermediate", usedIn: ["Visual Assist"] },
      { name: "Tauri", level: "intermediate" },
    ],
  },
  {
    id: "devops",
    name: "DevOps & Tools",
    description: "Development operations and tooling",
    skills: [
      {
        name: "Git",
        level: "advanced",
        usedIn: ["Agentic AutoML", "Applied", "Glyph"],
      },
      {
        name: "GitHub",
        level: "advanced",
        usedIn: ["Portfolio", "Applied"],
      },
      { name: "Docker", level: "intermediate", usedIn: ["Agentic AutoML"] },
      { name: "Kubernetes", level: "learning" },
      {
        name: "Vercel",
        level: "advanced",
        usedIn: ["Applied", "Cadence", "Glyph", "LifeQuest", "Portfolio"],
      },
      { name: "CI/CD", level: "intermediate", usedIn: ["Portfolio"] },
    ],
  },
  {
    id: "specializations",
    name: "Specializations",
    description: "Specialized skills and domains",
    skills: [
      {
        name: "Parallel Computing",
        level: "intermediate",
        usedIn: ["Glyph", "jetpack-compress"],
      },
      {
        name: "OCR",
        level: "intermediate",
        usedIn: ["Visual Assist", "PolicyBot"],
      },
      {
        name: "API Integration",
        level: "advanced",
        usedIn: ["Miami ITSM", "Agentic AutoML"],
      },
      {
        name: "Metadata Management",
        level: "advanced",
        usedIn: ["Master Inventory", "Miami ITSM"],
      },
      {
        name: "Accessibility",
        level: "intermediate",
        usedIn: ["Visual Assist", "Portfolio"],
      },
    ],
  },
];

/**
 * Get all skills flattened into a single array
 */
export function getAllSkills(): Skill[] {
  return skillCategories.flatMap((cat) => cat.skills);
}

/**
 * Get skills by proficiency level
 */
export function getSkillsByLevel(level: SkillLevel): Skill[] {
  return getAllSkills().filter((skill) => skill.level === level);
}

/**
 * Get skills used in a given project or role (by provenance)
 */
export function getSkillsUsedIn(source: string): Skill[] {
  return getAllSkills().filter((skill) => skill.usedIn?.includes(source));
}

/**
 * Get skill category by ID
 */
export function getSkillCategory(id: string): SkillCategory | undefined {
  return skillCategories.find((cat) => cat.id === id);
}
