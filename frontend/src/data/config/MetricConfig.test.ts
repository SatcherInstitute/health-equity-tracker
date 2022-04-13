import { isPctType, MetricType } from "./MetricConfig";

describe("Test Metric Config Functions", () => {
  test("Test Detection of Percent Type", () => {
    expect(isPctType("pct")).toBe(true);
    expect(isPctType("per100k")).toBe(false);
    expect(isPctType("something broken" as MetricType)).toBe(false);
  });
});
