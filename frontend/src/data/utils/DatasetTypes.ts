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

// Note: we currently don't support both commas and quotes together, which requires escaping the quotes with another quote.
export function convertSpecialCharactersForCsv(val: any) {
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

  toCsvString(): string {
    let df = this.toDataFrame();
    const columns = df.getColumnNames();
    // apply specialChar fn to every column
    df = df.transformSeries(
      Object.fromEntries(
        columns.map((colName) => [colName, convertSpecialCharactersForCsv])
      )
    );
    return df.toCSV();
  }
}

// Map of dataset id to DatasetMetadata
export type MapOfDatasetMetadata = Readonly<Record<string, DatasetMetadata>>;
