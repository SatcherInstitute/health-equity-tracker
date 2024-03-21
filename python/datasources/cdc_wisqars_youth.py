import pandas as pd

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.cdc_wisqars_utils import (
    convert_columns_to_numeric,
    generate_cols_map,
    DATA_DIR,
    RACE_NAMES_MAPPING,
    WISQARS_COLS,
)
from ingestion.constants import (
    CURRENT,
    HISTORICAL,
    NATIONAL_LEVEL,
    US_NAME,
)
from ingestion.dataset_utils import (
    combine_race_ethnicity,
    generate_pct_rel_inequity_col,
    generate_pct_share_col_with_unknowns,
    generate_per_100k_col,
    generate_time_df_with_cols_and_types,
)
from ingestion.merge_utils import merge_state_ids

"""
Data Source: CDC WISQARS Youth (data on gun violence)

Description:
- The data on gun violence by youth and race is downloaded from the CDC WISQARS database.
- The downloaded data is stored locally in our data/cdc_wisqars directory for subsequent use.

Instructions for Downloading Data:
1. Visit the WISQARS website: https://wisqars.cdc.gov/reports/
2. Select the injury outcome:
    - `Fatal`
3. Select the year and race options:
    - `2018-2021 by Single Race`
4. Select the desired data years:
    - `2018-2021`
5. Select the geography:
    - `United States`
6. Select the intent:
    - `All Intents`
7. Select the mechanism:
    - `Firearm`
8. Select the demographic selections:
   - `Custom Age Range: <1 to Unknown`, `Both Sexes`, `All Races`
5. Select appropriate report layout:
   - For youth-national-all: `Intent`, `None`, `None`, `None`
   - For youth-national-race: `Intent`, `Race`, `Ethnicity`, `None`
   - For youth-state-all: `Intent`, `State`, `None`, `None`
   - For youth-state-race: `Intent`, `State`, `Race`, `Ethnicity`
Notes:
- There is no county-level data.
- Race data is only available for fatal data and is available from 2018-2021.

Last Updated: 2/24
"""

TIME_MAP = {
    CURRENT: [
        'gun_deaths_young_adults_estimated_total',
        'gun_deaths_young_adults_pct_share',
        'gun_deaths_young_adults_per_100k',
        'gun_deaths_young_adults_population',
        'gun_deaths_young_adults_population_pct',
        'gun_deaths_youth_estimated_total',
        'gun_deaths_youth_pct_share',
        'gun_deaths_youth_per_100k',
        'gun_deaths_youth_population',
        'gun_deaths_youth_population_pct',
    ],
    HISTORICAL: [
        'gun_deaths_young_adults_pct_relative_inequity',
        'gun_deaths_young_adults_pct_share',
        'gun_deaths_young_adults_per_100k',
        'gun_deaths_youth_pct_relative_inequity',
        'gun_deaths_youth_pct_share',
        'gun_deaths_youth_per_100k',
    ],
}

CATEGORIES_LIST = ['gun_deaths_young_adults', 'gun_deaths_youth']
ESTIMATED_TOTALS_MAP = generate_cols_map(CATEGORIES_LIST, std_col.RAW_SUFFIX)
PCT_REL_INEQUITY_MAP = generate_cols_map(ESTIMATED_TOTALS_MAP.values(), std_col.PCT_REL_INEQUITY_SUFFIX)
PCT_SHARE_MAP = generate_cols_map(ESTIMATED_TOTALS_MAP.values(), std_col.PCT_SHARE_SUFFIX)
PCT_SHARE_MAP['gun_deaths_young_adults_population'] = 'gun_deaths_young_adults_population_pct'
PCT_SHARE_MAP['gun_deaths_youth_population'] = 'gun_deaths_youth_population_pct'
PER_100K_MAP = generate_cols_map(CATEGORIES_LIST, std_col.PER_100K_SUFFIX)


class CDCWisqarsYouthData(DataSource):
    @staticmethod
    def get_id():
        return "CDC_WISQARS_YOUTH_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_wisqars_youth_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCHIVData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")

        national_totals_by_intent_df = load_wisqars_df_from_data_dir("all", geo_level)

        df = self.generate_breakdown_df(demographic, geo_level, national_totals_by_intent_df)

        for table_type in [CURRENT, HISTORICAL]:
            table_name = f"youth_by_{demographic}_{geo_level}_{table_type}"
            time_cols = TIME_MAP[table_type]

            df_for_bq, col_types = generate_time_df_with_cols_and_types(df, time_cols, table_type, demographic)

            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_name, column_types=col_types)

    def generate_breakdown_df(self, breakdown: str, geo_level: str, alls_df: pd.DataFrame):
        cols_to_standard = {
            "year": std_col.TIME_PERIOD_COL,
            "state": std_col.STATE_NAME_COL,
            "race": std_col.RACE_CATEGORY_ID_COL,
        }

        breakdown_group_df = load_wisqars_df_from_data_dir(breakdown, geo_level)

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=cols_to_standard)

        std_col.add_race_columns_from_category_id(df)

        df = merge_state_ids(df)

        df = generate_pct_share_col_with_unknowns(
            df,
            PCT_SHARE_MAP,
            std_col.RACE_OR_HISPANIC_COL,
            std_col.ALL_VALUE,
            'Unknown race',
        )

        for col in ESTIMATED_TOTALS_MAP.values():
            pop_col = (
                'gun_deaths_young_adults_population'
                if col == 'gun_deaths_young_adults'
                else 'gun_deaths_youth_population'
            )
            df = generate_pct_rel_inequity_col(df, PCT_SHARE_MAP[col], pop_col, PCT_REL_INEQUITY_MAP[col])

        gun_deaths_column_order = [
            std_col.TIME_PERIOD_COL,
            std_col.STATE_NAME_COL,
            std_col.STATE_FIPS_COL,
            std_col.RACE_OR_HISPANIC_COL,
            std_col.RACE_CATEGORY_ID_COL,
            'gun_deaths_young_adults_estimated_total',
            'gun_deaths_young_adults_pct_relative_inequity',
            'gun_deaths_young_adults_pct_share',
            'gun_deaths_young_adults_per_100k',
            'gun_deaths_young_adults_population',
            'gun_deaths_young_adults_population_pct',
            'gun_deaths_youth_estimated_total',
            'gun_deaths_youth_pct_relative_inequity',
            'gun_deaths_youth_pct_share',
            'gun_deaths_youth_per_100k',
            'gun_deaths_youth_population',
            'gun_deaths_youth_population_pct',
        ]

        df = (
            df[gun_deaths_column_order]
            .sort_values(
                by=[std_col.TIME_PERIOD_COL, std_col.STATE_NAME_COL],
                ascending=[False, True],
            )
            .reset_index(drop=True)
        )
        df.to_csv('testing_output.csv', index=False)

        return df


def load_wisqars_df_from_data_dir(breakdown: str, geo_level: str):
    output_df = pd.DataFrame(columns=['year', 'state', 'race'])

    for variable_string in ['gun_deaths_young_adults', 'gun_deaths_youth']:
        df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
            DATA_DIR,
            f"{variable_string}-{geo_level}-{breakdown}.csv",
            na_values=["--", "**"],
            usecols=lambda x: x not in WISQARS_COLS,
            thousands=",",
            dtype={"Year": str},
        )

        # Convert column names to lowercase
        df.columns = df.columns.str.lower()

        # removes the metadata section from the csv
        metadata_start_index = df[df["year"] == "Total"].index
        metadata_start_index = metadata_start_index[0]
        df = df.iloc[:metadata_start_index]

        # cleans data frame
        columns_to_convert = ["deaths", "crude rate"]
        convert_columns_to_numeric(df, columns_to_convert)

        if geo_level == NATIONAL_LEVEL:
            df.insert(1, "state", US_NAME)

        if breakdown == "all":
            df.insert(2, std_col.RACE_COL, std_col.Race.ALL.value)

        if std_col.ETH_COL in df.columns.to_list():
            df = combine_race_ethnicity(df, RACE_NAMES_MAPPING)
            df = df.rename(columns={'race_ethnicity_combined': 'race'})

        # Combines the unknown and hispanic rows
        df = df.groupby(['year', 'state', 'race']).sum(min_count=1).reset_index()

        # Identify rows where 'race' is 'HISP' or 'UNKNOWN'
        subset_mask = df['race'].isin(['HISP', 'UNKNOWN'])

        # Create a temporary DataFrame with just the subset
        temp_df = df[subset_mask].copy()

        # Apply the function to the temporary DataFrame
        temp_df = generate_per_100k_col(temp_df, 'deaths', 'population', 'crude rate')

        # Update the original DataFrame with the results for the 'crude rate' column
        df.loc[subset_mask, 'crude rate'] = temp_df['crude rate']

        df.rename(
            columns={
                'deaths': f'{variable_string}_estimated_total',
                'population': f'{variable_string}_population',
                'crude rate': f'{variable_string}_per_100k',
            },
            inplace=True,
        )

        output_df = output_df.merge(df, how='outer')

    return output_df
