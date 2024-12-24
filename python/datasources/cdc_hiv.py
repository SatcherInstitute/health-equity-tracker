import numpy as np
import pandas as pd
from datasources.data_source import DataSource
from ingestion.constants import (
    COUNTY_LEVEL,
    STATE_LEVEL,
    NATIONAL_LEVEL,
    US_FIPS,
    ALL_VALUE,
    CURRENT,
    HISTORICAL,
)
from ingestion.dataset_utils import (
    generate_pct_share_col_without_unknowns,
    generate_pct_rel_inequity_col,
    preserve_only_current_time_period_rows,
)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.gcs_to_bq_util import BQ_STRING, BQ_FLOAT
from ingestion.merge_utils import merge_county_names
from ingestion.het_types import HIV_BREAKDOWN_TYPE
from typing import cast


# constants
CDC_AGE = "Age Group"
CDC_RACE = "Race/Ethnicity"
CDC_SEX = "Sex"
CDC_YEAR = "Year"
CDC_STATE_FIPS = "FIPS"
CDC_STATE_NAME = "Geography"
CDC_POP = "Population"
CDC_CASES = "Cases"
CDC_PCT_RATE = "Percent"
CDC_PER_100K = "Rate per 100000"
DTYPE = {CDC_STATE_FIPS: str, CDC_YEAR: str}
ATLAS_COLS = ["Indicator", "Transmission Category", "Rate LCI", "Rate UCI"]
NA_VALUES = ["Data suppressed", "Data not available"]
CDC_ATLAS_COLS = [CDC_YEAR, CDC_STATE_NAME, CDC_STATE_FIPS]
CDC_DEM_COLS = [CDC_AGE, CDC_RACE, CDC_SEX]

DEM_COLS_STANDARD = {
    std_col.AGE_COL: CDC_AGE,
    std_col.RACE_OR_HISPANIC_COL: CDC_RACE,
    std_col.SEX_COL: CDC_SEX,
}

HIV_METRICS = {
    "care": std_col.HIV_CARE_PREFIX,
    "deaths": std_col.HIV_DEATHS_PREFIX,
    "diagnoses": std_col.HIV_DIAGNOSES_PREFIX,
    "prep": std_col.HIV_PREP_PREFIX,
    "prevalence": std_col.HIV_PREVALENCE_PREFIX,
    "stigma": std_col.HIV_STIGMA_INDEX,
}

NON_PER_100K_LIST = [
    std_col.HIV_CARE_PREFIX,
    std_col.HIV_PREP_PREFIX,
    std_col.HIV_STIGMA_INDEX,
]

PER_100K_MAP = {
    prefix: std_col.generate_column_name(prefix, std_col.PER_100K_SUFFIX)
    for prefix in HIV_METRICS.values()
    if prefix not in NON_PER_100K_LIST
}


PCT_SHARE_MAP = {
    prefix: std_col.generate_column_name(prefix, std_col.PCT_SHARE_SUFFIX)
    for prefix in HIV_METRICS.values()
    if prefix != std_col.HIV_STIGMA_INDEX
}
PCT_SHARE_MAP[std_col.HIV_PREP_POPULATION] = std_col.HIV_PREP_POPULATION_PCT
PCT_SHARE_MAP[std_col.POPULATION_COL] = std_col.HIV_POPULATION_PCT
PCT_SHARE_MAP[std_col.HIV_CARE_POPULATION] = std_col.HIV_CARE_POPULATION_PCT

TEST_PCT_SHARE_MAP = {
    std_col.HIV_DIAGNOSES_PREFIX: "hiv_diagnoses_pct_share",
    std_col.HIV_DEATHS_PREFIX: "hiv_deaths_pct_share",
    std_col.HIV_PREVALENCE_PREFIX: "hiv_prevalence_pct_share",
    std_col.POPULATION_COL: std_col.HIV_POPULATION_PCT,
}

PCT_RELATIVE_INEQUITY_MAP = {
    prefix: std_col.generate_column_name(prefix, std_col.PCT_REL_INEQUITY_SUFFIX)
    for prefix in HIV_METRICS.values()
    if prefix != std_col.HIV_STIGMA_INDEX
}

# a nested dictionary that contains values swaps per column name
BREAKDOWN_TO_STANDARD_BY_COL = {
    std_col.AGE_COL: {"Ages 13 years and older": std_col.ALL_VALUE},
    std_col.RACE_CATEGORY_ID_COL: {
        "All races/ethnicities": std_col.Race.ALL.value,
        "American Indian/Alaska Native": std_col.Race.AIAN_NH.value,
        "Asian": std_col.Race.ASIAN_NH.value,
        "Black/African American": std_col.Race.BLACK_NH.value,
        "Hispanic/Latino": std_col.Race.HISP.value,
        "Multiracial": std_col.Race.MULTI_NH.value,
        "Other": std_col.Race.OTHER_NONSTANDARD_NH.value,
        "Native Hawaiian/Other Pacific Islander": std_col.Race.NHPI_NH.value,
        "White": std_col.Race.WHITE_NH.value,
    },
    std_col.SEX_COL: {"Both sexes": std_col.ALL_VALUE},
}

CARE_PREP_MAP = {
    std_col.HIV_CARE_PREFIX: std_col.HIV_CARE_LINKAGE,
    std_col.HIV_PREP_PREFIX: std_col.HIV_PREP_COVERAGE,
}

POP_MAP = {
    std_col.HIV_CARE_PREFIX: std_col.HIV_CARE_POPULATION,
    std_col.HIV_PREP_PREFIX: std_col.HIV_PREP_POPULATION,
    std_col.HIV_DEATHS_PREFIX: std_col.POPULATION_COL,
    std_col.HIV_DIAGNOSES_PREFIX: std_col.POPULATION_COL,
    std_col.HIV_PREVALENCE_PREFIX: std_col.POPULATION_COL,
    std_col.HIV_STIGMA_INDEX: std_col.POPULATION_COL,
}

# HIV dictionaries
DICTS = [
    HIV_METRICS,
    CARE_PREP_MAP,
    PER_100K_MAP,
    PCT_SHARE_MAP,
    PCT_RELATIVE_INEQUITY_MAP,
]

# Define base categories
BASE_COLS = [
    std_col.HIV_CARE_PREFIX,
    std_col.HIV_DEATHS_PREFIX,
    std_col.HIV_DIAGNOSES_PREFIX,
    std_col.HIV_PREP_PREFIX,
    std_col.HIV_PREVALENCE_PREFIX,
]
BASE_COLS_NO_PREP = [col for col in BASE_COLS if col != std_col.HIV_PREP_PREFIX]

# Split into categories for which 'per_100k' applies
BASE_COLS_PER_100K = [
    std_col.HIV_DEATHS_PREFIX,
    std_col.HIV_DIAGNOSES_PREFIX,
    std_col.HIV_PREVALENCE_PREFIX,
]

# Generate 'per_100k', 'pct_share' and 'pct_relative_inequity' versions
PER_100K_COLS = [f"{col}_{std_col.PER_100K_SUFFIX}" for col in BASE_COLS_PER_100K]
PCT_SHARE_COLS = [f"{col}_{std_col.PCT_SHARE_SUFFIX}" for col in BASE_COLS]
BW_PCT_SHARE_COLS = [f"{col}_{std_col.PCT_SHARE_SUFFIX}" for col in BASE_COLS_PER_100K]
PCT_REL_INEQUITY_COLS = [f"{col}_{std_col.PCT_REL_INEQUITY_SUFFIX}" for col in BASE_COLS]
BW_PCT_REL_INEQUITY_COLS = [f"{col}_{std_col.PCT_REL_INEQUITY_SUFFIX}" for col in BASE_COLS_PER_100K]

# Define other common and unique columns
COMMON_COLS = [
    std_col.HIV_STIGMA_INDEX,
    std_col.HIV_CARE_PREFIX,
    std_col.HIV_PREP_COVERAGE,
    std_col.HIV_PREP_POPULATION_PCT,
    std_col.HIV_POPULATION_PCT,
    std_col.HIV_CARE_POPULATION_PCT,
]
GENDER_COLS = [
    f"{col}_{gender}"
    for col in BASE_COLS_NO_PREP
    for gender in [
        std_col.TOTAL_ADDITIONAL_GENDER,
        std_col.TOTAL_TRANS_MEN,
        std_col.TOTAL_TRANS_WOMEN,
    ]
]
TOTAL_DEATHS = f"{std_col.HIV_DEATHS_PREFIX}_{std_col.RAW_SUFFIX}"

# TODO: fix this properly; maybe black_women should be its own data source rather
# TODO: than doing everything in this file with so many conditionals
BW_FLOAT_COLS_RENAME_MAP = {
    "hiv_deaths": "hiv_deaths_black_women",
    "hiv_deaths_pct_relative_inequity": "hiv_deaths_black_women_pct_relative_inequity",
    "hiv_deaths_pct_share": "hiv_deaths_black_women_pct_share",
    "hiv_deaths_per_100k": "hiv_deaths_black_women_per_100k",
    "hiv_diagnoses": "hiv_diagnoses_black_women",
    "hiv_diagnoses_pct_relative_inequity": "hiv_diagnoses_black_women_pct_relative_inequity",
    "hiv_diagnoses_pct_share": "hiv_diagnoses_black_women_pct_share",
    "hiv_diagnoses_per_100k": "hiv_diagnoses_black_women_per_100k",
    "population": "black_women_population_count",
    "hiv_population_pct": "black_women_population_pct",
    "hiv_prevalence": "hiv_prevalence_black_women",
    "hiv_prevalence_pct_relative_inequity": "hiv_prevalence_black_women_pct_relative_inequity",
    "hiv_prevalence_pct_share": "hiv_prevalence_black_women_pct_share",
    "hiv_prevalence_per_100k": "hiv_prevalence_black_women_per_100k",
}


class CDCHIVData(DataSource):
    @staticmethod
    def get_id():
        return "CDC_HIV_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_hiv_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCHIVData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")
        if demographic == std_col.RACE_COL:
            demographic = std_col.RACE_OR_HISPANIC_COL

        # MAKE RACE-AGE BREAKDOWN WITH ONLY COUNTS (NOT RATES) FOR AGE-ADJUSTMENT
        if geo_level != COUNTY_LEVEL and demographic == std_col.RACE_OR_HISPANIC_COL:
            race_age_table_id = f"by_race_age_{geo_level}"
            race_age_df = self.generate_race_age_deaths_df(geo_level)
            float_cols = [TOTAL_DEATHS, std_col.POPULATION_COL]
            col_types = gcs_to_bq_util.get_bq_column_types(race_age_df, float_cols)
            gcs_to_bq_util.add_df_to_bq(race_age_df, dataset, race_age_table_id, column_types=col_types)

        # WE DONT SHOW BLACK WOMEN AT COUNTY LEVEL
        if geo_level == COUNTY_LEVEL and demographic == std_col.BLACK_WOMEN:
            return

        all = "black_women_all" if demographic == std_col.BLACK_WOMEN else "all"
        alls_df = load_atlas_df_from_data_dir(geo_level, all)
        df = self.generate_breakdown_df(demographic, geo_level, alls_df)

        # MAKE TWO TABLES: ONE FOR TIME WITH MORE ROWS AND ONE FOR CURRENT WITH MORE COLS
        for time_view in (CURRENT, HISTORICAL):
            # copy so iterative changes dont interfere
            df_for_bq = df.copy()

            table_demo = demographic if demographic != std_col.BLACK_WOMEN else "black_women_by_age"
            table_id = gcs_to_bq_util.make_bq_table_id(table_demo, geo_level, time_view)
            if demographic == std_col.BLACK_WOMEN:
                df_for_bq.rename(columns=BW_FLOAT_COLS_RENAME_MAP, inplace=True)
            else:
                df_for_bq.rename(columns={std_col.POPULATION_COL: std_col.HIV_POPULATION}, inplace=True)

            col_types = get_bq_col_types(demographic, geo_level, time_view)

            # drop unneeded rows from current
            if time_view == CURRENT:
                df_for_bq = preserve_only_current_time_period_rows(df_for_bq)

            # drop unneeded columns to reduce file size
            keep_cols = col_types.keys()
            df_for_bq = df_for_bq[keep_cols]

            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)

    def generate_breakdown_df(self, breakdown: str, geo_level: str, alls_df: pd.DataFrame):
        """generate_breakdown_df generates a HIV data frame by breakdown and geo_level

        breakdown: string equal to `age`, `black_women`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `county`, `national`, or `state`
        alls_df: the data frame containing the all values for each demographic breakdown
        return: a data frame of time-based HIV data by breakdown and geo_level"""

        geo_to_use = std_col.COUNTY_NAME_COL if geo_level == COUNTY_LEVEL else std_col.STATE_NAME_COL
        fips_to_use = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        cols_to_standard = {
            CDC_AGE: std_col.AGE_COL,
            CDC_STATE_FIPS: fips_to_use,
            CDC_STATE_NAME: geo_to_use,
            CDC_POP: std_col.POPULATION_COL,
            CDC_RACE: std_col.RACE_CATEGORY_ID_COL,
            CDC_SEX: std_col.SEX_COL,
            CDC_YEAR: std_col.TIME_PERIOD_COL,
        }

        breakdown_group_df = load_atlas_df_from_data_dir(geo_level, breakdown)

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=cols_to_standard)

        df = df.replace(to_replace=BREAKDOWN_TO_STANDARD_BY_COL)

        if geo_level == COUNTY_LEVEL:
            df = merge_county_names(df)
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0, 2)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_FIPS_COL] = US_FIPS

        if breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.BLACK_WOMEN]:
            std_col.add_race_columns_from_category_id(df)

        if breakdown != std_col.BLACK_WOMEN:
            if std_col.HIV_DEATHS_PREFIX not in df.columns:
                df[[std_col.HIV_DEATHS_PREFIX, PER_100K_MAP[std_col.HIV_DEATHS_PREFIX]]] = np.nan

            if std_col.HIV_PREP_PREFIX not in df.columns:
                df[[std_col.HIV_PREP_PREFIX, std_col.HIV_PREP_COVERAGE]] = np.nan

            if std_col.HIV_STIGMA_INDEX not in df.columns:
                df[[std_col.HIV_STIGMA_INDEX]] = np.nan

        if breakdown == std_col.BLACK_WOMEN:
            df = generate_pct_share_col_without_unknowns(
                df,
                TEST_PCT_SHARE_MAP,
                cast(HIV_BREAKDOWN_TYPE, std_col.AGE_COL),
                std_col.ALL_VALUE,
            )

        else:
            df = generate_pct_share_col_without_unknowns(
                df,
                PCT_SHARE_MAP,
                cast(HIV_BREAKDOWN_TYPE, breakdown),
                std_col.ALL_VALUE,
            )

        for col in HIV_METRICS.values():
            pop_col = std_col.HIV_POPULATION_PCT
            if col == std_col.HIV_PREP_PREFIX:
                pop_col = std_col.HIV_PREP_POPULATION_PCT
            if col == std_col.HIV_CARE_PREFIX:
                pop_col = std_col.HIV_CARE_POPULATION_PCT
            if breakdown == std_col.BLACK_WOMEN:
                pop_col == "black_women_population_count"

            if (breakdown == std_col.BLACK_WOMEN) and (col in BASE_COLS_PER_100K):
                df = generate_pct_rel_inequity_col(df, PCT_SHARE_MAP[col], pop_col, PCT_RELATIVE_INEQUITY_MAP[col])

            elif breakdown != std_col.BLACK_WOMEN:
                if col != std_col.HIV_STIGMA_INDEX:
                    df = generate_pct_rel_inequity_col(df, PCT_SHARE_MAP[col], pop_col, PCT_RELATIVE_INEQUITY_MAP[col])

        return df

    def generate_race_age_deaths_df(self, geo_level):
        """load in CDC Atlas HIV Deaths tables from /data
        for "ALL" and for "by race by age" by geo_level,
        merge and keep the counts needed for age-adjustment"""

        use_cols = [
            CDC_YEAR,
            CDC_STATE_NAME,
            CDC_STATE_FIPS,
            CDC_AGE,
            CDC_RACE,
            CDC_CASES,
            CDC_POP,
        ]

        # ALL RACE x ALL AGE
        alls_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            "cdc_hiv",
            f"hiv_deaths-{geo_level}-all.csv",
            subdirectory="hiv_deaths",
            na_values=NA_VALUES,
            usecols=use_cols,
            thousands=",",
            dtype=DTYPE,
        )
        alls_df = preserve_only_current_time_period_rows(alls_df, keep_time_period_col=True, time_period_col=CDC_YEAR)
        alls_df[std_col.RACE_CATEGORY_ID_COL] = std_col.Race.ALL.value
        alls_df[std_col.AGE_COL] = ALL_VALUE
        alls_df = alls_df[use_cols]

        # RACE GROUPS x ALL AGE
        race_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            "cdc_hiv",
            f"hiv_deaths-{geo_level}-race_and_ethnicity.csv",
            subdirectory="hiv_deaths",
            na_values=NA_VALUES,
            usecols=use_cols,
            thousands=",",
            dtype=DTYPE,
        )
        race_df = preserve_only_current_time_period_rows(race_df, keep_time_period_col=True, time_period_col=CDC_YEAR)
        race_df[std_col.AGE_COL] = ALL_VALUE
        race_df = race_df[use_cols]

        # ALL RACE x AGE GROUPS
        age_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            "cdc_hiv",
            f"hiv_deaths-{geo_level}-age.csv",
            subdirectory="hiv_deaths",
            na_values=NA_VALUES,
            usecols=use_cols,
            thousands=",",
            dtype=DTYPE,
        )
        age_df = preserve_only_current_time_period_rows(age_df, keep_time_period_col=True, time_period_col=CDC_YEAR)
        age_df[std_col.RACE_CATEGORY_ID_COL] = std_col.Race.ALL.value
        age_df = age_df[use_cols]

        # RACE GROUPS x AGE GROUPS
        race_age_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            "cdc_hiv",
            f"hiv_deaths-{geo_level}-race_and_ethnicity-age.csv",
            subdirectory="hiv_deaths",
            na_values=NA_VALUES,
            usecols=use_cols,
            thousands=",",
            dtype=DTYPE,
        )

        race_age_df = preserve_only_current_time_period_rows(
            race_age_df, keep_time_period_col=True, time_period_col=CDC_YEAR
        )
        # fix poorly formatted state names
        race_age_df[CDC_STATE_NAME] = race_age_df[CDC_STATE_NAME].str.replace("^", "", regex=False)

        df = pd.concat([alls_df, race_df, age_df, race_age_df], ignore_index=True)

        # rename columns
        df = df.rename(
            columns={
                CDC_YEAR: std_col.TIME_PERIOD_COL,
                CDC_STATE_NAME: std_col.STATE_NAME_COL,
                CDC_STATE_FIPS: std_col.STATE_FIPS_COL,
                CDC_AGE: std_col.AGE_COL,
                CDC_RACE: std_col.RACE_CATEGORY_ID_COL,
                CDC_CASES: TOTAL_DEATHS,
                CDC_POP: std_col.POPULATION_COL,
            }
        )

        # rename data items
        df = df.replace(to_replace=BREAKDOWN_TO_STANDARD_BY_COL)
        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_FIPS_COL] = US_FIPS

        std_col.add_race_columns_from_category_id(df)
        return df


def load_atlas_df_from_data_dir(geo_level: str, breakdown: str):
    """load_atlas_from_data_dir generates HIV data by breakdown and geo_level

    breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, or `black_women`
    geo_level: string equal to `county`, `national`, or `state`
    return: a data frame of time-based HIV data by breakdown and
    geo_level with AtlasPlus columns"""
    output_df = pd.DataFrame(columns=CDC_ATLAS_COLS)
    hiv_directory = "cdc_hiv_black_women" if std_col.BLACK_WOMEN in breakdown else "cdc_hiv"

    for datatype in HIV_METRICS.values():
        atlas_cols_to_exclude = generate_atlas_cols_to_exclude(breakdown)

        no_black_women_data = (std_col.BLACK_WOMEN in breakdown) and ((datatype not in BASE_COLS_PER_100K))
        no_deaths_data = (datatype == std_col.HIV_DEATHS_PREFIX) and (geo_level == COUNTY_LEVEL)
        no_prep_data = (datatype == std_col.HIV_PREP_PREFIX) and (
            breakdown == std_col.RACE_OR_HISPANIC_COL and geo_level != NATIONAL_LEVEL
        )
        no_stigma_data = (datatype == std_col.HIV_STIGMA_INDEX) and (
            (geo_level == COUNTY_LEVEL) or (geo_level == STATE_LEVEL and breakdown != "all")
        )

        if no_black_women_data or no_deaths_data or no_prep_data or no_stigma_data:
            continue

        if breakdown == std_col.BLACK_WOMEN:
            filename = f"{datatype}-{geo_level}-{breakdown}-age.csv"
        else:
            filename = f"{datatype}-{geo_level}-{breakdown}.csv"
        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            hiv_directory,
            filename,
            subdirectory=datatype,
            na_values=NA_VALUES,
            usecols=lambda x: x not in atlas_cols_to_exclude,
            thousands=",",
            dtype=DTYPE,
        )

        if (datatype in BASE_COLS_NO_PREP) and (breakdown == "all") and (geo_level == NATIONAL_LEVEL):
            filename = f"{datatype}-{geo_level}-gender.csv"
            all_national_gender_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                hiv_directory,
                filename,
                subdirectory=datatype,
                na_values=NA_VALUES,
                usecols=lambda x: x not in atlas_cols_to_exclude,
                thousands=",",
                dtype=DTYPE,
            )

            national_gender_cases_pivot = all_national_gender_df.pivot_table(
                index=CDC_YEAR, columns=CDC_SEX, values=CDC_CASES, aggfunc="sum"
            ).reset_index()

            # Convert the list to an Index object
            national_gender_cases_pivot.columns = pd.Index(
                [
                    CDC_YEAR,
                    f"{datatype}_{std_col.TOTAL_ADDITIONAL_GENDER}",
                    f"{datatype}_{std_col.TOTAL_TRANS_MEN}",
                    f"{datatype}_{std_col.TOTAL_TRANS_WOMEN}",
                ]
            )

            df = pd.merge(df, national_gender_cases_pivot, on=CDC_YEAR)

        if datatype in [std_col.HIV_CARE_PREFIX, std_col.HIV_PREP_PREFIX]:
            cols_to_standard = {
                CDC_CASES: datatype,
                CDC_PCT_RATE: CARE_PREP_MAP[datatype],
                CDC_POP: POP_MAP[datatype],
            }
        elif datatype == std_col.HIV_STIGMA_INDEX:
            cols_to_standard = {
                CDC_PER_100K: std_col.HIV_STIGMA_INDEX,
                CDC_POP: POP_MAP[datatype],
            }
        else:
            cols_to_standard = {
                CDC_CASES: datatype,
                CDC_PER_100K: PER_100K_MAP[datatype],
                CDC_POP: POP_MAP[datatype],
            }

        if CDC_AGE in df.columns:
            if datatype == std_col.HIV_PREP_PREFIX:
                df[CDC_AGE] = df[CDC_AGE].replace({"13-24": "16-24"})
            elif datatype == std_col.HIV_STIGMA_INDEX:
                df[CDC_AGE] = df[CDC_AGE].replace({"13-24": "18-24"})

        df[CDC_STATE_NAME] = df[CDC_STATE_NAME].str.replace("^", "", regex=False)
        df[CDC_YEAR] = df[CDC_YEAR].str.replace("2020 (COVID-19 Pandemic)", "2020", regex=False)

        df = df.rename(columns=cols_to_standard)

        if datatype == std_col.HIV_STIGMA_INDEX:
            df = df.drop(columns=[CDC_CASES, "population"])

        # TODO: GitHub #2907 this is causing FutureWarning: not sure how to fix
        # In a future version, the Index constructor will not infer
        # numeric dtypes when passed object-dtype sequences (matching Series behavior)
        output_df = output_df.merge(df, how="outer")

    return output_df


def generate_atlas_cols_to_exclude(breakdown: str):
    """
    Generates a list of columns exclude based on the breakdown.
    breakdown: string equal to `age`, `race_and_ethnicity`, or `sex`
    return: a list of columns to exclude when reading csv file
    """
    atlas_cols = ["Indicator", "Transmission Category", "Rate LCI", "Rate UCI"]

    if breakdown == "race_and_ethnicity-age":
        atlas_cols.append(CDC_SEX)
    elif breakdown not in ["all", std_col.BLACK_WOMEN, "black_women_all"]:
        atlas_cols.extend(filter(lambda x: x != DEM_COLS_STANDARD[breakdown], CDC_DEM_COLS))

    return atlas_cols


def get_bq_col_types(demo, geo, time_view):
    """Set the columns and associated BigQuery dtypes based
    on the breakdown of the table"""

    # All Black Women tables get (almost) the same columns and bq types
    if demo == std_col.BLACK_WOMEN:
        bw_col_types = {}
        if time_view == HISTORICAL:
            bw_col_types[std_col.TIME_PERIOD_COL] = BQ_STRING

        bw_col_types.update(
            {
                std_col.STATE_NAME_COL: BQ_STRING,
                std_col.STATE_FIPS_COL: BQ_STRING,
                std_col.AGE_COL: BQ_STRING,
                std_col.SEX_COL: BQ_STRING,
                std_col.RACE_OR_HISPANIC_COL: BQ_STRING,
                std_col.RACE_CATEGORY_ID_COL: BQ_STRING,
                "hiv_deaths_black_women_per_100k": BQ_FLOAT,
                "hiv_diagnoses_black_women_per_100k": BQ_FLOAT,
                "hiv_prevalence_black_women_per_100k": BQ_FLOAT,
            }
        )

        if time_view == HISTORICAL:
            bw_col_types.update(
                {
                    "hiv_deaths_black_women_pct_relative_inequity": BQ_FLOAT,
                    "hiv_diagnoses_black_women_pct_relative_inequity": BQ_FLOAT,
                    "hiv_prevalence_black_women_pct_relative_inequity": BQ_FLOAT,
                }
            )
        elif time_view == CURRENT:
            bw_col_types.update(
                {
                    "hiv_deaths_black_women": BQ_FLOAT,
                    "hiv_diagnoses_black_women": BQ_FLOAT,
                    "hiv_prevalence_black_women": BQ_FLOAT,
                    "black_women_population_count": BQ_FLOAT,
                    "hiv_deaths_black_women_pct_share": BQ_FLOAT,
                    "hiv_diagnoses_black_women_pct_share": BQ_FLOAT,
                    "hiv_prevalence_black_women_pct_share": BQ_FLOAT,
                    "black_women_population_pct": BQ_FLOAT,
                }
            )

        return bw_col_types

    # FOR STANDARD DEMOGRAPHICS - SET BASE COLS
    col_types = {}

    # KEEP COLUMNS IN ORDER FOR EASIER READING ON BQ
    if time_view == HISTORICAL:
        col_types[std_col.TIME_PERIOD_COL] = BQ_STRING

    # SET GEO COLS
    if geo == COUNTY_LEVEL:
        col_types.update(
            {
                std_col.COUNTY_NAME_COL: BQ_STRING,
                std_col.COUNTY_FIPS_COL: BQ_STRING,
            }
        )
    else:
        col_types.update(
            {
                std_col.STATE_NAME_COL: BQ_STRING,
                std_col.STATE_FIPS_COL: BQ_STRING,
            }
        )

    # SET DEMO COL(S)
    col_types[demo] = BQ_STRING
    if demo == std_col.RACE_OR_HISPANIC_COL:
        col_types.update(
            {
                std_col.RACE_CATEGORY_ID_COL: BQ_STRING,
            }
        )

    # ALL TABLES GET RATE COLS
    col_types.update(
        {
            "hiv_stigma_index": BQ_FLOAT,
            "hiv_deaths_per_100k": BQ_FLOAT,
            "hiv_diagnoses_per_100k": BQ_FLOAT,
            "hiv_prevalence_per_100k": BQ_FLOAT,
            "hiv_care_linkage": BQ_FLOAT,
            "hiv_prep_coverage": BQ_FLOAT,
        }
    )

    # SET DATA COLS
    if time_view == CURRENT:
        col_types.update(
            {
                "hiv_care_pct_share": BQ_FLOAT,
                "hiv_deaths_pct_share": BQ_FLOAT,
                "hiv_diagnoses_pct_share": BQ_FLOAT,
                "hiv_prep_pct_share": BQ_FLOAT,
                "hiv_prevalence_pct_share": BQ_FLOAT,
                "hiv_prep_population_pct": BQ_FLOAT,
                "hiv_population_pct": BQ_FLOAT,
                "hiv_care_population_pct": BQ_FLOAT,
                "hiv_care": BQ_FLOAT,
                "hiv_deaths": BQ_FLOAT,
                "hiv_diagnoses": BQ_FLOAT,
                "hiv_prep": BQ_FLOAT,
                "hiv_prevalence": BQ_FLOAT,
                std_col.HIV_POPULATION: BQ_FLOAT,
                std_col.HIV_CARE_POPULATION: BQ_FLOAT,
                std_col.HIV_PREP_POPULATION: BQ_FLOAT,
            }
        )
    elif time_view == HISTORICAL:
        col_types.update(
            {
                "hiv_care_pct_relative_inequity": BQ_FLOAT,
                "hiv_deaths_pct_relative_inequity": BQ_FLOAT,
                "hiv_diagnoses_pct_relative_inequity": BQ_FLOAT,
                "hiv_prep_pct_relative_inequity": BQ_FLOAT,
                "hiv_prevalence_pct_relative_inequity": BQ_FLOAT,
            }
        )

    # SET TRANSGENDER COUNT COLS
    if geo == NATIONAL_LEVEL and demo == std_col.SEX_COL:
        col_types.update(
            {
                "hiv_care_total_additional_gender": BQ_FLOAT,
                "hiv_care_total_trans_men": BQ_FLOAT,
                "hiv_care_total_trans_women": BQ_FLOAT,
                "hiv_deaths_total_additional_gender": BQ_FLOAT,
                "hiv_deaths_total_trans_men": BQ_FLOAT,
                "hiv_deaths_total_trans_women": BQ_FLOAT,
                "hiv_diagnoses_total_additional_gender": BQ_FLOAT,
                "hiv_diagnoses_total_trans_men": BQ_FLOAT,
                "hiv_diagnoses_total_trans_women": BQ_FLOAT,
                "hiv_prevalence_total_additional_gender": BQ_FLOAT,
                "hiv_prevalence_total_trans_men": BQ_FLOAT,
                "hiv_prevalence_total_trans_women": BQ_FLOAT,
            }
        )

    return col_types
