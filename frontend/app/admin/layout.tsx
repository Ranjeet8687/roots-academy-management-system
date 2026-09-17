"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Video,
  Calendar,
  FileText,
  FolderOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  GraduationCap,
} from "lucide-react";

const adminNavItems = [
  { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { id: "courses", label: "Courses", href: "/admin/courses", icon: BookOpen },
  { id: "students", label: "Students", href: "/admin/students", icon: Users },
  { id: "lectures", label: "Lectures", href: "/admin/lectures", icon: Video },
  { id: "live-classes", label: "Live Classes", href: "/admin/live-classes", icon: Calendar },
  { id: "dpps", label: "DPPs", href: "/admin/dpps", icon: FileText },
  { id: "study-materials", label: "Study Materials", href: "/admin/study-materials", icon: FolderOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ${
            sidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div
              className={`flex items-center justify-between h-16 px-4 border-b border-gray-200 ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
            >
              {!sidebarCollapsed && (
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <span className="text-xl font-bold text-gray-900">Roots Admin</span>
                </Link>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto" aria-label="Admin navigation">
              <ul className="space-y-1" role="list">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        } ${sidebarCollapsed ? "justify-center" : ""}`}
                        aria-current={isActive ? "page" : undefined}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User section */}
            <div className="p-3 border-t border-gray-200">
              {!sidebarCollapsed && user && (
                <div className="flex items-center gap-3 px-3 py-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => logout()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors w-full ${
                  sidebarCollapsed ? "justify-center" : ""
                }`}
                title={sidebarCollapsed ? "Logout" : undefined}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!sidebarCollapsed && <span className="font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={`flex-1 min-h-screen transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}
        >
          <div className="p-6 sm:p-8 lg:p-10">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}