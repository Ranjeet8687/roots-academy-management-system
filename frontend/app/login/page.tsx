import type { Metadata } from "next";
import { AuthLayout, AuthCard, LoginForm, PublicOnlyRoute } from "@/components/auth";

export const metadata: Metadata = {
  title: "Login | Roots Academy",
  description: "Login to your Roots Academy account to continue your learning journey.",
};

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <AuthLayout>
        <AuthCard>
          <LoginForm />
        </AuthCard>
      </AuthLayout>
    </PublicOnlyRoute>
  );
}