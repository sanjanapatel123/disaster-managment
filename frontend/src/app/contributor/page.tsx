"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";

type Disaster = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: "ACTIVE" | "RESOLVED";
  tags: string[];
};

export default function ContributorDashboard() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api
      .get("/disasters")
      .then((response) => {
        const payload = response.data;
        const records = Array.isArray(payload) ? payload : payload.data;

        if (!Array.isArray(records)) {
          throw new Error("Unexpected disaster API response.");
        }

        if (mounted) setDisasters(records);
      })
      .catch(() => {
        if (mounted) {
          toast.error("Could not load disaster information.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DashboardLayout role="CONTRIBUTOR">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Contributor workspace
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold text-[#0B1F3A] sm:text-5xl">
            Response Overview
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review incident information and help coordinate disaster response.
          </p>
        </div>

        <Link
          href="/contributor/incidents/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <Plus size={17} />
          Report an incident
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Recorded incidents"
          value={loading ? "—" : disasters.length}
          description="Disaster incidents available to the team"
          icon={AlertTriangle}
          tone="blue"
        />
        <StatCard
          title="Active incidents"
          value={
            loading
              ? "—"
              : disasters.filter((item) => item.status === "ACTIVE").length
          }
          description="Incidents that may need attention"
          icon={ShieldCheck}
          tone="red"
        />
        <StatCard
          title="Resolved incidents"
          value={
            loading
              ? "—"
              : disasters.filter((item) => item.status === "RESOLVED").length
          }
          description="Incidents marked as resolved"
          icon={ShieldCheck}
          tone="green"
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0B1F3A]">
              Incident activity
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current incidents from the response system
            </p>
          </div>
          <Link
            href="/contributor/incidents"
            className="flex items-center gap-1 text-sm font-semibold text-blue-700"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading incidents...
          </p>
        ) : disasters.length === 0 ? (
          <div className="py-8 text-center">
            <p className="font-semibold text-slate-800">No incidents yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Create a new incident to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {disasters.slice(0, 5).map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.location || "Location unavailable"}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {item.description}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === "ACTIVE"
                      ? "bg-red-50 text-red-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {item.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
