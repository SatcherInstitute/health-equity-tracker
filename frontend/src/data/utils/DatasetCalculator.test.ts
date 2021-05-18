import { DataFrame, IDataFrame } from "data-forge";
import { DatasetCalculator } from "./DatasetCalculator";

describe("Dataset Calculator", () => {
  let calc = new DatasetCalculator();

  test("Testing per 100k", async () => {
    expect(calc.per100k(100, 1000)).toEqual(10000);
  });

  test("Testing total", async () => {
    expect(calc.estimateTotal(10, 20)).toEqual(2);
  });

  test("Testing percent", async () => {
    expect(calc.percent(10, 20)).toEqual(50);
  });

  test("Testing percent share one race", async () => {
    let data = [
      { race_and_ethnicity: "a", population: 1, fips: "00" },
      { race_and_ethnicity: "All", population: 1, fips: "00" },
    ];
    let df: IDataFrame = new DataFrame(data);
    df = calc.calculatePctShare(
      df,
      "population",
      "pct_share",
      "race_and_ethnicity",
      ["fips"]
    );
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
    df = calc.calculatePctShare(
      df,
      "population",
      "pct_share",
      "race_and_ethnicity",
      ["fips"]
    );
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
    df = calc.calculatePctShareOfKnown(
      df,
      "population",
      "share_unk",
      "race_and_ethnicity"
    );
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
