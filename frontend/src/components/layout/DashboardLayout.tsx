"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

type Role = "ADMIN" | "CONTRIBUTOR";

export default function DashboardLayout({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute allowedRole={role}>
      <div className="min-h-screen bg-[#F5F7FB]">
        <Sidebar
          role={role}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="min-h-screen lg:pl-64">
          <Topbar role={role} onMenuClick={() => setMobileOpen(true)} />

          <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-7 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
