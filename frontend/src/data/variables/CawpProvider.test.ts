import { Breakdowns } from "../query/Breakdowns";
import {
  HISPANIC,
  RACE,
  RaceAndEthnicityGroup,
  UNKNOWN_RACE,
  WHITE,
} from "../utils/Constants";
import { Fips } from "../utils/Fips";
import CawpProvider, { getWomenRaceLabel } from "./CawpProvider";

const cawp = new CawpProvider();

describe("CAWP Unit Tests", () => {
  test("Test getDatasetId() National", async () => {
    const national = Breakdowns.forFips(new Fips("00")).addBreakdown(RACE);
    expect(cawp.getDatasetId(national)).toEqual(
      "cawp_time_data-race_and_ethnicity_national_time_series"
    );
  });

  test("Test getDatasetId() State", async () => {
    const national = Breakdowns.forFips(new Fips("01")).addBreakdown(RACE);
    expect(cawp.getDatasetId(national)).toEqual(
      "cawp_time_data-race_and_ethnicity_state_time_series"
    );
  });

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
