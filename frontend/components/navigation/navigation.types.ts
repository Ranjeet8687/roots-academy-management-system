export interface NavItem {
  /** Unique key, also used for React lists */
  id: string;
  /** Label shown to the user */
  label: string;
  /** Route path this item links to */
  href: string;
}

export interface NavActionsProps {
  /** Optional override for the CTA label */
  ctaLabel?: string;
  /** Optional override for the CTA destination */
  ctaHref?: string;
  /** Extra classes for the wrapping element */
  className?: string;
}

export interface DesktopNavProps {
  items: NavItem[];
  /** Currently active route, used to highlight the matching item */
  activePath: string;
  className?: string;
}

export interface MobileNavProps {
  items: NavItem[];
  activePath: string;
  isOpen: boolean;
  onClose: () => void;
}