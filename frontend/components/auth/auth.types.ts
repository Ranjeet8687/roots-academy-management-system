import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormValues {
  fullName: string;
  email: string;
  mobileNumber: string;
  parentMobileNumber: string;
  courseInterested: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface CourseOption {
  value: string;
  label: string;
}

/** Shared props for the reusable text / password input field. */
export interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  register: UseFormRegisterReturn;
  error?: string;
  required?: boolean;
}

/** Shared props for the reusable checkbox field. */
export interface FormCheckboxProps {
  id: string;
  label: ReactNode;
  register: UseFormRegisterReturn;
  error?: string;
}