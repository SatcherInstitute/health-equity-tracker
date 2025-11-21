from datasources.data_source import DataSource
from ingestion import dataset_utils, merge_utils, gcs_to_bq_util, standardized_columns as std_col
from ingestion.constants import COUNTY_LEVEL, CURRENT, HISTORICAL
from ingestion.chr_utils import (
    get_topics_for_sheet_and_year,
    get_primary_data_year_for_topic,
    get_all_topic_prefixes,
    get_race_map,
)
from typing import List, Dict, Tuple
import pandas as pd

"""
Files downloaded from County Health Rankings website
Recent years:
- countyhealthrankings.org/health-data/methodology-and-sources/data-documentation
Older years:
- countyhealthrankings.org/health-data/methodology-and-sources/data-documentation/national-data-documentation-2010-2022

File names vary as do the download link text, but it's generally the first file in each section.
The text contains the words `National Data`
"""

CHR_DIR = "chr"

CHR_FILE_LOOKUP = {
    "2011": "2011 County Health Rankings National Data_v2_0.xls",
    "2012": "2012 County Health Rankings National Data_v2_0.xls",
    "2013": "2013CountyHealthRankingsNationalData.xls",
    "2014": "2014 County Health Rankings Data - v6.xls",
    "2015": "2015 County Health Rankings Data - v3.xls",
    "2016": "2016 County Health Rankings Data - v3.xls",
    "2017": "2017CountyHealthRankingsData.xls",
    "2018": "2018 County Health Rankings Data - v2.xls",
    "2019": "2019 County Health Rankings Data - v3.xls",
    "2020": "2020 County Health Rankings Data - v2.xlsx",
    "2021": "2021 County Health Rankings Data - v1.xlsx",
    "2022": "2022 County Health Rankings Data - v1.xlsx",
    "2023": "2023 County Health Rankings Data - v2.xlsx",
    "2024": "2024_county_health_release_data_-_v1.xlsx",
    "2025": "2025 County Health Rankings Data - v3.xlsx",
}

source_fips_col = "FIPS"
source_per_100k = "Rate"
source_pct_rate = "%"
source_pct_rate_cols_no_symbol = ["Diabetes"]


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

        dfs = []

        for year in CHR_FILE_LOOKUP.keys():

            main_sheet_name = "Select Measure Data" if year in ["2024", "2025"] else "Ranked Measure Data"
            main_source_df = get_df_from_chr_excel_sheet(year, main_sheet_name)
            additional_source_df = get_df_from_chr_excel_sheet(year, "Additional Measure Data")
            year_df = pd.merge(main_source_df, additional_source_df, how="outer", on=source_fips_col)
            year_df = year_df.rename(
                columns={
                    source_fips_col: std_col.COUNTY_FIPS_COL,
                }
            )

            # drop any national and state-level rows
            year_df = year_df[~year_df[std_col.COUNTY_FIPS_COL].astype(str).str.endswith("000")]
            melt_map = get_melt_map(year)
            year_df = dataset_utils.melt_to_het_style_df(
                year_df, std_col.RACE_CATEGORY_ID_COL, [std_col.COUNTY_FIPS_COL], melt_map, drop_empty_rows=True
            )

            year_df[std_col.STATE_FIPS_COL] = year_df[std_col.COUNTY_FIPS_COL].str[:2]

            # Assign time_period per topic based on the primary data years, not just the CHR release year
            merge_cols = [std_col.STATE_FIPS_COL, std_col.COUNTY_FIPS_COL, std_col.RACE_CATEGORY_ID_COL]

            # split the year_df into multiple dfs, each containing the merge cols plus one of the metric cols
            metric_cols = list(melt_map.keys())
            year_topic_dfs = []

            for metric_col in metric_cols:
                year_topic_df = year_df[[metric_col] + merge_cols].copy()

                # Extract topic prefix from metric column (remove _per_100k or _pct_rate suffix)
                topic_prefix = metric_col.replace("_per_100k", "").replace("_pct_rate", "")

                primary_data_year = get_primary_data_year_for_topic(topic_prefix, year)
                if primary_data_year is None:
                    raise ValueError(
                        f"No time period mapping found for metric {metric_col} (topic: {topic_prefix}) in year {year}"
                    )

                year_topic_df[std_col.TIME_PERIOD_COL] = primary_data_year
                year_topic_dfs.append(year_topic_df)

            updated_years_df = merge_utils.merge_dfs_list(year_topic_dfs, [std_col.TIME_PERIOD_COL] + merge_cols)
            dfs.append(updated_years_df)

        df = pd.concat(dfs)

        sort_cols = [
            std_col.TIME_PERIOD_COL,
            std_col.STATE_FIPS_COL,
            std_col.COUNTY_FIPS_COL,
            std_col.RACE_CATEGORY_ID_COL,
        ]

        agg_metric_cols = [col for col in df.columns if col not in sort_cols]

        # For each metric column, take the LAST non-null value (most recent release)
        agg_dict = {col: "last" for col in agg_metric_cols}

        df = df.groupby(sort_cols, dropna=False).agg(agg_dict).reset_index()

        assert not df.duplicated(subset=sort_cols).any(), f"Found duplicate rows based on {sort_cols}"

        # Reorder: sort columns first, then everything else
        df = df[sort_cols + agg_metric_cols]
        df = df.sort_values(by=sort_cols).reset_index(drop=True)

        df = merge_utils.merge_state_ids(df)
        df = merge_utils.merge_county_names(df)
        df = merge_utils.merge_yearly_pop_numbers(df, std_col.RACE_COL, COUNTY_LEVEL)
        df = df.rename(
            columns={
                std_col.POPULATION_PCT_COL: std_col.CHR_POPULATION_PCT,
                std_col.POPULATION_COL: std_col.CHR_POPULATION_RAW,
            }
        )
        std_col.swap_race_id_col_for_names_col(df)

        for timeview in [CURRENT, HISTORICAL]:
            df = df.copy()
            table_id = gcs_to_bq_util.make_bq_table_id(demographic, COUNTY_LEVEL, timeview)
            timeview_float_cols_map = get_float_cols()
            float_cols = timeview_float_cols_map[timeview]
            df_for_bq, float_cols = convert_some_pct_rate_to_100k(df, float_cols)

            topic_prefixes = get_all_topic_prefixes()
            topic_prefixes.append("chr_population")

            df_for_bq, col_types = dataset_utils.get_timeview_df_and_cols(df_for_bq, timeview, topic_prefixes)

            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)


def get_source_usecols(year: str, sheet_name: str) -> List[str]:
    """
    Returns a list of column names to be used when reading a source file's excel sheet.
    The list includes the source_fips_col and columns derived from CHR_METRICS.

    Returns:
        list: A list of column names to be used when reading a source file.
    """
    source_usecols = [source_fips_col]

    sheet_race_map = get_race_map(year, sheet_name)
    sheet_topics = get_topics_for_sheet_and_year(sheet_name, year)

    for topic_config in sheet_topics.values():
        source_all_col = topic_config["source_all_col"]
        source_usecols.append(source_all_col)

        # If this topic has race-stratified data
        source_race_prefix = topic_config.get("source_race_prefix")
        if source_race_prefix is not None:
            for race_suffix in sheet_race_map.keys():
                source_usecols.append(f"{source_race_prefix} {race_suffix}")

    return source_usecols


def get_melt_map(year: str) -> Dict[str, Dict[str, str]]:
    """
    Returns a nested dict, one item per generated metric column, which relate the source's
    original metric by race COLUMN NAME to the needed race column VALUE in the resulting HET df.

    Returns:
        dict: A nested dict
    """
    melt_map: Dict[str, Dict[str, str]] = {}

    # Process both Select/Ranked and Additional sheets
    for sheet_name in ["Select Measure Data", "Additional Measure Data"]:
        sheet_topics = get_topics_for_sheet_and_year(sheet_name, year)
        sheet_race_map = get_race_map(year, sheet_name)

        for het_prefix, topic_config in sheet_topics.items():
            source_all_col = topic_config["source_all_col"]
            source_race_prefix = topic_config.get("source_race_prefix")

            topic_melt_map: Dict[str, str] = {}

            # Add the "all" column
            topic_melt_map[source_all_col] = std_col.Race.ALL.value

            # Add race-stratified columns if they exist
            if source_race_prefix is not None:
                for source_race_suffix, het_race_id in sheet_race_map.items():
                    topic_melt_map[f"{source_race_prefix} {source_race_suffix}"] = het_race_id

            # Determine the rate suffix (per_100k or pct_rate)
            rate_suffix = ""
            if source_per_100k in source_all_col:
                rate_suffix = std_col.PER_100K_SUFFIX
            if source_pct_rate in source_all_col or source_all_col in source_pct_rate_cols_no_symbol:
                rate_suffix = std_col.PCT_RATE_SUFFIX

            # Set this metric's melt map
            melt_map[f"{het_prefix}_{rate_suffix}"] = topic_melt_map

    return melt_map


def get_float_cols() -> Dict[str, List[str]]:
    """
    Returns a dictionary that maps the time period (CURRENT or HISTORICAL) to a list of column names.
    The list of column names includes all numerical cols like population, per_100k and pct_share.

    Returns:
        dict: A dictionary that maps the time period string to a list of needed numerical column names.
    """
    current_float_cols = [std_col.CHR_POPULATION_RAW, std_col.CHR_POPULATION_PCT]
    historical_float_cols = []

    # Get all unique topic prefixes across all years
    all_topic_prefixes = get_all_topic_prefixes()

    for topic_prefix in all_topic_prefixes:
        # Find any occurrence of this topic to determine its rate type
        # We'll check the first available year/sheet combo for this topic
        rate_suffix = None

        for year in CHR_FILE_LOOKUP.keys():
            for sheet_name in ["Select Measure Data", "Additional Measure Data"]:
                sheet_topics = get_topics_for_sheet_and_year(sheet_name, year)

                if topic_prefix in sheet_topics:
                    source_all_col = sheet_topics[topic_prefix]["source_all_col"]

                    if source_per_100k in source_all_col:
                        rate_suffix = std_col.PER_100K_SUFFIX
                    elif source_pct_rate in source_all_col or source_all_col in source_pct_rate_cols_no_symbol:
                        rate_suffix = std_col.PCT_RATE_SUFFIX

                    break

            if rate_suffix is not None:
                break

        if rate_suffix:
            topic_rate_col = f"{topic_prefix}_{rate_suffix}"
            current_float_cols.append(topic_rate_col)
            historical_float_cols.append(topic_rate_col)

    TIME_MAP = {CURRENT: current_float_cols, HISTORICAL: historical_float_cols}

    return TIME_MAP


def get_df_from_chr_excel_sheet(year: str, sheet_name: str) -> pd.DataFrame:
    source_usecols = get_source_usecols(year, sheet_name)

    file_name = CHR_FILE_LOOKUP[year]

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
        if col in df.columns:
            df[col] = df[col] * 1000

    # round 100k to whole numbers and pct_rate to one decimal
    for col in df.columns:
        if col in float_cols:
            num_decimal_places = 1 if "_pct" in col else 0
            df[col] = df[col].round(num_decimal_places)

    return (df, float_cols)
