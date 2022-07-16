import { DataFrame, IDataFrame } from "data-forge";
import { STATE_FIPS_MAP } from "./Fips";

export type DatasetId =
  | "acs_population-by_race_county_std"
  | "acs_population-by_race_state_std"
  | "acs_population-by_race_national"
  | "acs_population-by_age_county"
  | "acs_population-by_age_state"
  | "acs_population-by_age_national"
  | "acs_population-by_sex_county"
  | "acs_population-by_sex_state"
  | "acs_population-by_sex_national"
  | "acs_2010_population-by_race_and_ethnicity_territory"
  | "acs_2010_population-by_sex_territory"
  | "acs_2010_population-by_age_territory"
  | "covid_tracking_project-cases_by_race_state"
  | "covid_tracking_project-deaths_by_race_state"
  | "covid_tracking_project-hospitalizations_by_race_state"
  | "covid_tracking_project-tests_by_race_state"
  | "acs_health_insurance-health_insurance_by_sex_age_county"
  | "acs_health_insurance-health_insurance_by_sex_age_state"
  | "acs_health_insurance-health_insurance_by_race_age_state"
  | "acs_health_insurance-health_insurance_by_race_age_county"
  | "acs_poverty_dataset-poverty_by_race_state"
  | "acs_poverty_dataset-poverty_by_race_county"
  | "acs_poverty_dataset-poverty_by_sex_state"
  | "acs_poverty_dataset-poverty_by_sex_county"
  | "acs_poverty_dataset-poverty_by_age_state"
  | "acs_poverty_dataset-poverty_by_age_county"
  | "cdc_restricted_data-by_race_county_processed"
  | "cdc_restricted_data-by_race_state_processed-with_age_adjust"
  | "cdc_restricted_data-by_age_county_processed"
  | "cdc_restricted_data-by_age_state_processed"
  | "cdc_restricted_data-by_age_national_processed"
  | "cdc_restricted_data-by_sex_county_processed"
  | "cdc_restricted_data-by_sex_state_processed"
  | "cdc_restricted_data-by_sex_national_processed"
  | "cdc_vaccination_county-race_and_ethnicity"
  | "cdc_vaccination_national-age"
  | "cdc_vaccination_national-sex"
  | "cdc_vaccination_national-race_and_ethnicity"
  | "kff_vaccination-race_and_ethnicity"
  | "uhc_data-age_national"
  | "uhc_data-race_and_ethnicity_national"
  | "uhc_data-sex_national"
  | "uhc_data-age_state"
  | "uhc_data-race_and_ethnicity_state"
  | "uhc_data-sex_state"
  | "bjs_incarceration_data-age_national"
  | "bjs_incarceration_data-age_state"
  | "bjs_incarceration_data-race_and_ethnicity_national"
  | "bjs_incarceration_data-race_and_ethnicity_state"
  | "bjs_incarceration_data-sex_national"
  | "bjs_incarceration_data-sex_state"
  | "vera_incarceration_county-jail_age_county"
  | "vera_incarceration_county-jail_sex_county"
  | "vera_incarceration_county-jail_race_and_ethnicity_county"
  | "vera_incarceration_county-prison_age_county"
  | "vera_incarceration_county-prison_sex_county"
  | "vera_incarceration_county-prison_race_and_ethnicity_county"
  | "cawp_data-race_and_ethnicity_national"
  | "cawp_data-race_and_ethnicity_state"
  | "propublica_congress"
  | "geographies"
  | "census_pop_estimates-race_and_ethnicity";

// Data sources may provide multiple datasets
export interface DataSourceMetadata {
  readonly id: string;
  readonly description: string;
  readonly dataset_ids: DatasetId[];
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
  readonly string;
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
    // Assume the columns are the same as the keys of the first row. This is
    // okay since every row has the same keys. However, we could improve this by
    // sending column names as structured data from the server.

    const fields = Object.keys(this.rows[0]);

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
