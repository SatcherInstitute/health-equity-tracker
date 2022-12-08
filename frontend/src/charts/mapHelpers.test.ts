import { buildTooltipTemplate } from "./mapHelpers";

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
