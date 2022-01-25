import { DataFrame, IDataFrame } from "data-forge";
import { RACE } from "./Constants";
import { DatasetCalculator } from "./DatasetCalculator";

describe("Dataset Calculator", () => {
  let calc = new DatasetCalculator();

  test("Testing per 100k", async () => {
    expect(calc.per100k(100, 1000)).toEqual(10000);
  });

  test("Testing total", async () => {
    expect(calc.estimateTotal(10_000, 20)).toEqual(2);
  });

  test("Testing percent", () => {
    expect(calc.percent(10, 20)).toEqual(50);

    // Extra decimals shouldn't be added unless it would otherwise round to 0.
    expect(calc.percent(2, 310)).toEqual(0.6);
    expect(calc.percent(53, 82)).toEqual(64.6);
    expect(calc.percent(2, 3100)).toEqual(0.1);

    // Numbers that would round to 0 with 1 decimal place get 2 decimal places.
    expect(calc.percent(1, 3100)).toEqual(0.03);
    expect(calc.percent(1, 20000)).toEqual(0.01);

    // 0.0047 rounds to 0 because we limit to 2 decimal places.
    expect(calc.percent(1, 21000)).toEqual(0);

    // Make sure actual 0 works fine.
    expect(calc.percent(0, 100)).toEqual(0);

    // Make sure invalid values are converted to null.
    expect(calc.percent(null, 100)).toEqual(null);
    expect(calc.percent(undefined, 100)).toEqual(null);
    expect(calc.percent(5, null)).toEqual(null);
    expect(calc.percent(5, undefined)).toEqual(null);
    expect(calc.percent(5, 0)).toEqual(null);
  });

  test("Testing percentAvoidRoundingToZero", () => {
    expect(calc.percentAvoidRoundingToZero(1, 21000, 1, 1)).toEqual(0);
    expect(calc.percentAvoidRoundingToZero(1, 21000, 1, 2)).toEqual(0);
    expect(calc.percentAvoidRoundingToZero(1, 21000, 1, 3)).toEqual(0.005);
    expect(calc.percentAvoidRoundingToZero(1, 21000, 1, 4)).toEqual(0.005);

    expect(calc.percentAvoidRoundingToZero(9, 4801, 2, 2)).toEqual(0.19);
    expect(calc.percentAvoidRoundingToZero(9, 4801, 2, 3)).toEqual(0.19);

    expect(calc.percentAvoidRoundingToZero(9, 480100, 2, 2)).toEqual(0);
    expect(calc.percentAvoidRoundingToZero(9, 480100, 2, 3)).toEqual(0.002);
    expect(calc.percentAvoidRoundingToZero(9, 480100, 2, 4)).toEqual(0.002);
  });

  test("Testing percent share one race", async () => {
    let data = [
      { race_and_ethnicity: "a", population: 1, fips: "00" },
      { race_and_ethnicity: "All", population: 1, fips: "00" },
    ];
    let df: IDataFrame = new DataFrame(data);
    df = calc.calculatePctShare(df, "population", "pct_share", RACE, ["fips"]);
    expect(df.toArray()).toEqual([
      {
        race_and_ethnicity: "a",
        population: 1,
        pct_share: 100,
        fips: "00",
      },
      {
        race_and_ethnicity: "All",
        population: 1,
        pct_share: 100,
        fips: "00",
      },
    ]);
  });

  test("Testing percent share two race", async () => {
    let data = [
      { race_and_ethnicity: "a", population: 1, fips: "00" },
      { race_and_ethnicity: "b", population: 1, fips: "00" },
      { race_and_ethnicity: "All", population: 2, fips: "00" },
    ];
    let df: IDataFrame = new DataFrame(data);
    df = calc.calculatePctShare(df, "population", "pct_share", RACE, ["fips"]);
    expect(df.toArray()).toEqual([
      {
        race_and_ethnicity: "a",
        population: 1,
        pct_share: 50,
        fips: "00",
      },
      {
        race_and_ethnicity: "b",
        population: 1,
        pct_share: 50,
        fips: "00",
      },
      {
        race_and_ethnicity: "All",
        population: 2,
        pct_share: 100,
        fips: "00",
      },
    ]);
  });

  test("Testing calculatePctShareOfKnown", async () => {
    let data = [
      { race_and_ethnicity: "a", population: 1, fips: "00" },
      { race_and_ethnicity: "Unknown", population: 1, fips: "00" },
      { race_and_ethnicity: "All", population: 2, fips: "00" },
    ];
    let df: IDataFrame = new DataFrame(data);
    df = calc.calculatePctShareOfKnown(df, "population", "share_unk", RACE);
    expect(df.toArray()).toEqual([
      {
        race_and_ethnicity: "a",
        population: 1,
        share_unk: 100,
        fips: "00",
      },
      {
        race_and_ethnicity: "All",
        population: 2,
        share_unk: 100,
        fips: "00",
      },
      {
        race_and_ethnicity: "Unknown",
        population: 1,
        fips: "00",
      },
    ]);
  });
});
