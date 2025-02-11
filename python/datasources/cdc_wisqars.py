"""
This documentation outlines the procedure for acquiring gun violence data for the
general population from the CDC WISQARS database. The data, once downloaded, is
stored locally in the `data/cdc_wisqars` directory for further processing and
analysis.

Instructions for Downloading Data:

- Access the WISQARS website at https://wisqars.cdc.gov/reports/ and adjust filters
- Select `Fatal` as the injury outcome.
- 2018-2022 by Single Race for "by race" tables, 2001-2022 for all other tables.
- Specify the data years of interest, matching the period selected above.
- Set geography to `United States`.
- Choose `All Intents` for the intent.
- Under mechanism, opt for `Firearm`.
- For demographics, select `All ages`, `Both Sexes`, `All Races`.
    - For by non-hispanic race tables select `Non-Hispanic`.
    - All other tables select `All Ethnicities`.
- Decide on the report layout based on your requirements:


ALL GUN DEATHS - ALL PEOPLE
`Year`, `None`, `None`, `None`
"gun_deaths-national-all"
`Year`, `State`, `None`, `None`
"gun_deaths-state-all"

ALL GUN DEATHS - BY HISPANIC + UNKNOWN
`Year`, `Ethnicity`, `None`, `None`
"gun_deaths-national-ethnicity"
`Year`, `Ethnicity`, `State`, `None`
"gun_deaths-state-ethnicity"

ALL GUN DEATHS - BY RACE (NH)
`Year`, `Race`, `None`, `None`
"gun_deaths-national-race_and_ethnicity"
`Year`, `Race`, `State`, `None`
"gun_deaths-state-race_and_ethnicity"

ALL GUN DEATHS - BY SEX
`Year`, `Sex`, `None`, `None`
"gun_deaths-national-sex"
`Year`, `Sex`, `State`, `None`
"gun_deaths-state-sex"

ALL GUN DEATHS - BY AGE
`Year`, `Age Group`, `None`, `None`
"gun_deaths-national-age"
`Year`, `Age Group`, `State`, `None`
"gun_deaths-state-age"

GUN HOMICIDES AND SUICIDES - ALL PEOPLE
`Year`, `Intent`, `None`, `None`
"gun_homicides_suicides-national-all"
`Year`, `Intent`, `State`, `None`
"gun_homicides_suicides-state-all"

GUN HOMICIDES AND SUICIDES - HISPANIC + UNKNOWN
`Year`, `Intent`, `Ethnicity`, `None`
"gun_homicides_suicides-national-ethnicity"
`Year`, `Intent`, `Ethnicity`, `State`
"gun_homicides_suicides-state-ethnicity"

GUN HOMICIDES AND SUICIDES - BY SEX
`Year`, `Intent`, `Sex`, `None`
"gun_homicides_suicides-national-sex"
`Year`, `Intent`, `Sex`, `State`
"gun_homicides_suicides-state-sex"

GUN HOMICIDES AND SUICIDES - BY AGE
`Year`, `Intent`, `Age Group`, `None`
"gun_homicides_suicides-national-age"
`Year`, `Intent`, `Age Group`, `State`
"gun_homicides_suicides-state-age"

GUN HOMICIDES AND SUICIDES - BY RACE (NH)
`Year`, `Intent`, `Race`, `None`
"gun_homicides_suicides-national-race_and_ethnicity"
`Year`, `Intent`, `Race`, `State`
"gun_homicides_suicides-state-race_and_ethnicity"


Last Updated: 2/25
"""

import pandas as pd
import numpy as np
from datasources.data_source import DataSource
from ingestion.constants import CURRENT, HISTORICAL, Sex
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.dataset_utils import (
    generate_pct_rel_inequity_col,
    generate_pct_share_col_without_unknowns,
    generate_pct_share_col_with_unknowns,
    generate_time_df_with_cols_and_types,
)
from ingestion.merge_utils import merge_state_ids
from ingestion.cdc_wisqars_utils import (
    generate_cols_map,
    contains_unknown,
    RACE_NAMES_MAPPING,
    ETHNICITY_NAMES_MAPPING,
    INJ_INTENTS,
    INJ_OUTCOMES,
    condense_age_groups,
    load_wisqars_as_df_from_data_dir,
    WISQARS_ALL,
    WISQARS_INTENT,
    WISQARS_DEATHS,
    WISQARS_CRUDE_RATE,
    WISQARS_YEAR,
    WISQARS_STATE,
    WISQARS_AGE_GROUP,
    WISQARS_SEX,
    WISQARS_RACE,
    WISQARS_ETH,
    WISQARS_POP,
    WISQARS_HOMICIDE,
    WISQARS_SUICIDE,
    WISQARS_ALL_INTENTS,
)
from typing import List
from ingestion.het_types import RATE_CALC_COLS_TYPE, WISQARS_VAR_TYPE, WISQARS_DEMO_TYPE, GEO_TYPE


WISQARS_URL_MAP = {
    # pylint: disable-next=line-too-long
    "gun_deaths-national-all": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=NONE&r3=NONE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_deaths-state-all": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&d=&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=STATE&r3=NONE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_deaths-national-sex": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&d=&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=SEX&r3=NONE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_deaths-state-sex": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&d=&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=SEX&r3=STATE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_deaths-national-age": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&d=&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=AGEGP&r3=NONE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_deaths-state-age": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&d=&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=AGEGP&r3=STATE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_deaths-national-ethnicity": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=ETHNICTY&r3=NONE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_deaths-state-ethnicity": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&d=&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=ETHNICTY&r3=STATE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_deaths-national-race_and_ethnicity": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2018&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=2&e=1&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=RACE-SINGLE&r3=NONE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_deaths-state-race_and_ethnicity": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2018&y2=2022&t=0&d=&i=0&m=20890&g=00&me=0&s=0&r=0&ry=2&e=1&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=RACE-SINGLE&r3=STATE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_homicides_suicides-national-all": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=INTENT&r3=NONE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_homicides_suicides-state-all": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=INTENT&r3=STATE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_homicides_suicides-national-ethnicity": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=INTENT&r3=ETHNICTY&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_homicides_suicides-state-ethnicity": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=INTENT&r3=ETHNICTY&r4=STATE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_homicides_suicides-national-sex": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=INTENT&r3=SEX&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_homicides_suicides-state-sex": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=INTENT&r3=SEX&r4=STATE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_homicides_suicides-national-age": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=INTENT&r3=AGEGP&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_homicides_suicides-state-age": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2001&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=0&e=0&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=INTENT&r3=AGEGP&r4=STATE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_homicides_suicides-national-race_and_ethnicity": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2018&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=2&e=1&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=INTENT&r3=RACE-SINGLE&r4=NONE",  # noqa: E501
    # pylint: disable-next=line-too-long
    "gun_homicides_suicides-state-race_and_ethnicity": "https://wisqars.cdc.gov/reports/?o=MORT&y1=2018&y2=2022&t=0&i=0&m=20890&g=00&me=0&s=0&r=0&ry=2&e=1&yp=65&a=ALL&g1=0&g2=199&a1=0&a2=199&r1=YEAR&r2=INTENT&r3=RACE-SINGLE&r4=STATE",  # noqa: E501
}

PER_100K_MAP = generate_cols_map(INJ_INTENTS, std_col.PER_100K_SUFFIX)
RAW_TOTALS_MAP = generate_cols_map(INJ_INTENTS, std_col.RAW_SUFFIX)
RAW_POPULATIONS_MAP = generate_cols_map(INJ_OUTCOMES, std_col.POPULATION_COL)
PCT_SHARE_MAP = generate_cols_map(RAW_TOTALS_MAP.values(), std_col.PCT_SHARE_SUFFIX)
PCT_SHARE_MAP[std_col.FATAL_POPULATION] = std_col.FATAL_POPULATION_PCT
PCT_REL_INEQUITY_MAP = generate_cols_map(RAW_TOTALS_MAP.values(), std_col.PCT_REL_INEQUITY_SUFFIX)

PIVOT_DEM_COLS = {
    std_col.AGE_COL: [WISQARS_YEAR, WISQARS_STATE, WISQARS_AGE_GROUP, WISQARS_POP],
    std_col.RACE_OR_HISPANIC_COL: [WISQARS_YEAR, WISQARS_STATE, std_col.RACE_CATEGORY_ID_COL, WISQARS_POP],
    std_col.SEX_COL: [WISQARS_YEAR, WISQARS_STATE, WISQARS_SEX, WISQARS_POP],
    WISQARS_ALL: [WISQARS_YEAR, WISQARS_STATE, WISQARS_POP],
}

TIME_MAP = {
    CURRENT: (
        list(PER_100K_MAP.values())
        + list(PCT_SHARE_MAP.values())
        + list(RAW_TOTALS_MAP.values())
        + list(RAW_POPULATIONS_MAP.values())
    ),
    HISTORICAL: (list(PER_100K_MAP.values()) + list(PCT_REL_INEQUITY_MAP.values()) + list(PCT_SHARE_MAP.values())),
}

COL_DICTS: List[RATE_CALC_COLS_TYPE] = [
    {
        "numerator_col": std_col.GUN_VIOLENCE_HOMICIDE_RAW,
        "denominator_col": std_col.FATAL_POPULATION,
        "rate_col": std_col.GUN_VIOLENCE_HOMICIDE_PER_100K,
    },
    {
        "numerator_col": std_col.GUN_VIOLENCE_SUICIDE_RAW,
        "denominator_col": std_col.FATAL_POPULATION,
        "rate_col": std_col.GUN_VIOLENCE_SUICIDE_PER_100K,
    },
    {
        "numerator_col": "gun_violence_all_intents_estimated_total",
        "denominator_col": std_col.FATAL_POPULATION,
        "rate_col": "gun_violence_all_intents_per_100k",
    },
]

GUN_DEATHS_BY_INTENT: WISQARS_VAR_TYPE = "gun_homicides_suicides"
GUN_DEATHS_OVERALL: WISQARS_VAR_TYPE = "gun_deaths"


class CDCWisqarsData(DataSource):
    """
    Class for handling CDC WISQARS data.

    Methods:
        get_id(): Retrieves the ID for CDC WISQARS data.
        get_table_name(): Retrieves the table name for CDC WISQARS data.
        upload_to_gcs(gcs_bucket, **attrs): Uploads data to Google Cloud Storage.
        write_to_bq(dataset, gcs_bucket, **attrs): Writes data to BigQuery.
        generate_breakdown_df(demographic, geo_level, alls_df): Generates a data frame
        by breakdown and geographic level.

    """

    @staticmethod
    def get_id():
        return "CDC_WISQARS_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_wisqars_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCWISQARS")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic: WISQARS_DEMO_TYPE = self.get_attr(attrs, "demographic")  # type: ignore
        geo_level: GEO_TYPE = self.get_attr(attrs, "geographic")  # type: ignore

        alls_by_intent_df = process_wisqars_df(WISQARS_ALL, geo_level)

        if demographic == std_col.RACE_OR_HISPANIC_COL:
            alls_by_intent_df.insert(2, std_col.RACE_CATEGORY_ID_COL, std_col.Race.ALL.value)
        else:
            alls_by_intent_df.insert(2, demographic, std_col.ALL_VALUE)

        df = self.generate_breakdown_df(demographic, geo_level, alls_by_intent_df)

        for time_view in (CURRENT, HISTORICAL):
            table_id = gcs_to_bq_util.make_bq_table_id(demographic, geo_level, time_view)
            time_cols = TIME_MAP[time_view]

            time_cols = [col.replace("gun_violence_all_intents", GUN_DEATHS_OVERALL) for col in time_cols]
            df.columns = [col.replace("gun_violence_all_intents", GUN_DEATHS_OVERALL) for col in df.columns]

            df_for_bq, col_types = generate_time_df_with_cols_and_types(df, time_cols, time_view, demographic)

            gcs_to_bq_util.add_df_to_bq(df_for_bq, dataset, table_id, column_types=col_types)

    def generate_breakdown_df(self, demographic: WISQARS_DEMO_TYPE, geo_level: GEO_TYPE, alls_df: pd.DataFrame):
        """generate_breakdown_df generates a gun violence data frame by demographic and geo_level

        demographic: string equal to `age`, `race_and_ethnicity, or `sex`
        geo_level: string equal to `national` or `state`
        alls_df: the data frame containing the all values for each demographic demographic
        return: a data frame of national time-based WISQARS data by demographic"""

        breakdown_group_df = process_wisqars_df(demographic, geo_level)

        df = pd.concat([breakdown_group_df, alls_df], axis=0)

        if demographic == std_col.AGE_COL:
            df = condense_age_groups(df, COL_DICTS)
        elif demographic == std_col.SEX_COL:
            df = df.replace({demographic: {"Females": Sex.FEMALE, "Males": Sex.MALE}})
        elif demographic == std_col.RACE_OR_HISPANIC_COL:
            std_col.add_race_columns_from_category_id(df)

        df = merge_state_ids(df)

        # Adds missing columns
        combined_cols = list(PER_100K_MAP.values()) + list(RAW_TOTALS_MAP.values())
        for col in combined_cols:
            if col not in df.columns:
                df[col] = np.nan

        # Detect if data frame has unknown values
        has_unknown = df.map(contains_unknown).any().any()

        if has_unknown:
            unknown = "Unknown"
            if demographic == std_col.RACE_OR_HISPANIC_COL:
                unknown = "Unknown race"
            df = generate_pct_share_col_with_unknowns(df, PCT_SHARE_MAP, demographic, std_col.ALL_VALUE, unknown)

        else:
            df = generate_pct_share_col_without_unknowns(df, PCT_SHARE_MAP, demographic, std_col.ALL_VALUE)

        for col in RAW_TOTALS_MAP.values():
            df = generate_pct_rel_inequity_col(
                df, PCT_SHARE_MAP[col], std_col.FATAL_POPULATION_PCT, PCT_REL_INEQUITY_MAP[col]
            )

        return df


def process_wisqars_df(demographic: WISQARS_DEMO_TYPE, geo_level: GEO_TYPE):
    """
    generates WISQARS data by demographic and geo_level

    demographic: string equal to `all`, `age`, `race_and_ethnicity`, or `sex`
    geo_level: string equal to `national`, or `state`
    return: a data frame of time-based WISQARS data by demographic and geo_level with
    WISQARS columns
    """
    output_df = pd.DataFrame(columns=[std_col.TIME_PERIOD_COL])

    df_each_intent = load_wisqars_as_df_from_data_dir(GUN_DEATHS_BY_INTENT, geo_level, demographic)
    df_all_intent_combined = load_wisqars_as_df_from_data_dir(GUN_DEATHS_OVERALL, geo_level, demographic)
    df_all_intent_combined[WISQARS_INTENT] = WISQARS_ALL_INTENTS

    df = pd.concat([df_each_intent, df_all_intent_combined], axis=0)

    if demographic == std_col.RACE_OR_HISPANIC_COL:
        df_eth_each_intent = load_wisqars_as_df_from_data_dir(GUN_DEATHS_BY_INTENT, geo_level, "ethnicity")
        df_eth_all_intent_combined = load_wisqars_as_df_from_data_dir(GUN_DEATHS_OVERALL, geo_level, "ethnicity")
        df_eth_all_intent_combined[WISQARS_INTENT] = WISQARS_ALL_INTENTS
        df_eth = pd.concat([df_eth_each_intent, df_eth_all_intent_combined], axis=0)
        df_eth = df_eth[df_eth[WISQARS_ETH] != "Non-Hispanic"]
        df_eth = df_eth.rename(columns={WISQARS_ETH: std_col.RACE_CATEGORY_ID_COL})
        df_eth = df_eth.replace({std_col.RACE_CATEGORY_ID_COL: ETHNICITY_NAMES_MAPPING})

        df = df.rename(columns={WISQARS_RACE: std_col.RACE_CATEGORY_ID_COL})
        df = df.replace({std_col.RACE_CATEGORY_ID_COL: RACE_NAMES_MAPPING})

        df = pd.concat([df, df_eth], axis=0)

    df = df[df[WISQARS_INTENT].isin([WISQARS_HOMICIDE, WISQARS_SUICIDE, WISQARS_ALL_INTENTS])].copy()

    # Reshapes df to add the intent rows as columns
    pivot_df = df.pivot(
        index=PIVOT_DEM_COLS.get(demographic, []),
        columns=WISQARS_INTENT,
        values=[WISQARS_DEATHS, WISQARS_CRUDE_RATE],
    )

    flat_columns = [
        (
            f"gun_violence_{col[1].lower().replace(' ', '_')}_{std_col.RAW_SUFFIX}"
            if col[0] == WISQARS_DEATHS
            else f"gun_violence_{col[1].lower().replace(' ', '_')}_{std_col.PER_100K_SUFFIX}"
        )
        for col in pivot_df.columns
    ]

    pivot_df.columns = pd.Index(flat_columns)
    df = pivot_df.reset_index()

    df.rename(
        columns={
            WISQARS_YEAR: std_col.TIME_PERIOD_COL,
            WISQARS_STATE: std_col.STATE_NAME_COL,
            WISQARS_AGE_GROUP: std_col.AGE_COL,
            WISQARS_POP: std_col.FATAL_POPULATION,
            WISQARS_SEX: std_col.SEX_COL,
        },
        inplace=True,
    )

    if demographic == std_col.AGE_COL:
        df[std_col.AGE_COL] = df[std_col.AGE_COL].str.replace(" to ", "-")

    output_df = output_df.merge(df, how="outer")

    return output_df
