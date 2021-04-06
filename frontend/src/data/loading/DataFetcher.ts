// Note: this Will be replaced with real API calls. Leaving data fetches
// untyped for now, but we should define types for the API calls once we
// establish the API types.

import { MapOfDatasetMetadata, Row } from "../utils/DatasetTypes";
import { FakeDatasetMetadataMap } from "../config/FakeDatasetMetadata";
import { Environment } from "../../utils/Environment";
import { DataFrame } from "data-forge";

type FileFormat = "json" | "csv";

export interface DataFetcher {
  /**
   * Fetches and returns the dataset associated with the provided ID.
   * @param datasetId The id of the dataset to load.
   */
  loadDataset(datasetId: string): Promise<Row[]>;

  /** Fetches and returns the MetadataMap for all datasets. */
  getMetadata(): Promise<MapOfDatasetMetadata>;
}

export class ApiDataFetcher implements DataFetcher {
  environment: Environment;

  constructor(environment: Environment) {
    this.environment = environment;
  }

  /**
   * Returns whether the dataset should be fetched as a static file from the
   * tmp directory. If false, fetches normally from the data server. This is
   * mainly for local development, though it may be used for in-progress
   * datasets that have not been fully productionized on the data server.
   * @param fileName The full name of the dataset file, including file
   *     extension.
   */
  private shouldFetchAsStaticFile(fileName: string) {
    return (
      (this.environment.deployContext === "development" &&
        !this.environment.getBaseApiUrl()) ||
      this.environment.forceFetchDatasetAsStaticFile(fileName)
    );
  }

  private getApiUrl() {
    return this.environment.getBaseApiUrl() + "/api";
  }

  /**
   * @param datasetName The ID of the dataset to request
   * @param format FileFormat for the request.
   */
  private getDatasetRequestPath(
    datasetName: string,
    format: FileFormat = "json"
  ) {
    const fullDatasetName = datasetName + "." + format;
    const basePath = this.shouldFetchAsStaticFile(fullDatasetName)
      ? "/tmp/"
      : this.getApiUrl() + "/dataset?name=";
    return basePath + fullDatasetName;
  }

  /**
   * @param datasetName The ID of the dataset to request
   * @param format FileFormat for the request.
   */
  private async fetchDataset(datasetName: string, format: FileFormat = "json") {
    const requestPath = this.getDatasetRequestPath(datasetName, format);
    const resp = await fetch(requestPath);
    return await resp.json();
  }

  // TODO build in retries, timeout before showing error to user.
  async loadDataset(datasetId: string): Promise<Row[]> {
    // TODO handle server returning a dataset not found error.
    let result = await this.fetchDataset(datasetId);

    // TODO remove these once we figure out how to make BQ export integers as
    // integers
    if (datasetId.startsWith("acs_population")) {
      result = result.map((row: any) => {
        return { ...row, population: Number(row["population"]) };
      });
    }
    if (datasetId.startsWith("cdc_restricted")) {
      result = result.map((row: any) => {
        return {
          ...row,
          cases: Number(row["cases"]),
          hosp_y: Number(row["hosp_y"]),
          hosp_n: Number(row["hosp_n"]),
          hosp_unknown: Number(row["hosp_unknown"]),
          death_y: Number(row["death_y"]),
          death_n: Number(row["death_n"]),
          death_unknown: Number(row["death_unknown"]),
          population:
            row["population"] == null ? null : Number(row["population"]),
        };
      });
    } else if (datasetId.startsWith("acs_poverty")) {
      result = result.map((row: any) => {
        return {
          ...row,
          above_poverty_line: Number(row["above_poverty_line"]),
          below_poverty_line: Number(row["below_poverty_line"]),
        };
      });
    }

    console.log("HELLoWORLDS");
    // TODO - the server should drop ingestion_ts before exporting the file. At
    // that point we can drop this code.
    return new DataFrame(result)
      .dropSeries(["ingestion_ts"])
      .resetIndex()
      .toArray();
  }

  async getMetadata(): Promise<MapOfDatasetMetadata> {
    // TODO replace with real API call.
    return FakeDatasetMetadataMap;
  }
}
