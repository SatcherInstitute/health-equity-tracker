import pandas as pd
from datasources.data_source import DataSource
from ingestion.constants import CURRENT, HISTORICAL, US_NAME, US_FIPS
from ingestion import gcs_to_bq_util, standardized_columns as std_col
from ingestion.dataset_utils import (
    generate_pct_share_col_without_unknowns,
    generate_pct_rel_inequity_col,
    preserve_only_current_time_period_rows,
)


def generate_cols_map(prefixes, suffix):
    return {prefix: std_col.generate_column_name(prefix, suffix) for prefix in prefixes}


INJ_INTENTS = [
    std_col.LEGAL_INTERVENTION_PREFIX,
    std_col.OTHER_ASSAULT_PREFIX,
    std_col.SELF_HARM_PREFIX,
    std_col.SEXUAL_ASSAULT_PREFIX,
    std_col.UNINTENTIONAL_PREFIX,
]

PCT_REL_INEQUITY_MAP = generate_cols_map(INJ_INTENTS, std_col.PCT_REL_INEQUITY_SUFFIX)
PCT_SHARE_MAP = generate_cols_map(INJ_INTENTS, std_col.PCT_SHARE_SUFFIX)
PCT_SHARE_MAP[std_col.POPULATION_COL] = std_col.POP_PCT_SUFFIX
PER_100K_MAP = generate_cols_map(INJ_INTENTS, std_col.PER_100K_SUFFIX)

PIVOT_INDEX_COLS = {
    std_col.AGE_COL: ["Year", "Age Group", "Population"],
    std_col.SEX_COL: ["Year", "Sex", "Population"],
    "all": ["Year", "Age Group", "Sex", "Population"],
}


class CDCWisqarsData(DataSource):
    @staticmethod
    def get_id():
        return "CDC_WISQARS_DATA"

    @staticmethod
    def get_table_name():
        return "cdc_wisqars_data"

    def upload_to_gcs(self, gcs_bucket, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for CDCHIVData")

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geo_level = self.get_attr(attrs, "geographic")

        nat_totals_by_intent_df = load_wisqars_df_from_data_dir("all", geo_level)
        if demographic == std_col.SEX_COL:
            nat_totals_by_intent_df = nat_totals_by_intent_df.drop(
                columns=['Age Group']
            )
        else:
            nat_totals_by_intent_df = nat_totals_by_intent_df.drop(columns=['Sex'])

        df = self.generate_breakdown_df(demographic, geo_level, nat_totals_by_intent_df)

        float_cols = [std_col.POPULATION_COL]
        float_cols.extend(INJ_INTENTS)
        float_cols.extend(PER_100K_MAP.values())
        float_cols.extend(PCT_SHARE_MAP.values())
        float_cols.extend(PCT_REL_INEQUITY_MAP.values())

        for table_type in (CURRENT, HISTORICAL):
            df_for_bq = df.copy()

            table_name = f"{demographic}_{geo_level}_{table_type}"

            if table_type == CURRENT:
                df_for_bq = preserve_only_current_time_period_rows(df_for_bq)

            col_types = gcs_to_bq_util.get_bq_column_types(df_for_bq, float_cols)

            gcs_to_bq_util.add_df_to_bq(
                df_for_bq, dataset, table_name, column_types=col_types
            )

    def generate_breakdown_df(
        self, breakdown: str, geo_level: str, alls_df: pd.DataFrame
    ):
        """generate_breakdown_df generates a HIV data frame by breakdown and geo_level

        breakdown: string equal to `age` or `sex`
        geo_level: string equal to `national`
        alls_df: the data frame containing the all values for each demographic breakdown
        return: a data frame of national time-based WISQARS data by breakdown"""

        cols_to_standard = {
            "Age Group": std_col.AGE_COL,
            "Crude Rate_Assault - Other": PER_100K_MAP[std_col.OTHER_ASSAULT_PREFIX],
            "Crude Rate_Assault - Sexual": PER_100K_MAP[std_col.SEXUAL_ASSAULT_PREFIX],
            "Crude Rate_Legal Intervention": PER_100K_MAP[
                std_col.LEGAL_INTERVENTION_PREFIX
            ],
            "Crude Rate_Self-Harm": PER_100K_MAP[std_col.SELF_HARM_PREFIX],
            "Crude Rate_Unintentional (Includes undetermined)": PER_100K_MAP[
                std_col.UNINTENTIONAL_PREFIX
            ],
            "Estimated Number_Assault - Other": std_col.OTHER_ASSAULT_PREFIX,
            "Estimated Number_Assault - Sexual": std_col.SEXUAL_ASSAULT_PREFIX,
            "Estimated Number_Legal Intervention": std_col.LEGAL_INTERVENTION_PREFIX,
            "Estimated Number_Self-Harm": std_col.SELF_HARM_PREFIX,
            "Estimated Number_Unintentional (Includes undetermined)": std_col.UNINTENTIONAL_PREFIX,
            "Population": std_col.POPULATION_COL,
            "Sex": std_col.SEX_COL,
            "Year": std_col.TIME_PERIOD_COL,
        }

        breakdown_group_df = load_wisqars_df_from_data_dir(breakdown, geo_level)

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=cols_to_standard)

        df.insert(1, std_col.STATE_NAME_COL, US_NAME)
        df.insert(2, std_col.STATE_FIPS_COL, US_FIPS)

        df = generate_pct_share_col_without_unknowns(
            df, PCT_SHARE_MAP, breakdown, std_col.ALL_VALUE
        )

        for col in INJ_INTENTS:
            pop_col = std_col.POPULATION_COL
            df = generate_pct_rel_inequity_col(
                df, PCT_SHARE_MAP[col], pop_col, PCT_REL_INEQUITY_MAP[col]
            )

        return df


def load_wisqars_df_from_data_dir(breakdown: str, geo_level: str):
    """load_wisqars_df_from_data_dir generates WISQARS data by breakdown and geo_level

    breakdown: string equal to `age` or `sex`
    geo_level: string equal to `national`
    return: a data frame of national time-based WISQARS data by breakdown with WISQARS columns
    """
    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        "cdc_wisqars",
        f"non_fatal_gun_injuries-{geo_level}-{breakdown}.csv",
        na_values="--",
        usecols=generate_use_cols(breakdown),
        thousands=",",
        dtype={"Year": str},
    )

    # removes the metadata section from the csv
    metadata_start_index = df[df["Intent"] == "Total"].index
    metadata_start_index = metadata_start_index[0]
    df = df.iloc[:metadata_start_index]

    # removes the rows with missing "Intent" values
    df = df.dropna(subset=["Intent"])

    # adds the missing demographic columns to the alls_df
    if breakdown == "all":
        df[["Age Group", "Sex"]] = std_col.ALL_VALUE

    # reshapes df to add the intent rows as columns
    pivot_df = df.pivot(
        index=PIVOT_INDEX_COLS.get(breakdown, []),
        columns="Intent",
        values=["Estimated Number", "Crude Rate"],
    )
    pivot_df.columns = ["_".join(col) for col in pivot_df.columns]

    result_df = pivot_df.reset_index()

    return result_df


def generate_use_cols(breakdown: str):
    cdc_wisqars_cols = [
        "Crude Rate",
        "Estimated Number",
        "Intent",
        "Population",
        "Year",
    ]

    if breakdown == std_col.AGE_COL:
        cdc_wisqars_cols.append("Age Group")

    if breakdown == std_col.SEX_COL:
        cdc_wisqars_cols.append("Sex")

    return cdc_wisqars_cols
