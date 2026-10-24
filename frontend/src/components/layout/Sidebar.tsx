"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  MapPin,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function Sidebar({
  role,
  mobileOpen,
  onClose,
}: {
  role: "ADMIN" | "CONTRIBUTOR";
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const links =
    role === "ADMIN"
      ? [
          { label: "Overview", href: "/admin", icon: LayoutDashboard },
          {
            label: "All Incidents",
            href: "/admin/incidents",
            icon: AlertTriangle,
          },
          { label: "Resources", href: "/admin/resources", icon: MapPin },
          { label: "Community Reports", href: "/admin/reports", icon: Users },
        ]
      : [
          { label: "Overview", href: "/contributor", icon: LayoutDashboard },
          {
            label: "My Incidents",
            href: "/contributor/incidents",
            icon: AlertTriangle,
          },
          {
            label: "Report Incident",
            href: "/contributor/incidents/new",
            icon: MapPin,
          },
        ];

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    toast.success("You have been signed out.");
    router.replace("/login");
  }

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0B1F3A] text-white transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2.5">
              <ShieldAlert size={25} />
            </div>
            <div>
              <p className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-wide">
                RESPONSE HQ
              </p>
              <p className="text-[10px] tracking-[0.18em] text-blue-200">
                DISASTER COORDINATION
              </p>
            </div>
          </div>
          <button
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-3 pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {role === "ADMIN" ? "Administration" : "Response workspace"}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {links.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== `/${role.toLowerCase()}` && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  active
                    ? "bg-blue-600 font-semibold text-white shadow-lg shadow-blue-950/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-200">
              {role === "ADMIN" ? "A" : "C"}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {role === "ADMIN" ? "Administrator" : "Contributor"}
              </p>
              <p className="text-xs text-slate-400">Signed in</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
