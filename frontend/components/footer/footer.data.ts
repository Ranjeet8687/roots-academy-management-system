import type {
  FooterBrand,
  FooterLink,
  FooterCourse,
  FooterContact,
  FooterSocial,
  FooterBottomLink,
} from "./footer.types";

export const footerBrand: FooterBrand = {
  name: "Roots Academy",
  tagline: "Building Foundation, Achieving Success",
  description:
    "Roots Academy is a premier educational coaching institute dedicated to guiding students towards excellence in JEE, NEET and Foundation programs through conceptual clarity, personalised mentoring and rigorous practice.",
};

export const footerQuickLinks: FooterLink[] = [
  { id: "home", label: "Home", href: "#home" },
  { id: "about", label: "About", href: "#about" },
  { id: "courses", label: "Courses", href: "#courses" },
  { id: "faculty", label: "Faculty", href: "#faculty" },
  { id: "demo-lectures", label: "Demo Lectures", href: "#demo-lectures" },
  { id: "results", label: "Results", href: "#results" },
  { id: "testimonials", label: "Testimonials", href: "#testimonials" },
  { id: "gallery", label: "Gallery", href: "#gallery" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export const footerCourses: FooterCourse[] = [
  { id: "jee", label: "JEE (Main & Advanced)" },
  { id: "neet", label: "NEET (UG)" },
  { id: "foundation", label: "Foundation (Class 6–10)" },
  { id: "mht-cet", label: "MHT-CET" },
  { id: "crash-course", label: "Crash Course" },
  { id: "dropper-batch", label: "Dropper Batch" },
];

export const footerContactDetails: FooterContact[] = [
  {
    id: "phone",
    label: "Phone",
    value: "+91 93567 76815",
    href: "tel:+919356776815",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: "+91 93567 76815",
    href: "https://wa.me/919356776815",
  },
  {
    id: "email",
    label: "Email",
    value: "Email Coming Soon",
  },
  {
    id: "address",
    label: "Office Address",
    value: "Office Address Coming Soon",
  },
];

export const footerSocialLinks: FooterSocial[] = [
  { id: "instagram", platform: "Instagram", href: "https://instagram.com" },
  { id: "facebook", platform: "Facebook", href: "https://facebook.com" },
  { id: "youtube", platform: "YouTube", href: "https://youtube.com" },
  { id: "telegram", platform: "Telegram", href: "https://telegram.org" },
  { id: "linkedin", platform: "LinkedIn", href: "https://linkedin.com" },
];

export const footerCopyright = "© 2026 Roots Academy. All Rights Reserved.";

export const footerBottomLinks: FooterBottomLink[] = [
  { id: "privacy", label: "Privacy Policy", href: "#" },
  { id: "terms", label: "Terms & Conditions", href: "#" },
  { id: "sitemap", label: "Sitemap", href: "#" },
];