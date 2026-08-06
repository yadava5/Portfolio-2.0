/**
 * @fileoverview Experience/work history data for the portfolio
 *
 * Contains professional experience, internships, and relevant work history
 * with detailed responsibilities and achievements.
 */

import { withBasePath } from "@/lib/basePath";

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

function parseYearMonth(dateStr: string): Date {
  const [year, month] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, 1);
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
    endDate: "2026-05",
    description: [
      "Built scalable Python and SQL data workflows for OAS/Tableau reporting, including high-volume transforms over 1 million raw records.",
      "Designed and deployed interactive Tableau dashboards used across multiple university departments for data-driven decision making.",
      "Analyzed IT service management data to uncover trends and KPIs, presenting findings that informed strategic decisions.",
      "Developed an AI-powered Slack chatbot integrated with Workday, Oracle Analytics Server, and Tableau APIs for governed data access.",
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
      "Built OAS/Tableau data workflow over 1M+ operational records",
      "Built usage analytics pipeline for Oracle Analytics Server",
      "Created AI policy-support chatbot reducing documentation lookup time",
      "Integrated Slack workflow bot with Workday and Tableau APIs",
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
  const start = parseYearMonth(startDate);
  const end = endDate === "Present" ? new Date() : parseYearMonth(endDate);

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
 * The separator is an EN DASH (fix round 3, S13). A range is what the en
 * dash is for, the site already sets one in the case files
 * ("jun 2025 – may 2026", for this same role), and this function's
 * hyphen was printing a second grammar for the same fact two clicks
 * apart. Every date range the page renders now uses the one mark.
 *
 * @param startDate - Start date in YYYY-MM format
 * @param endDate - End date in YYYY-MM format or "Present"
 * @returns Formatted date range (e.g., "Jun 2025 – Present")
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const formatMonth = (dateStr: string) => {
    const date = parseYearMonth(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const start = formatMonth(startDate);
  const end = endDate === "Present" ? "Present" : formatMonth(endDate);

  return `${start} – ${end}`;
}

/* CRITIC-LEDGER F59: `getCurrentExperience()` lived here and returned
   `experiences.find((exp) => exp.endDate === "Present")`. No entry in
   this file has ever carried "Present" — the one role ended 2026-05 —
   so the function could only ever return `undefined`, and it had zero
   call sites to notice. Deleted rather than repaired: "the current
   experience" is a claim the site does not currently have, and a
   helper that manufactures one is how it would quietly acquire it. */
