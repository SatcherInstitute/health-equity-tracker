import pandas as pd
from datasources.cdc_cancer_utils import (
    BREAKDOWN_TO_STANDARD_BY_COL,
    CDC_CANCER_PCT_CONDITIONS,
    CDC_CANCER_PCT_CONDITIONS_WITH_SEX_BREAKDOWN,
    COUNT_COL,
    POP_COL,
    TMP_ALL,
    load_cdc_df_from_data_dir,
)
from datasources.data_source import DataSource
from ingestion.constants import ALL_VALUE, NATIONAL_LEVEL, UNKNOWN, US_NAME
from ingestion.dataset_utils import (
    build_bq_col_types,
    generate_pct_share_col_with_unknowns,
    generate_pct_share_col_without_unknowns,
)
from ingestion.het_types import CANCER_TYPE_OR_ALL, GEO_TYPE
from ingestion import standardized_columns as std_col
from ingestion.merge_utils import merge_state_ids
from ingestion import gcs_to_bq_util


class CdcCancerData(DataSource):
    @staticmethod
    def get_id():
        return 'CDC_CANCER_DATA'

    @staticmethod
    def get_table_name():
        return 'cdc_cancer_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for CdcCancerData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demo_type = self.get_attr(attrs, 'demographic')
        geo_level = self.get_attr(attrs, 'geographic')

        table_name = f'{demo_type}_{geo_level}_current'

        df = self.generate_breakdown_df(demo_type, geo_level)

        bq_col_types = build_bq_col_types(df)

        df.to_csv('testing_output.csv', index=False)

        gcs_to_bq_util.add_df_to_bq(df, dataset, table_name, column_types=bq_col_types)

    def generate_breakdown_df(
        self,
        demo_breakdown: CANCER_TYPE_OR_ALL,
        geo_level: GEO_TYPE,
    ) -> pd.DataFrame:
        """Generates HET-stye dataframe by demo_breakdown and geo_level
        demo_breakdown: string equal to `lis`, `eligibility`, `age`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `national`, or `state`
        return: a breakdown df by demographic and geo_level"""

        demo_col = std_col.RACE_CATEGORY_ID_COL if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else demo_breakdown
        all_val = std_col.Race.ALL.value if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else ALL_VALUE

        conditions = (
            CDC_CANCER_PCT_CONDITIONS_WITH_SEX_BREAKDOWN
            if demo_breakdown == std_col.SEX_COL
            else CDC_CANCER_PCT_CONDITIONS
        )

        alls_df = load_cdc_df_from_data_dir(geo_level, TMP_ALL, conditions)
        alls_df[demo_col] = all_val

        breakdown_group_df = load_cdc_df_from_data_dir(geo_level, demo_breakdown, conditions)

        df = pd.concat([breakdown_group_df, alls_df], axis=0)
        df = df.replace(to_replace=BREAKDOWN_TO_STANDARD_BY_COL)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_NAME_COL] = US_NAME
        else:
            df = merge_state_ids(df)

        # rename count cols
        rename_col_map = {}
        count_to_pct_share_map = {}
        for condition in conditions:
            # source cols
            source_rate_numerator = f'{condition}_{COUNT_COL}'
            source_rate_denominator = f'{condition}_{POP_COL}'

            # het cols to make
            cancer_type = condition.lower()
            het_rate_numerator = f'{cancer_type}_count_{std_col.RAW_SUFFIX}'
            het_rate_denominator = f'{cancer_type}_population_{std_col.RAW_SUFFIX}'
            het_pct_share = f'{cancer_type}_{std_col.PCT_SHARE_SUFFIX}'
            het_pop_pct_share = f'{cancer_type}_pop_{std_col.PCT_SHARE_SUFFIX}'

            # Rename mappings
            rename_col_map[source_rate_numerator] = het_rate_numerator
            rename_col_map[source_rate_denominator] = het_rate_denominator

            # Pct share mappings
            count_to_pct_share_map[het_rate_numerator] = het_pct_share
            count_to_pct_share_map[het_rate_denominator] = het_pop_pct_share

            df = df.rename(columns=rename_col_map)

        if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)

        # generate pct share columns
        if demo_breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.AGE_COL, std_col.SEX_COL]:
            df = generate_pct_share_col_without_unknowns(
                df,
                count_to_pct_share_map,
                demo_breakdown,
                ALL_VALUE,
            )
        else:
            df = generate_pct_share_col_with_unknowns(
                df,
                count_to_pct_share_map,
                demo_breakdown,
                ALL_VALUE,
                UNKNOWN,
            )

        # if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
        #     df = get_age_adjusted_ratios(df, conditions)

        df = df.sort_values(by=[std_col.STATE_FIPS_COL, demo_col]).reset_index(drop=True)

        return df
