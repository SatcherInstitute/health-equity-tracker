from datasources.data_source import DataSource
from ingestion import dataset_utils, merge_utils, gcs_to_bq_util, standardized_columns as std_col
from ingestion.constants import COUNTY_LEVEL, CURRENT, HISTORICAL
from typing import List, Dict
import pandas as pd

# NOTE: cols for numerator and denominator are all NULL

CHR_DIR = 'chr'

het_to_source_topic_all_to_race_prefix_map = {
    std_col.PREVENTABLE_HOSP_PREFIX: {'Preventable Hospitalization Rate': 'Preventable Hosp. Rate'}
}

source_race_to_id_map = {
    '(AIAN)': std_col.Race.AIAN_NH.value,
    '(Asian)': std_col.Race.API_NH.value,
    '(Black)': std_col.Race.BLACK_NH.value,
    '(Hispanic)': std_col.Race.HISP.value,
    '(White)': std_col.Race.WHITE_NH.value,
}

source_fips_col = 'FIPS'


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

        df = get_df_from_chr_excel_sheet('Select Measure Data')

        df = df.rename(
            columns={
                source_fips_col: std_col.COUNTY_FIPS_COL,
            }
        )

        # # drop national and state-level rows
        df = df[~df[std_col.COUNTY_FIPS_COL].str.endswith('000')]

        melt_map = get_melt_map()

        df = dataset_utils.melt_to_het_style_df(df, std_col.RACE_CATEGORY_ID_COL, [std_col.COUNTY_FIPS_COL], melt_map)

        df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str[:2]
        df[std_col.TIME_PERIOD_COL] = '2024'

        df = merge_utils.merge_state_ids(df)
        df = merge_utils.merge_county_names(df)
        df = merge_utils.merge_yearly_pop_numbers(df, std_col.RACE_COL, COUNTY_LEVEL)
        std_col.add_race_columns_from_category_id(df)

        for timeview in [CURRENT]:
            df = df.copy()
            table_name = f"{demographic}_{COUNTY_LEVEL}_{timeview}"
            timeview_float_cols_map = get_float_cols()
            float_cols = timeview_float_cols_map[timeview]

            df_for_bq, col_types = dataset_utils.generate_time_df_with_cols_and_types(
                df, float_cols, timeview, demographic
            )

            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_name, column_types=col_types)


def get_source_usecols() -> List[str]:
    """
    Returns a list of column names to be used when reading a source file.
    The list includes the source_fips_col and columns derived from the source_topic_all_to_race_prefix_map.

    Returns:
        list: A list of column names to be used when reading a source file.
    """
    source_usecols = [source_fips_col]
    for source_topic_all_to_race_prefix_map in het_to_source_topic_all_to_race_prefix_map.values():
        for source_topic, source_topic_race_prefix in source_topic_all_to_race_prefix_map.items():
            source_usecols.append(source_topic)
            for race_suffix in source_race_to_id_map.keys():
                source_usecols.append(f'{source_topic_race_prefix} {race_suffix}')

    return source_usecols


def get_melt_map() -> Dict[str, Dict[str, str]]:
    """
    Returns a nested dict, one item per generated metric column, which relate the source's
    original metric by race COLUMN NAME to the needed race column VALUE in the resulting HET df.

    Returns:
        dict: A nested dict
    """
    melt_map = {}
    # each topic get its own sub-mapping
    for het_prefix, source_all_race_map in het_to_source_topic_all_to_race_prefix_map.items():
        topic_melt_map = {}
        # maps the sources by race topic column name to the needed HET race column values
        for source_all, source_race_prefix in source_all_race_map.items():
            topic_melt_map[source_all] = std_col.Race.ALL.value
            for source_race_suffix, het_race_id in source_race_to_id_map.items():
                topic_melt_map[f'{source_race_prefix} {source_race_suffix}'] = het_race_id

        melt_map[f'{het_prefix}_{std_col.PER_100K_SUFFIX}'] = topic_melt_map
    return melt_map


def get_float_cols() -> Dict[str, List[str]]:
    """
    Returns a dictionary that maps the time period (CURRENT or HISTORICAL) to a list of column names.
    The list of column names includes all numerical cols like population, per_100k and pct_share.

    Returns:
        dict: A dictionary that maps the time period string to a list of needed numerical column names .
    """

    current_float_cols = [std_col.POPULATION_PCT_COL, std_col.POPULATION_COL]
    historical_float_cols = []

    # include all numerical columns in the time map
    for topic_prefix in het_to_source_topic_all_to_race_prefix_map.keys():
        topic_per_100k = f'{topic_prefix}_{std_col.PER_100K_SUFFIX}'
        current_float_cols.append(topic_per_100k)
        historical_float_cols.append(topic_per_100k)

    TIME_MAP = {CURRENT: current_float_cols, HISTORICAL: historical_float_cols}

    return TIME_MAP


def get_df_from_chr_excel_sheet(sheet_name: str) -> pd.DataFrame:
    return gcs_to_bq_util.load_xlsx_as_df_from_data_dir(
        CHR_DIR,
        '2024_county_health_release_data_-_v1.xlsx',
        sheet_name,
        header=1,
        usecols=get_source_usecols(),
        dtype={
            source_fips_col: 'str',
        },
    )
