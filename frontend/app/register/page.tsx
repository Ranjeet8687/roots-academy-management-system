import type { Metadata } from "next";
import { AuthLayout, AuthCard, RegisterForm, PublicOnlyRoute } from "@/components/auth";

export const metadata: Metadata = {
  title: "Create Account | Roots Academy",
  description: "Create your Roots Academy account and start your success story.",
};

export default function RegisterPage() {
  return (
    <PublicOnlyRoute>
      <AuthLayout>
        <AuthCard>
          <RegisterForm />
        </AuthCard>
      </AuthLayout>
    </PublicOnlyRoute>
  );
}