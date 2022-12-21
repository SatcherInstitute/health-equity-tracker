import {
  HISPANIC,
  RaceAndEthnicityGroup,
  UNKNOWN_RACE,
  WHITE,
} from "../utils/Constants";
import { getWomenRaceLabel } from "./CawpProvider";

describe("CAWP Unit Tests", () => {
  test("Test Women Race Label Swapping", async () => {
    expect(getWomenRaceLabel(UNKNOWN_RACE)).toEqual("Women with unknown race");
    expect(getWomenRaceLabel(WHITE)).toEqual("White women");
    expect(
      getWomenRaceLabel("almost_anything" as RaceAndEthnicityGroup)
    ).toEqual("almost_anything women");
    expect(getWomenRaceLabel(HISPANIC)).not.toEqual(
      "Hispanic and Latino women"
    );
  });
});
