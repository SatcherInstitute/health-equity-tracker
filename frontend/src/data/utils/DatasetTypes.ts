import { DataFrame, IDataFrame } from "data-forge";
import { STATE_FIPS_MAP } from "./Fips";

// Data sources may provide multiple datasets
export interface DataSourceMetadata {
  readonly id: string;
  readonly description: string;
  readonly dataset_ids: string[];
  readonly data_source_name: string;
  readonly data_source_pretty_site_name: string;
  readonly data_source_link: string;
  readonly geographic_level: string;
  readonly demographic_granularity: string;
  readonly update_frequency: string;
  readonly downloadable: boolean;
}

// Datasets contain data with specified breakdowns
// For example: data by race and county or data by age and state
export interface DatasetMetadata {
  readonly id: string;
  readonly name: string;
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

// Note: we currently don't support both commas and quotes together, which
// requires escaping the quotes with another quote.
function convertSpecialCharactersForCsv(val: any) {
  if (typeof val === "string" && val.includes(",")) {
    return `"${val}"`;
  }
  return val;
}

export class Dataset {
  readonly rows: Readonly<Row[]>;
  readonly metadata: Readonly<DatasetMetadata>;

  constructor(rows: Row[], metadata: DatasetMetadata) {
    this.rows = rows;
    this.metadata = metadata;
  }

  toDataFrame(): IDataFrame {
    // TODO Remove this once STATE FIPS are embedded during GCP/SQL step
    const rowsWithFakeFips = this.rows.map((row) => {
      const fipsCode = Object.keys(STATE_FIPS_MAP).find(
        (key) => STATE_FIPS_MAP[key] === row.state_name
      );
      return { ...row, state_fips: fipsCode };
    });
    return new DataFrame(rowsWithFakeFips);
  }

  toCsvString() {
    // Previously they had assumed that every row would have the same keys; this was not accurate though because a row that contained a null value was losing that entire key/value pair. I "fixed" by having it scan the entire array and collect a set of keys found throughout. However, as they originally noted, we could improve this by sending column names as structured data from the server.

    let fields = [];
    for (const row of this.rows) {
      fields.push(...Object.keys(row));
    }
    // @ts-ignore
    fields = [...new Set(fields)];

    const df = this.toDataFrame().transformSeries(
      Object.fromEntries(
        fields.map((name) => [name, convertSpecialCharactersForCsv])
      )
    );
    return [fields]
      .concat(df.toRows())
      .map((row) => row.join(","))
      .join("\n");
  }
}

// Map of dataset id to DatasetMetadata
export type MapOfDatasetMetadata = Readonly<Record<string, DatasetMetadata>>;
