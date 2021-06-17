"""
This program is intended to be run locally by someone who has access to the CDC
restricted public surveillance data and has downloaded the latest version of
the data from the secure GCS bucket to their local machine. It requires as
flags path and prefix of the CSV files which make up the CDC restricted data
(e.g. "COVID_Cases_Restricted_Detailed_01312021" is the prefix for the 1/31/21
data performs aggregation and standardization, and outputs the resulting CSV
to the same path that was input. The resulting CSVs are intended to be uploaded
to the manual-uploads GCS bucket for consumption by the ingestion pipeline.

Example usage:
python cdc_restricted_local.py --dir="/Users/vanshkumar/Downloads" --prefix="COVID_Cases_Restricted_Detailed_01312021"
"""

import argparse
import os
import sys
import time

import ingestion.standardized_columns as std_col
import numpy as np
import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'


# Command line flags for the dir and file name prefix for the data.
parser = argparse.ArgumentParser()
parser.add_argument("-dir", "--dir", help="Path to the CDC restricted data CSV files")
parser.add_argument("-prefix", "--prefix", help="Prefix for the CDC restricted CSV files")

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
    STATE_COL: std_col.STATE_POSTAL_COL,
    COUNTY_FIPS_COL: std_col.COUNTY_FIPS_COL,
    COUNTY_COL: std_col.COUNTY_NAME_COL,
    RACE_COL: std_col.RACE_CATEGORY_ID_COL,
    SEX_COL: std_col.SEX_COL,
    AGE_COL: std_col.AGE_COL,
}

# Mapping for county_fips, county, and state unknown values to "Unknown".
COUNTY_FIPS_NAMES_MAPPING = {"NA": ""}
COUNTY_NAMES_MAPPING = {"Missing": "Unknown", "NA": "Unknown"}
STATE_NAMES_MAPPING = {"Missing": "Unknown", "NA": "Unknown"}

# Mappings for race, sex, and age values in the data to a standardized forms.
# Note that these mappings exhaustively cover the possible values in the data
# as of the latest dataset. New data should be checked for schema changes.
RACE_NAMES_MAPPING = {
    "American Indian/Alaska Native, Non-Hispanic": std_col.Race.AIAN_NH.value,
    "Asian, Non-Hispanic": std_col.Race.ASIAN_NH.value,
    "Black, Non-Hispanic": std_col.Race.BLACK_NH.value,
    "Multiple/Other, Non-Hispanic": std_col.Race.MULTI_OR_OTHER_STANDARD_NH.value,
    "Native Hawaiian/Other Pacific Islander, Non-Hispanic": std_col.Race.NHPI_NH.value,
    "White, Non-Hispanic": std_col.Race.WHITE_NH.value,
    "Hispanic/Latino": std_col.Race.HISP.value,
    "NA": std_col.Race.UNKNOWN.value,
    "Missing": std_col.Race.UNKNOWN.value,
    "Unknown": std_col.Race.UNKNOWN.value,
}

SEX_NAMES_MAPPING = {
    "Male": "Male",
    "Female": "Female",
    "Other": "Other",
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

# Mapping from geo and demo to relevant column(s) in the data. The demo
# mapping also includes the values mapping for transforming demographic values
# to their standardized form.
GEO_COL_MAPPING = {'state': [STATE_COL], 'county': COUNTY_COLS}
DEMOGRAPHIC_COL_MAPPING = {
    'race': (RACE_COL, RACE_NAMES_MAPPING),
    'sex': (SEX_COL, SEX_NAMES_MAPPING),
    'age': (AGE_COL, AGE_NAMES_MAPPING),
}

# States that we have decided to suppress different kinds of data for, due to
# very incomplete data. Note that states that have all data suppressed will
# have case, hospitalization, and death data suppressed.
# See https://github.com/SatcherInstitute/health-equity-tracker/issues/617.
ALL_DATA_SUPPRESSION_STATES = ("LA", "MO", "MS", "ND", "TX", "WY")
HOSP_DATA_SUPPRESSION_STATES = ("HI", "MD", "NE", "NM", "RI", "SD")
DEATH_DATA_SUPPRESSION_STATES = ("HI", "MD", "NE", "NM", "RI", "SD",
                                 "WV", "DE")


def accumulate_data(df, geo_cols, overall_df, demog_col, names_mapping):
    """Converts/adds columns for cases, hospitalizations, deaths. Does some
    basic standardization of dataframe elements. Groups by given groupby_cols
    and aggregates. Returns sum of the aggregated df & overall_df.

    df: Pandas dataframe that contains a chunk of all of the raw data.
    geo_cols: List of geo columns we want to groupby / aggregate on.
    overall_df: Pandas dataframe to add our aggregated data to.
    demog_col: Name of the demographic column to aggregate on & standardize.
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
                                      (df['hosp_yn'] == 'Missing'))
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

    # Standardize the values in demog_col using names_mapping.
    df = df.replace({demog_col: names_mapping})

    # Group by the geo and demographic columns and compute the sum/counts of
    # cases/hospitalizations/deaths. Add total rows and add to overall_df.
    groupby_cols = geo_cols + [demog_col]
    df = df.groupby(groupby_cols).sum().reset_index()
    totals = df.groupby(geo_cols).sum().reset_index()
    if demog_col == RACE_COL:  # Special case required due to later processing.
        totals[demog_col] = std_col.Race.TOTAL.value
    else:
        totals[demog_col] = std_col.TOTAL_VALUE
    df = df.append(totals)
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
    df = df.rename(columns=COL_NAME_MAPPING)

    # Add race metadata columns.
    if std_col.RACE_CATEGORY_ID_COL in df.columns:
        std_col.add_race_columns_from_category_id(df)

    return df


def process_data(dir, files):
    """Given a directory and a list of files which contain line item-level
    covid data, standardizes and aggregates by race, age, and sex. Returns a
    map from (geography, demographic) to the associated dataframe.

    dir: Directory in which the files live.
    files: List of file paths that contain covid data.
    """
    all_dfs = {}
    for geo in ['state', 'county']:
        for demo in ['race', 'sex', 'age']:
            all_dfs[(geo, demo)] = pd.DataFrame()

    for f in sorted(files):
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

            # For county fips, we make sure they are strings of length 5 as per
            # our standardization (ignoring empty values).
            df[COUNTY_FIPS_COL] = df[COUNTY_FIPS_COL].map(
                lambda x: x.zfill(5) if len(x) > 0 else x)

            # Remove records from states where we want to suppress all data.
            df = df[~df[STATE_COL].isin(ALL_DATA_SUPPRESSION_STATES)]

            # For each of ({state, county} x {race, sex, age}), we slice the
            # data to focus on that dimension and aggregate.
            for (geo, demo), _ in all_dfs.items():
                # Build the columns we will group by.
                geo_cols = GEO_COL_MAPPING[geo]
                demog_col, demog_names_mapping = DEMOGRAPHIC_COL_MAPPING[demo]

                # Slice the data and aggregate for the given dimension.
                sliced_df = df[geo_cols + [demog_col] + OUTCOME_COLS]
                all_dfs[(geo, demo)] = accumulate_data(
                    sliced_df, geo_cols, all_dfs[(geo, demo)], demog_col,
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

        # Set hospitalization and death data for states we want to suppress to
        # an empty string, indicating missing data.
        rows_to_modify = all_dfs[key][std_col.STATE_POSTAL_COL].isin(
            HOSP_DATA_SUPPRESSION_STATES)
        all_dfs[key].loc[rows_to_modify, std_col.COVID_HOSP_Y] = ""
        all_dfs[key].loc[rows_to_modify, std_col.COVID_HOSP_N] = ""
        all_dfs[key].loc[rows_to_modify, std_col.COVID_HOSP_UNKNOWN] = ""

        rows_to_modify = all_dfs[key][std_col.STATE_POSTAL_COL].isin(
            DEATH_DATA_SUPPRESSION_STATES)
        all_dfs[key].loc[rows_to_modify, std_col.COVID_DEATH_Y] = ""
        all_dfs[key].loc[rows_to_modify, std_col.COVID_DEATH_N] = ""
        all_dfs[key].loc[rows_to_modify, std_col.COVID_DEATH_UNKNOWN] = ""

        # Standardize all None/NaNs in the data to an empty string, and convert
        # everything to string before returning & writing to CSV.
        all_dfs[key] = all_dfs[key].fillna("").astype(str)

    return all_dfs


def main():
    # Get the dir and prefix from the command line flags.
    args = parser.parse_args()
    dir = args.dir
    prefix = args.prefix

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

    all_dfs = process_data(dir, matching_files)

    # Write the results out to CSVs.
    for (geo, demo), df in all_dfs.items():
        file_path = os.path.join(dir, f"cdc_restricted_by_{demo}_{geo}.csv")
        df.to_csv(file_path, index=False)


if __name__ == "__main__":
    main()
