import { Fips } from "./Fips";

describe("Test getDisplayName()", () => {
  test("US/STATE with no addon", async () => {
    expect(new Fips("00").getDisplayName()).toEqual("United States");
  });
  test("County without addon", async () => {
    expect(new Fips("02016").getDisplayName()).toEqual(
      "Aleutians West Census Area"
    );
  });
  test("County with Parish addon", async () => {
    expect(new Fips("22001").getDisplayName()).toEqual("Acadia Parish");
  });
  test("County with county addon", async () => {
    expect(new Fips("08031").getDisplayName()).toEqual("Denver County");
  });
});

describe("Test getSentenceDisplayName()", () => {
  test("The US", async () => {
    expect(new Fips("00").getSentenceDisplayName()).toEqual(
      " the United States"
    );
  });
});
