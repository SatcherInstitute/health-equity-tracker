from ingestion import standardized_columns as std_col
from ingestion import gcs_to_bq_util
from ingestion.constants import (
    HISTORICAL,
    CURRENT,
    COUNTY_LEVEL,
    STATE_LEVEL,
    NATIONAL_LEVEL,
)
from ingestion.gcs_to_bq_util import BQ_STRING, BQ_FLOAT
import pandas as pd


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

DEM_COLS_STANDARD = {std_col.AGE_COL: CDC_AGE, std_col.RACE_OR_HISPANIC_COL: CDC_RACE, std_col.SEX_COL: CDC_SEX}
HIV_METRICS = {
    "care": std_col.HIV_CARE_PREFIX,
    "deaths": std_col.HIV_DEATHS_PREFIX,
    "diagnoses": std_col.HIV_DIAGNOSES_PREFIX,
    "prep": std_col.HIV_PREP_PREFIX,
    "prevalence": std_col.HIV_PREVALENCE_PREFIX,
    "stigma": std_col.HIV_STIGMA_INDEX,
}
BW_HIV_METRICS = {k: HIV_METRICS[k] for k in ["deaths", "diagnoses", "prevalence"]}
NON_PER_100K_LIST = [std_col.HIV_CARE_PREFIX, std_col.HIV_PREP_PREFIX, std_col.HIV_STIGMA_INDEX]

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
PCT_SHARE_MAP.update(
    {
        std_col.HIV_PREP_POPULATION: std_col.HIV_PREP_POPULATION_PCT,
        std_col.POPULATION_COL: std_col.HIV_POPULATION_PCT,
        std_col.HIV_CARE_POPULATION: std_col.HIV_CARE_POPULATION_PCT,
    }
)

BW_PCT_SHARE_MAP = {
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

CARE_PREP_MAP = {std_col.HIV_CARE_PREFIX: std_col.HIV_CARE_LINKAGE, std_col.HIV_PREP_PREFIX: std_col.HIV_PREP_COVERAGE}
POP_MAP = {
    prefix: (
        std_col.HIV_CARE_POPULATION
        if prefix == std_col.HIV_CARE_PREFIX
        else std_col.HIV_PREP_POPULATION
        if prefix == std_col.HIV_PREP_PREFIX
        else std_col.POPULATION_COL
    )
    for prefix in HIV_METRICS.values()
}
DICTS = [HIV_METRICS, CARE_PREP_MAP, PER_100K_MAP, PCT_SHARE_MAP, PCT_RELATIVE_INEQUITY_MAP]

BASE_COLS = [
    std_col.HIV_CARE_PREFIX,
    std_col.HIV_DEATHS_PREFIX,
    std_col.HIV_DIAGNOSES_PREFIX,
    std_col.HIV_PREP_PREFIX,
    std_col.HIV_PREVALENCE_PREFIX,
]
BASE_COLS_NO_PREP, BASE_COLS_PER_100K = [col for col in BASE_COLS if col != std_col.HIV_PREP_PREFIX], [
    col for col in BASE_COLS if col not in NON_PER_100K_LIST
]
PER_100K_COLS = [f"{col}_{std_col.PER_100K_SUFFIX}" for col in BASE_COLS_PER_100K]
PCT_SHARE_COLS, BW_PCT_SHARE_COLS = [f"{col}_{std_col.PCT_SHARE_SUFFIX}" for col in BASE_COLS], [
    f"{col}_{std_col.PCT_SHARE_SUFFIX}" for col in BASE_COLS_PER_100K
]
PCT_REL_INEQUITY_COLS, BW_PCT_REL_INEQUITY_COLS = [f"{col}_{std_col.PCT_REL_INEQUITY_SUFFIX}" for col in BASE_COLS], [
    f"{col}_{std_col.PCT_REL_INEQUITY_SUFFIX}" for col in BASE_COLS_PER_100K
]

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
    for gender in [std_col.TOTAL_ADDITIONAL_GENDER, std_col.TOTAL_TRANS_MEN, std_col.TOTAL_TRANS_WOMEN]
]
TOTAL_DEATHS = f"{std_col.HIV_DEATHS_PREFIX}_{std_col.RAW_SUFFIX}"
BW_FLOAT_COLS_RENAME_MAP = {
    f"hiv_{metric}{suffix}": f"hiv_{metric}_black_women{suffix}"
    for metric in ["deaths", "diagnoses", "prevalence"]
    for suffix in ["", "_pct_relative_inequity", "_pct_share", "_per_100k"]
}
BW_FLOAT_COLS_RENAME_MAP.update(
    {"population": "black_women_population_count", "hiv_population_pct": "black_women_population_pct"}
)


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
        atlas_cols.extend([v for k, v in DEM_COLS_STANDARD.items() if k != breakdown])
    return atlas_cols


def get_bq_col_types(demo, geo, time_view):
    types = {std_col.TIME_PERIOD_COL: BQ_STRING} if time_view == HISTORICAL else {}
    if demo == std_col.BLACK_WOMEN:
        types.update(
            {
                std_col.STATE_NAME_COL: BQ_STRING,
                std_col.STATE_FIPS_COL: BQ_STRING,
                std_col.AGE_COL: BQ_STRING,
                std_col.SEX_COL: BQ_STRING,
                std_col.RACE_OR_HISPANIC_COL: BQ_STRING,
                std_col.RACE_CATEGORY_ID_COL: BQ_STRING,
            }
        )
        types.update(
            {f"hiv_{metric}_black_women_per_100k": BQ_FLOAT for metric in ["deaths", "diagnoses", "prevalence"]}
        )
        suffix = "_pct_relative_inequity" if time_view == HISTORICAL else ""
        types.update(
            {f"hiv_{metric}_black_women{suffix}": BQ_FLOAT for metric in ["deaths", "diagnoses", "prevalence"]}
        )
        if time_view == CURRENT:
            types.update(
                {
                    "black_women_population_count": BQ_FLOAT,
                    "black_women_population_pct": BQ_FLOAT,
                    **{
                        f"hiv_{metric}_black_women_pct_share": BQ_FLOAT
                        for metric in ["deaths", "diagnoses", "prevalence"]
                    },
                }
            )
        return types

    geo_cols = (
        {std_col.COUNTY_NAME_COL: BQ_STRING, std_col.COUNTY_FIPS_COL: BQ_STRING}
        if geo == COUNTY_LEVEL
        else {std_col.STATE_NAME_COL: BQ_STRING, std_col.STATE_FIPS_COL: BQ_STRING}
    )
    types.update(
        {
            **geo_cols,
            demo: BQ_STRING,
            **({std_col.RACE_CATEGORY_ID_COL: BQ_STRING} if demo == std_col.RACE_OR_HISPANIC_COL else {}),
        }
    )
    types.update(
        {
            k: BQ_FLOAT
            for k in [
                "hiv_stigma_index",
                "hiv_deaths_per_100k",
                "hiv_diagnoses_per_100k",
                "hiv_prevalence_per_100k",
                "hiv_care_linkage",
                "hiv_prep_coverage",
            ]
        }
    )
    if time_view == CURRENT:
        types.update(
            {
                **{f"{col}_pct_share": BQ_FLOAT for col in BASE_COLS},
                **{f"{col}": BQ_FLOAT for col in BASE_COLS},
                std_col.HIV_POPULATION: BQ_FLOAT,
                std_col.HIV_CARE_POPULATION: BQ_FLOAT,
                std_col.HIV_PREP_POPULATION: BQ_FLOAT,
                "hiv_prep_population_pct": BQ_FLOAT,
                "hiv_population_pct": BQ_FLOAT,
                "hiv_care_population_pct": BQ_FLOAT,
            }
        )
    else:
        types.update({f"{col}_pct_relative_inequity": BQ_FLOAT for col in BASE_COLS})
    if geo == NATIONAL_LEVEL and demo == std_col.SEX_COL:
        types.update(
            {
                f"{col}_{gender}": BQ_FLOAT
                for col in BASE_COLS_NO_PREP
                for gender in ["total_additional_gender", "total_trans_men", "total_trans_women"]
            }
        )
    return types


def load_atlas_df_from_data_dir(geo_level: str, breakdown: str):
    """Load HIV data by breakdown and geo_level from AtlasPlus data files

    breakdown: string equal to `age`, `race_and_ethnicity`, `sex`, or `black_women`
    geo_level: string equal to `county`, `national`, or `state`
    return: a data frame of time-based HIV data by breakdown and geo_level
    """
    output_df = pd.DataFrame(columns=CDC_ATLAS_COLS)
    hiv_directory = "cdc_hiv_black_women" if std_col.BLACK_WOMEN in breakdown else "cdc_hiv"

    for datatype in HIV_METRICS.values():
        atlas_cols_to_exclude = generate_atlas_cols_to_exclude(breakdown)

        # Skip combinations where data files don't exist
        no_black_women_data = (std_col.BLACK_WOMEN in breakdown) and (datatype not in BASE_COLS_PER_100K)
        no_deaths_data = (datatype == std_col.HIV_DEATHS_PREFIX) and (geo_level == COUNTY_LEVEL)
        no_prep_data = (datatype == std_col.HIV_PREP_PREFIX) and (
            breakdown == std_col.RACE_OR_HISPANIC_COL and geo_level != NATIONAL_LEVEL
        )
        no_stigma_data = (datatype == std_col.HIV_STIGMA_INDEX) and (
            (geo_level == COUNTY_LEVEL) or (geo_level == STATE_LEVEL and breakdown != "all")
        )

        if no_black_women_data or no_deaths_data or no_prep_data or no_stigma_data:
            continue

        # Build filename and load data
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

        # Add national gender columns if applicable
        if (datatype in BASE_COLS_NO_PREP) and (breakdown == "all") and (geo_level == NATIONAL_LEVEL):
            gender_df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
                hiv_directory,
                f"{datatype}-{geo_level}-gender.csv",
                subdirectory=datatype,
                na_values=NA_VALUES,
                usecols=lambda x: x not in atlas_cols_to_exclude,
                thousands=",",
                dtype=DTYPE,
            )

            gender_pivot = gender_df.pivot_table(
                index=CDC_YEAR, columns=CDC_SEX, values=CDC_CASES, aggfunc="sum"
            ).reset_index()

            gender_pivot.columns = pd.Index(
                [
                    CDC_YEAR,
                    f"{datatype}_{std_col.TOTAL_ADDITIONAL_GENDER}",
                    f"{datatype}_{std_col.TOTAL_TRANS_MEN}",
                    f"{datatype}_{std_col.TOTAL_TRANS_WOMEN}",
                ]
            )

            df = pd.merge(df, gender_pivot, on=CDC_YEAR)

        # Rename columns based on datatype
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
                CDC_PER_100K: PER_100K_MAP[datatype],
                CDC_CASES: datatype,
                CDC_POP: POP_MAP[datatype],
            }

        # Apply age adjustments for specific datatypes
        if CDC_AGE in df.columns:
            if datatype == std_col.HIV_PREP_PREFIX:
                df[CDC_AGE] = df[CDC_AGE].replace({"13-24": "16-24"})
            elif datatype == std_col.HIV_STIGMA_INDEX:
                df[CDC_AGE] = df[CDC_AGE].replace({"13-24": "18-24"})

        # Clean data
        df[CDC_STATE_NAME] = df[CDC_STATE_NAME].str.replace("^", "", regex=False)
        df[CDC_YEAR] = df[CDC_YEAR].str.replace("2020 (COVID-19 Pandemic)", "2020", regex=False)
        df = df[df[CDC_YEAR] <= "2022"]

        df = df.rename(columns=cols_to_standard)

        if datatype == std_col.HIV_STIGMA_INDEX:
            df = df.drop(columns=[CDC_CASES, "population"])

        output_df = output_df.merge(df, how="outer")

    return output_df
