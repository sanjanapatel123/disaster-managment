import { describe, expect, it } from "vitest";
import { classifyReportPriority } from "../src/services/report-priority.service";

describe("Report priority classification", () => {
  it("should classify trapped people as HIGH", () => {
    expect(
      classifyReportPriority("People are trapped inside a building."),
    ).toBe("HIGH");
  });

  it("should classify water shortage as MEDIUM", () => {
    expect(classifyReportPriority("Residents need drinking water.")).toBe(
      "MEDIUM",
    );
  });

  it("should classify general information as LOW", () => {
    expect(classifyReportPriority("The weather is cloudy today.")).toBe("LOW");
  });
});
