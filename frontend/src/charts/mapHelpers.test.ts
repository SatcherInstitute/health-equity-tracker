import { Fips } from "../data/utils/Fips";
import { buildTooltipTemplate, getCountyAddOn } from "./mapHelpers";

describe("Test buildTooltipTemplate()", () => {
  test("generates vega template string with a title, no SVI", () => {
    const wTitleNoSvi = buildTooltipTemplate(
      /* tooltipPairs */ {
        [`"Some Condition"`]: "datum.some_condition_per100k",
      },
      /* title? */ `"Some State"`,
      /* includeSvi */ false
    );
    expect(wTitleNoSvi).toEqual(
      '{title: "Some State",""Some Condition"": datum.some_condition_per100k,}'
    );
  });

  test("generates vega template string with no title, with SVI", () => {
    const noTitleWithSvi = buildTooltipTemplate(
      /* tooltipPairs */ {
        [`"Some Other Condition"`]: "datum.some_other_condition_per100k",
      },
      /* title? */ undefined,
      /* includeSvi */ true
    );
    expect(noTitleWithSvi).toEqual(
      '{""Some Other Condition"": datum.some_other_condition_per100k,"County SVI": datum.rating}'
    );
  });
});

describe("Test getCountyAddOn()", () => {
  test("A child FIPS of Alaska should get equiv", () => {
    const alaskaAddOn = getCountyAddOn(
      /* fips */ new Fips("02999"),
      /* showCounties */ true
    );
    expect(alaskaAddOn).toEqual("(County Equivalent)");
  });

  test("A child FIPS of Louisiana should get parish", () => {
    const louisianaAddOn = getCountyAddOn(
      /* fips */ new Fips("22999"),
      /* showCounties */ true
    );
    expect(louisianaAddOn).toEqual("Parish (County Equivalent)");
  });

  test("A child FIPS of Puerto Rico should get equiv", () => {
    const puertoRicoAddOn = getCountyAddOn(
      /* fips */ new Fips("72999"),
      /* showCounties */ true
    );
    expect(puertoRicoAddOn).toEqual("(County Equivalent)");
  });

  test("AL should get blank string", () => {
    const alabamaAddOn = getCountyAddOn(
      /* fips */ new Fips("02"),
      /* showCounties */ false
    );
    expect(alabamaAddOn).toEqual("");
  });
});

describe("Test getCountyAddOn()", () => {
  test("A child FIPS of Alaska should get equiv", () => {
    const alaskaAddOn = getCountyAddOn(
      /* fips */ new Fips("02999"),
      /* showCounties */ true
    );
    expect(alaskaAddOn).toEqual("(County Equivalent)");
  });

  test("A child FIPS of Louisiana should get parish", () => {
    const louisianaAddOn = getCountyAddOn(
      /* fips */ new Fips("22999"),
      /* showCounties */ true
    );
    expect(louisianaAddOn).toEqual("Parish (County Equivalent)");
  });

  test("A child FIPS of Puerto Rico should get equiv", () => {
    const puertoRicoAddOn = getCountyAddOn(
      /* fips */ new Fips("72999"),
      /* showCounties */ true
    );
    expect(puertoRicoAddOn).toEqual("(County Equivalent)");
  });

  test("AL should get blank string", () => {
    const alabamaAddOn = getCountyAddOn(
      /* fips */ new Fips("02"),
      /* showCounties */ false
    );
    expect(alabamaAddOn).toEqual("");
  });
});
