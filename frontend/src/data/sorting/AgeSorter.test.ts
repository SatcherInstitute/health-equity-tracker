import { Breakdowns } from "../query/Breakdowns";
import { AgeSorter } from "./AgeSorter";

describe("dataset utils test", () => {
  const ALL = { age: "All" };
  const A0_4 = { age: "0-4" };
  const A5_9 = { age: "5-9" };
  const A11_20 = { age: "11-20" };
  const A20P = { age: "20+" };
  const breakdown = Breakdowns.national().andAge();

  beforeEach(() => {});

  test("empty arr", async () => {
    let data: any = [];
    new AgeSorter().checkApply(data, breakdown);
    expect(data).toStrictEqual([]);
  });

  test("single ell all", async () => {
    let data: any = [ALL];
    new AgeSorter().checkApply(data, breakdown);
    expect(data).toStrictEqual([ALL]);
  });

  test("single single sort sorted", async () => {
    let data: any = [ALL, A0_4];
    new AgeSorter().checkApply(data, breakdown);
    expect(data).toStrictEqual([ALL, A0_4]);
  });

  test("single single sort reversed", async () => {
    let data: any = [A0_4, ALL];
    new AgeSorter().checkApply(data, breakdown);
    expect(data).toStrictEqual([ALL, A0_4]);
  });

  test("testing single sort unbounded sorted", async () => {
    let data: any = [A0_4, A20P];
    new AgeSorter().checkApply(data, breakdown);
    expect(data).toStrictEqual([A0_4, A20P]);
  });

  test("testing single sort unbounded reversed", async () => {
    let data: any = [A20P, A0_4];
    new AgeSorter().checkApply(data, breakdown);
    expect(data).toStrictEqual([A0_4, A20P]);
  });

  test("testing real life usecase", async () => {
    let data: any = [A11_20, A20P, A0_4, A5_9, ALL];
    new AgeSorter().checkApply(data, breakdown);
    expect(data).toStrictEqual([ALL, A0_4, A5_9, A11_20, A20P]);
  });
});
