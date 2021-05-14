import { Breakdowns } from "../query/Breakdowns";
import { AlphabeticalSorterStrategy } from "./AlphabeticalSorterStrategy";

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
    data.sort(new AlphabeticalSorterStrategy("race").compareFn);
    expect(data).toStrictEqual([]);
  });

  test("test alpha sort", async () => {
    let data: any = [RACE_A, RACE_C, RACE_B];
    data.sort(new AlphabeticalSorterStrategy("race").compareFn);
    expect(data).toStrictEqual([RACE_A, RACE_B, RACE_C]);
  });

  test("test alpha sort with front", async () => {
    let data: any = [RACE_A, RACE_C, RACE_B];
    data.sort(new AlphabeticalSorterStrategy("race", ["b"]).compareFn);
    expect(data).toStrictEqual([RACE_B, RACE_A, RACE_C]);
  });

  test("test alpha sort with back", async () => {
    let data: any = [RACE_A, RACE_C, RACE_B];
    data.sort(new AlphabeticalSorterStrategy("race", ["b"], ["a"]).compareFn);
    expect(data).toStrictEqual([RACE_B, RACE_C, RACE_A]);
  });

  test("test alpha sort with front multiple", async () => {
    let data: any = [RACE_A, RACE_C, RACE_B];
    data.sort(new AlphabeticalSorterStrategy("race", ["b", "c"]).compareFn);
    expect(data).toStrictEqual([RACE_B, RACE_C, RACE_A]);
  });

  test("test alpha sort with back multiple", async () => {
    let data: any = [RACE_A, RACE_C, RACE_B, RACE_ALL];
    data.sort(
      new AlphabeticalSorterStrategy("race", ["All"], ["b", "c"]).compareFn
    );
    expect(data).toStrictEqual([RACE_ALL, RACE_A, RACE_B, RACE_C]);
  });
});
