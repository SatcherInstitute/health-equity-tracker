// Note: this Will be replaced with real API calls. Leaving data fetches
// untyped for now, but we should define types for the API calls once we
// establish the API types.

import { MetadataMap, Row } from "./DatasetTypes";
import { diabetes } from "./FakeData";
import FakeMetadataMap from "./FakeMetadataMap";
import { DataFrame } from "data-forge";
import { STATE_FIPS_MAP } from "../utils/madlib/Fips";

async function getDiabetesFrame() {
  const r = await fetch(
    "https://api.census.gov/data/2018/acs/acs5/profile?get=NAME&for=state:*"
  );
  const json = await r.json();
  const stateFipsFrame = new DataFrame({
    columnNames: json[0],
    rows: json.slice(1),
  }).renameSeries({
    state: "state_fips",
    NAME: "state_name",
  });
  // TODO use brfss.json not in-memory
  return new DataFrame(diabetes)
    .dropSeries([
      "PREDIABETES_YES_YESPREGNANT",
      "PREDIABETES_NO_UNSURE_REFUSED",
    ])
    .renameSeries({
      BRFSS2019_STATE: "state_name",
      BRFSS2019_IMPLIED_RACE: "race_and_ethnicity",
      DIABETES_YES_YESPREGNANT: "diabetes_count",
      COPD_YES: "copd_count",
      DIABETES_NO_REFUSED: "diabetes_no",
      COPD_NO_UNKNOWN_REFUSED: "copd_no",
    })
    .join(
      stateFipsFrame,
      (row: any) => row.state_name,
      (row: any) => row.state_name,
      (dia, acs) => ({ ...dia, state_fips: acs.state_fips })
    );
}

class DataFetcher {
  async loadLocalFile(fileName: string) {
    const resp = await fetch("tmp/" + fileName);
    return await resp.json();
  }

  // TODO build in retries, timeout before showing error to user.
  async loadDataset(datasetId: string): Promise<Row[]> {
    // TODO load from data server once it's ready
    switch (datasetId) {
      case "brfss":
        const diabetesData = await getDiabetesFrame();
        return diabetesData.toArray();
      case "acs_state_population_by_race_nonstandard":
        return await this.loadLocalFile("table_race_nonstand.json");
      case "covid_by_state_and_race":
        let result = await this.loadLocalFile("covid_by_state.json");
        const fipsEntries = Object.entries(STATE_FIPS_MAP);
        const reversed = fipsEntries.map((entry) => [entry[1], entry[0]]);
        const fipsMap = Object.fromEntries(reversed);
        result = result.map((row: any) => {
          return { ...row, state_fips: fipsMap[row["state_name"]] };
        });
        return result;
      default:
        throw new Error("Unknown dataset: " + datasetId);
    }
  }

  async getMetadata(): Promise<MetadataMap> {
    // Simulate load time
    await new Promise((res) => {
      setTimeout(res, 1000);
    });

    return FakeMetadataMap;
  }
}

export default DataFetcher;
