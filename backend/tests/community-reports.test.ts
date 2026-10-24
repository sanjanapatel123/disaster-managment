import { afterEach, describe, expect, it } from "vitest";
import { getCommunityReports } from "../src/services/community-reports.service";

afterEach(() => {
  delete process.env.MOCK_REPORTS_FAILURE;
});

describe("Community reports service", () => {
  it("should return normalized reports and cache subsequent requests", async () => {
    delete process.env.MOCK_REPORTS_FAILURE;

    const disasterId = `test-${Date.now()}`;

    const first = await getCommunityReports(disasterId);
    const second = await getCommunityReports(disasterId);

    expect(first.data.length).toBeGreaterThan(0);
    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(second.data).toEqual(first.data);

    expect(first.data[0]).toHaveProperty("content");
    expect(first.data[0]).toHaveProperty("user");
    expect(first.data[0]).toHaveProperty("created_at");
  });

  it("should propagate external service failure", async () => {
    process.env.MOCK_REPORTS_FAILURE = "true";

    await expect(
      getCommunityReports(`failure-test-${Date.now()}`),
    ).rejects.toThrow("Mock community reports service unavailable");
  });
});
