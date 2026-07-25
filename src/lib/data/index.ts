/**
 * @fileoverview Data module barrel export
 *
 * Re-exports all data modules for convenient imports throughout the app.
 *
 * @example
 * ```ts
 * import { projects, personalInfo, experiences } from "@/lib/data";
 * ```
 */

// Projects
export {
  projects,
  getFeaturedProjects,
  getPublicProjects,
  getProjectById,
  getProjectsByCategory,
  type Project,
  type TechTag,
} from "./projects";

// Experience
// (CRITIC-LEDGER F59: getCurrentExperience() is gone — it could only
// ever return undefined. See the note in experience.ts.)
export {
  experiences,
  calculateDuration,
  formatDateRange,
  type Experience,
} from "./experience";

// Skills
export {
  skillCategories,
  getAllSkills,
  getSkillsByLevel,
  getSkillsUsedIn,
  getSkillCategory,
  type Skill,
  type SkillCategory,
  type SkillLevel,
} from "./skills";

// Testimonials
// (CRITIC-LEDGER F58: `getRandomTestimonial()` is gone. A reference
// chosen by Math.random() is a reference nobody stands behind — which
// one a reader sees should be an editorial decision with a reason, and
// on this site it is: see the note on the second entry.)
export {
  testimonials,
  getManagerTestimonial,
  getTestimonialsByRelationship,
  type Testimonial,
} from "./testimonials";

// Personal Info
export {
  personalInfo,
  socialLinks,
  education,
  awards,
  siteMetadata,
  getFormattedLocation,
  getCurrentEducation,
  type SocialLink,
  type Education,
  type Award,
} from "./personal";
