import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./config/prisma";
import disasterRoutes from "./routes/disasters/disaster.routes";
import authRoutes from "./routes/auth/auth.routes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/disasters", disasterRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      message: "Disaster Response API is running",
      database: "connected",
    });
  } catch {
    return res.status(503).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

export default app;
