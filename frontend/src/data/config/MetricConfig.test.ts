import { formatFieldValue, isPctType, MetricType } from "./MetricConfig";

describe("Test Metric Config Functions", () => {
  test("Test Detection of Percent Type", () => {
    expect(isPctType("pct")).toBe(true);
    expect(isPctType("per100k")).toBe(false);
    expect(isPctType("something broken" as MetricType)).toBe(false);
  });

  test("Test Formatting of Field Values", () => {
    expect(formatFieldValue("pct", 33)).toBe("33.0%");
    expect(formatFieldValue("pct", 33, true)).toBe("33.0");
    expect(formatFieldValue("pct_share", 3, false)).toBe("3.0%");
    expect(formatFieldValue("per100k", 30_000, false)).toBe("30,000");
  });
});
