/**
 * @fileoverview Testimonials/recommendations data
 *
 * Contains professional recommendations from LinkedIn and other sources,
 * attributed to specific people with their roles.
 *
 * CRITIC-LEDGER F58 — this file had ZERO importers and zero occurrences
 * in `out/`. On a site whose entire thesis is "every claim terminates at
 * an artifact outside this site", the only third-party, externally
 * verifiable evidence its author has was the one thing he did not show.
 * The closing page's "references" apparatus now carries the manager
 * recommendation (StoryShell ch07) — the placement a hiring reader
 * already means by that word.
 *
 * Rules that hold for anything rendered out of this file:
 *   1. A rendered excerpt is a CONTIGUOUS VERBATIM substring of the
 *      quote. Never a paraphrase, never a stitched-together sentence,
 *      never a word changed for flow. `assertVerbatimExcerpts()` below
 *      is a build-time gate, not a comment: the build fails rather than
 *      ship a reworded third party.
 *   2. The person is named, with their own title, and linked, so the
 *      reader can go and ask them.
 *   3. Excerpting is disclosed on the page, with the full text's
 *      location, because an unmarked excerpt of praise is a lie of
 *      omission in the flattering direction.
 */

/** Testimonial/recommendation entry */
export interface Testimonial {
  /** Unique identifier */
  id: string;
  /** Person's name */
  name: string;
  /** Person's title/role */
  title: string;
  /** Company/organization */
  company: string;
  /** Relationship to you */
  relationship: "manager" | "colleague" | "mentor" | "client";
  /** Profile photo path */
  photo?: string;
  /** The recommendation text */
  quote: string;
  /** Date received (YYYY-MM) */
  date: string;
  /** LinkedIn profile URL */
  linkedInUrl?: string;
  /**
   * The passage the site prints when the full recommendation is longer
   * than its surface can carry. MUST be a contiguous verbatim substring
   * of `quote` — enforced below at module scope.
   */
  excerpt?: string;
  /**
   * How this person's relationship reads to a stranger, in the site's
   * own voice. Rendered beside the name so the reader can weight the
   * reference without clicking through.
   */
  standing?: string;
}

/**
 * Professional testimonials
 *
 * Sourced from LinkedIn recommendations
 */
export const testimonials: Testimonial[] = [
  {
    id: "randall-vollen",
    name: "Randall Vollen",
    /* CURRENT position, not the one held when the recommendation was written.
       Verified on LinkedIn 2026-08-10: Applied AI & Data Principal at CBTS
       since Jul 2026; the Miami University entry (Institutional Director of
       BI, Data Management & Analytics, 2025–2026) now carries an end date.

       The tense split here is deliberate and it is the whole point of having
       both fields. `title`/`company` answer "who is this person, and will the
       reader find them where I said" — so they must track the live profile,
       because a title that disagrees with the LinkedIn page it links to reads
       as a fabricated reference rather than a stale one. `standing` answers
       "how would they know?", which is a fact about the past and does not
       move when he changes jobs.

       This file previously carried his LinkedIn HEADLINE ("Hands on
       Experienced Data, AI & Analytics Executive") in the `title` field. A
       headline is self-written positioning copy, not a position; it named no
       employer, which is why the stale `company: "Miami University"` beside
       it went unnoticed for months. Read the Experience section, not the
       headline. */
    title: "Applied AI & Data Principal",
    company: "CBTS",
    relationship: "manager",
    quote:
      "I managed Ayush as part of Miami University's inaugural Data and Business Intelligence intern cohort. From the start, he operated above intern level. Ayush contributed to core delivery. He built data pipelines used to analyze Oracle Analytics Server usage, giving the team visibility into report adoption, demand patterns, and technical load. That work informed platform decisions and prioritization. He also built a policy support chatbot that helped users interpret and apply Miami's data policies in day to day work. It translated policy language into practical guidance and reduced ambiguity without adding process overhead. Ayush showed strong judgment, independence, and follow through. He understood intent, not just requirements. He took feedback, iterated quickly, and delivered usable outcomes. He is disciplined, thoughtful, and reliable. Ayush would add value to any data, analytics, or platform team that expects real contribution and accountability.",
    date: "2026-01",
    linkedInUrl: "https://www.linkedin.com/in/randall-v-30745a4/",
    /* Five contiguous sentences, verbatim, from the recommendation's
       final third. Chosen for two reasons and no others:
         · it is the part a stranger can act on — a manager's assessment
           of how the work got done, not a restatement of the résumé;
         · it names no employer. The home page already names the
           university once, in ¶02, and the site's rule is one mention
           per surface. An excerpt that reintroduced it would have made
           the closing page repeat the one noun it had just spent a
           chapter earning the right to say once. */
    excerpt:
      "Ayush showed strong judgment, independence, and follow through. He understood intent, not just requirements. He took feedback, iterated quickly, and delivered usable outcomes. He is disciplined, thoughtful, and reliable. Ayush would add value to any data, analytics, or platform team that expects real contribution and accountability.",
    standing: "managed the data internship, 2025–26",
  },
  {
    id: "shree-chaturvedi",
    name: "Shree Chaturvedi",
    /* Verified on LinkedIn and shreechaturvedi.com, 2026-08-10. Two changes,
       and the second is the one that mattered.

       First, tense: he graduated in May 2026, stated in his own words on his
       site ("graduated may 2026") and in a LinkedIn post ("now that I've
       graduated"), so this describes a finished degree. His Experience
       section has zero current entries — he is job-searching, not employed —
       so there is no employer to name and inventing a plausible one would be
       the worst available error.

       Second, and this was wrong rather than merely stale: "Computer Science
       + Mathematics" reads as a double major. It is one major and one minor —
       "B.S. Computer Science, Minor in Mathematics" on both his LinkedIn
       Education entry and his own résumé. Overstating a real person's
       credentials on a page that exists to argue for careful claims is the
       specific failure this site cannot afford. */
    title: "B.S. Computer Science, Minor in Mathematics",
    company: "Miami University",
    relationship: "colleague",
    quote:
      "Ayush was my teammate for our senior design project (capstone). He always brought good energy in meetings and came up with his own ideas. He showed strong aptitude and willingness to learn and adapt to new problem domains. I was particularly impressed with his ability to work under pressure or strict deadlines and still deliver high quality work. I'm confident he would be a valuable member in any development team.",
    date: "2026-01",
    linkedInUrl: "https://www.linkedin.com/in/chaturs/",
    /* Deliberately NOT surfaced, and the reason belongs on the record.
       It is a real recommendation from a real person and nothing about
       it is doubted — but it is a capstone teammate writing about his
       capstone teammate, which is the one reference shape a hiring
       reader discounts on sight, because the incentives are symmetric
       and both parties know it. Printed beside a manager's specific
       account of delivered work it would not add a second reference; it
       would put a question mark over the first. The site has just cut a
       ledger row for padding (CRITIC-LEDGER F54) — doing the opposite
       two chapters later would be an argument against itself. One
       reference, the strongest one on file, is the same editorial rule
       every other surface here runs on. */
  },
];

/* ── Build-time honesty gate (F58 rule 1) ───────────────────────────
   An excerpt that is not a contiguous verbatim substring of the quote
   is a paraphrase wearing quotation marks — a third party made to say
   something they did not write. Module scope, so it ran during
   `next build`: the export failed rather than publishing it.

   THAT SENTENCE STOPPED BEING TRUE IN PHASE 4. Module-scope code runs
   when the module is IMPORTED, and the component that imported this one
   was deleted with the React tree — nothing on the build path imports
   it now, so this function has not executed since. The rule itself is
   re-implemented over this file's source in
   `scripts/qa/check-figures.mjs`, which already holds the run's ¶12
   testimony to these quotes word for word and runs on every build.
   Kept here rather than deleted: if this file is ever imported again,
   the guard should still be in it. */
function assertVerbatimExcerpts(entries: Testimonial[]): void {
  for (const entry of entries) {
    if (entry.excerpt && !entry.quote.includes(entry.excerpt)) {
      throw new Error(
        `testimonials: excerpt for "${entry.id}" is not a verbatim substring of the quote`
      );
    }
  }
}
assertVerbatimExcerpts(testimonials);

/**
 * Get testimonial from a manager
 */
export function getManagerTestimonial(): Testimonial | undefined {
  return testimonials.find((t) => t.relationship === "manager");
}

/**
 * Get testimonials by relationship type
 */
export function getTestimonialsByRelationship(
  relationship: Testimonial["relationship"]
): Testimonial[] {
  return testimonials.filter((t) => t.relationship === relationship);
}

/* `getRandomTestimonial()` used to live here:
   `testimonials[Math.floor(Math.random() * testimonials.length)]`.
   Deleted. Which reference a reader is shown is an editorial decision
   that has to be defensible — this file's whole discipline is that
   there is a reason for the one that ships and a written reason for the
   one that does not. A coin flip has neither, and in a static export it
   would also mean the build's dice, frozen, forever. */
