import { HISPANIC, UNKNOWN_RACE, WHITE } from "../utils/Constants";
import { getWomenRaceLabel } from "./CawpProvider";

describe("CAWP Unit Tests", () => {
  test("Test Women Race Label Swapping", async () => {
    expect(getWomenRaceLabel(UNKNOWN_RACE)).toEqual("Women of Unknown Race");
    expect(getWomenRaceLabel(WHITE)).toEqual("White Women");
    expect(getWomenRaceLabel("almost_anything")).toEqual(
      "almost_anything Women"
    );
    expect(getWomenRaceLabel(HISPANIC)).not.toEqual(
      "Hispanic and Latino Women"
    );
  });
});
