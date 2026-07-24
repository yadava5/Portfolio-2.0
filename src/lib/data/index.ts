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
export {
  experiences,
  calculateDuration,
  formatDateRange,
  getCurrentExperience,
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
export {
  testimonials,
  getManagerTestimonial,
  getTestimonialsByRelationship,
  getRandomTestimonial,
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
  getDeansListCount,
  type SocialLink,
  type Education,
  type Award,
} from "./personal";
