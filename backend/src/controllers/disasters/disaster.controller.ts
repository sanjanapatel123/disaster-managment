import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import {
  createDisasterSchema,
  updateDisasterSchema,
} from "../../validators/disasters/disaster.validator";
import { resolveLocation } from "../../services/location.service";
import { emitDisasterEvent } from "../../config/socket";

// POST /disasters
export async function createDisaster(req: Request, res: Response) {
  const result = createDisasterSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid disaster details. Please check the provided fields.",
      errors: result.error.flatten(),
    });
  }

  try {
    const { location: suppliedLocation, ...data } = result.data;

    const resolved = await resolveLocation(data.description, suppliedLocation);

    const disaster = await prisma.disaster.create({
      data: {
        ...data,
        location: resolved.location,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        creator: { connect: { id: req.user!.id } },
      },
    });

    emitDisasterEvent("disaster_created", disaster);

    return res.status(201).json({
      success: true,
      message: "Disaster created successfully.",
      data: disaster,
      locationResolution: {
        source: resolved.source,
        resolved: resolved.latitude !== null,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to create disaster because the associated user does not exist.",
      });
    }

    console.error("Create disaster error:", error);

    return res.status(500).json({
      success: false,
      message:
        "An unexpected error occurred while creating the disaster. Please try again later.",
    });
  }
}

// GET /disasters?tag=flood
export async function getDisasters(req: Request, res: Response) {
  try {
    const tag =
      typeof req.query.tag === "string" ? req.query.tag.trim() : undefined;

    const disasters = await prisma.disaster.findMany({
      where: tag ? { tags: { has: tag } } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: tag
        ? `Disasters with tag "${tag}" retrieved successfully.`
        : "Disasters retrieved successfully.",
      count: disasters.length,
      data: disasters,
    });
  } catch (error) {
    console.error("Get disasters error:", error);

    return res.status(500).json({
      success: false,
      message:
        "An unexpected error occurred while retrieving disasters. Please try again later.",
    });
  }
}

// GET /disasters/:id
export async function getDisasterById(req: Request, res: Response) {
  try {
    const disaster = await prisma.disaster.findUnique({
      where: { id: req.params.id as string },
    });

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: "Disaster not found. Please check the disaster ID.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Disaster retrieved successfully.",
      data: disaster,
    });
  } catch (error) {
    console.error("Get disaster by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while retrieving the disaster.",
    });
  }
}

// PATCH /disasters/:id

export async function updateDisaster(req: Request, res: Response) {
  const result = updateDisasterSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid update details. Please check the provided fields.",
      errors: result.error.flatten(),
    });
  }

  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide at least one field to update.",
    });
  }

  try {
    const disaster = await prisma.disaster.update({
      where: { id: req.params.id as string },
      data: result.data,
    });

    emitDisasterEvent("disaster_updated", disaster);

    return res.status(200).json({
      success: true,
      message: "Disaster updated successfully.",
      data: disaster,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        success: false,
        message: "Disaster not found. Unable to update the requested record.",
      });
    }

    console.error("Update disaster error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while updating the disaster.",
    });
  }
}

// DELETE /disasters/:id
export async function deleteDisaster(req: Request, res: Response) {
  try {
    await prisma.disaster.delete({
      where: { id: req.params.id as string },
    });

    return res.status(200).json({
      success: true,
      message: "Disaster deleted successfully.",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        success: false,
        message: "Disaster not found. It may have already been deleted.",
      });
    }

    console.error("Delete disaster error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while deleting the disaster.",
    });
  }
}
