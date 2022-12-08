import { Fips } from "./Fips";

describe("Test getDisplayName()", () => {
  test("US", async () => {
    expect(new Fips("00").getDisplayName()).toEqual("United States");
  });
});
