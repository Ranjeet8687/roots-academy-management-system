export type ContactIconName = "MapPin" | "Phone" | "Mail" | "Clock";

export type SocialPlatform = "Facebook" | "Instagram" | "Linkedin" | "Youtube";

export interface ContactDetail {
  id: string;
  icon: ContactIconName;
  label: string;
  value: string;
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  href: string;
}

export type ContactFieldType = "text" | "email" | "tel" | "select" | "textarea";

export interface ContactFormField {
  id: string;
  /** Key used in the form state object */
  name: string;
  label: string;
  type: ContactFieldType;
  placeholder?: string;
  required: boolean;
  autoComplete?: string;
  /** Only used when type is "select" */
  options?: string[];
}

export interface ContactHeaderProps {
  className?: string;
}

export interface ContactInfoProps {
  details: ContactDetail[];
  socialLinks: SocialLink[];
  className?: string;
}

export interface ContactFormProps {
  fields: ContactFormField[];
  className?: string;
}

export interface GoogleMapProps {
  title?: string;
  src?: string;
  className?: string;
}