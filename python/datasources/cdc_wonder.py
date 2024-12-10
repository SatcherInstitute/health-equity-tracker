import pandas as pd
from ingestion.cdc_wonder_utils import (
    ALL_CANCER_CONDITIONS,
    DEMOGRAPHIC_TO_STANDARD_BY_COL,
    CANCERS_WITH_SEX_DEMOGRAPHIC,
    TMP_ALL,
    get_float_cols,
    load_cdc_df_from_data_dir,
)
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion import standardized_columns as std_col
from ingestion.constants import (
    ALL_VALUE,
    CURRENT,
    HISTORICAL,
    NATIONAL_LEVEL,
    UNKNOWN,
    US_NAME,
)
from ingestion.dataset_utils import (
    generate_pct_rel_inequity_col,
    generate_pct_share_col_with_unknowns,
    generate_pct_share_col_without_unknowns,
    generate_time_df_with_cols_and_types,
)
from ingestion.het_types import CANCER_TYPE_OR_ALL, GEO_TYPE
from ingestion.merge_utils import merge_state_ids


class CdcWonderData(DataSource):
    @staticmethod
    def get_id():
        return 'CDC_WONDER_DATA'

    @staticmethod
    def get_table_name():
        return 'cdc_wonder_data'

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for CdcWonderData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        """Writes CDC Wonder data to BigQuery with specific demographic and geographic splits

        Args:
            dataset: BigQuery dataset to write to
            gcs_bucket: GCS bucket (unused)
            **attrs: Additional attributes including 'demographic' and 'geographic'
        """
        demographic_type = self.get_attr(attrs, 'demographic')
        geo_level = self.get_attr(attrs, 'geographic')

        df = self.generate_breakdown_df(demographic_type, geo_level)

        for time_view in (CURRENT, HISTORICAL):
            table_id = gcs_to_bq_util.make_bq_table_id(demographic_type, geo_level, time_view)
            conditions = CANCERS_WITH_SEX_DEMOGRAPHIC if demographic_type == std_col.SEX_COL else ALL_CANCER_CONDITIONS
            float_cols = get_float_cols(time_view, conditions)

            df_for_bq, col_types = generate_time_df_with_cols_and_types(df, float_cols, table_id, demographic_type)
            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)

    def generate_breakdown_df(
        self,
        demographic_type: CANCER_TYPE_OR_ALL,
        geo_level: GEO_TYPE,
    ) -> pd.DataFrame:
        """Generates HET-style dataframe by demographic type and geographic level

        Args:
            demographic_type: Type of demographic analysis (e.g., 'age', 'race_and_ethnicity', 'sex', 'all')
            geo_level: Geographic level ('national' or 'state')

        Returns:
            pd.DataFrame: Processed dataframe with demographic and geographic splits
        """
        demographic_col = (
            std_col.RACE_CATEGORY_ID_COL if demographic_type == std_col.RACE_OR_HISPANIC_COL else demographic_type
        )
        all_val = std_col.Race.ALL.value if demographic_type == std_col.RACE_OR_HISPANIC_COL else ALL_VALUE

        conditions = CANCERS_WITH_SEX_DEMOGRAPHIC if demographic_type == std_col.SEX_COL else ALL_CANCER_CONDITIONS

        alls_df = load_cdc_df_from_data_dir(geo_level, TMP_ALL, conditions)
        alls_df[demographic_col] = all_val

        demographic_df = load_cdc_df_from_data_dir(geo_level, demographic_type, conditions)

        df = pd.concat([demographic_df, alls_df], axis=0)
        df = df.replace(to_replace=DEMOGRAPHIC_TO_STANDARD_BY_COL)

        if geo_level == NATIONAL_LEVEL:
            df[std_col.STATE_NAME_COL] = US_NAME
        else:
            df = merge_state_ids(df)

        count_to_pct_share_map = {}
        raw_totals_map = {}
        pct_share_map = {}
        pop_pct_share_map = {}
        pct_rel_inequity_map = {}

        for condition in conditions:
            cancer_type = condition.lower()

            # Define column names
            count_col = f'{cancer_type}_count_{std_col.RAW_SUFFIX}'
            pop_col = f'{cancer_type}_{std_col.RAW_POP_SUFFIX}'
            pct_share_col = f'{cancer_type}_{std_col.PCT_SHARE_SUFFIX}'
            pop_pct_share_col = f'{cancer_type}_{std_col.POP_PCT_SUFFIX}'
            pct_rel_inequity_col = f'{cancer_type}_{std_col.PCT_REL_INEQUITY_SUFFIX}'

            # Set up column mappings
            count_to_pct_share_map[count_col] = pct_share_col
            count_to_pct_share_map[pop_col] = pop_pct_share_col

            # Set up inequity calculation mappings
            raw_totals_map[cancer_type] = count_col
            pct_share_map[count_col] = pct_share_col
            pop_pct_share_map[count_col] = pop_pct_share_col
            pct_rel_inequity_map[count_col] = pct_rel_inequity_col

            if demographic_type == std_col.RACE_OR_HISPANIC_COL:
                std_col.add_race_columns_from_category_id(df)

        # Handle age-specific calculations
        if demographic_type == std_col.AGE_COL:
            non_all_df = df[df[demographic_type] != ALL_VALUE]
            for condition in conditions:
                count_col = f'{condition.lower()}_count_{std_col.RAW_SUFFIX}'
                if count_col in df.columns:
                    # Update 'All' rows with sum of available age groups
                    available_total = non_all_df[count_col].sum()
                    df.loc[df[demographic_type] == ALL_VALUE, count_col] = available_total

        # Generate percentage share & inequity columns
        if demographic_type in [std_col.RACE_OR_HISPANIC_COL, std_col.AGE_COL, std_col.SEX_COL]:
            df = generate_pct_share_col_without_unknowns(
                df,
                count_to_pct_share_map,
                demographic_type,
                ALL_VALUE,
            )
        else:
            df = generate_pct_share_col_with_unknowns(
                df,
                count_to_pct_share_map,
                demographic_type,
                ALL_VALUE,
                UNKNOWN,
            )

        for raw_total_col in raw_totals_map.values():
            if raw_total_col in df.columns:
                df = generate_pct_rel_inequity_col(
                    df,
                    pct_share_map[raw_total_col],
                    pop_pct_share_map[raw_total_col],
                    pct_rel_inequity_map[raw_total_col],
                )

        df = df.sort_values(by=[std_col.STATE_FIPS_COL, demographic_col]).reset_index(drop=True)

        return df
