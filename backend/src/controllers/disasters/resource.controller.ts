import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().max(500).default(10),
});

export async function getNearbyResources(req: Request, res: Response) {
  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid location parameters. Provide valid lat, lng, and radius values.",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const disasterId = req.params.id as string;
    const { lat, lng, radius } = parsed.data;

    const disaster = await prisma.disaster.findUnique({
      where: { id: disasterId },
      select: { id: true },
    });

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: "Disaster not found. Please check the disaster ID.",
      });
    }

    // Haversine distance, calculated in kilometres inside PostgreSQL.
    const resources = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        type: string;
        location: string;
        latitude: number;
        longitude: number;
        disasterId: string;
        createdAt: Date;
        distance_km: number;
      }>
    >`
      SELECT
        id,
        name,
        type,
        location,
        latitude,
        longitude,
        "disasterId",
        "createdAt",
        (
          6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(${lat}))
              * cos(radians(latitude))
              * cos(radians(longitude) - radians(${lng}))
              + sin(radians(${lat}))
              * sin(radians(latitude))
            ))
          )
        ) AS distance_km
      FROM "Resource"
      WHERE "disasterId" = ${disasterId}
      AND (
        6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(${lat}))
            * cos(radians(latitude))
            * cos(radians(longitude) - radians(${lng}))
            + sin(radians(${lat}))
            * sin(radians(latitude))
          ))
        )
      ) <= ${radius}
      ORDER BY distance_km ASC
    `;

    return res.status(200).json({
      success: true,
      message: "Nearby resources retrieved successfully.",
      count: resources.length,
      radiusKm: radius,
      data: resources.map((resource) => ({
        ...resource,
        distance_km: Number(resource.distance_km),
      })),
    });
  } catch (error) {
    console.error("Nearby resources error:", error);

    return res.status(500).json({
      success: false,
      message:
        "An unexpected error occurred while retrieving nearby resources.",
    });
  }
}
