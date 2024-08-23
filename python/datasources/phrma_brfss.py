import pandas as pd
from datasources.data_source import DataSource
from ingestion.constants import NATIONAL_LEVEL, ALL_VALUE, US_NAME, UNKNOWN
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_state_ids
from ingestion.dataset_utils import (
    generate_pct_share_col_without_unknowns,
    generate_pct_share_col_with_unknowns,
    build_bq_col_types,
)
from ingestion.het_types import (
    GEO_TYPE,
    PHRMA_BREAKDOWN_TYPE,
)
from ingestion.phrma_utils import (
    ADHERENCE_RATE_LOWER,
    COUNT_TOTAL_LOWER,
    COUNT_YES_LOWER,
    PHRMA_CANCER_PCT_CONDITIONS,
    SCREENED,
    SCREENING_ELIGIBLE,
    BREAKDOWN_TO_STANDARD_BY_COL,
    load_phrma_df_from_data_dir,
)

"""
NOTE: Phrma data comes in .xlsx files, with breakdowns by sheet.
We need to first convert these to csv files as pandas is VERY slow on excel files,
using the `scripts/extract_excel_sheets_to_csvs` script.

`./scripts/extract_excel_sheets_to_csvs --directory ../data/phrma/{SCREENED}`
"""


class PhrmaBrfssData(DataSource):
    @staticmethod
    def get_id():
        return 'PHRMA_BRFSS_DATA'

    @staticmethod
    def get_table_name():
        return 'phrma_brfss_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for PhrmaBrfssData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demo_type = self.get_attr(attrs, 'demographic')
        geo_level = self.get_attr(attrs, 'geographic')

        table_name = f'{demo_type}_{geo_level}'

        df = self.generate_breakdown_df(demo_type, geo_level)

        bq_col_types = build_bq_col_types(df)
        gcs_to_bq_util.add_df_to_bq(df, dataset, table_name, column_types=bq_col_types)

    def generate_breakdown_df(
        self,
        demo_breakdown: PHRMA_BREAKDOWN_TYPE,
        geo_level: GEO_TYPE,
    ) -> pd.DataFrame:
        """Generates HET-stye dataframe by demo_breakdown and geo_level
        demo_breakdown: string equal to `lis`, `eligibility`, `age`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `national`, or `state`
        return: a breakdown df by demographic and geo_level"""

        # give the ALL df a demographic column with correctly capitalized "All"/"ALL" value
        demo_col = std_col.RACE_CATEGORY_ID_COL if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else demo_breakdown
        all_val = std_col.Race.ALL.value if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else ALL_VALUE

        alls_df = load_phrma_df_from_data_dir(geo_level, 'all', 'cancer')
        alls_df[demo_col] = all_val

        breakdown_group_df = load_phrma_df_from_data_dir(geo_level, demo_breakdown, 'cancer')

        df = pd.concat([breakdown_group_df, alls_df], axis=0)
        df = df.replace(to_replace=BREAKDOWN_TO_STANDARD_BY_COL)

        # ADHERENCE rate
        for condition in PHRMA_CANCER_PCT_CONDITIONS:
            source_col_name = f'{condition}_{ADHERENCE_RATE_LOWER}'
            het_col_name = f'{condition.lower()}_{SCREENED}_{std_col.PCT_RATE_SUFFIX}'
            df[het_col_name] = df[source_col_name].round()
            df = df.drop(source_col_name, axis=1)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_NAME_COL] = US_NAME
        else:
            df = merge_state_ids(df)

        # rename count cols
        rename_col_map = {}
        count_to_pct_share_map = {}
        for condition in PHRMA_CANCER_PCT_CONDITIONS:

            # source cols
            source_rate_numerator = f'{condition}_{COUNT_YES_LOWER}'
            source_rate_denominator = f'{condition}_{COUNT_TOTAL_LOWER}'

            # het cols to make
            cancer_type = condition.lower()
            het_rate_numerator = f'{cancer_type}_{SCREENED}_{std_col.RAW_SUFFIX}'
            het_rate_denominator = f'{cancer_type}_{SCREENING_ELIGIBLE}_{std_col.RAW_SUFFIX}'
            het_pct_share = f'{cancer_type}_{SCREENED}_{std_col.PCT_SHARE_SUFFIX}'
            het_pop_pct_share = f'{cancer_type}_{SCREENING_ELIGIBLE}_{std_col.POP_PCT_SUFFIX}'

            # prepare rename mappings
            rename_col_map[source_rate_numerator] = het_rate_numerator
            rename_col_map[source_rate_denominator] = het_rate_denominator

            # prepare _pct_share and _pop_pct_share mappings
            count_to_pct_share_map[het_rate_numerator] = het_pct_share
            count_to_pct_share_map[het_rate_denominator] = het_pop_pct_share

        df = df.rename(columns=rename_col_map)

        if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)

        # generate pct share columns
        if demo_breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.AGE_COL]:
            # all demographics are known
            df = generate_pct_share_col_without_unknowns(
                df,
                count_to_pct_share_map,
                demo_breakdown,
                ALL_VALUE,
            )
        else:
            # there are rows for Unknown demographic, however the pct_shares for numerator total
            # and denominator total are both calculated as the share of KNOWN.
            # Unknowns are added back on to populate the Unknowns Map
            df = generate_pct_share_col_with_unknowns(
                df,
                count_to_pct_share_map,
                demo_breakdown,
                ALL_VALUE,
                UNKNOWN,
            )

        df = df.sort_values(by=[std_col.STATE_FIPS_COL, demo_col]).reset_index(drop=True)

        return df
