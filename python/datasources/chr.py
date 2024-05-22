from datasources.data_source import DataSource
from ingestion import dataset_utils, merge_utils, gcs_to_bq_util, standardized_columns as std_col
from ingestion.constants import COUNTY_LEVEL

CHR = 'chr'

source_state_fips = 'State FIPS Code'
source_county_fips = '5-digit FIPS Code'
source_time_period = 'Release Year'

source_cols = [source_time_period, source_state_fips, source_county_fips]

prev_hosp_per_100k_col = std_col.generate_column_name(std_col.PREVENTABLE_HOSP_PREFIX, std_col.PER_100K_SUFFIX)

source_race_to_id_map = {
    'raw value': std_col.Race.ALL.value,
    '(AIAN)': std_col.Race.AIAN_NH.value,
    '(Asian/Pacific Islander)': std_col.Race.API_NH.value,
    '(Black)': std_col.Race.BLACK_NH.value,
    '(Hispanic)': std_col.Race.HISP.value,
    '(White)': std_col.Race.WHITE_NH.value,
}

melt_map = {
    prev_hosp_per_100k_col: {
        f'Preventable Hospital Stays {source_race}': het_race_id
        for source_race, het_race_id in source_race_to_id_map.items()
    },
}

source_topic_cols = list(melt_map[prev_hosp_per_100k_col].keys())
# NOTE: cols for numerator and denominator are all NULL

source_dtypes = {
    **{topic_col: 'float64' for topic_col in source_topic_cols},
    **{col: 'str' for col in source_cols},
}


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

        use_cols = source_cols + source_topic_cols

        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            CHR,
            "analytic_data2024.csv",
            usecols=use_cols,
            dtype=source_dtypes,
            skiprows=[1],  # skip weird sub header row
        )

        # drop national and state-level rows
        df = df[~df[source_county_fips].str.endswith('000')]

        df = dataset_utils.melt_to_het_style_df(df, std_col.RACE_CATEGORY_ID_COL, source_cols, melt_map)

        std_col.add_race_columns_from_category_id(df)

        df = df.rename(
            columns={
                source_county_fips: std_col.COUNTY_FIPS_COL,
                source_state_fips: std_col.STATE_FIPS_COL,
                source_time_period: std_col.TIME_PERIOD_COL,
            }
        )

        df = merge_utils.merge_yearly_pop_numbers(df, std_col.RACE_COL, COUNTY_LEVEL)
        df = merge_utils.merge_state_ids(df)
        df = merge_utils.merge_county_names(df)

        table_name = f"{demographic}_{COUNTY_LEVEL}"

        print(table_name)
        # df.to_csv(table_name, index=False)
        print(df)

        # gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_name, column_types=col_types)
