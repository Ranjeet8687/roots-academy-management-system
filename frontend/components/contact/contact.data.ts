import type { ContactDetail, SocialLink, ContactFormField } from "./contact.types";

export const CONTACT_LABEL = "CONTACT US" as const;

export const CONTACT_HEADING = "Have Questions? We're Here to Help." as const;

export const CONTACT_DESCRIPTION =
  "Whether you're looking for admissions, fee details, counselling, scholarship information or course guidance, our team is always ready to help." as const;

/**
 * Contact details. Icon names are stored as strings only — no
 * Lucide components in this file — and resolved to components
 * inside ContactInfo.tsx, keeping this file safe to import from
 * either a Server or Client Component.
 */
export const CONTACT_DETAILS: ContactDetail[] = [
  {
    id: "address",
    icon: "MapPin",
    label: "Address",
    value: "Roots Academy, Sector 62, Noida, Uttar Pradesh 201309",
  },
  {
    id: "phone",
    icon: "Phone",
    label: "Phone",
    value: "+91 9876543210",
  },
  {
    id: "email",
    icon: "Mail",
    label: "Email",
    value: "admissions@rootsacademy.in",
  },
  {
    id: "office-hours",
    icon: "Clock",
    label: "Office Hours",
    value: "Monday – Saturday, 8:00 AM – 8:00 PM",
  },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { id: "facebook", platform: "Facebook", href: "https://facebook.com" },
  { id: "instagram", platform: "Instagram", href: "https://instagram.com" },
  { id: "linkedin", platform: "Linkedin", href: "https://linkedin.com" },
  { id: "youtube", platform: "Youtube", href: "https://youtube.com" },
];

/** Options for the "Course Interested In" dropdown field */
export const CONTACT_COURSES: string[] = [
  "JEE Foundation",
  "JEE Advanced",
  "NEET UG",
  "MHT-CET",
  "Dropper",
  "Class 9–10 Foundation",
];

/**
 * Form field definitions. Purely data-driven so the form can be
 * reordered, extended, or wired to a real API without touching
 * ContactForm.tsx markup.
 */
export const CONTACT_FORM_FIELDS: ContactFormField[] = [
  {
    id: "fullName",
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Your full name",
    required: true,
  },
  {
    id: "email",
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "you@example.com",
    required: true,
  },
  {
    id: "phone",
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+91 00000 00000",
    required: true,
  },
  {
    id: "course",
    name: "course",
    label: "Course Interested In",
    type: "select",
    placeholder: "Select a course",
    required: true,
    options: CONTACT_COURSES,
  },
  {
    id: "message",
    name: "message",
    label: "Message",
    type: "textarea",
    placeholder: "Tell us how we can help",
    required: true,
  },
];

export const GOOGLE_MAP_TITLE = "Roots Academy — Sector 62, Noida, Uttar Pradesh" as const;

export const GOOGLE_MAP_EMBED_SRC =
  "https://www.google.com/maps?q=Roots+Academy+Sector+62+Noida+Uttar+Pradesh+India&output=embed" as const;