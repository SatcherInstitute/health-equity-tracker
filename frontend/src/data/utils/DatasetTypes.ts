import { DataFrame, IDataFrame } from "data-forge";

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
  readonly time_period_range?: string;
}

// Datasets contain data with specified breakdowns
// For example: data by race and county or data by age and state
export interface DatasetMetadata {
  readonly id: string;
  readonly name: string;
  readonly update_time: string;
  readonly contains_nh?: boolean;
  readonly contains_mega?: boolean;
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
  if (val === null) {
    return "";
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
    return new DataFrame(this.rows);
  }

  getAllColumnNames(): string[] {
    const headersSet = new Set<string>();
    for (const row of this.rows) {
      for (const header of Object.keys(row)) {
        headersSet.add(header);
      }
    }
    return Array.from(headersSet);
  }

  toCsvString(): string {
    // grab ALL column names throughout every row
    const headers = this.getAllColumnNames();

    // add column names first
    let csvString = headers.join(",");
    csvString += "\r\n";

    // iterate through and add values as needed
    // ensure missing keys and explicit nulls are filled in as ""
    this.rows.forEach((row, rowIndex) => {
      headers.forEach((header, headerIndex) => {
        let value = "";
        if (header in row) {
          value = row[header as string];
        }
        csvString += convertSpecialCharactersForCsv(value);

        // comma between values or newline between rows
        if (headerIndex < headers.length - 1) {
          csvString += ",";
        } else if (rowIndex < this.rows.length - 1) csvString += "\r\n";
      });
    });

    return csvString;
  }
}

// Map of dataset id to DatasetMetadata
export type MapOfDatasetMetadata = Readonly<Record<string, DatasetMetadata>>;
