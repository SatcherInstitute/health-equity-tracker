import { failInvalidFips, Fips } from "./Fips";

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

describe("Test failInvalidFips()", () => {
  test("Good USA FIPS", async () => {
    expect(failInvalidFips("00")).toEqual(undefined);
  });
  test("Good state FIPS", async () => {
    expect(failInvalidFips("01")).toEqual(undefined);
  });
  test("Good county FIPS", async () => {
    expect(failInvalidFips("01011")).toEqual(undefined);
  });
  test("KNOWN ISSUE: Bad FIPS with 2 or 5 digit format will pass", async () => {
    expect(failInvalidFips("99999")).toEqual(undefined);
  });
  test("Bad number of digits FIPS", async () => {
    expect(() => {
      failInvalidFips("1");
    }).toThrow("Invalid FIPS code");
  });
  test("Bad non-digits FIPS", async () => {
    expect(() => {
      failInvalidFips("1A");
    }).toThrow("Invalid FIPS code");
  });
});
