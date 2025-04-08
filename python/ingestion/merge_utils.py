import pandas as pd  # type: ignore
import ingestion.standardized_columns as std_col
from functools import reduce
from ingestion.constants import US_FIPS, US_NAME, US_ABBR, COUNTY_LEVEL, NATIONAL_LEVEL, STATE_LEVEL, ALL_VALUE
from typing import Literal, List, Union, Type, Optional, Tuple, Dict
import os

ACS_EARLIEST_YEAR = "2009"
ACS_CURRENT_YEAR = "2022"
DECIA_CUTOFF_YEAR = "2016"


# This works for both local runs and also in a container within the /app directory
INGESTION_DIR = os.path.dirname(os.path.abspath(__file__))
ACS_MERGE_DATA_DIR = os.path.join(INGESTION_DIR, "acs_population")
DECIA_2010_MERGE_DATA_DIR = os.path.join(INGESTION_DIR, "decia_2010_territory_population")
DECIA_2020_MERGE_DATA_DIR = os.path.join(INGESTION_DIR, "decia_2020_territory_population")
FIPS_CODES_DIR = os.path.join(INGESTION_DIR, "fips_codes")
COUNTY_LEVEL_FIPS_CSV = os.path.join(FIPS_CODES_DIR, "county_level_fips.csv")
STATE_LEVEL_FIPS_CSV = os.path.join(FIPS_CODES_DIR, "state_level_fips.csv")


def merge_county_names(df: pd.DataFrame) -> pd.DataFrame:
    """Merges standardized county names by county FIPS code downloaded from
    `census_utility` big query public dataset into an existing county level dataframe
    Any existing 'county_name' data in the incoming df will be overwritten.

    Parameters:
        df: county-level dataframe with a 'county_fips' column containing 5-digit FIPS code strings
    Returns:
        The same df with 'county_name' column filled with standardized county names
    """

    if std_col.COUNTY_FIPS_COL not in df.columns:
        raise ValueError(
            "df must be county-level with `county_fips` col of 5 digit FIPS strings."
            + f"This dataframe only contains these columns: {list(df.columns)}"
        )

    county_level_fips_df = pd.read_csv(COUNTY_LEVEL_FIPS_CSV, dtype=str)

    if std_col.COUNTY_NAME_COL in df.columns:
        df = df.drop(columns=std_col.COUNTY_NAME_COL)

    df = pd.merge(df, county_level_fips_df, how="left", on=std_col.COUNTY_FIPS_COL).reset_index(drop=True)

    return df


def merge_state_ids(df, keep_postal=False):
    """Accepts a df that may be lacking state info (like names, FIPS codes or postal codes)
    and merges in the missing columns with info downloaded from`census_utility` big query public dataset.

    Parameters:
       df: dataframe to missing info into, with at least one of the following columns:
        `state_name`, `state_postal`, `state_fips`
       keep_postal: if True, keeps the `state_postal` column, default False
    Returns:
        the same df with a 'state_fips' column containing 2-digit string FIPS codes,
        a 'state_name' column containing the standardize name,
        and optionally a 'state_postal' columns with the 2-letter postal codes
    """

    if (
        std_col.STATE_NAME_COL not in df.columns
        and std_col.STATE_POSTAL_COL not in df.columns
        and std_col.STATE_FIPS_COL not in df.columns
    ):
        raise ValueError(
            "Dataframe must be a state-level table "
            + "with at least one of the following columns: "
            + "`state_name`, `state_fips` (2 digit FIPS strings), "
            + " or `state_postal` containing 2 digit FIPS strings."
            + f"This dataframe only contains these columns: {list(df.columns)}"
        )

    state_level_fips_df = pd.read_csv(STATE_LEVEL_FIPS_CSV, dtype=str)

    united_states_fips = pd.DataFrame(
        [
            {
                "state_fips_code": US_FIPS,
                "state_name": US_NAME,
                "state_postal_abbreviation": US_ABBR,
            }
        ]
    )

    unknown_fips = pd.DataFrame(
        [
            {
                "state_fips_code": "Unknown",
                "state_name": "Unknown",
                "state_postal_abbreviation": "Unknown",
            }
        ]
    )

    state_level_fips_df = state_level_fips_df[["state_fips_code", "state_name", "state_postal_abbreviation"]]
    state_level_fips_df = pd.concat([state_level_fips_df, united_states_fips, unknown_fips])

    state_level_fips_df = state_level_fips_df.rename(
        columns={
            "state_fips_code": std_col.STATE_FIPS_COL,
            "state_postal_abbreviation": std_col.STATE_POSTAL_COL,
        }
    ).reset_index(drop=True)

    merge_col = std_col.STATE_NAME_COL
    if std_col.STATE_POSTAL_COL in df.columns:
        merge_col = std_col.STATE_POSTAL_COL
    if std_col.STATE_FIPS_COL in df.columns:
        merge_col = std_col.STATE_FIPS_COL

    df = pd.merge(df, state_level_fips_df, how="left", on=merge_col).reset_index(drop=True)

    if (not keep_postal) and (std_col.STATE_POSTAL_COL in df.columns):
        df = df.drop(columns=std_col.STATE_POSTAL_COL)

    return df


def merge_pop_numbers(df, demo: Literal["age", "sex", "race"], loc: Literal["county", "state", "national"]):
    """Merges the corresponding `population` and `population_pct` column into the given df

    df: a pandas df with demographic column and a `state_fips` column
    demo: the demographic in the df, either `age`, `race`, or `sex`
    loc: the location level for the df, either `county`, `state`, or `national`"""

    return _merge_pop(df, demo, loc)


def merge_yearly_pop_numbers(
    df: pd.DataFrame,
    demo: Literal["age", "race", "sex"],
    geo_level: Literal["county", "state", "national"],
) -> pd.DataFrame:
    """Merges multiple years of population data onto incoming df
    that contains a `time_period` col of 4 digit string year values

    For states/counties + PR + DC:
    - Any rows where the year is earlier than 2009 will be merged as `null`
    - Any rows where the year is present in our ACS tables will be merged directly
    - Any rows where the year is later than most recent ACS year will be merged
    with that most recent year of ACS population data
    - Any rows with year 2009-2015 for Island Area territories will
        merge against the 2010 Decennial from `decia_2010`
    - Any rows with year 2016-current for Island Area territories / county-equivalents
        will merge against the 2020 Decennial from `decia_2020`

    df: pandas df with a demographic col, and `time_period` col, and a fips col
    demo: the demographic in the df
    geo_level: the location level for the df
    """

    if std_col.TIME_PERIOD_COL not in df.columns:
        raise ValueError("Cannot merge by year as the provided df does not contain a `time_period` col")

    # list to collect pre-acs, acs, and post-acs df sections
    sub_dfs: List[pd.DataFrame] = []

    _tmp_time_period_col = "temp_time_period_col_as_int"
    df[_tmp_time_period_col] = df[std_col.TIME_PERIOD_COL].astype(int)

    # dont merge pre-2009 years
    pre_acs_rows_df = df[df[_tmp_time_period_col] < int(ACS_EARLIEST_YEAR)]
    if len(pre_acs_rows_df) > 0:
        sub_dfs.append(pre_acs_rows_df)

    # merge matchable years directly
    acs_rows_df = df.loc[
        (df[_tmp_time_period_col] >= int(ACS_EARLIEST_YEAR)) & (df[_tmp_time_period_col] <= int(ACS_CURRENT_YEAR))
    ]
    if len(acs_rows_df) > 0:
        acs_rows_df = _merge_pop(acs_rows_df, demo, geo_level, on_time_period=True)
        sub_dfs.append(acs_rows_df)

    # merge most recent SOURCE data (without equiv years from ACS) with most recent ACS data
    post_acs_rows_df = df[df[_tmp_time_period_col] > int(ACS_CURRENT_YEAR)]
    if len(post_acs_rows_df) > 0:
        # temporarily save the original SOURCE years in a new column
        _tmp_src_yr_col = "temp_source_year_col"
        post_acs_rows_df = post_acs_rows_df.copy()
        post_acs_rows_df.loc[:, _tmp_src_yr_col] = post_acs_rows_df[std_col.TIME_PERIOD_COL]

        # set the mergeable column year to the most recent to merge that data from ACS
        post_acs_rows_df[std_col.TIME_PERIOD_COL] = ACS_CURRENT_YEAR
        # merge that recent year pop data
        post_acs_rows_df = _merge_pop(post_acs_rows_df, demo, geo_level, on_time_period=True)

        # swap back to the real year data
        post_acs_rows_df[std_col.TIME_PERIOD_COL] = post_acs_rows_df[_tmp_src_yr_col]
        post_acs_rows_df = post_acs_rows_df.drop(columns=[_tmp_src_yr_col])
        sub_dfs.append(post_acs_rows_df)

    # combine the three sub-dfs
    df = pd.concat(sub_dfs, axis=0).reset_index(drop=True)
    df = df.drop(columns=[_tmp_time_period_col])

    return df


def merge_multiple_pop_cols(
    df: pd.DataFrame, demo: Literal["age", "race", "sex", "race_and_ethnicity"], condition_cols: List[str]
):
    """Merges the population of each state into a column for each condition in `condition_cols`.
       If a condition is NaN for that state the population gets counted as zero.

       This function must be called on a state level dataset.

      df: a pandas df with demographic (race, sex, or age) and a `state_fips` column
      demo: the demographic in the df, either `age`, `race`, or `sex`
      condition_cols: a list of strings which will serve as the col names to be added e.g.:
    ['condition_a_population', 'condition_b_population']"""

    df = _merge_pop(df, demo, STATE_LEVEL)

    for col in condition_cols:
        df[col] = df[std_col.POPULATION_COL]

    df = df.drop(columns=[std_col.POPULATION_COL, std_col.POPULATION_PCT_COL])
    return df


def _merge_pop(df, demo, geo_level, on_time_period: Optional[bool] = None):
    on_col_map = {
        "age": std_col.AGE_COL,
        "race": std_col.RACE_CATEGORY_ID_COL,
        "race_and_ethnicity": std_col.RACE_CATEGORY_ID_COL,
        "sex": std_col.SEX_COL,
    }

    pop_dtype = {
        std_col.STATE_FIPS_COL: str,
        std_col.POPULATION_COL: float,
        std_col.POPULATION_PCT_COL: float,
    }

    if geo_level == COUNTY_LEVEL:
        pop_dtype[std_col.COUNTY_FIPS_COL] = str

    if demo not in on_col_map:
        raise ValueError(f"{demo} not a demographic option, must be one of: {list(on_col_map.keys())}")

    acs_demo = "race" if demo == std_col.RACE_OR_HISPANIC_COL else demo

    pop_table_name = f"{acs_demo}_{geo_level}"

    print(f"\nMerging real ACS population from python/ingestion/acs_population/{pop_table_name}")

    if on_time_period:
        pop_table_name += "_historical"
        pop_dtype[std_col.TIME_PERIOD_COL] = str
    else:
        pop_table_name += "_current"

    pop_file = os.path.join(ACS_MERGE_DATA_DIR, f"{pop_table_name}.csv")
    pop_df = pd.read_csv(pop_file, dtype=pop_dtype)

    needed_cols = [on_col_map[demo], std_col.POPULATION_COL, std_col.POPULATION_PCT_COL]

    if std_col.STATE_FIPS_COL in df.columns:
        needed_cols.append(std_col.STATE_FIPS_COL)

    if geo_level == COUNTY_LEVEL:
        needed_cols.append(std_col.COUNTY_FIPS_COL)

    keep_cols = [*needed_cols, std_col.TIME_PERIOD_COL] if on_time_period else needed_cols

    pop_df = pop_df[keep_cols]

    # merge pop data for other territories/county-equivalents
    # from DECIA_2020 (VI, GU, AS, MP)
    if geo_level != NATIONAL_LEVEL:
        pop_terr_table_name = f"{demo}_{geo_level}_current"

        terr_pop_dtype = {
            std_col.STATE_FIPS_COL: str,
            std_col.POPULATION_COL: float,
            std_col.POPULATION_PCT_COL: float,
        }

        if geo_level == COUNTY_LEVEL:
            terr_pop_dtype[std_col.COUNTY_FIPS_COL] = str

        pop_terr_2020_file = os.path.join(DECIA_2020_MERGE_DATA_DIR, f"{pop_terr_table_name}.csv")
        pop_terr_2020_df = pd.read_csv(pop_terr_2020_file, dtype=terr_pop_dtype)

        pop_terr_df = pop_terr_2020_df[needed_cols]

        if on_time_period:
            # re-use 2020 territory populations in every ACS year 2016-current
            # load and use 2010 territory populations in every ACS year 2009-2015, only state not county level
            pop_terr_2010_file = (
                pop_terr_2020_file
                if geo_level == COUNTY_LEVEL
                else os.path.join(DECIA_2010_MERGE_DATA_DIR, f"{pop_terr_table_name}.csv")
            )
            pop_terr_2010_df = pd.read_csv(pop_terr_2010_file, dtype=terr_pop_dtype)

            pop_terr_2010_df = pop_terr_2010_df[needed_cols]

            yearly_pop_terr_dfs = []
            start_year = int(ACS_EARLIEST_YEAR)
            end_year = max(df[std_col.TIME_PERIOD_COL].astype(int)) + 1
            for year_num in range(start_year, end_year):
                year_str = str(year_num)
                yearly_df = pop_terr_2010_df.copy() if year_num < int(DECIA_CUTOFF_YEAR) else pop_terr_df.copy()
                yearly_df[std_col.TIME_PERIOD_COL] = year_str
                yearly_pop_terr_dfs.append(yearly_df)

            # add all territory years together
            pop_terr_df = pd.concat(yearly_pop_terr_dfs)

        # add either time_series or single year territory rows to states rows
        pop_df = pd.concat([pop_df, pop_terr_df])

    on_cols = [on_col_map[demo]]
    if std_col.STATE_FIPS_COL in df.columns:
        on_cols.append(std_col.STATE_FIPS_COL)

    if geo_level == COUNTY_LEVEL:
        on_cols.append(std_col.COUNTY_FIPS_COL)

    if on_time_period:
        on_cols.append(std_col.TIME_PERIOD_COL)

    df = pd.merge(df, pop_df, how="left", on=on_cols)

    return df.reset_index(drop=True)


def merge_intersectional_pop(
    df: pd.DataFrame,
    geo_level: Literal["national", "state", "county"],
    primary_demo_col: Literal["age", "race_and_ethnicity", "sex", "race"],
    race_specific_group: Optional[str] = None,
    age_specific_group: Optional[str] = None,
    sex_specific_group: Optional[str] = None,
) -> Tuple[pd.DataFrame, str]:
    """
    Merges specific cross-section pop from ACS, for later use with dataset_utils.generate_estimated_total_col()

    Parameters:
    - df: The DataFrame to be processed.
    - geo_level: The geo level of the DataFrame, e.g. 'state'.
    - primary_demo_col: The name of the disaggregated demographic column to be included in the DataFrame,
    e.g. 'race_and_ethnicity' with one row per race group.
    - race_specific_group: The name of the race-specific sub-group to use from the reference population.
    - age_specific_group: The name of the age-specific sub-group to use from the reference population.
    - sex_specific_group: The name of the sex-specific sub-group to use from the reference population.

    NOTE: This function and the the specific group kwargs above are needed when the df is for a specific population,
    like "adults by race", or "black women by age". In this case, we must use this specific subset population
    for our estimate calculation, rather than the entire reference population.

    Returns:
    - tuple containing the merged DataFrame and the string name of the added intersectional population column.
    """

    if primary_demo_col == std_col.RACE_COL:
        primary_demo_col = "race_and_ethnicity"

    pop_dtype: Dict[str, Union[Type[float], Type[str]]] = {
        std_col.POPULATION_COL: float,
    }

    geo_file = ""

    if geo_level == COUNTY_LEVEL:
        pop_dtype[std_col.COUNTY_FIPS_COL] = str
        geo_file = COUNTY_LEVEL
    if geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:
        pop_dtype[std_col.STATE_FIPS_COL] = str
        geo_file = STATE_LEVEL

    pop_file = os.path.join(ACS_MERGE_DATA_DIR, f"multi_sex_age_race_{geo_file}_current.csv")
    pop_df = pd.read_csv(pop_file, dtype=pop_dtype)

    if geo_level == NATIONAL_LEVEL:
        pop_df = sum_states_to_national(pop_df)

    # the primary demographic breakdown can't use a specific group
    if primary_demo_col == "race_and_ethnicity" and race_specific_group:
        raise ValueError("race_specific_group kwarg is not applicable when primary_demo_col is race.")
    if primary_demo_col == "age" and age_specific_group:
        raise ValueError("age_specific_group kwarg is not applicable when primary_demo_col is age.")
    if primary_demo_col == "sex" and sex_specific_group:
        raise ValueError("sex_specific_group kwarg is not applicable when primary_demo_col is sex.")

    if age_specific_group == "18+":
        pop_df = sum_age_groups(pop_df, "18+")

    specific_group_map = {}
    specific_group_map[std_col.RACE_OR_HISPANIC_COL] = ALL_VALUE if race_specific_group is None else race_specific_group
    specific_group_map[std_col.AGE_COL] = ALL_VALUE if age_specific_group is None else age_specific_group
    specific_group_map[std_col.SEX_COL] = ALL_VALUE if sex_specific_group is None else sex_specific_group

    pop_col = std_col.POPULATION_COL
    for group in specific_group_map.values():
        if group != ALL_VALUE:
            group = group.replace("+", "plus")
            group = group.replace("-", "_")
            group = group.lower()
            pop_col = f"{group}_{pop_col}"

    pop_df = pop_df.rename(columns={std_col.POPULATION_COL: pop_col})

    # scope the pop df to the specific intersectional subgroup (e.g. Black Women, ages 65+)
    for demo in [std_col.AGE_COL, std_col.RACE_OR_HISPANIC_COL, std_col.SEX_COL]:

        # keep all rows and columns for the main demographic breakdown
        if demo == primary_demo_col:
            continue

        # drop the rows that don't match the specific group
        pop_df = pop_df[pop_df[demo] == specific_group_map[demo]]

        secondary_demo_col = [demo]

        if demo == std_col.RACE_OR_HISPANIC_COL:
            secondary_demo_col.append(std_col.RACE_CATEGORY_ID_COL)

        # drop the secondary demographic columns
        pop_df = pop_df.drop(columns=secondary_demo_col).reset_index(drop=True)

    # merge the population column onto the original df
    potential_geo_cols = [std_col.COUNTY_FIPS_COL, std_col.STATE_FIPS_COL, std_col.STATE_NAME_COL]
    merge_cols = []

    for col in potential_geo_cols:
        if col in df.columns:
            merge_cols.append(col)

    if primary_demo_col == std_col.RACE_OR_HISPANIC_COL:
        merge_cols.append(std_col.RACE_CATEGORY_ID_COL)

        # for race, merge only on the ID col; need to get names back later
        if std_col.RACE_OR_HISPANIC_COL in df.columns:
            df.drop(columns=[std_col.RACE_OR_HISPANIC_COL], inplace=True)
        if std_col.RACE_OR_HISPANIC_COL in pop_df.columns:
            pop_df.drop(columns=[std_col.RACE_OR_HISPANIC_COL], inplace=True)
    else:
        merge_cols.append(primary_demo_col)

    # the sex/race/age/county ACS data only has NH for White
    # we can approximate the other race groups using the non-NH race codes
    if primary_demo_col == std_col.RACE_OR_HISPANIC_COL:
        # string "_NH" off race_category_id on everything except "WHITE_NH"
        race_id_replace_map = {
            "AIAN": "AIAN_NH",
            "ASIAN": "ASIAN_NH",
            "BLACK": "BLACK_NH",
            "NHPI": "NHPI_NH",
            "MULTI": "MULTI_NH",
            "OTHER_STANDARD": "OTHER_STANDARD_NH",
        }

        pop_df[std_col.RACE_CATEGORY_ID_COL] = pop_df[std_col.RACE_CATEGORY_ID_COL].replace(race_id_replace_map)

    df = df.merge(pop_df, on=merge_cols, how="left")

    if primary_demo_col == std_col.RACE_OR_HISPANIC_COL:
        std_col.add_race_columns_from_category_id(df)

    return (df, pop_col)


def sum_states_to_national(pop_df: pd.DataFrame) -> pd.DataFrame:
    """
    Sums rows from each race across all states together to generate new rows for national level

    Parameters:
    - pop_df: The DataFrame to be processed.

    Returns:
    - A DataFrame with the same columns as the state level df, summed across states to a national level
    """

    pop_df = pop_df.copy()
    groupby_cols = [std_col.SEX_COL, std_col.RACE_OR_HISPANIC_COL, std_col.RACE_CATEGORY_ID_COL, std_col.AGE_COL]

    # Group by the necessary columns and sum the population
    grouped_series = pop_df.groupby(groupby_cols, as_index=False)[std_col.POPULATION_COL].sum().reset_index(drop=True)

    # Reassign pop_df to be the DataFrame version of grouped_series
    pop_df = pd.DataFrame(grouped_series)

    # Fill in the new geo cols
    pop_df[std_col.STATE_FIPS_COL] = US_FIPS
    pop_df[std_col.STATE_NAME_COL] = US_NAME

    return pop_df


def sum_age_groups(pop_df: pd.DataFrame, age_group: Literal["18+"]) -> pd.DataFrame:
    """
    Sums rows of smaller age groups together to generate new rows for target age group

    Parameters:
    - pop_df: The DataFrame to be processed.
    - age_group: The name of the needed age group.

    Returns:
    - A DataFrame with the rows for the target age group replacing the rows for the smaller summed age groups.
    """

    summed_age_groups_map = {
        "18+": [
            "18-19",
            "20-20",
            "21-21",
            "22-24",
            "25-29",
            "30-34",
            "35-39",
            "40-44",
            "45-49",
            "50-54",
            "55-59",
            "60-61",
            "62-64",
            "65-66",
            "67-69",
            "70-74",
            "75-79",
            "80-84",
            "85+",
        ],
    }

    # throw an error is user supplies an age group that isn't in the summed_age_groups_map
    if age_group not in summed_age_groups_map:
        raise ValueError(f"age_group kwarg must be one of {summed_age_groups_map.keys()}")

    possible_geo_cols = [
        std_col.STATE_FIPS_COL,
        std_col.STATE_NAME_COL,
        std_col.COUNTY_FIPS_COL,
        std_col.COUNTY_NAME_COL,
    ]

    groupby_cols = [std_col.SEX_COL, std_col.RACE_OR_HISPANIC_COL, std_col.RACE_CATEGORY_ID_COL]

    for geo_col in possible_geo_cols:
        if geo_col in pop_df.columns:
            groupby_cols.append(geo_col)

    summed_pop_df = pop_df[pop_df[std_col.AGE_COL].isin(summed_age_groups_map[age_group])]
    rest_of_pop_df = pop_df[~pop_df[std_col.AGE_COL].isin(summed_age_groups_map[age_group])]

    # Group by 'state_fips' and 'time_period', and sum the 'population' for the filtered age groups
    summed_pop_df = pd.DataFrame(
        summed_pop_df.groupby(
            groupby_cols,
            as_index=False,
        )[std_col.POPULATION_COL].sum()
    )

    # Label the new age group
    summed_pop_df[std_col.AGE_COL] = age_group

    # Add the rest of the population
    df = pd.concat([rest_of_pop_df, summed_pop_df], axis=0).reset_index(drop=True)

    return df


def merge_dfs_list(df_list: List[pd.DataFrame], merge_cols: List[str]) -> pd.DataFrame:
    """Merges a list of dataframes into a single dataframe.

    Parameters:
    - df_list: A list of dataframes to be merged.
    - merge_cols: A list of columns to be used for merging.

    Returns:
    - A single dataframe containing the merged data.
    """

    merged_df = reduce(lambda left, right: pd.merge(left, right, on=merge_cols, how="outer"), df_list)

    return merged_df
