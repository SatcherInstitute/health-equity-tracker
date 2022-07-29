import VaccineProvider from "./VaccineProvider";
import AcsPopulationProvider from "./AcsPopulationProvider";
import { Breakdowns, BreakdownVar } from "../query/Breakdowns";
import { MetricQuery, MetricQueryResponse } from "../query/MetricQuery";
import { Fips } from "../utils/Fips";
import { DatasetMetadataMap } from "../config/DatasetMetadata";
import { excludeAll } from "../query/BreakdownFilter";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import { FipsSpec, NC, USA, MARIN } from "./TestUtils";
import {
  ASIAN_NH,
  ALL,
  RACE,
  DemographicGroup,
  CROSS_SECTIONAL,
} from "../utils/Constants";
import { MetricId } from "../config/MetricConfig";

const METRIC_IDS: MetricId[] = [
  "vaccinated_pct_share",
  "vaccinated_share_of_known",
  "vaccinated_per_100k",
  "vaccine_population_pct",
];

export async function evaluateWithAndWithoutAll(
  vaccineDatasetId: string,
  rawCovidData: any[],
  acsDatasetId: string,
  rawAcsData: any[],
  baseBreakdown: Breakdowns,
  breakdownVar: BreakdownVar,
  rowsExcludingAll: any[],
  rowsIncludingAll: any[]
) {
  const acsProvider = new AcsPopulationProvider();
  const vaccineProvider = new VaccineProvider(acsProvider);

  dataFetcher.setFakeDatasetLoaded(vaccineDatasetId, rawCovidData);
  dataFetcher.setFakeDatasetLoaded(acsDatasetId, rawAcsData);

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await vaccineProvider.getData(
    new MetricQuery(
      METRIC_IDS,
      baseBreakdown.addBreakdown(breakdownVar),
      CROSS_SECTIONAL
    )
  );

  let consumedDatasetIds = [vaccineDatasetId];
  if (acsDatasetId !== "") {
    consumedDatasetIds.push(acsDatasetId);
  }

  if (baseBreakdown.geography === "national") {
    consumedDatasetIds.push(
      "acs_2010_population-by_race_and_ethnicity_territory"
    );
  }

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse(rowsIncludingAll, consumedDatasetIds)
  );

  // Evaluate the response without requesting "All" field
  const responseExcludingAll = await vaccineProvider.getData(
    new MetricQuery(
      METRIC_IDS,
      baseBreakdown.addBreakdown(breakdownVar, excludeAll()),
      CROSS_SECTIONAL
    )
  );
  expect(responseExcludingAll).toEqual(
    new MetricQueryResponse(rowsExcludingAll, consumedDatasetIds)
  );
}

autoInitGlobals();
const dataFetcher = getDataFetcher() as FakeDataFetcher;

function finalRow(
  fips: FipsSpec,
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  vaccinated_pct: number,
  vaccinated_pct_share: number,
  vaccinated_pct_share_of_known: number,
  vaccine_population_pct: number
) {
  return {
    [breakdownName]: breakdownValue,
    fips: fips.code,
    fips_name: fips.name,
    vaccinated_per_100k: vaccinated_pct,
    vaccinated_pct_share: vaccinated_pct_share,
    vaccinated_share_of_known: vaccinated_pct_share_of_known,
    vaccine_population_pct: vaccine_population_pct,
  };
}

function stateRow(
  fips: FipsSpec,
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  vaccinated_pct: number,
  vaccinated_pct_share: number,
  vaccinated_first_dose: number,
  population: number,
  population_pct: number
) {
  return [
    {
      [breakdownName]: breakdownValue,
      state_fips: fips.code,
      state_name: fips.name,
      vaccinated_pct: vaccinated_pct,
      vaccinated_pct_share: vaccinated_pct_share,
      vaccinated_first_dose: vaccinated_first_dose,
      population: population,
      population_pct: population_pct,
    },
    {
      state_fips: fips.code,
      state_name: fips.name,
      race_and_ethnicity: breakdownValue,
      population: population,
    },
  ];
}

function nationalRow(
  breakdownName: BreakdownVar,
  breakdownValue: DemographicGroup,
  vaccinated_first_dose: number,
  vaccinated_share_of_known: number,
  vaccinated_per_100k: number,
  population: number,
  population_pct: number
) {
  return [
    {
      [breakdownName]: breakdownValue,
      state_fips: USA.code,
      state_name: USA.name,
      vaccinated_first_dose: vaccinated_first_dose,
      vaccinated_share_of_known: vaccinated_share_of_known,
      vaccinated_per_100k: vaccinated_per_100k,
    },
    {
      state_fips: USA.code,
      state_name: USA.name,
      population: population,
      race_and_ethnicity: breakdownValue,
      population_pct: population_pct,
    },
  ];
}

describe("VaccineProvider", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap);
  });

  test("State and Race Breakdown", async () => {
    const [NC_ASIAN_ROW, NC_ACS_ASIAN_ROW] = stateRow(
      NC,
      RACE,
      ASIAN_NH,
      0.15,
      0.2,
      0, // not used
      100,
      0.5
    );

    const [NC_ALL_ROW, NC_ACS_ALL_ROW] = stateRow(
      NC,
      RACE,
      ALL,
      0,
      0,
      50,
      200,
      1
    );

    const rawData = [NC_ASIAN_ROW, NC_ALL_ROW];

    // Create final rows with diabetes_count & diabetes_per_100k
    const NC_ASIAN_FINAL = finalRow(
      /*fips*/ NC,
      /*breakdownName*/ RACE,
      /*breakdownValue*/ ASIAN_NH,
      /*vaccinated_per_100k*/ 15000,
      /*vaccinated_pct_share*/ 20,
      /*vaccinated_pct_share_of_known*/ 20,
      /*vaccine_population_pct*/ 50
    );

    const NC_ALL_FINAL = finalRow(
      /*fips*/ NC,
      /*breakdownName*/ RACE,
      /*breakdownValue*/ ALL,
      /*vaccinated_per_100k*/ 25000,
      /*vaccinated_pct_share*/ 100,
      /*vaccinated_pct_share_of_known*/ 100,
      /*vaccine_population_pct*/ 100
    );

    await evaluateWithAndWithoutAll(
      "kff_vaccination-race_and_ethnicity",
      rawData,
      "acs_population-by_race_state_std",
      [NC_ACS_ASIAN_ROW, NC_ACS_ALL_ROW],
      Breakdowns.forFips(new Fips("37")),
      RACE,
      [NC_ASIAN_FINAL],
      [NC_ALL_FINAL, NC_ASIAN_FINAL]
    );
  });

  test("National and Race Breakdown", async () => {
    const [USA_ASIAN_ROW, USA_ACS_ASIAN_ROW] = nationalRow(
      RACE,
      ASIAN_NH,
      1000,
      100,
      10000,
      50,
      50
    );

    const [USA_ALL_ROW, USA_ACS_ALL_ROW] = nationalRow(
      RACE,
      ALL,
      1000,
      100,
      50000,
      100,
      100
    );

    const rawData = [USA_ASIAN_ROW, USA_ALL_ROW];

    const USA_ASIAN_FINAL = finalRow(
      /*fips*/ USA,
      /*breakdownName*/ RACE,
      /*breakdownValue*/ ASIAN_NH,
      /*vaccinated_per_100k*/ 10000,
      /*vaccinated_pct_share*/ 100,
      /*vaccinated_pct_share_of_known*/ 100,
      /*vaccine_population_pct*/ 50
    );

    const USA_ALL_FINAL = finalRow(
      /*fips*/ USA,
      /*breakdownName*/ RACE,
      /*breakdownValue*/ ALL,
      /*vaccinated_per_100k*/ 50000,
      /*vaccinated_pct_share*/ 100,
      /*vaccinated_pct_share_of_known*/ 100,
      /*vaccine_population_pct*/ 100
    );

    await evaluateWithAndWithoutAll(
      "cdc_vaccination_national-race_and_ethnicity",
      rawData,
      "acs_population-by_race_national",
      [USA_ACS_ASIAN_ROW, USA_ACS_ALL_ROW],
      Breakdowns.national(),
      RACE,
      [USA_ASIAN_FINAL],
      [USA_ALL_FINAL, USA_ASIAN_FINAL]
    );
  });

  test("County and Race Breakdown", async () => {
    const MARIN_COUNTY_ALL_ROW = {
      [RACE]: ALL,
      county_fips: MARIN.code,
      county_name: MARIN.name,
      vaccinated_first_dose: 10,
      population: 50,
    };

    const MARIN_FINAL_ROW = {
      [RACE]: ALL,
      fips: MARIN.code,
      fips_name: MARIN.name,
      vaccinated_per_100k: 20000,
    };

    await evaluateWithAndWithoutAll(
      "cdc_vaccination_county-race_and_ethnicity",
      [MARIN_COUNTY_ALL_ROW],
      "acs_population-by_race_county_std",
      [],
      Breakdowns.byCounty(),
      RACE,
      [],
      [MARIN_FINAL_ROW]
    );
  });
});
