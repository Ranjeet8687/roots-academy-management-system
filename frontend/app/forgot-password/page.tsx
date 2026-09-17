import type { Metadata } from "next";
import { AuthLayout, AuthCard, ForgotPasswordForm, PublicOnlyRoute } from "@/components/auth";

export const metadata: Metadata = {
  title: "Forgot Password | Roots Academy",
  description: "Reset your Roots Academy account password.",
};

export default function ForgotPasswordPage() {
  return (
    <PublicOnlyRoute>
      <AuthLayout>
        <AuthCard>
          <ForgotPasswordForm />
        </AuthCard>
      </AuthLayout>
    </PublicOnlyRoute>
  );
}