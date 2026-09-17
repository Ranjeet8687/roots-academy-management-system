"use client";

import { motion, type Variants } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactFormProps } from "./contact.types";

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const fieldBaseClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--text-body)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-colors duration-[var(--transition-base)] focus:border-[var(--color-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]";

/**
 * ContactForm
 * UI-only enquiry form. No submission handler is wired to a backend.
 */
export function ContactForm({ fields, className }: ContactFormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <motion.form
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {fields.map((field) => (
        <motion.div key={field.id} variants={fadeUp} className="flex flex-col gap-2">
          <label
            htmlFor={field.id}
            className="text-[var(--text-caption)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)]"
          >
            {field.label}
            {field.required && (
              <span className="text-[var(--color-error)]" aria-hidden="true">
                {" "}
                *
              </span>
            )}
          </label>

          {field.type === "textarea" ? (
            <textarea
              id={field.id}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              autoComplete={field.autoComplete}
              rows={5}
              aria-required={field.required}
              className={cn(fieldBaseClasses, "resize-none")}
            />
          ) : field.type === "select" ? (
            <select
              id={field.id}
              name={field.name}
              required={field.required}
              defaultValue=""
              aria-required={field.required}
              className={fieldBaseClasses}
            >
              <option value="" disabled>
                {field.placeholder}
              </option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.id}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              autoComplete={field.autoComplete}
              aria-required={field.required}
              className={fieldBaseClasses}
            />
          )}
        </motion.div>
      ))}

      <motion.button
        variants={fadeUp}
        type="submit"
        aria-label="Send message"
        className="group/btn mt-2 flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 text-[var(--text-button)] font-[var(--font-weight-medium)] text-white transition-[gap,background-color] duration-[var(--transition-base)] hover:gap-2.5 hover:bg-[var(--color-primary)]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
        Send Message
        <Send className="h-4 w-4 transition-transform duration-[var(--transition-base)] group-hover/btn:translate-x-0.5" />
      </motion.button>
    </motion.form>
  );
}