import ingestion.standardized_columns as std_col
import numpy as np
import os
import pandas as pd
pd.options.mode.chained_assignment = None  # default='warn'
import sys
import time


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

# These are the columns that we want to keep from the data. We split them out
# by geo columns (we always break down by these), race/sex/age columns (we
# break down by one of these at a time), and outcome columns, which are the
# measured variables.
GEO_COLS = ['county_fips_code', 'res_county', 'res_state']
RACE_COL = 'race_ethnicity_combined'
SEX_COL = 'sex'
AGE_COL = 'age_group'
OUTCOME_COLS = ['hosp_yn', 'death_yn']

# Mapping from column name in the data to standardized version.
COL_NAME_MAPPING = {
    GEO_COLS[0]: std_col.COUNTY_FIPS_COL,
    GEO_COLS[1]: std_col.COUNTY_NAME_COL,
    GEO_COLS[2]: std_col.STATE_NAME_COL,
    RACE_COL: std_col.RACE_OR_HISPANIC_COL,
    SEX_COL: std_col.SEX_COL,
    AGE_COL: std_col.AGE_COL,
}

# Mappings for race & age values in the data to their standardized forms.
RACE_VALUES_MAPPING = {
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

AGE_VALUES_MAPPING = {
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
    "Unknown": "Unknown",
}


def accumulate_data(df, groupby_cols, overall_df, breakdown_col=None,
                    values_mapping=None):
    """Converts/adds columns for cases, hospitalizations, deaths. Does some
    basic standardization of dataframe elements. Groups by given groupby_cols
    and aggregates. Returns sum of the aggregated df & overall_df.

    df: Pandas dataframe that contains a chunk of all of the raw data.
    groupby_cols: List of columns we want to groupby / breakdown on.
    overall_df: Pandas dataframe to add our aggregated data to.
    breakdown_col: Name of the breakdown column to standardize.
    values_mapping: Mapping from breakdown value to standardized form.
    """
    # Add a columns of all ones, for counting the # of cases for a breakdown.
    df[std_col.COVID_CASES] = np.ones(df.shape[0], dtype=int)

    # Add columns for hospitalization yes/no/unknown and death yes/no/unknown,
    # as we aggregate and count these individually. Do a sanity check that we
    # covered all the data and drop the original hospitalization/death columns.
    df[std_col.COVID_HOSP_Y] = (df['hosp_yn'] == 'Yes')
    df[std_col.COVID_HOSP_N] = (df['hosp_yn'] == 'No')
    df[std_col.COVID_HOSP_UNKNOWN] = ((df['hosp_yn'] == 'Unknown') |
                                      (df['hosp_yn'] == 'Missing') |
                                      (df['hosp_yn'] == 'OTH'))
    df[std_col.COVID_DEATH_Y] = (df['death_yn'] == 'Yes')
    df[std_col.COVID_DEATH_N] = (df['death_yn'] == 'No')
    df[std_col.COVID_DEATH_UNKNOWN] = ((df['death_yn'] == 'Unknown') |
                                       (df['death_yn'] == 'Missing'))

    assert (df[std_col.COVID_HOSP_Y] | df[std_col.COVID_HOSP_N] |
            df[std_col.COVID_HOSP_UNKNOWN]).all()
    assert (df[std_col.COVID_DEATH_Y] | df[std_col.COVID_DEATH_N] |
            df[std_col.COVID_DEATH_UNKNOWN]).all()

    df = df.drop(columns='hosp_yn')
    df = df.drop(columns='death_yn')

    # If given, standardize the values in breakdown_col using values_mapping.
    if breakdown_col is not None:
        df = df.replace({breakdown_col: values_mapping})

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
    race_df = pd.DataFrame()
    sex_df = pd.DataFrame()
    age_df = pd.DataFrame()
    for f in sorted(matching_files):
        start = time.time()
        chunked_frame = pd.read_csv(
            os.path.join(dir, f), dtype=str, chunksize=100000)
        for chunk in chunked_frame:
            # For each of {race, sex, age}, we slice the data to focus on that
            # breakdown, and then aggregate by geo + that breakdown.
            df = chunk[GEO_COLS + OUTCOME_COLS + [RACE_COL]]
            race_df = accumulate_data(df, GEO_COLS + [RACE_COL], race_df,
                                      RACE_COL, RACE_VALUES_MAPPING)

            df = chunk[GEO_COLS + OUTCOME_COLS + [SEX_COL]]
            sex_df = accumulate_data(df, GEO_COLS + [SEX_COL], sex_df)

            df = chunk[GEO_COLS + OUTCOME_COLS + [AGE_COL]]
            age_df = accumulate_data(df, GEO_COLS + [AGE_COL], age_df, AGE_COL,
                                     AGE_VALUES_MAPPING)
        end = time.time()
        print("Took", round(end - start, 2), "seconds to process file", f)

    # Some brief sanity checks to make sure the data is OK.
    sanity_check_data(race_df)
    sanity_check_data(sex_df)
    sanity_check_data(age_df)

    # The outcomes data is automatically converted to float when the chunks
    # are added together, so we convert back to int here. We also reset the
    # the index for simplicity.
    race_df = race_df.astype(int).reset_index()
    sex_df = sex_df.astype(int).reset_index()
    age_df = age_df.astype(int).reset_index()

    # Standardize the column names and race/age/sex values.
    race_df = standardize_data(race_df)
    sex_df = standardize_data(sex_df)
    age_df = standardize_data(age_df)

    # Write the results out to CSVs.
    race_df.to_csv(
        os.path.join(dir, "cdc_restricted_by_race_county.csv"), index=False)
    sex_df.to_csv(
        os.path.join(dir, "cdc_restricted_by_sex_county.csv"), index=False)
    age_df.to_csv(
        os.path.join(dir, "cdc_restricted_by_age_county.csv"), index=False)


if __name__ == "__main__":
    main()
