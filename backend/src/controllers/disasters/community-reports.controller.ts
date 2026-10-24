import type { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { getCommunityReports } from "../../services/community-reports.service";

export async function getDisasterReports(req: Request, res: Response) {
  try {
    const disasterId = req.params.id as string;

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

    const result = await getCommunityReports(disasterId);

    return res.status(200).json({
      success: true,
      message: "Community reports retrieved successfully.",
      count: result.data.length,
      cached: result.cached,
      data: result.data,
    });
  } catch (error) {
    console.error("Community reports error:", error);

    return res.status(502).json({
      success: false,
      message:
        "The community reports service is currently unavailable. Please try again later.",
    });
  }
}
