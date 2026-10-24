"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  RefreshCw,
  Hospital,
  Droplets,
  House,
  Utensils,
  LifeBuoy,
  AlertCircle,
} from "lucide-react";

type Disaster = {
  id: string;
  title: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type Resource = {
  id: string;
  name: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  distance_km?: number | string;
};

const resourceIcons: Record<string, typeof Hospital> = {
  HOSPITAL: Hospital,
  SHELTER: House,
  FOOD: Utensils,
  WATER: Droplets,
  RESCUE: LifeBuoy,
};

const resourceColors: Record<string, string> = {
  HOSPITAL: "bg-red-50 text-red-600",
  SHELTER: "bg-blue-50 text-blue-600",
  FOOD: "bg-orange-50 text-orange-600",
  WATER: "bg-cyan-50 text-cyan-600",
  RESCUE: "bg-emerald-50 text-emerald-600",
};

export default function ResourcesPage() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("10");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingDisasters, setLoadingDisasters] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const loadDisasters = async () => {
      try {
        const response = await axios.get("/disasters");
        const payload = response.data;
        const list = Array.isArray(payload) ? payload : (payload.data ?? []);

        setDisasters(list);

        if (list.length > 0) {
          setSelectedId(list[0].id);
          setLatitude(list[0].latitude != null ? String(list[0].latitude) : "");
          setLongitude(
            list[0].longitude != null ? String(list[0].longitude) : "",
          );
        }
      } catch {
        toast.error("Failed to load disasters.");
      } finally {
        setLoadingDisasters(false);
      }
    };

    loadDisasters();
  }, []);

  const handleDisasterChange = (id: string) => {
    setSelectedId(id);
    setResources([]);
    setSearched(false);

    const disaster = disasters.find((item) => item.id === id);
    setLatitude(disaster?.latitude != null ? String(disaster.latitude) : "");
    setLongitude(disaster?.longitude != null ? String(disaster.longitude) : "");
  };

  const searchResources = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedId) {
      toast.error("Please select a disaster.");
      return;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const radiusKm = Number(radius);

    if (
      latitude.trim() === "" ||
      longitude.trim() === "" ||
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90
    ) {
      toast.error("Enter a valid latitude between -90 and 90.");
      return;
    }

    if (
      longitude.trim() === "" ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      toast.error("Enter a valid longitude between -180 and 180.");
      return;
    }

    if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 500) {
      toast.error("Radius must be greater than 0 and at most 500 km.");
      return;
    }

    setSearching(true);

    try {
      const response = await axios.get(`/disasters/${selectedId}/resources`, {
        params: { lat, lng, radius: radiusKm },
      });

      const payload = response.data;
      const list = Array.isArray(payload) ? payload : (payload.data ?? []);

      setResources(list);
      setSearched(true);
      toast.success(`${list.length} resource(s) found.`);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Unable to find nearby resources.";

      toast.error(message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Disaster Response
          </p>
          <h1 className="mt-1 font-heading text-4xl font-bold text-[#0b1f3a]">
            Nearby Resources
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Find emergency facilities and assistance near a disaster location.
          </p>
        </div>

        <form
          onSubmit={searchResources}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="font-heading text-2xl font-semibold text-[#0b1f3a]">
            Search by location
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Select disaster
              </label>
              <select
                value={selectedId}
                onChange={(event) => handleDisasterChange(event.target.value)}
                disabled={loadingDisasters || disasters.length === 0}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  {loadingDisasters
                    ? "Loading disasters..."
                    : "Select a disaster"}
                </option>
                {disasters.map((disaster) => (
                  <option key={disaster.id} value={disaster.id}>
                    {disaster.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                placeholder="e.g. 22.7196"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="e.g. 75.8577"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search radius (km)
              </label>
              <input
                type="number"
                min="0.1"
                max="500"
                step="any"
                value={radius}
                onChange={(event) => setRadius(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={searching || loadingDisasters || !selectedId}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b1f3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {searching ? "Searching..." : "Find Resources"}
            </button>

            <p className="text-xs text-slate-500">
              Coordinates are required to calculate nearby resources.
            </p>
          </div>
        </form>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-[#0b1f3a]">
              Search Results
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {searched
                ? `${resources.length} resource(s) within ${radius} km`
                : "Search for resources to see results here."}
            </p>
          </div>
          {searched && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {resources.length} found
            </span>
          )}
        </div>

        {searched && resources.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <AlertCircle className="mx-auto h-9 w-9 text-slate-400" />
            <h3 className="mt-3 font-semibold text-slate-800">
              No nearby resources found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try increasing the radius or changing the coordinates.
            </p>
          </div>
        )}

        {!searched && !loadingDisasters && disasters.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <AlertCircle className="mx-auto h-9 w-9 text-slate-400" />
            <h3 className="mt-3 font-semibold text-slate-800">
              No disasters available
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Create a disaster first, then search for nearby resources.
            </p>
          </div>
        )}

        {resources.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => {
              const Icon = resourceIcons[resource.type] ?? MapPin;
              const color =
                resourceColors[resource.type] ?? "bg-slate-100 text-slate-600";

              return (
                <article
                  key={resource.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`rounded-xl p-3 ${color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {resource.type.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-[#0b1f3a]">
                    {resource.name}
                  </h3>

                  <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    {resource.location}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-500">Distance</span>
                    <span className="text-sm font-bold text-blue-700">
                      {resource.distance_km != null
                        ? `${Number(resource.distance_km).toFixed(2)} km`
                        : "Not available"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    {resource.latitude}, {resource.longitude}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
