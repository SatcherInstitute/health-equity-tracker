import { sortAgeParsedNumerically } from "./datasetutils";

describe("dataset utils test", () => {
  const ALL = { age: "All" };
  const A0_4 = { age: "0-4" };
  const A5_9 = { age: "5-9" };
  const A11_20 = { age: "11-20" };
  const A20P = { age: "20+" };

  beforeEach(() => {});

  test("empty arr", async () => {
    let data: any = [];
    data.sort(sortAgeParsedNumerically);
    expect(data).toStrictEqual([]);
  });

  test("single ell all", async () => {
    let data: any = [ALL];
    data.sort(sortAgeParsedNumerically);
    expect(data).toStrictEqual([ALL]);
  });

  test("single single sort sorted", async () => {
    let data: any = [ALL, A0_4];
    data.sort(sortAgeParsedNumerically);
    expect(data).toStrictEqual([ALL, A0_4]);
  });

  test("single single sort reversed", async () => {
    let data: any = [A0_4, ALL];
    data.sort(sortAgeParsedNumerically);
    expect(data).toStrictEqual([ALL, A0_4]);
  });

  test("testing single sort unbounded sorted", async () => {
    let data: any = [A0_4, A20P];
    data.sort(sortAgeParsedNumerically);
    expect(data).toStrictEqual([A0_4, A20P]);
  });

  test("testing single sort unbounded reversed", async () => {
    let data: any = [A20P, A0_4];
    data.sort(sortAgeParsedNumerically);
    expect(data).toStrictEqual([A0_4, A20P]);
  });

  test("testing real life usecase", async () => {
    let data: any = [A11_20, A20P, A0_4, A5_9, ALL];
    data.sort(sortAgeParsedNumerically);
    expect(data).toStrictEqual([ALL, A0_4, A5_9, A11_20, A20P]);
  });
});
