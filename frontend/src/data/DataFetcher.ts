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

type FileFormat = "json" | "csv";

class DataFetcher {
  /**
   * When true, forces all data requests to go to the server's static file
   * directory. Should not be used in production environments.
   */
  forceStaticFile: boolean;
  /**
   * The base url for API calls. Empty string if API calls are relative to the
   * current domain.
   */
  apiUrl: string;

  constructor() {
    // If the API url isn't provided, requests are relative to current domain.
    this.apiUrl = process.env.REACT_APP_BASE_API_URL || "";

    // Use the static file directory for unit test environments, and for
    // localhost environments unless the API url is provided
    // TODO we should replace this class with a FakeDataFetcher for test
    // environments and make this class throw an error in test environments.
    this.forceStaticFile =
      process.env.NODE_ENV === "test" ||
      (process.env.NODE_ENV === "development" && !this.apiUrl);
  }

  private getApiUrl() {
    return this.apiUrl + "/api";
  }

  /**
   * @param datasetName The ID of the dataset to request
   * @param useStaticFile Whether to route the request to the static file directory
   * @param format FileFormat for the request.
   */
  private getDatasetRequestPath(
    datasetName: string,
    useStaticFile: boolean = false,
    format: FileFormat = "json"
  ) {
    const fullDatasetName = datasetName + "." + format;
    const basePath =
      useStaticFile || this.forceStaticFile
        ? "/tmp/"
        : this.getApiUrl() + "/dataset?name=";
    return basePath + fullDatasetName;
  }

  /**
   * @param datasetName The ID of the dataset to request
   * @param useStaticFile Whether to route the request to the static file directory
   * @param format FileFormat for the request.
   */
  private async fetchDataset(
    datasetName: string,
    useStaticFile: boolean = false,
    format: FileFormat = "json"
  ) {
    const requestPath = this.getDatasetRequestPath(
      datasetName,
      useStaticFile,
      format
    );
    const resp = await fetch(requestPath);
    return await resp.json();
  }

  // TODO build in retries, timeout before showing error to user.
  /**
   * Fetches and returns the dataset associated with the provided ID.
   * @param datasetId The id of the dataset to load.
   */
  async loadDataset(datasetId: string): Promise<Row[]> {
    // TODO remove these special cases once the datasets are available on the
    // data server.
    if (datasetId === "brfss") {
      const diabetesData = await getDiabetesFrame();
      return diabetesData.toArray();
    }

    if (datasetId === "covid_by_state_and_race") {
      let result = await this.fetchDataset("covid_by_state", true);
      const fipsEntries = Object.entries(STATE_FIPS_MAP);
      const reversed = fipsEntries.map((entry) => [entry[1], entry[0]]);
      const fipsMap = Object.fromEntries(reversed);
      result = result.map((row: any) => {
        return { ...row, state_fips: fipsMap[row["state_name"]] };
      });
      return result;
    }

    if (datasetId === "acs_population-by_race_state_std") {
      // TODO remove this once we figure out how to make BQ export integers as
      // integers
      let result = await this.fetchDataset(datasetId);
      result = result.map((row: any) => {
        return { ...row, population: Number(row["population"]) };
      });
      return result;
    }

    // TODO handle server returning a dataset not found error.
    return await this.fetchDataset(datasetId);
  }

  async getMetadata(): Promise<MetadataMap> {
    // Simulate load time
    // TODO get rid of this, make real metadata request. Alternatively, hard
    // code metadata and drop the artificial timeout.
    await new Promise((res) => {
      setTimeout(res, 1000);
    });

    return FakeMetadataMap;
  }
}

export default DataFetcher;
