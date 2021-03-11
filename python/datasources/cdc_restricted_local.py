"""
This program is intended to be run locally by someone who has access to the CDC
restricted public surveillance data and has downloaded the latest version of
the data from the secure GCS bucket to their local machine. It asks for the
path and prefix of the CSV files which make up the CDC restricted data (e.g.
"COVID_Cases_Restricted_Detailed_01312021" is the prefix for the 1/31/21 data),
performs aggregation and standardization, and outputs the resulting CSV to the
same path that was input. The resulting CSVs are intended to be uploaded to the
manual-uploads GCS bucket for consumption by the ingestion pipeline.
"""

import os
import sys
import time

import ingestion.standardized_columns as std_col
import numpy as np
import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'

# These are the columns that we want to keep from the data.
# Geo columns (state, county) - we aggregate or groupby either state or county.
# Demog columns (race, age, sex) - we groupby one of these at a time.
# Outcome columns (hosp, death) - these are the measured variables we count.
STATE_COL = 'res_state'
COUNTY_FIPS_COL = 'county_fips_code'
COUNTY_COL = 'res_county'
RACE_COL = 'race_ethnicity_combined'
SEX_COL = 'sex'
AGE_COL = 'age_group'
OUTCOME_COLS = ['hosp_yn', 'death_yn']

# Convenience list for when we group the data by county.
COUNTY_COLS = [COUNTY_FIPS_COL, COUNTY_COL, STATE_COL]

# Mapping from column name in the data to standardized version.
COL_NAME_MAPPING = {
    STATE_COL: std_col.STATE_NAME_COL,
    COUNTY_FIPS_COL: std_col.COUNTY_FIPS_COL,
    COUNTY_COL: std_col.COUNTY_NAME_COL,
    RACE_COL: std_col.RACE_OR_HISPANIC_COL,
    SEX_COL: std_col.SEX_COL,
    AGE_COL: std_col.AGE_COL,
}

# Mapping for county_fips, county, and state unknown values to "Unknown".
COUNTY_FIPS_NAMES_MAPPING = {"NA": "-1"}  # Has to be str for later ingestion.
COUNTY_NAMES_MAPPING = {"Missing": "Unknown", "NA": "Unknown"}
STATE_NAMES_MAPPING = {"Missing": "Unknown", "NA": "Unknown"}

# Mappings for race, sex, and age values in the data to a standardized forms.
# Note that these mappings cover the possible values in the data as of 3/1/21.
# New data should be checked for schema changes.
RACE_NAMES_MAPPING = {
    "American Indian/Alaska Native, Non-Hispanic": std_col.Race.AIAN_NH.value,
    "Asian, Non-Hispanic": std_col.Race.ASIAN_NH.value,
    "Black, Non-Hispanic": std_col.Race.BLACK_NH.value,
    "Multiple/Other, Non-Hispanic": std_col.Race.MULTI_NH.value,
    "Native Hawaiian/Other Pacific Islander, Non-Hispanic": std_col.Race.NHPI_NH.value,
    "White, Non-Hispanic": std_col.Race.WHITE_NH.value,
    "Hispanic/Latino": std_col.Race.HISP.value,
    "NA": std_col.Race.UNKNOWN.value,
    "Missing": std_col.Race.UNKNOWN.value,
    "Unknown": std_col.Race.UNKNOWN.value,
}

SEX_NAMES_MAPPING = {
    "NA": "Unknown",
    "Missing": "Unknown",
    "Unknown": "Unknown",
}

AGE_NAMES_MAPPING = {
    "0 - 9 Years": "0-9",
    "10 - 19 Years": "10-19",
    "20 - 29 Years": "20-29",
    "30 - 39 Years": "30-39",
    "40 - 49 Years": "40-49",
    "50 - 59 Years": "50-59",
    "60 - 69 Years": "60-69",
    "70 - 79 Years": "70-79",
    "80+ Years": "80+",
    "NA": "Unknown",
    "Missing": "Unknown",
}


def accumulate_data(df, groupby_cols, overall_df, demographic_col,
                    names_mapping):
    """Converts/adds columns for cases, hospitalizations, deaths. Does some
    basic standardization of dataframe elements. Groups by given groupby_cols
    and aggregates. Returns sum of the aggregated df & overall_df.

    df: Pandas dataframe that contains a chunk of all of the raw data.
    groupby_cols: List of columns we want to groupby / aggregate on.
    overall_df: Pandas dataframe to add our aggregated data to.
    demographic_col: Name of the demographic column to standardize.
    names_mapping: Mapping from demographic value to standardized form.
    """
    # Add a columns of all ones, for counting the # of cases / records.
    df[std_col.COVID_CASES] = np.ones(df.shape[0], dtype=int)

    # Add columns for hospitalization yes/no/unknown and death yes/no/unknown,
    # as we aggregate and count these individually. Do a sanity check that we
    # covered all the data and drop the original hospitalization/death columns.
    df[std_col.COVID_HOSP_Y] = (df['hosp_yn'] == 'Yes')
    df[std_col.COVID_HOSP_N] = (df['hosp_yn'] == 'No')
    df[std_col.COVID_HOSP_UNKNOWN] = ((df['hosp_yn'] == 'Unknown') |
                                      (df['hosp_yn'] == 'Missing') |
                                      (df['hosp_yn'] == 'nul') |
                                      (df['hosp_yn'] == 'OTH'))
    df[std_col.COVID_DEATH_Y] = (df['death_yn'] == 'Yes')
    df[std_col.COVID_DEATH_N] = (df['death_yn'] == 'No')
    df[std_col.COVID_DEATH_UNKNOWN] = ((df['death_yn'] == 'Unknown') |
                                       (df['death_yn'] == 'Missing'))

    check_hosp = (df[std_col.COVID_HOSP_Y] | df[std_col.COVID_HOSP_N] |
                  df[std_col.COVID_HOSP_UNKNOWN]).all()
    check_deaths = (df[std_col.COVID_DEATH_Y] | df[std_col.COVID_DEATH_N] |
                    df[std_col.COVID_DEATH_UNKNOWN]).all()

    assert check_hosp, "All possible hosp_yn values are not accounted for"
    assert check_deaths, "All possible death_yn values are not accounted for"

    df = df.drop(columns=['hosp_yn', 'death_yn'])

    # Standardize the values in demographic_col using names_mapping.
    df = df.replace({demographic_col: names_mapping})

    # Group by the desired columns and compute the sum/counts of
    # cases/hospitalizations/deaths. Add this df to overall_df.
    df = df.groupby(groupby_cols).sum().reset_index()
    df = df.set_index(groupby_cols)
    if not overall_df.empty:
        return overall_df.add(df, fill_value=0)
    return df


def sanity_check_data(df):
    # Perform some simple sanity checks that we are covering all the data.
    cases = df[std_col.COVID_CASES]
    assert cases.equals(df[std_col.COVID_HOSP_Y] + df[std_col.COVID_HOSP_N] +
                        df[std_col.COVID_HOSP_UNKNOWN])
    assert cases.equals(df[std_col.COVID_DEATH_Y] + df[std_col.COVID_DEATH_N] +
                        df[std_col.COVID_DEATH_UNKNOWN])


def standardize_data(df):
    """Standardizes the data by cleaning string values and standardizing column
    names.

    df: Pandas dataframe to standardize.
    """
    # Clean string values in the dataframe.
    df = df.applymap(
        lambda x: x.replace('"', '').strip() if isinstance(x, str) else x)

    # Standardize column names.
    return df.rename(columns=COL_NAME_MAPPING)


def main():
    dir = input("Enter the path to the CDC restricted data CSV files: ")
    prefix = input("Enter the prefix for the CDC restricted CSV files: ")

    # Get the files in the specified directory which match the prefix.
    matching_files = []
    files = [
        f for f in os.listdir(dir) if os.path.isfile(os.path.join(dir, f))]
    for f in files:
        filename_parts = f.split('.')
        if (len(filename_parts) == 2 and prefix in filename_parts[0] and
                filename_parts[1] == 'csv'):
            matching_files.append(f)

    if len(matching_files) == 0:
        print("Unable to find any files that match the prefix!")
        sys.exit()

    print("Matching files: ")
    for f in matching_files:
        print(f)

    # Go through the CSV files, chunking each and grouping by columns we want.
    all_dfs = {}
    for geo in ['state', 'county']:
        for demo in ['race', 'sex', 'age']:
            all_dfs[(geo, demo)] = pd.DataFrame()

    # Mapping from geo and demo to relevant column(s) in the data. The demo
    # mapping also includes the values mapping for transforming values to their
    # standardized form.
    geo_col_mapping = {'state': [STATE_COL], 'county': COUNTY_COLS}
    demographic_col_mapping = {
        'race': (RACE_COL, RACE_NAMES_MAPPING),
        'sex': (SEX_COL, SEX_NAMES_MAPPING),
        'age': (AGE_COL, AGE_NAMES_MAPPING),
    }

    for f in sorted(matching_files):
        start = time.time()

        # Note that we read CSVs with keep_default_na = False as we want to
        # prevent pandas from interpreting "NA" in the data as NaN
        chunked_frame = pd.read_csv(os.path.join(dir, f), dtype=str,
                                    chunksize=100000, keep_default_na=False)
        for chunk in chunked_frame:
            # We first do a bit of cleaning up of geo values and str values.
            df = chunk.replace({COUNTY_FIPS_COL: COUNTY_FIPS_NAMES_MAPPING})
            df = df.replace({COUNTY_COL: COUNTY_NAMES_MAPPING})
            df = df.replace({STATE_COL: STATE_NAMES_MAPPING})

            def _clean_str(x):
                return x.replace('"', '').strip() if isinstance(x, str) else x
            df = df.applymap(_clean_str)

            # For each of ({state, county} x {race, sex, age}), we slice the
            # data to focus on that dimension and aggregate.
            for (geo, demo), _ in all_dfs.items():
                # Build the columns we will group by.
                geo_cols = geo_col_mapping[geo]
                demog_col, demog_names_mapping = demographic_col_mapping[demo]
                groupby_cols = geo_cols + [demog_col]

                # Slice the data and aggregate for the given dimension.
                sliced_df = df[groupby_cols + OUTCOME_COLS]
                all_dfs[(geo, demo)] = accumulate_data(
                    sliced_df, groupby_cols, all_dfs[(geo, demo)], demog_col,
                    demog_names_mapping)

        end = time.time()
        print("Took", round(end - start, 2), "seconds to process file", f)

    # Post-processing of the data.
    for key in all_dfs:
        # Some brief sanity checks to make sure the data is OK.
        sanity_check_data(all_dfs[key])

        # The outcomes data is automatically converted to float when the chunks
        # are added together, so we convert back to int here. We also reset the
        # index for simplicity.
        all_dfs[key] = all_dfs[key].astype(int).reset_index()

        # Standardize the column names and race/age/sex values.
        all_dfs[key] = standardize_data(all_dfs[key])

    # Write the results out to CSVs.
    for (geo, demo), df in all_dfs.items():
        file_path = os.path.join(dir, f"cdc_restricted_by_{demo}_{geo}.csv")
        df.to_csv(file_path, index=False)


if __name__ == "__main__":
    main()
