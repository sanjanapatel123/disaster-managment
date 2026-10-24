import { classifyReportPriority } from "./report-priority.service";

export interface CommunityReport {
  content: string;
  user: string;
  created_at: string;
}

interface CacheEntry {
  data: CommunityReport[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000;

async function fetchMockReports(
  disasterId: string,
): Promise<CommunityReport[]> {
  if (process.env.MOCK_REPORTS_FAILURE === "true") {
    throw new Error("Mock community reports service unavailable");
  }

  return [
    {
      content: "Need drinking water near Manhattan.",
      user: "citizen123",
      created_at: new Date().toISOString(),
    },
    {
      content: "Several families need emergency shelter.",
      user: "citizen456",
      created_at: new Date().toISOString(),
    },
  ];
}

export async function getCommunityReports(
  disasterId: string,
): Promise<{ data: CommunityReport[]; cached: boolean }> {
  const cached = cache.get(disasterId);

  if (cached && cached.expiresAt > Date.now()) {
    return { data: cached.data, cached: true };
  }

  cache.delete(disasterId);

  const externalReports = await fetchMockReports(disasterId);

  const normalized = externalReports.map((report) => ({
    content: String(report.content),
    user: String(report.user),
    created_at: new Date(report.created_at).toISOString(),
    priority: classifyReportPriority(String(report.content)),
  }));

  cache.set(disasterId, {
    data: normalized,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return { data: normalized, cached: false };
}
