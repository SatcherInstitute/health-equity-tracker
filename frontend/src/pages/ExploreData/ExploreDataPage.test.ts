import { Fips } from "../../data/utils/Fips";
import { resolveCityToCounty } from "./ExploreDataPage";

describe("Test Explore Data Page Functions Functions", () => {
  const denverCountyFips = new Fips("08031");
  const denverCityFips = new Fips("0803120000");

  test("Test City to Parent County Resolver: with City", () => {
    expect(resolveCityToCounty(denverCityFips)).toBe(denverCountyFips.code);
  });
  test("Test City to Parent County Resolver: with County (should Fail)", () => {
    expect(() => {
      resolveCityToCounty(denverCountyFips);
    }).toThrow(Error);
  });
});

export {};
