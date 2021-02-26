import { DataFrame, IDataFrame } from "data-forge";

// Data sources may provide multiple datasets
export interface DataSourceMetadata {
  readonly id: string;
  readonly description: string;
  readonly dataset_ids: string[];
  readonly data_source_name: string;
  readonly data_source_link: string;
  readonly geographic_level: string;
  readonly demographic_granularity: string;
  readonly update_frequency: string;
}

// Datasets contain data with specified breakdowns
// For example: data by race and county or data by age and state
export interface DatasetMetadata {
  readonly id: string;
  readonly name: string;
  readonly fields: readonly Field[];
  readonly update_time: string;
  // Source ID is added programmatically based on DataSourceMetadata config
  source_id?: string;
}

export interface Field {
  readonly data_type: string;
  readonly name: string;
  readonly description: string;
  readonly origin_dataset: string;
}

export interface FieldRange {
  readonly min: number;
  readonly max: number;
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
export type MapOfDatasetMetadata = Readonly<Record<string, DatasetMetadata>>;
