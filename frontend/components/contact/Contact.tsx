"use client";

import { SectionWrapper } from "@/components/layout";
import { ContactHeader } from "./ContactHeader";
import { ContactInfo } from "./ContactInfo";
import { ContactForm } from "./ContactForm";
import { GoogleMap } from "./GoogleMap";
import { CONTACT_DETAILS, SOCIAL_LINKS, CONTACT_FORM_FIELDS } from "./contact.data";

/**
 * Contact
 * Full "Contact Us" section: header plus a two-column info/form
 * grid, followed by a required full-width Google Map spanning the
 * entire section width (not split into columns). SectionWrapper
 * (id="contact") drives consistent vertical rhythm/background and
 * scroll-spy / active-nav highlighting. Composition only — header,
 * info, form, and map each live in their own component.
 */
export function Contact() {
  return (
    <SectionWrapper id="contact" background="bg-background">
      <div className="flex flex-col gap-14">
        <ContactHeader />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ContactInfo details={CONTACT_DETAILS} socialLinks={SOCIAL_LINKS} />
          <ContactForm fields={CONTACT_FORM_FIELDS} />
        </div>

        <GoogleMap />
      </div>
    </SectionWrapper>
  );
}