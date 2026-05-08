/**
 * @fileoverview Experience/work history data for the portfolio
 *
 * Contains professional experience, internships, and relevant work history
 * with detailed responsibilities and achievements.
 */

import { withBasePath } from "@/lib/utils";

/** Work experience entry */
export interface Experience {
  /** Unique identifier */
  id: string;
  /** Job title */
  title: string;
  /** Company/organization name */
  company: string;
  /** Company logo path */
  logo: string;
  /** Employment type */
  type: "full-time" | "part-time" | "internship" | "contract";
  /** Work location */
  location: string;
  /** Location type */
  locationType: "on-site" | "remote" | "hybrid";
  /** Start date (YYYY-MM) */
  startDate: string;
  /** End date (YYYY-MM or "Present") */
  endDate: string;
  /** Job description/responsibilities */
  description: string[];
  /** Technologies/skills used */
  skills: string[];
  /** Key achievements with metrics */
  achievements: string[];
}

/**
 * Professional experience entries
 *
 * Ordered by recency (most recent first)
 */
export const experiences: Experience[] = [
  {
    id: "miami-it",
    title: "ITSM Data Integration Student Associate",
    company: "Miami University",
    logo: withBasePath("/images/companies/miami.png"),
    type: "internship",
    location: "Oxford, Ohio",
    locationType: "on-site",
    startDate: "2025-06",
    endDate: "Present",
    description: [
      "Built scalable Python and SQL pipelines to clean and transform over 1 million rows of raw data, creating a reliable foundation for cross-departmental reporting.",
      "Designed and deployed interactive Tableau dashboards used across multiple university departments for data-driven decision making.",
      "Analyzed IT service management data to uncover trends and KPIs, presenting findings that informed strategic decisions.",
      "Developed an AI-powered Slack chatbot integrated with Workday, Oracle Analytics Server, and Tableau APIs for real-time data access.",
    ],
    skills: [
      "Python",
      "SQL",
      "Tableau",
      "Data Pipelines",
      "ETL",
      "Snowflake",
      "API Integration",
      "Slack API",
      "OpenAI",
    ],
    achievements: [
      "Processed 1M+ rows of operational data into trusted datasets",
      "Built usage analytics pipeline for Oracle Analytics Server",
      "Created AI policy-support chatbot reducing documentation lookup time",
      "Integrated Slack workflow bot with Workday and Tableau APIs",
    ],
  },
  {
    id: "aramark",
    title: "Student Worker – Market Street at MacCracken",
    company: "Aramark",
    logo: withBasePath("/images/companies/aramark.png"),
    type: "part-time",
    location: "Oxford, Ohio",
    locationType: "on-site",
    startDate: "2023-08",
    endDate: "2023-12",
    description: [
      "Assisted with checkout operations, handling customer transactions quickly and accurately.",
      "Operated the grill station, preparing food while following safety and sanitation standards.",
      "Supported team efficiency by collaborating with coworkers in high-volume dining environment.",
    ],
    skills: ["Customer Service", "Time Management", "Teamwork"],
    achievements: [
      "Maintained high accuracy in transaction handling",
      "Ensured food safety compliance during high-volume periods",
    ],
  },
];

/**
 * Calculate duration string from start and end dates
 *
 * @param startDate - Start date in YYYY-MM format
 * @param endDate - End date in YYYY-MM format or "Present"
 * @returns Duration string (e.g., "9 months", "1 year 3 months")
 */
export function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate + "-01");
  const end = endDate === "Present" ? new Date() : new Date(endDate + "-01");

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (months < 12) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? "s" : ""}`;
  }

  return `${years} year${years !== 1 ? "s" : ""} ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
}

/**
 * Format date range for display
 *
 * @param startDate - Start date in YYYY-MM format
 * @param endDate - End date in YYYY-MM format or "Present"
 * @returns Formatted date range (e.g., "Jun 2025 - Present")
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr + "-01");
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const start = formatMonth(startDate);
  const end = endDate === "Present" ? "Present" : formatMonth(endDate);

  return `${start} - ${end}`;
}

/**
 * Get the current/most recent experience
 */
export function getCurrentExperience(): Experience | undefined {
  return experiences.find((exp) => exp.endDate === "Present");
}
