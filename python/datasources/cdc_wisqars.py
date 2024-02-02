import pandas as pd
import numpy as np
from datasources.data_source import DataSource
from ingestion.constants import (
    CURRENT,
    HISTORICAL,
    US_NAME,
    NATIONAL_LEVEL,
    STATE_LEVEL,
)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.dataset_utils import (
    generate_pct_share_col_without_unknowns,
    generate_pct_rel_inequity_col,
    preserve_only_current_time_period_rows,
    generate_pct_share_col_with_unknowns,
)
from ingestion.merge_utils import merge_state_ids


def generate_cols_map(prefixes, suffix):
    return {
        prefix: prefix.replace(f"_{std_col.RAW_SUFFIX}", "") + f"_{suffix}"
        for prefix in prefixes
    }


DATA_DIR = "cdc_wisqars"

INJ_OUTCOMES = [std_col.FATAL_PREFIX, std_col.NON_FATAL_PREFIX]

INJ_INTENTS = [
    std_col.HOMICIDE_PREFIX,
    std_col.LEGAL_INTERVENTION_PREFIX,
    std_col.SUICIDE_PREFIX,
    std_col.NON_FATAL_INJURIES_PREFIX,
]

PER_100K_MAP = generate_cols_map(INJ_INTENTS, std_col.PER_100K_SUFFIX)
RAW_TOTALS_MAP = generate_cols_map(INJ_INTENTS, std_col.RAW_SUFFIX)
PCT_SHARE_MAP = generate_cols_map(RAW_TOTALS_MAP.values(), std_col.PCT_SHARE_SUFFIX)
PCT_SHARE_MAP[std_col.FATAL_POPULATION] = std_col.FATAL_POPULATION_PCT
PCT_SHARE_MAP[std_col.NON_FATAL_POPULATION] = std_col.NON_FATAL_POPULATION_PCT
PCT_REL_INEQUITY_MAP = generate_cols_map(
    RAW_TOTALS_MAP.values(), std_col.PCT_REL_INEQUITY_SUFFIX
)

PIVOT_DEM_COLS = {
    std_col.AGE_COL: ["Year", "State", "Age Group", "Population"],
    std_col.RACE_OR_HISPANIC_COL: ["Year", "State", "Race", "Ethnicity", "Population"],
    std_col.SEX_COL: ["Year", "State", "Sex", "Population"],
    "all": ["Year", "State", "Population"],
}

RACE_COLS_TO_STANDARD = {
    "American Indian / Alaska Native Hispanic": std_col.Race.AIAN.value,
    "American Indian / Alaska Native Non-Hispanic": std_col.Race.AIAN_NH.value,
    "American Indian / Alaska Native Unknown": std_col.Race.ETHNICITY_UNKNOWN.value,
    "Asian Hispanic": std_col.Race.ASIAN.value,
    "Asian Non-Hispanic": std_col.Race.ASIAN_NH.value,
    "Asian Unknown": std_col.Race.ETHNICITY_UNKNOWN.value,
    "Black Hispanic": std_col.Race.BLACK.value,
    "Black Non-Hispanic": std_col.Race.BLACK_NH.value,
    "Black Unknown": std_col.Race.ETHNICITY_UNKNOWN.value,
    "HI Native / Pacific Islander Hispanic": std_col.Race.NHPI.value,
    "HI Native / Pacific Islander Non-Hispanic": std_col.Race.NHPI_NH.value,
    "HI Native / Pacific Islander Unknown": std_col.Race.ETHNICITY_UNKNOWN.value,
    "More than One Race Hispanic": std_col.Race.MULTI.value,
    "More than One Race Non-Hispanic": std_col.Race.MULTI_NH.value,
    "More than One Race Unknown": std_col.Race.ETHNICITY_UNKNOWN.value,
    "White Hispanic": std_col.Race.WHITE.value,
    "White Non-Hispanic": std_col.Race.WHITE_NH.value,
    "White Unknown": std_col.Race.ETHNICITY_UNKNOWN.value,
}

WISQARS_COLS = [
    "Age-Adjusted Rate",
    "Cases (Sample)",
    "CV",
    "Lower 95% CI",
    "Standard Error",
    "Upper 95% CI",
    "Years of Potential Life Lost",
]


class CDCWisqarsData(DataSource):
    @staticmethod
    def get_id():
        return "CDC_WISQARS_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_wisqars_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCHIVData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")

        nat_totals_by_intent_df = load_wisqars_df_from_data_dir("all", geo_level)
        if demographic == std_col.RACE_OR_HISPANIC_COL:
            nat_totals_by_intent_df.insert(2, demographic, std_col.Race.ALL.value)
        else:
            nat_totals_by_intent_df.insert(2, demographic, std_col.ALL_VALUE)

        df = self.generate_breakdown_df(demographic, geo_level, nat_totals_by_intent_df)

        float_cols = [std_col.FATAL_POPULATION, std_col.NON_FATAL_POPULATION]
        float_cols.extend(RAW_TOTALS_MAP.values())
        float_cols.extend(PER_100K_MAP.values())
        float_cols.extend(PCT_SHARE_MAP.values())
        float_cols.extend(PCT_REL_INEQUITY_MAP.values())

        df[float_cols] = df[float_cols].astype(float)

        for table_type in (CURRENT, HISTORICAL):
            df_for_bq = df.copy()

            table_name = f"{demographic}_{geo_level}_{table_type}"

            if table_type == CURRENT:
                df_for_bq[std_col.TIME_PERIOD_COL] = (
                    df_for_bq[std_col.TIME_PERIOD_COL] + '-01'
                )
                df_for_bq = preserve_only_current_time_period_rows(df_for_bq)

            col_types = gcs_to_bq_util.get_bq_column_types(df_for_bq, float_cols)

            gcs_to_bq_util.add_df_to_bq(
                df_for_bq, dataset, table_name, column_types=col_types
            )

    def generate_breakdown_df(
        self, breakdown: str, geo_level: str, alls_df: pd.DataFrame
    ):
        """generate_breakdown_df generates a HIV data frame by breakdown and geo_level

        breakdown: string equal to `age`, `race_and_ethnicity, or `sex`
        geo_level: string equal to `national` or `state`
        alls_df: the data frame containing the all values for each demographic breakdown
        return: a data frame of national time-based WISQARS data by breakdown"""

        cols_to_standard = {
            std_col.RACE_OR_HISPANIC_COL: std_col.RACE_CATEGORY_ID_COL,
            "State": std_col.STATE_NAME_COL,
            "Year": std_col.TIME_PERIOD_COL,
        }

        breakdown_group_df = load_wisqars_df_from_data_dir(breakdown, geo_level)

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=cols_to_standard)

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)

        df = merge_state_ids(df)

        # adds missing columns
        combined_cols = list(PER_100K_MAP.values()) + list(RAW_TOTALS_MAP.values())
        for col in combined_cols:
            if col not in df.columns:
                df[col] = np.nan

        if std_col.NON_FATAL_POPULATION not in df.columns:
            df[std_col.NON_FATAL_POPULATION] = np.nan

        # detect if data frame has unknown values
        has_unknown = df.applymap(contains_unknown).any().any()

        if has_unknown:
            unknown = 'Unknown'
            if breakdown == std_col.RACE_OR_HISPANIC_COL:
                unknown = std_col.Race.ETHNICITY_UNKNOWN.race
            df = generate_pct_share_col_with_unknowns(
                df, PCT_SHARE_MAP, breakdown, std_col.ALL_VALUE, unknown
            )
        else:
            df = generate_pct_share_col_without_unknowns(
                df, PCT_SHARE_MAP, breakdown, std_col.ALL_VALUE
            )

        for col in RAW_TOTALS_MAP.values():
            pop_col = std_col.FATAL_POPULATION
            if col == std_col.NON_FATAL_INJURIES_RAW:
                pop_col = std_col.NON_FATAL_POPULATION
            df = generate_pct_rel_inequity_col(
                df, PCT_SHARE_MAP[col], pop_col, PCT_REL_INEQUITY_MAP[col]
            )

        return df


def load_wisqars_df_from_data_dir(breakdown: str, geo_level: str):
    """
    load_wisqars_df_from_data_dir generates WISQARS data by breakdown and geo_level

    breakdown: string equal to `age`, `race_and_ethnicity`, or `sex`
    geo_level: string equal to `national`, or `state`
    return: a data frame of time-based WISQARS data by breakdown and geo_level with
    WISQARS columns
    """
    output_df = pd.DataFrame(columns=["Year"])

    for outcome in INJ_OUTCOMES:
        data_metric = 'Deaths'
        data_column_name = 'Intent'

        if outcome == std_col.NON_FATAL_PREFIX:
            data_metric = 'Estimated Number'
            data_column_name = 'Year'
            if geo_level == STATE_LEVEL or breakdown == std_col.RACE_OR_HISPANIC_COL:
                continue

        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            DATA_DIR,
            f"{outcome}_gun_injuries-{geo_level}-{breakdown}.csv",
            na_values=["--", "**"],
            usecols=lambda x: x not in WISQARS_COLS,
            thousands=",",
            dtype={"Year": str},
        )

        # removes the metadata section from the csv
        metadata_start_index = df[df[data_column_name] == "Total"].index
        metadata_start_index = metadata_start_index[0]
        df = df.iloc[:metadata_start_index]

        # cleans data frame
        columns_to_convert = [data_metric, 'Crude Rate']
        convert_columns_to_numeric(df, columns_to_convert)

        if geo_level == NATIONAL_LEVEL:
            df.insert(1, "State", US_NAME)

        if outcome == std_col.FATAL_PREFIX:
            df = df[
                (df['Intent'] != 'Unintentional') & (df['Intent'] != 'Undetermined')
            ]

            # reshapes df to add the intent rows as columns
            pivot_df = df.pivot(
                index=PIVOT_DEM_COLS.get(breakdown, []),
                columns="Intent",
                values=['Deaths', 'Crude Rate'],
            )

            pivot_df.columns = [
                f"{col[1].lower().replace(' ', '_')}_{std_col.RAW_SUFFIX}"
                if col[0] == 'Deaths'
                else f"{col[1].lower().replace(' ', '_')}_{std_col.PER_100K_SUFFIX}"
                for col in pivot_df.columns
            ]

            df = pivot_df.reset_index()

        df.rename(
            columns={
                "Age Group": std_col.AGE_COL,
                'Estimated Number': std_col.NON_FATAL_INJURIES_RAW,
                'Population': f'{outcome}_population',
                'Crude Rate': std_col.NON_FATAL_INJURIES_PER_100K,
                'Sex': std_col.SEX_COL,
            },
            inplace=True,
        )

        if breakdown == std_col.RACE_OR_HISPANIC_COL:
            df['RaceEthn'] = df.apply(
                lambda row: f"{row['Race']} {row['Ethnicity']}", axis=1
            )

            df.insert(2, std_col.RACE_OR_HISPANIC_COL, df['RaceEthn'])

            df.drop(
                columns=['Race', 'Ethnicity', 'RaceEthn'],
                inplace=True,
            )
            df = df.replace(to_replace=RACE_COLS_TO_STANDARD)

            unknown_ethnicity_df = df[
                df[std_col.RACE_OR_HISPANIC_COL] == std_col.Race.ETHNICITY_UNKNOWN.value
            ]

            unknown_ethnicity_df = (
                unknown_ethnicity_df.groupby(
                    ['Year', 'State', std_col.RACE_OR_HISPANIC_COL]
                )
                .sum(min_count=1)
                .reset_index()
            )

            df_filtered = df[
                df[std_col.RACE_OR_HISPANIC_COL] != std_col.Race.ETHNICITY_UNKNOWN.value
            ]

            df = pd.concat([df_filtered, unknown_ethnicity_df], ignore_index=True)

        output_df = output_df.merge(df, how="outer")

    return output_df


def clean_numeric(val):
    """
    removes strings with '**' subset and replaces commas
    """
    if isinstance(val, str):
        if '**' in val:
            return np.nan
        if ',' in val:
            return val.replace(',', '')
    return val


def convert_columns_to_numeric(df, columns_to_convert):
    """
    applies clean_numeric to necessary columns and convert values to float
    """
    for column in columns_to_convert:
        df[column] = df[column].apply(clean_numeric)
        df[column] = pd.to_numeric(df[column], errors='coerce')


def contains_unknown(x):
    if isinstance(x, str) and 'unknown' in x.lower():
        return True
    return False
