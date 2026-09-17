"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  STUDENT_DASHBOARD_ROUTE,
  ADMIN_DASHBOARD_ROUTE,
  FACULTY_DASHBOARD_ROUTE,
} from "./auth.data";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("ADMIN" | "FACULTY" | "STUDENT")[];
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Store the intended path for redirect after login
        if (pathname !== "/login" && pathname !== "/register") {
          sessionStorage.setItem("redirectAfterLogin", pathname);
        }
        router.push(fallbackPath);
        return;
      }

      // Check role-based access
      if (allowedRoles && role && !allowedRoles.includes(role)) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [isAuthenticated, loading, role, router, pathname, allowedRoles, fallbackPath]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-primary"
        >
          <Loader2 className="h-10 w-10" />
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled by useEffect
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null; // Redirect handled by useEffect
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      let dashboardRoute = "/dashboard";
      switch (role) {
        case "ADMIN":
          dashboardRoute = ADMIN_DASHBOARD_ROUTE;
          break;
        case "FACULTY":
          dashboardRoute = FACULTY_DASHBOARD_ROUTE;
          break;
        case "STUDENT":
        default:
          dashboardRoute = STUDENT_DASHBOARD_ROUTE;
          break;
      }
      router.push(dashboardRoute);
    }
  }, [isAuthenticated, loading, role, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-primary"
        >
          <Loader2 className="h-10 w-10" />
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}