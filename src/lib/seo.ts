import {
  education,
  personalInfo,
  siteMetadata,
  socialLinks,
} from "@/lib/data/personal";
import type { Project } from "@/lib/data/projects";
import type { ProjectCaseStudy } from "@/lib/data/projectCaseStudies";
import { basePath } from "@/lib/basePath";

export function absoluteSiteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  const pathWithoutBase =
    basePath && normalized.startsWith(`${basePath}/`)
      ? normalized.slice(basePath.length)
      : normalized;
  const relativePath = pathWithoutBase.replace(/^\//, "");

  return new URL(relativePath, `${siteMetadata.url}/`).toString();
}

/* ══════════════════════════════════════════════════════════════════
   STRUCTURED DATA (CRITIC-LEDGER F23)

   `grep -c 'application/ld+json' out/index.html` → 0. No Person, no
   sameAs to the GitHub and LinkedIn URLs that had been sitting in
   personal.ts all along — on a portfolio whose entire search surface is
   a NAME QUERY, which is the one query type structured data most
   directly answers.

   Everything below is composed from the data layer. Nothing is
   asserted here that the page does not already print, and no field is
   filled with a plausible-looking value it cannot source: no
   aggregateRating, no jobTitle the owner has not claimed, no
   award/credential text beyond what `awards` records. A JSON-LD block
   is a machine-readable restatement of the page — an invented one is
   the same lie as an invented number, only harder for a reader to
   catch.
   ══════════════════════════════════════════════════════════════════ */

/** Stable @ids so the graph nodes can reference each other across routes */
const PERSON_ID = `${siteMetadata.url}/#person`;
const SITE_ID = `${siteMetadata.url}/#website`;

type JsonLdNode = Record<string, unknown>;

/**
 * The Person node — the name query's answer.
 *
 * `sameAs` carries only profiles the site already links in its own
 * chrome; `mailto:` is dropped from that list (a social profile is not
 * an identity URL, and the address is on the gate for a human to use).
 */
export function personNode(): JsonLdNode {
  const school = education[0];
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: personalInfo.name,
    url: `${siteMetadata.url}/`,
    image: absoluteSiteUrl(personalInfo.portrait.image),
    description: personalInfo.bio[0],
    homeLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cincinnati",
        addressRegion: "OH",
        addressCountry: "US",
      },
    },
    sameAs: socialLinks
      .filter((link) => link.url.startsWith("http"))
      .map((link) => link.url),
    ...(school
      ? {
          alumniOf: {
            "@type": "CollegeOrUniversity",
            name: school.school,
          },
        }
      : {}),
  };
}

/** The WebSite node — the publication this document belongs to */
export function webSiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: `${siteMetadata.url}/`,
    name: siteMetadata.title,
    description: siteMetadata.description,
    inLanguage: "en-US",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };
}

/** Person + WebSite — emitted once, from the root layout */
export function siteGraph(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": [personNode(), webSiteNode()],
  };
}

/**
 * The thing a case file is ABOUT, typed by what the repository
 * actually is rather than by what would look best:
 *   · a public repo   → SoftwareSourceCode, with the repository itself
 *   · a hosted demo   → WebApplication
 *   · neither         → SoftwareApplication with no URL to promise
 * A private file gets no `codeRepository` — the case file says the repo
 * is private, and the graph must say the same thing.
 */
function projectNode(project: Project, study: ProjectCaseStudy): JsonLdNode {
  const type = project.githubUrl
    ? "SoftwareSourceCode"
    : project.liveUrl
      ? "WebApplication"
      : "SoftwareApplication";
  return {
    "@type": type,
    name: project.title,
    description: study.summary,
    author: { "@id": PERSON_ID },
    ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
    ...(project.liveUrl ? { url: project.liveUrl } : {}),
    ...(type === "SoftwareSourceCode"
      ? {
          programmingLanguage: project.techStack.map((tech) => tech.name),
        }
      : { applicationCategory: "DeveloperApplication" }),
  };
}

/**
 * A case file's graph: the page is a TechArticle ABOUT the project.
 *
 * `datePublished` = the file's `filed` date, `dateModified` = its
 * `verified` date — the two dates the kicker already prints. Both are
 * YYYY-MM because that is the precision on record; a fabricated day
 * would be an invented number in a machine-readable field.
 */
export function caseStudyGraph(
  project: Project,
  study: ProjectCaseStudy
): JsonLdNode {
  const url = `${siteMetadata.url}/projects/${project.id}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        headline: `${project.title} — case file`,
        description: study.summary,
        url,
        mainEntityOfPage: url,
        datePublished: study.filed,
        dateModified: study.verified,
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
        isPartOf: { "@id": SITE_ID },
        image: absoluteSiteUrl(`/og/case-${project.id}.png`),
        about: projectNode(project, study),
      },
      personNode(),
    ],
  };
}

/**
 * /evidence — a CollectionPage over the ledger. `numberOfItems` is the
 * manifest's own length, passed in by the page rather than hardcoded,
 * so it can never drift from the entries actually rendered.
 */
export function evidenceGraph(entryCount: number): JsonLdNode {
  const url = `${siteMetadata.url}/evidence/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#ledger`,
        name: "The evidence index",
        url,
        description:
          "The master ledger behind the portfolio: every claim, its source, how it was verified, its visibility, and its privacy boundary.",
        isPartOf: { "@id": SITE_ID },
        author: { "@id": PERSON_ID },
        mainEntity: {
          "@type": "ItemList",
          name: "Proof manifest",
          numberOfItems: entryCount,
        },
      },
      personNode(),
    ],
  };
}

/**
 * Serialize a graph for `dangerouslySetInnerHTML`.
 *
 * `<` is escaped so no data-layer string can ever close the script
 * element early — the one injection surface a JSON-LD block has.
 */
export function jsonLdHtml(graph: JsonLdNode): string {
  return JSON.stringify(graph).replace(/</g, "\\u003c");
}
