from datasources.data_source import DataSource
from ingestion import dataset_utils, merge_utils, gcs_to_bq_util, standardized_columns as std_col
from ingestion.constants import COUNTY_LEVEL, CURRENT, HISTORICAL
from typing import List, Dict, Optional, Tuple
import pandas as pd

# NOTE: col values for numerator and denominator are NULL

CHR_DIR = "chr"


het_to_source_select_topic_all_to_race_prefix_map: Dict[str, Dict[str, Optional[str]]] = {
    std_col.PREVENTABLE_HOSP_PREFIX: {"Preventable Hospitalization Rate": "Preventable Hosp. Rate"},
    std_col.EXCESSIVE_DRINKING_PREFIX: {"% Excessive Drinking": None},
}

het_to_source_additional_topic_all_to_race_prefix_map: Dict[str, Dict[str, Optional[str]]] = {
    std_col.SUICIDE_PREFIX: {"Crude Rate": "Suicide Rate"},
    std_col.FREQUENT_MENTAL_DISTRESS_PREFIX: {"% Frequent Mental Distress": None},
    std_col.DIABETES_PREFIX: {"% Adults with Diabetes": None},
    std_col.VOTER_PARTICIPATION_PREFIX: {"% Voter Turnout": None},
}

# frequent mental distress
source_race_to_id_map = {
    "(AIAN)": std_col.Race.AIAN_NH.value,
    "(Asian)": std_col.Race.API_NH.value,
    "(Black)": std_col.Race.BLACK_NH.value,
    "(Hispanic)": std_col.Race.HISP.value,
    "(White)": std_col.Race.WHITE_NH.value,
}

# suicide 2024
source_nh_race_code_to_id_map_2024 = {
    "(Hispanic (all races))": std_col.Race.HISP.value,
    "(Non-Hispanic AIAN)": std_col.Race.AIAN_NH.value,
    "(Non-Hispanic Asian)": std_col.Race.ASIAN_NH.value,
    "(Non-Hispanic Black)": std_col.Race.BLACK_NH.value,
    "(Non-Hispanic Native Hawaiian and Other Pacific Islander)": std_col.Race.NHPI_NH.value,
    "(Non-Hispanic 2+ races)": std_col.Race.MULTI_NH.value,
    "(Non-Hispanic White)": std_col.Race.WHITE_NH.value,
}

# suicide 2023
source_race_code_to_id_map_2023 = {
    "(AIAN)": std_col.Race.AIAN_NH.value,
    "(Asian)": std_col.Race.ASIAN_NH.value,
    "(Black)": std_col.Race.BLACK_NH.value,
    "(Hispanic)": std_col.Race.HISP.value,
    "(White)": std_col.Race.WHITE_NH.value,
}


source_fips_col = "FIPS"
source_per_100k = "Rate"
source_pct_rate = "%"


class CHRData(DataSource):
    @staticmethod
    def get_id():
        return "CHR_DATA"

    @staticmethod
    def get_table_name():
        return "chr_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CHRData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        if demographic == std_col.RACE_COL:
            demographic = std_col.RACE_OR_HISPANIC_COL

        dfs = []

        for year in ["2023", "2024"]:

            main_sheet_name = "Select Measure Data" if year == "2024" else "Ranked Measure Data"
            main_source_df = get_df_from_chr_excel_sheet(year, main_sheet_name)
            additional_source_df = get_df_from_chr_excel_sheet(year, "Additional Measure Data")
            year_df = pd.merge(main_source_df, additional_source_df, how="outer", on=source_fips_col)
            year_df = year_df.rename(
                columns={
                    source_fips_col: std_col.COUNTY_FIPS_COL,
                }
            )

            # # drop national and state-level rows
            year_df = year_df[~year_df[std_col.COUNTY_FIPS_COL].str.endswith("000")]
            melt_map = get_melt_map(year)
            year_df = dataset_utils.melt_to_het_style_df(
                year_df, std_col.RACE_CATEGORY_ID_COL, [std_col.COUNTY_FIPS_COL], melt_map
            )
            year_df[std_col.STATE_FIPS_COL] = year_df[std_col.COUNTY_FIPS_COL].str[:2]
            year_df[std_col.TIME_PERIOD_COL] = year
            dfs.append(year_df)

        df = pd.concat(dfs)
        df = merge_utils.merge_state_ids(df)
        df = merge_utils.merge_county_names(df)
        df = merge_utils.merge_yearly_pop_numbers(df, std_col.RACE_COL, COUNTY_LEVEL)
        df = df.rename(
            columns={
                std_col.POPULATION_PCT_COL: std_col.CHR_POPULATION_PCT,
                std_col.POPULATION_COL: std_col.CHR_POPULATION_RAW,
            }
        )
        std_col.add_race_columns_from_category_id(df)

        for timeview in [CURRENT, HISTORICAL]:
            df = df.copy()
            table_id = gcs_to_bq_util.make_bq_table_id(demographic, COUNTY_LEVEL, timeview)
            timeview_float_cols_map = get_float_cols()
            float_cols = timeview_float_cols_map[timeview]
            df_for_bq, float_cols = convert_some_pct_rate_to_100k(df, float_cols)

            topic_prefixes = list(het_to_source_select_topic_all_to_race_prefix_map.keys()) + list(
                het_to_source_additional_topic_all_to_race_prefix_map.keys()
            )
            topic_prefixes.append("chr_population")

            df_for_bq, col_types = dataset_utils.get_timeview_df_and_cols(df_for_bq, timeview, topic_prefixes)

            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)


def get_source_usecols(year: str, sheet_name: str) -> List[str]:
    """
    Returns a list of column names to be used when reading a source file's excel sheet.
    The list includes the source_fips_col and columns derived from the source_topic_all_to_race_prefix_map.

    Returns:
        list: A list of column names to be used when reading a source file.
    """

    source_usecols = [source_fips_col]

    sheet_topic_map: Dict[str, Dict[str, Optional[str]]] = {}
    sheet_race_map: Dict[str, str] = {}
    if sheet_name in ["Ranked Measure Data", "Select Measure Data"]:
        sheet_topic_map = het_to_source_select_topic_all_to_race_prefix_map
        sheet_race_map = source_race_to_id_map
    if sheet_name == "Additional Measure Data":
        sheet_topic_map = het_to_source_additional_topic_all_to_race_prefix_map
        sheet_race_map = source_nh_race_code_to_id_map_2024 if year == "2024" else source_race_code_to_id_map_2023

    for source_topic_all_to_race_prefix_map in sheet_topic_map.values():
        for source_topic, source_topic_race_prefix in source_topic_all_to_race_prefix_map.items():
            source_usecols.append(source_topic)

            # some topics only have ALLs
            if source_topic_race_prefix is not None:
                for race_suffix in sheet_race_map.keys():
                    source_usecols.append(f"{source_topic_race_prefix} {race_suffix}")

    return source_usecols


def get_melt_map(year: str) -> Dict[str, Dict[str, str]]:
    """
    Returns a nested dict, one item per generated metric column, which relate the source's
    original metric by race COLUMN NAME to the needed race column VALUE in the resulting HET df.

    Returns:
        dict: A nested dict
    """

    race_code_to_id_map = source_nh_race_code_to_id_map_2024 if year == "2024" else source_race_code_to_id_map_2023

    melt_map: Dict[str, Dict[str, str]] = {}
    # each topic get its own sub-mapping
    for het_prefix, source_all_race_map in het_to_source_select_topic_all_to_race_prefix_map.items():
        select_topic_melt_map: Dict[str, str] = {}
        # maps the sources by race topic column name to the needed HET race column values
        for source_all, source_race_prefix in source_all_race_map.items():
            select_topic_melt_map[source_all] = std_col.Race.ALL.value

            # some topics only have ALLs
            if source_race_prefix is not None:
                for source_race_suffix, het_race_id in source_race_to_id_map.items():
                    select_topic_melt_map[f"{source_race_prefix} {source_race_suffix}"] = het_race_id

        # assign 100k or pct_rate as needed
        rate_suffix = ""
        source_all_col = list(source_all_race_map.keys())[0]
        if source_per_100k in source_all_col:
            rate_suffix = std_col.PER_100K_SUFFIX
        if source_pct_rate in source_all_col:
            rate_suffix = std_col.PCT_RATE_SUFFIX

        # set this metrics sub melt map
        melt_map[f"{het_prefix}_{rate_suffix}"] = select_topic_melt_map

    for het_prefix, source_all_race_map in het_to_source_additional_topic_all_to_race_prefix_map.items():
        additional_topic_melt_map: Dict[str, str] = {}
        # maps the sources by race topic column name to the needed HET race column values
        for source_all, source_race_prefix in source_all_race_map.items():
            additional_topic_melt_map[source_all] = std_col.Race.ALL.value

            # some topics only have ALLs
            if source_race_prefix is not None:
                for source_race_suffix, het_race_id in race_code_to_id_map.items():
                    additional_topic_melt_map[f"{source_race_prefix} {source_race_suffix}"] = het_race_id

        # assign 100k or pct_rate as needed
        rate_suffix = ""
        source_all_col = list(source_all_race_map.keys())[0]
        if source_per_100k in source_all_col:
            rate_suffix = std_col.PER_100K_SUFFIX
        if source_pct_rate in source_all_col:
            rate_suffix = std_col.PCT_RATE_SUFFIX

        # set this metrics sub melt map
        melt_map[f"{het_prefix}_{rate_suffix}"] = additional_topic_melt_map

    return melt_map


def get_float_cols() -> Dict[str, List[str]]:
    """
    Returns a dictionary that maps the time period (CURRENT or HISTORICAL) to a list of column names.
    The list of column names includes all numerical cols like population, per_100k and pct_share.

    Returns:
        dict: A dictionary that maps the time period string to a list of needed numerical column names .
    """

    current_float_cols = [std_col.CHR_POPULATION_RAW, std_col.CHR_POPULATION_PCT]
    historical_float_cols = []

    # include all numerical columns in the time map
    all_topics = list(het_to_source_select_topic_all_to_race_prefix_map.keys()) + list(
        het_to_source_additional_topic_all_to_race_prefix_map.keys()
    )
    for topic_prefix in all_topics:

        # assign 100k or pct_rate as needed based on the source col name
        source_dict = {
            **het_to_source_select_topic_all_to_race_prefix_map,
            **het_to_source_additional_topic_all_to_race_prefix_map,
        }.get(topic_prefix)

        if source_dict is None:
            continue
        source_all_col = list(source_dict.keys())[0]

        rate_suffix = ""
        if source_per_100k in source_all_col:
            rate_suffix = std_col.PER_100K_SUFFIX
        if source_pct_rate in source_all_col:
            rate_suffix = std_col.PCT_RATE_SUFFIX
        topic_rate_col = f"{topic_prefix}_{rate_suffix}"
        current_float_cols.append(topic_rate_col)
        historical_float_cols.append(topic_rate_col)

    TIME_MAP = {CURRENT: current_float_cols, HISTORICAL: historical_float_cols}

    return TIME_MAP


def get_df_from_chr_excel_sheet(year: str, sheet_name: str) -> pd.DataFrame:
    source_usecols = get_source_usecols(year, sheet_name)

    file_name_lookup = {
        "2024": "2024_county_health_release_data_-_v1.xlsx",
        "2023": "2023 County Health Rankings Data - v2.xlsx",
    }

    file_name = file_name_lookup[year]

    return gcs_to_bq_util.load_xlsx_as_df_from_data_dir(
        CHR_DIR,
        file_name,
        sheet_name,
        header=1,
        usecols=source_usecols,
        dtype={
            source_fips_col: "str",
        },
    )


def convert_some_pct_rate_to_100k(df: pd.DataFrame, float_cols: List[str]) -> Tuple[pd.DataFrame, List[str]]:
    """
    Converts specific pct_rate columns to per_100k in both the df and the float cols list and
    rounds all float cols as needed.

    Returns:
        Tuple[pd.DataFrame, List[str]]: The df and the list of float cols
    """

    cols_conversion_map = {
        "excessive_drinking_pct_rate": "excessive_drinking_per_100k",
        "frequent_mental_distress_pct_rate": "frequent_mental_distress_per_100k",
        "diabetes_pct_rate": "diabetes_per_100k",
    }

    # swap col names in df and float cols
    float_cols = [cols_conversion_map.get(col, col) for col in float_cols]
    df = df.rename(columns=cols_conversion_map)

    # convert per 100 to per 100,000
    for col in cols_conversion_map.values():
        df[col] = df[col] * 1000

    # round 100k to whole numbers and pct_rate to one decimal
    for col in df.columns:
        if col in float_cols:
            num_decimal_places = 1 if "_pct" in col else 0
            df[col] = df[col].round(num_decimal_places)

    return (df, float_cols)
