import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import { prisma } from "../src/config/prisma";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is required to run API tests");
}

const contributorToken = jwt.sign({ role: "CONTRIBUTOR" }, secret, {
  subject: "test-contributor",
  expiresIn: "1h",
});

describe("Disaster Response API", () => {
  it("GET /health should return a successful response", async () => {
    const response = await request(app).get("/health");

    expect([200, 503]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.database).toBe("connected");
    }
  });

  it("should reject invalid disaster creation input", async () => {
    const response = await request(app)
      .post("/disasters")
      .set("Authorization", `Bearer ${contributorToken}`)
      .send({
        title: "X",
        description: "Short",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it("should prevent a contributor from deleting a disaster", async () => {
    const response = await request(app)
      .delete("/disasters/00000000-0000-4000-8000-000000000001")
      .set("Authorization", `Bearer ${contributorToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
