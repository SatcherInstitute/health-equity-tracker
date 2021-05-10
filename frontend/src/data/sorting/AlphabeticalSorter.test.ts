import { Breakdowns } from "../query/Breakdowns";
import { AlphabeticalSorter } from "./AlphabeticalSorter";

describe("dataset utils test", () => {
  const RACE_ALL = { race: "All" };
  const RACE_A = { race: "a" };
  const RACE_B = { race: "b" };
  const RACE_C = { race: "c" };

  const RACE_UNKNOWN = { race: "unknown" };
  const breakdown = Breakdowns.national();

  beforeEach(() => {});

  test("empty all", async () => {
    let data: any = [];
    new AlphabeticalSorter("race").checkApply(data, breakdown);
    expect(data).toStrictEqual([]);
  });

  test("test alpha sort", async () => {
    let data: any = [RACE_A, RACE_C, RACE_B];
    new AlphabeticalSorter("race").checkApply(data, breakdown);
    expect(data).toStrictEqual([RACE_A, RACE_B, RACE_C]);
  });

  test("test alpha sort with front", async () => {
    let data: any = [RACE_A, RACE_C, RACE_B];
    new AlphabeticalSorter("race", ["b"]).checkApply(data, breakdown);
    expect(data).toStrictEqual([RACE_B, RACE_A, RACE_C]);
  });

  test("test alpha sort with back", async () => {
    let data: any = [RACE_A, RACE_C, RACE_B];
    new AlphabeticalSorter("race", ["b"], ["a"]).checkApply(data, breakdown);
    expect(data).toStrictEqual([RACE_B, RACE_C, RACE_A]);
  });

  test("test alpha sort with front multiple", async () => {
    let data: any = [RACE_A, RACE_C, RACE_B];
    new AlphabeticalSorter("race", ["b", "c"]).checkApply(data, breakdown);
    expect(data).toStrictEqual([RACE_B, RACE_C, RACE_A]);
  });

  test("test alpha sort with back multiple", async () => {
    let data: any = [RACE_A, RACE_C, RACE_B, RACE_ALL];
    new AlphabeticalSorter("race", ["All"], ["b", "c"]).checkApply(
      data,
      breakdown
    );
    expect(data).toStrictEqual([RACE_ALL, RACE_A, RACE_B, RACE_C]);
  });
});
