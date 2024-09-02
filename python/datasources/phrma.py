import pandas as pd
from typing import cast
from datasources.data_source import DataSource
from ingestion.constants import (
    COUNTY_LEVEL,
    NATIONAL_LEVEL,
    ALL_VALUE,
    US_NAME,
    UNKNOWN,
)
from ingestion.dataset_utils import (
    generate_pct_share_col_with_unknowns,
    generate_pct_share_col_without_unknowns,
)
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.merge_utils import merge_county_names, merge_state_ids
from ingestion.het_types import (
    GEO_TYPE,
    PHRMA_BREAKDOWN_TYPE,
)
from ingestion.phrma_utils import (
    TMP_ALL,
    ADHERENCE_RATE,
    PER_100K,
    MEDICARE_DISEASE_COUNT,
    COUNT_TOTAL,
    COUNT_YES,
    MEDICARE_POP_COUNT,
    PHRMA_PCT_CONDITIONS,
    PHRMA_100K_CONDITIONS,
    ADHERENCE,
    BENEFICIARIES,
    BREAKDOWN_TO_STANDARD_BY_COL,
    load_phrma_df_from_data_dir,
    PHRMA_MEDICARE_CONDITIONS,
)


"""
NOTE: Phrma data comes in .xlsx files, with breakdowns by sheet.
We need to first convert these to csv files as pandas is VERY slow on excel files,
using the `scripts/extract_excel_sheets_to_csvs` script.

`./scripts/extract_excel_sheets_to_csvs --directory ../data/phrma`
"""

# constants
ELIGIBILITY = "eligibility"


class PhrmaData(DataSource):
    @staticmethod
    def get_id():
        return 'PHRMA_DATA'

    @staticmethod
    def get_table_name():
        return 'phrma_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for PhrmaData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demo_type = self.get_attr(attrs, 'demographic')
        geo_level = self.get_attr(attrs, 'geographic')

        alls_df = load_phrma_df_from_data_dir(geo_level, TMP_ALL, 'standard', PHRMA_MEDICARE_CONDITIONS)

        table_name = f'{demo_type}_{geo_level}'
        df = self.generate_breakdown_df(demo_type, geo_level, alls_df)

        # POP COMPARE FOR 100K
        float_cols = [
            f'{std_col.MEDICARE_PREFIX}_{std_col.POPULATION_COL}_{std_col.PCT_SHARE_SUFFIX}',
            f'{std_col.MEDICARE_PREFIX}_{std_col.POPULATION_COL}',
        ]

        # PCT_RATE CONDITIONS
        for condition in PHRMA_PCT_CONDITIONS:
            # rate, pct_share, count cols
            for metric in [
                std_col.PCT_RATE_SUFFIX,
                std_col.PCT_SHARE_SUFFIX,
                std_col.RAW_SUFFIX,
            ]:
                float_cols.append(f'{condition}_{ADHERENCE}_{metric}')
            # valid-population comparison pct_share and count cols
            float_cols.append(f'{condition}_{BENEFICIARIES}_{std_col.RAW_SUFFIX}')

        # PER_100K CONDITIONS
        for condition in PHRMA_100K_CONDITIONS:
            # rate, pct_share, count_cols
            for metric in [
                std_col.PER_100K_SUFFIX,
                std_col.PCT_SHARE_SUFFIX,
                std_col.RAW_SUFFIX,
            ]:
                float_cols.append(f'{condition}_{metric}')

        col_types = gcs_to_bq_util.get_bq_column_types(df, float_cols)

        gcs_to_bq_util.add_df_to_bq(df, dataset, table_name, column_types=col_types)

    def generate_breakdown_df(
        self,
        demo_breakdown: PHRMA_BREAKDOWN_TYPE,
        geo_level: GEO_TYPE,
        alls_df: pd.DataFrame,
    ) -> pd.DataFrame:
        """Generates HET-stye dataframe by demo_breakdown and geo_level
        demo_breakdown: string equal to `lis`, `eligibility`, `age`, `race_and_ethnicity`, or `sex`
        geo_level: string equal to `county`, `national`, or `state`
        alls_df: the data frame containing the all values for each demographic demo_breakdown.
        return: a breakdown df by demographic and geo_level"""

        # give the ALL df a demographic column with correctly capitalized "All"/"ALL" value
        demo_col = std_col.RACE_CATEGORY_ID_COL if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else demo_breakdown
        all_val = std_col.Race.ALL.value if demo_breakdown == std_col.RACE_OR_HISPANIC_COL else ALL_VALUE

        alls_df = alls_df.copy()
        alls_df[demo_col] = all_val

        fips_to_use = std_col.COUNTY_FIPS_COL if geo_level == COUNTY_LEVEL else std_col.STATE_FIPS_COL

        breakdown_group_df = load_phrma_df_from_data_dir(
            geo_level, demo_breakdown, 'standard', PHRMA_MEDICARE_CONDITIONS
        )

        df = pd.concat([breakdown_group_df, alls_df], axis=0)
        df = df.replace(to_replace=BREAKDOWN_TO_STANDARD_BY_COL)

        # ADHERENCE rate
        for condition in PHRMA_PCT_CONDITIONS:
            source_col_name = f'{condition}_{ADHERENCE_RATE}'
            het_col_name = f'{condition}_{ADHERENCE}_{std_col.PCT_RATE_SUFFIX}'
            df[het_col_name] = df[source_col_name].multiply(100).round()

        for condition in PHRMA_100K_CONDITIONS:
            source_col_name = f'{condition}_{PER_100K}'
            het_col_name = f'{condition}_{std_col.PER_100K_SUFFIX}'
            df[het_col_name] = df[source_col_name].round()

        if geo_level == COUNTY_LEVEL:
            df[std_col.STATE_FIPS_COL] = df[std_col.COUNTY_FIPS_COL].str.slice(0, 2)
            df = merge_county_names(df)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_NAME_COL] = US_NAME
        else:
            df = merge_state_ids(df)

        count_to_share_map = {
            # Pct share of adherence
            **{
                f'{condition}_{COUNT_YES}': f'{condition}_{ADHERENCE}_{std_col.PCT_SHARE_SUFFIX}'
                for condition in PHRMA_PCT_CONDITIONS
            },
            # Pct Share for disease
            **{
                f'{condition}_{MEDICARE_DISEASE_COUNT}': f'{condition}_{std_col.PCT_SHARE_SUFFIX}'
                for condition in PHRMA_100K_CONDITIONS
            },
            # Shared comparison population share col for all 100ks
            MEDICARE_POP_COUNT: (f'{std_col.MEDICARE_PREFIX}_{std_col.POPULATION_COL}_{std_col.PCT_SHARE_SUFFIX}'),
        }

        if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
            df = generate_pct_share_col_with_unknowns(
                df, count_to_share_map, demo_col, all_val, std_col.Race.UNKNOWN.value
            )
        else:
            # Some Sex breakdowns contained null count rows for Unknown with 100k/100k rate
            if demo_breakdown == std_col.SEX_COL:
                df = df[df[demo_breakdown] != UNKNOWN]
            df = generate_pct_share_col_without_unknowns(
                df, count_to_share_map, cast(PHRMA_BREAKDOWN_TYPE, demo_col), all_val
            )

        rename_col_map = {MEDICARE_POP_COUNT: f'{std_col.MEDICARE_PREFIX}_{std_col.POPULATION_COL}'}
        for condition in PHRMA_PCT_CONDITIONS:
            rename_col_map[f'{condition}_{COUNT_YES}'] = f'{condition}_{ADHERENCE}_{std_col.RAW_SUFFIX}'
            rename_col_map[f'{condition}_{COUNT_TOTAL}'] = f'{condition}_{BENEFICIARIES}_{std_col.RAW_SUFFIX}'
        for condition in PHRMA_100K_CONDITIONS:
            rename_col_map[f'{condition}_{MEDICARE_DISEASE_COUNT}'] = f'{condition}_{std_col.RAW_SUFFIX}'

        df = df.rename(columns=rename_col_map)

        df = df.drop(
            columns=[
                *[f'{condition}_{ADHERENCE_RATE}' for condition in PHRMA_PCT_CONDITIONS],
                *[f'{condition}_{PER_100K}' for condition in PHRMA_100K_CONDITIONS],
            ]
        )

        if demo_breakdown == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)

        df = df.sort_values(by=[fips_to_use, demo_col]).reset_index(drop=True)

        return df
