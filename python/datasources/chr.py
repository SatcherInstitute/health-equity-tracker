from datasources.data_source import DataSource
from ingestion import dataset_utils, gcs_to_bq_util, standardized_columns as std_col


source_cols = [
    # 'State FIPS Code',
    # 'County FIPS Code',
    '5-digit FIPS Code',
    # 'State Abbreviation',
    # 'Name',
    # 'Release Year',
]

source_topic_cols = [
    'Preventable Hospital Stays raw value',
    # 'Preventable Hospital Stays numerator',
    # 'Preventable Hospital Stays denominator',
    # 'Preventable Hospital Stays CI low',
    # 'Preventable Hospital Stays CI high',
    'Preventable Hospital Stays (AIAN)',
    'Preventable Hospital Stays (Asian/Pacific Islander)',
    'Preventable Hospital Stays (Black)',
    'Preventable Hospital Stays (Hispanic)',
    'Preventable Hospital Stays (White)',
]

source_dtypes = {
    **{col: float for col in source_topic_cols},
    **{col: str for col in source_cols},
}

melt_map = {
    "preventable_hospitalization_per_100k": {
        'Preventable Hospital Stays (Black)': std_col.Race.BLACK_NH.value,
        'Preventable Hospital Stays (Hispanic)': std_col.Race.HISP.value,
        'Preventable Hospital Stays (AIAN)': std_col.Race.AIAN_NH.value,
        'Preventable Hospital Stays (Asian/Pacific Islander)': std_col.Race.API_NH.value,
        'Preventable Hospital Stays (White)': std_col.Race.WHITE_NH.value,
        'Preventable Hospital Stays raw value': std_col.Race.ALL.value,
    },
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
            'chr',
            "analytic_data2024.csv",
            usecols=use_cols,
            dtype=source_dtypes,
            skiprows=[1],  # skip weird sub header row
        )

        # drop national and state-level rows
        df = df[~df['5-digit FIPS Code'].str.endswith('000')]

        df = dataset_utils.melt_to_het_style_df(df, std_col.RACE_CATEGORY_ID_COL, source_cols, melt_map)

        std_col.add_race_columns_from_category_id(df)

        df = df.rename(columns={"5-digit FIPS Code": std_col.COUNTY_FIPS_COL})

        table_name = f"{demographic}_county"

        print(table_name)
        print(df.to_string())
        print(df)

        # gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_name, column_types=col_types)
