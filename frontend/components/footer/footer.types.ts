export type SocialPlatform =
  | "Instagram"
  | "Facebook"
  | "YouTube"
  | "Telegram"
  | "LinkedIn";

export interface FooterLink {
  id: string;
  label: string;
  href: string;
}

export interface FooterCourse {
  id: string;
  label: string;
}

export interface FooterContact {
  id: string;
  label: string;
  value: string;
  href?: string;
}

export interface FooterSocial {
  id: string;
  platform: SocialPlatform;
  href: string;
}

export interface FooterBrand {
  name: string;
  tagline: string;
  description: string;
}

export interface FooterBottomLink {
  id: string;
  label: string;
  href: string;
}

export interface FooterBrandProps {
  brand: FooterBrand;
  className?: string;
}

export interface FooterLinksProps {
  quickLinks: FooterLink[];
  courses: FooterCourse[];
  contactDetails: FooterContact[];
  socialLinks: FooterSocial[];
  className?: string;
}

export interface FooterBottomProps {
  copyright: string;
  bottomLinks: FooterBottomLink[];
  className?: string;
}