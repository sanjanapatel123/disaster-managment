"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Edit3,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

type Role = "ADMIN" | "CONTRIBUTOR";

type Disaster = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  status: "ACTIVE" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
};

const emptyForm = {
  title: "",
  description: "",
  location: "",
  tags: "",
  status: "ACTIVE" as "ACTIVE" | "RESOLVED",
};

export default function IncidentManager({
  role,
  initialCreate = false,
}: {
  role: Role;
  initialCreate?: boolean;
}) {
  const isAdmin = role === "ADMIN";

  const [incidents, setIncidents] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [formOpen, setFormOpen] = useState(initialCreate);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadIncidents = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/disasters");
      const payload = response.data;
      const records = Array.isArray(payload) ? payload : payload.data;

      if (!Array.isArray(records)) {
        throw new Error("Unexpected API response");
      }

      setIncidents(records);
    } catch {
      toast.error("Unable to load incidents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(item: Disaster) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      location: item.location ?? "",
      tags: (item.tags ?? []).join(", "),
      status: item.status,
    });
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setSaving(true);
    const toastId = toast.loading(
      editingId ? "Updating incident..." : "Creating incident...",
    );

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim() || undefined,
        tags,
        ...(editingId ? { status: form.status } : {}),
      };

      if (editingId) {
        await api.patch(`/disasters/${editingId}`, payload);
        toast.success("Incident updated successfully.");
      } else {
        await api.post("/disasters", payload);
        toast.success("Incident created successfully.");
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadIncidents();
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? ((
              error as {
                response?: { data?: { message?: string } };
              }
            ).response?.data?.message ?? "Unable to save incident.")
          : "Unable to connect to the server.";

      toast.error(message);
    } finally {
      toast.dismiss(toastId);
      setSaving(false);
    }
  }

  async function handleDelete(item: Disaster) {
    const confirmed = window.confirm(
      `Delete "${item.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    const toastId = toast.loading("Deleting incident...");

    try {
      await api.delete(`/disasters/${item.id}`);
      toast.success("Incident deleted successfully.");
      await loadIncidents();
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? ((
              error as {
                response?: { data?: { message?: string } };
              }
            ).response?.data?.message ?? "Unable to delete incident.")
          : "Unable to connect to the server.";

      toast.error(message);
    } finally {
      toast.dismiss(toastId);
      setDeletingId(null);
    }
  }

  const filtered = incidents.filter((item) => {
    const query = search.toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.location ?? "").toLowerCase().includes(query) ||
      (item.tags ?? []).some((tag) => tag.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Incident operations
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold text-[#0B1F3A] sm:text-5xl">
            {isAdmin ? "Incident Management" : "My Workspace"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Create, search, and manage disaster incident records.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => void loadIncidents()}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <Plus size={17} />
            New incident
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total incidents</p>
          <p className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold text-[#0B1F3A]">
            {incidents.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active</p>
          <p className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold text-red-600">
            {incidents.filter((item) => item.status === "ACTIVE").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold text-emerald-600">
            {incidents.filter((item) => item.status === "RESOLVED").length}
          </p>
        </div>
      </div>

      {formOpen && (
        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0B1F3A]">
                {editingId ? "Update incident" : "Report a disaster"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the incident details below.
              </p>
            </div>
            <button
              onClick={() => setFormOpen(false)}
              aria-label="Close form"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Incident title *
              </label>
              <input
                required
                minLength={3}
                maxLength={150}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Manhattan Flood"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location (optional)
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Manhattan, NYC"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
              <p className="mt-1 text-xs text-slate-500">
                If omitted, the backend attempts to resolve it from the
                description.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description *
              </label>
              <textarea
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the incident, impact, and urgent needs..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tags
              </label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="flood, emergency, rescue"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
              <p className="mt-1 text-xs text-slate-500">
                Separate tags with commas.
              </p>
            </div>

            {editingId && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Incident status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "ACTIVE" | "RESOLVED",
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            )}

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                <Check size={17} />
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Create incident"}
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, location, tags..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading incidents...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="mx-auto mb-3 text-slate-400" size={32} />
            <p className="font-semibold text-slate-800">No incidents found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or create a new incident.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 sm:p-6 xl:flex-row xl:items-center xl:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0B1F3A]">
                      {item.title}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                        item.status === "ACTIVE"
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="max-w-3xl text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={14} />
                    {item.location || "Location unavailable"}
                  </p>

                  {(item.tags ?? []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => openEditForm(item)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => void handleDelete(item)}
                      disabled={deletingId === item.id}
                      aria-label={`Delete ${item.title}`}
                      className="flex items-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Showing {filtered.length} of {incidents.length} incidents
          </div>
        )}
      </section>
    </div>
  );
}
