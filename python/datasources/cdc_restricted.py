import ingestion.standardized_columns as std_col
from ingestion.standardized_columns import generate_column_name
from ingestion.standardized_columns import Race

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.dataset_utils import merge_fips_codes, merge_pop_numbers, generate_per_100k_col, generate_pct_share_col


# CDC_RESTRICTED_FILES = [
#     'cdc_restricted_by_race_county.csv',
#     'cdc_restricted_by_race_state.csv',
#     'cdc_restricted_by_age_county.csv',
#     'cdc_restricted_by_age_state.csv',
#     'cdc_restricted_by_sex_county.csv',
#     'cdc_restricted_by_sex_state.csv',
#     'cdc_restricted_by_race_and_age_state.csv'
# ]


COVID_CONDITION_TO_PREFIX = {
    std_col.COVID_CASES: std_col.COVID_CASES_PREFIX,
    std_col.COVID_HOSP_Y: std_col.COVID_HOSP_PREFIX,
    std_col.COVID_DEATH_Y: std_col.COVID_DEATH_PREFIX,
}


class CDCRestrictedData(DataSource):

    @staticmethod
    def get_id():
        return 'CDC_RESTRICTED_DATA'

    @staticmethod
    def get_table_name():
        return 'cdc_restricted_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCRestrictedData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        for geo in ['state']:
            for demo in ['sex']:
                filename = f'cdc_restricted_by_{demo}_{geo}.csv'
                df = gcs_to_bq_util.load_csv_as_df(
                    gcs_bucket, filename, dtype={'county_fips': str})

                column_types = {c: 'STRING' for c in df.columns}
                if std_col.RACE_INCLUDES_HISPANIC_COL in df.columns:
                    column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

                df = self.generate_breakdown(df, demo, geo)

                table_name = f'by_{demo}_{geo}_processed'
                gcs_to_bq_util.add_df_to_bq(
                    df, dataset, table_name, column_types=column_types)

    def generate_breakdown(self, df, demo, geo):
        if geo == 'state':
            # The county files already have fips codes
            df = merge_fips_codes(df)

        df = merge_pop_numbers(df, demo, geo)

        for raw_count_col, prefix in COVID_CONDITION_TO_PREFIX.items():
            per_100k_col_name = generate_column_name(prefix, std_col.PER_100K_SUFFIX)
            df = generate_per_100k_col(df, raw_count_col, std_col.POPULATION_COL, per_100k_col_name)

        # calculate pct_share
        for raw_count_col, prefix in COVID_CONDITION_TO_PREFIX.items():
            pct_share_col = generate_column_name(prefix, std_col.PCT_SHARE_SUFFIX)
            breakdown_col = std_col.RACE_CATEGORY_ID_COL if demo == 'race' else demo
            total_val = Race.ALL.value if demo == 'race' else std_col.ALL_VALUE

            df = generate_pct_share_col(df, raw_count_col, pct_share_col, breakdown_col, total_val)
            df = df.loc[df[breakdown_col] != 'Unknown', [pct_share_col]] = ""

        # Clean up column names.
        self.clean_frame_column_names(df)
        return df

