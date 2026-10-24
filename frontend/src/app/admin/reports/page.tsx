"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import axios from "@/lib/axios";
import { toast } from "sonner";
import {
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  UserRound,
  Clock,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

type Disaster = {
  id: string;
  title: string;
};

type CommunityReport = {
  content: string;
  user: string;
  created_at?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
};

const priorityStyles: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 ring-red-200",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-200",
  LOW: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export default function ReportsPage() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loadingDisasters, setLoadingDisasters] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const loadDisasters = useCallback(async () => {
    setLoadingDisasters(true);

    try {
      const response = await axios.get("/disasters");
      const payload = response.data;
      const list = Array.isArray(payload) ? payload : (payload.data ?? []);

      setDisasters(list);

      setSelectedId((current) => {
        if (current && list.some((item: Disaster) => item.id === current)) {
          return current;
        }
        return list[0]?.id ?? "";
      });
    } catch {
      toast.error("Failed to load disasters.");
    } finally {
      setLoadingDisasters(false);
    }
  }, []);

  const loadReports = useCallback(async (disasterId: string) => {
    if (!disasterId) {
      setReports([]);
      setError("");
      return;
    }

    setLoadingReports(true);
    setError("");

    try {
      const response = await axios.get(`/disasters/${disasterId}/reports`);
      const payload = response.data;
      const list = Array.isArray(payload) ? payload : (payload.data ?? []);

      setReports(list);
    } catch (err: unknown) {
      setReports([]);

      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "message" in err.response.data
          ? String(err.response.data.message)
          : "Unable to fetch community reports.";

      setError(message);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    void loadDisasters();
  }, [loadDisasters]);

  useEffect(() => {
    void loadReports(selectedId);
  }, [selectedId, loadReports]);

  const highCount = reports.filter((r) => r.priority === "HIGH").length;
  const mediumCount = reports.filter((r) => r.priority === "MEDIUM").length;
  const lowCount = reports.filter((r) => r.priority === "LOW").length;

  const filteredReports =
    priorityFilter === "ALL"
      ? reports
      : reports.filter((report) => report.priority === priorityFilter);

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Situational Awareness
            </p>
            <h1 className="mt-1 font-heading text-4xl font-bold text-[#0b1f3a]">
              Community Reports
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review citizen reports and identify urgent community needs.
            </p>
          </div>

          <button
            onClick={() => void loadReports(selectedId)}
            disabled={!selectedId || loadingReports}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b1f3a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingReports ? "animate-spin" : ""}`}
            />
            Refresh Reports
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Select disaster
          </label>
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            disabled={loadingDisasters || disasters.length === 0}
            className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              {loadingDisasters
                ? "Loading disasters..."
                : "No disasters available"}
            </option>
            {disasters.map((disaster) => (
              <option key={disaster.id} value={disaster.id}>
                {disaster.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "High Priority",
              count: highCount,
              color: "text-red-600",
              bg: "bg-red-50",
              icon: ShieldAlert,
            },
            {
              label: "Medium Priority",
              count: mediumCount,
              color: "text-amber-600",
              bg: "bg-amber-50",
              icon: AlertTriangle,
            },
            {
              label: "Low Priority",
              count: lowCount,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              icon: CheckCircle2,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    {item.label}
                  </span>
                  <span className={`rounded-xl p-2 ${item.bg} ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#0b1f3a]">
                  {loadingReports ? "—" : item.count}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-[#0b1f3a]">
                Incoming Reports
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {reports.length} report(s) received
              </p>
            </div>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">All priorities</option>
              <option value="HIGH">High priority</option>
              <option value="MEDIUM">Medium priority</option>
              <option value="LOW">Low priority</option>
            </select>
          </div>

          {loadingReports && (
            <div className="flex items-center justify-center gap-3 px-5 py-12 text-sm text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading community reports...
            </div>
          )}

          {!loadingReports && error && (
            <div className="p-8 text-center">
              <AlertTriangle className="mx-auto h-9 w-9 text-red-500" />
              <p className="mt-3 font-semibold text-slate-800">
                Could not load reports
              </p>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
              <button
                onClick={() => void loadReports(selectedId)}
                className="mt-4 rounded-xl bg-[#0b1f3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          )}

          {!loadingReports && !error && filteredReports.length === 0 && (
            <div className="px-5 py-12 text-center">
              <MessageSquare className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">
                No reports found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                There are no reports matching this priority filter.
              </p>
            </div>
          )}

          {!loadingReports && !error && filteredReports.length > 0 && (
            <div className="divide-y divide-slate-100">
              {filteredReports.map((report, index) => {
                const priority = report.priority ?? "LOW";

                return (
                  <article
                    key={`${report.user}-${report.created_at ?? index}-${index}`}
                    className="p-5 transition hover:bg-slate-50/70"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="flex gap-3">
                        <div className="mt-0.5 rounded-xl bg-blue-50 p-2.5 text-blue-700">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold leading-6 text-[#0b1f3a]">
                            {report.content}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <UserRound className="h-3.5 w-3.5" />
                              {report.user || "Anonymous"}
                            </span>
                            {report.created_at && (
                              <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(report.created_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${
                          priorityStyles[priority] ?? priorityStyles.LOW
                        }`}
                      >
                        {priority} PRIORITY
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
