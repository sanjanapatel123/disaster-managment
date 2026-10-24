const MOCK_LOCATIONS: Record<string, { latitude: number; longitude: number }> =
  {
    "manhattan, nyc": { latitude: 40.7831, longitude: -73.9712 },
    "new york, nyc": { latitude: 40.7128, longitude: -74.006 },
    "jabalpur, india": { latitude: 23.1815, longitude: 79.9864 },
    "mumbai, india": { latitude: 19.076, longitude: 72.8777 },
  };

export interface ResolvedLocation {
  location: string;
  latitude: number | null;
  longitude: number | null;
  source: "nominatim" | "mock" | "unresolved";
}

export function extractLocation(description: string): string | null {
  const patterns = [
    /\bhas affected\s+(.+?)(?:[.!?]|$)/i,
    /\baffecting\s+(.+?)(?:[.!?]|$)/i,
    /\bnear\s+(.+?)(?:[.!?]|$)/i,
    /\bin\s+(.+?)(?:[.!?]|$)/i,
    /\baround\s+(.+?)(?:[.!?]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);

    if (match?.[1]) {
      return match[1].trim().replace(/[.,;]+$/, "");
    }
  }

  return null;
}

export async function resolveLocation(
  description: string,
  suppliedLocation?: string,
): Promise<ResolvedLocation> {
  const place = suppliedLocation?.trim() || extractLocation(description);

  if (!place) {
    return {
      location: "Unknown",
      latitude: null,
      longitude: null,
      source: "unresolved",
    };
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");

    url.searchParams.set("q", place);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "DisasterResponsePlatform/1.0 (development project)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Geocoding service returned ${response.status}`);
    }

    const results = (await response.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (results.length > 0) {
      return {
        location: results[0].display_name,
        latitude: Number(results[0].lat),
        longitude: Number(results[0].lon),
        source: "nominatim",
      };
    }
  } catch (error) {
    console.error("Geocoding service error:", error);
  }

  const mock = MOCK_LOCATIONS[place.toLowerCase()];

  if (mock) {
    return {
      location: place,
      ...mock,
      source: "mock",
    };
  }

  return {
    location: place,
    latitude: null,
    longitude: null,
    source: "unresolved",
  };
}
