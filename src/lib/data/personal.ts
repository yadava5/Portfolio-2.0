/**
 * @fileoverview Personal information and site metadata
 *
 * Contains personal details, education, awards, and site configuration.
 * This is the single source of truth for personal information across the site.
 */

import { withBasePath } from "@/lib/utils";

/** Social link entry */
export interface SocialLink {
  /** Platform name */
  name: string;
  /** URL */
  url: string;
  /** Lucide icon name */
  icon: string;
}

/** Education entry */
export interface Education {
  /** School name */
  school: string;
  /** Degree type */
  degree: string;
  /** Field of study */
  field: string;
  /** Start date (YYYY-MM) */
  startDate: string;
  /** End date (YYYY-MM) */
  endDate: string;
  /** Relevant coursework */
  coursework: string[];
  /** School logo path */
  logo: string;
}

/** Award/honor entry */
export interface Award {
  /** Award name */
  name: string;
  /** Issuing organization */
  issuer: string;
  /** Date received */
  date: string;
  /** Description */
  description: string;
}

/** Personal information */
export const personalInfo = {
  /** Full name */
  name: "Ayush Yadav",
  /** First name for casual display */
  firstName: "Ayush",
  /** Professional title/tagline */
  title: "New-grad software engineer",
  /** Short tagline for hero section */
  tagline:
    "New-grad software engineer — data pipelines, ML systems, and software I can stand behind",
  /** Email address */
  email: "aesh_1055@icloud.com",
  /** Location */
  location: "Cincinnati, Ohio",
  /** Current availability */
  availability: "Open to new-grad software, data, and ML engineering roles",
  /** Professional portrait. `thumb` is the 96×96 header-button
   *  derivative (PERF-AUDIT fix 3 — the full 900×1350 portrait was
   *  preload-shipped on every route to paint a 26–36px avatar);
   *  regenerate via `npm run assets:derive`. The portrait MODAL keeps
   *  the full image. */
  portrait: {
    image: withBasePath(
      "/images/profile/ayush-yadav-professional-portrait.webp"
    ),
    thumb: withBasePath("/images/profile/ayush-yadav-avatar-96.webp"),
    alt: "Ayush Yadav professional portrait",
  },

  /** Bio paragraphs for about section */
  bio: [
    "Computer Science graduate focused on data pipelines, applied machine learning, and reliable software systems end-to-end.",
    "As an ITSM Data Integration Student Associate at Miami University from June 2025 to May 2026, I built Python and data pipelines for Tableau/OAS and operational reporting, translated messy records into trusted datasets, and shipped dashboards and automations for real team workflows.",
    "I enjoy backend/full-stack engineering, data engineering, and ML-adjacent product work, especially where performance, reliability, and clear user impact matter.",
  ],

  /** Resume file path */
  resumeUrl: withBasePath("/resume.pdf"),
};

/** Social media links */
export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/yadava5",
    icon: "Github",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/ayush-yadav-developer/",
    icon: "Linkedin",
  },
  {
    name: "Email",
    url: "mailto:aesh_1055@icloud.com",
    icon: "Mail",
  },
];

/** Education history */
export const education: Education[] = [
  {
    school: "Miami University",
    degree: "Bachelor of Science",
    field: "Computer Science",
    startDate: "2022-08",
    endDate: "2026-05",
    coursework: [
      "CSE 385 – Database Systems: Relational modeling, normalization, SQL",
      "CSE 432 – Machine Learning: Predictive models, large dataset projects",
      "CSE 443 – High Performance Computing: Parallel/multiprocessor programming",
      "CSE 484 – Algorithms II: NP-completeness, approximation algorithms",
      "MTH 252 – Calculus III: 3D geometry, vectors, multiple integrals",
      "MTH 222 – Linear Algebra: Matrix algebra, determinants, vector spaces, transformations",
      "MTH 231 – Discrete Math: Logic, sets, proofs by induction, relations, counting",
      "STA 301 – Applied Statistics: Probability, hypothesis testing, ANOVA, regression",
      "STA 363 – Statistical Modeling: Regression, experimental design, model selection",
    ],
    logo: withBasePath("/images/companies/miami.png"),
  },
];

/** Awards and honors */
export const awards: Award[] = [
  {
    name: "Dean's List",
    issuer: "Miami University",
    date: "2026-01",
    description:
      "Named to the Dean's List for Fall 2025 in recognition of outstanding academic achievement.",
  },
  {
    name: "Dean's List",
    issuer: "Miami University",
    date: "2025-06",
    description:
      "Named to the Dean's List for Spring 2025 in recognition of outstanding academic achievement.",
  },
  {
    name: "Dean's List",
    issuer: "Miami University",
    date: "2024-01",
    description:
      "Placed on the Dean's List for Fall 2023 in recognition of strong semester GPA.",
  },
];

/** Site metadata for SEO */
export const siteMetadata = {
  /** Site title */
  title: "Ayush Yadav | Software, Data, and ML Engineering",
  /** Site description */
  description:
    "Ayush Yadav's new-grad software, data, and ML engineering portfolio with source-truth case studies, private-safe evidence, and current resume links.",
  /** Site URL */
  url: "https://yadava5.github.io/Portfolio-2.0",
  /** Open Graph image path */
  ogImage: withBasePath("/og-image.png"),
  /** Twitter handle */
  twitterHandle: "@ayushyadav_dev",
  /** Keywords for SEO */
  keywords: [
    "Ayush Yadav",
    "Software Engineer",
    "Data Engineer",
    "Full-Stack Developer",
    "Machine Learning",
    "Miami University",
    "Python",
    "TypeScript",
    "React",
    "PostgreSQL",
    "Data Pipelines",
  ],
};

/**
 * Get formatted location string
 */
export function getFormattedLocation(): string {
  return `${personalInfo.location}`;
}

/**
 * Get current education (most recent)
 */
export function getCurrentEducation(): Education | undefined {
  return education[0];
}

/**
 * Count total Dean's List appearances
 */
export function getDeansListCount(): number {
  return awards.filter((a) => a.name === "Dean's List").length;
}
