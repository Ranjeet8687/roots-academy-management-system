export interface FacultySocialLinks {
  linkedin?: string;
  email?: string;
  website?: string;
}

/**
 * FacultyData
 * Shape of a single faculty member. Mirrors a future
 * GET /api/faculty response — no restructuring needed later.
 */
export interface FacultyData {
  id: string;
  name: string;
  /** Path or URL to the faculty photo */
  photo: string;
  subject: string;
  qualification: string;
  /** e.g. "12 Years" */
  experience: string;
  specialization: string;
  description: string;
  socialLinks: FacultySocialLinks;
  featured?: boolean;
}