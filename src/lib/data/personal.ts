/**
 * @fileoverview Personal information and site metadata
 *
 * Contains personal details, education, awards, and site configuration.
 * This is the single source of truth for personal information across the site.
 */

import { withBasePath } from "@/lib/basePath";

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
  /** Email address — owner's decision 2026-07-30: the address he uses
      everywhere else, replacing aesh_1055@icloud.com. One public
      address across the site, the résumé and the case files; a reader
      who takes the contact line from one surface and the mailto from
      another must land in the same inbox. */
  email: "aesh.03.23@gmail.com",
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
    url: "mailto:aesh.03.23@gmail.com",
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
  /**
   * Site description.
   *
   * CRITIC-LEDGER F52 (the decaying half): this read "a recent
   * computer-science graduate". Graduation was 2026-05; "recent" has a
   * shelf life measured in months and nothing in the build would ever
   * flag it — the ledger asked for a review date. A review date only
   * moves the decay; the sentence below has none, because it describes
   * what the SITE is (the thing that stays true) rather than how new
   * its author is. Seven case files, each claim terminating at an
   * artifact — the argument the whole document makes.
   *
   * Fix round 4: the possessive was a STRAIGHT apostrophe. It never
   * showed in the round-3 glyph sweep because that sweep read painted
   * prose, and this sentence is never painted — it is the meta
   * description, the og/twitter description, and the deck drawn on
   * `public/og/home.png`. It is the site's first sentence in a search
   * result and in every shared link, so it is the LAST place the
   * typographic rule should lapse. Re-render the card after editing
   * this line (`npm run assets:render-og`) — the deck is read from
   * here, and the drawn card and the meta tag must say the same thing.
   */
  description:
    "Ayush Yadav’s portfolio: software, data, and ML engineering case files, where every claim terminates at an artifact you can open — and an evidence index that lists them all.",
  /** Site URL */
  url: "https://ayush-yadav.com",
  /**
   * Default Open Graph image — the home card (CRITIC-LEDGER F25). Real
   * raster, rendered from the data layer by
   * `npm run assets:render-og`; every route with its own card overrides
   * this in its own metadata block.
   */
  ogImage: withBasePath("/og/home.png"),
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

/* `getDeansListCount()` stood here from W2's F53 fix — the ¶03
   education line was to derive "spring & fall 2025" from the awards
   array so the two could never contradict. The 2026-07-24 owner
   directive settled that line as confirmed copy instead (semesters
   named, GPA once), and the helper's last call site went with it. It
   was exported from src/lib/data/index.ts and called by nothing:
   dead code whose docstring described a contract the page no longer
   holds. Removed rather than left as a comment about a function that
   isn't there (certification round, D1). The Fall-2023 award still
   sits in `awards` above, and the open question about it is recorded
   where the copy is — StoryShell's education block. */
