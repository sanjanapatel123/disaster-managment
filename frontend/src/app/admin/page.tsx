"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import { useDisasterUpdates } from "@/hooks/useDisasterUpdates";
import axios from "axios";

type Disaster = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: "ACTIVE" | "RESOLVED";
  tags: string[];
  createdAt: string;
};

export default function AdminDashboard() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDisasters = useCallback(async () => {
    try {
      const response = await axios.get("/disasters");
      const payload = response.data;
      const list = Array.isArray(payload) ? payload : (payload.data ?? []);

      setDisasters(list);
    } catch {
      toast.error("Failed to load disasters.");
    }
  }, []);

  useDisasterUpdates(loadDisasters);

  useEffect(() => {
    void loadDisasters();
  }, [loadDisasters]);

  const activeCount = disasters.filter(
    (item) => item.status === "ACTIVE",
  ).length;

  const resolvedCount = disasters.filter(
    (item) => item.status === "RESOLVED",
  ).length;

  return (
    <DashboardLayout role="ADMIN">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Operations overview
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold text-[#0B1F3A] sm:text-5xl">
            Command Center
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor disaster incidents and coordinate response activity from one
            place.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => void loadDisasters()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <Link
            href="/admin/incidents"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <Plus size={17} />
            Manage incidents
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total incidents"
          value={loading ? "—" : disasters.length}
          description="All recorded disaster incidents"
          icon={Activity}
          tone="blue"
        />
        <StatCard
          title="Active incidents"
          value={loading ? "—" : activeCount}
          description="Incidents requiring attention"
          icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          title="Resolved incidents"
          value={loading ? "—" : resolvedCount}
          description="Incidents marked resolved"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          title="Latest records"
          value={loading ? "—" : disasters.length}
          description="Records available in the system"
          icon={Clock3}
          tone="amber"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0B1F3A]">
              Recent incidents
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest disaster records from the API
            </p>
          </div>

          <Link
            href="/admin/incidents"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading incident records...
          </div>
        ) : disasters.length === 0 ? (
          <div className="p-10 text-center">
            <Activity className="mx-auto mb-3 text-slate-400" size={32} />
            <p className="font-semibold text-slate-800">No incidents found</p>
            <p className="mt-1 text-sm text-slate-500">
              Incident records will appear here when available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Incident</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disasters.slice(0, 6).map((disaster) => (
                  <tr key={disaster.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {disaster.title}
                      </p>
                      <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                        {disaster.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {disaster.location || "Location unavailable"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          disaster.status === "ACTIVE"
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {disaster.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(disaster.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
