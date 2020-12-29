import { DataFrame, IDataFrame } from "data-forge";
import { MetricQuery, MetricQueryResponse } from "./MetricQuery";

/* TODO: These are not yet comprehensive, final interfaces */

export interface DatasetMetadata {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly fields: readonly Field[];
  readonly data_source_name: string;
  readonly data_source_link: string;
  readonly geographic_level: string;
  readonly demographic_granularity: string;
  readonly update_frequency: string;
  readonly update_time: string;
}

export interface Field {
  readonly data_type: string;
  readonly name: string;
  readonly description: string;
  readonly origin_dataset: string;
}

// TODO: make typedef for valid data types instead of any.
export type Row = Readonly<Record<string, any>>;

export class Dataset {
  readonly rows: Readonly<Row[]>;
  readonly metadata: Readonly<DatasetMetadata>;

  constructor(rows: Row[], metadata: DatasetMetadata) {
    this.rows = rows;
    this.metadata = metadata;
  }

  toDataFrame(): IDataFrame {
    return new DataFrame(this.rows);
  }

  toCsvString() {
    const headers = this.metadata.fields.map((f) => f.name);
    const stringFields = this.metadata.fields
      .filter((f) => f.data_type === "string")
      .map((f) => f.name);
    const addQuotes = (val: string) => `"${val}"`;
    const df = this.toDataFrame().transformSeries(
      Object.fromEntries(stringFields.map((name) => [name, addQuotes]))
    );
    return [headers]
      .concat(df.toRows())
      .map((row) => row.join(","))
      .join("\n");
  }
}

// Map of dataset id to DatasetMetadata
export type MetadataMap = Readonly<Record<string, DatasetMetadata>>;

export type LoadStatus = "unloaded" | "loading" | "loaded" | "error";

export interface DatasetStore {
  readonly loadDataset: (id: string) => Promise<Dataset | undefined>;
  readonly getDatasetLoadStatus: (id: string) => LoadStatus;
  readonly loadMetrics: (query: MetricQuery) => Promise<void>;
  readonly getMetricsLoadStatus: (query: MetricQuery) => LoadStatus;
  readonly getMetrics: (query: MetricQuery) => MetricQueryResponse;
  readonly metadataLoadStatus: LoadStatus;
  readonly metadata: MetadataMap;
  readonly datasets: Readonly<Record<string, Dataset>>;
}
