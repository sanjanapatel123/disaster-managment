"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

type Role = "ADMIN" | "CONTRIBUTOR";

export default function ProtectedRoute({
  allowedRole,
  children,
}: {
  allowedRole: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (storedRole !== allowedRole) {
      toast.error("You don't have permission to access this page.");
      router.replace(storedRole === "ADMIN" ? "/admin" : "/contributor");
      return;
    }

    setAuthorized(true);
  }, [allowedRole, router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoaderCircle className="animate-spin text-blue-700" size={32} />
      </div>
    );
  }

  return <>{children}</>;
}
