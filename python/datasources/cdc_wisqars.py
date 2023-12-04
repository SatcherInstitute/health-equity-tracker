import pandas as pd
from datasources.data_source import DataSource
from ingestion.constants import CURRENT, HISTORICAL, US_NAME, US_FIPS
from ingestion import gcs_to_bq_util, standardized_columns as std_col


GUN_DETERMINANTS = [
    std_col.SEXUAL_ASSAULT_PREFIX,
    std_col.LEGAL_INTERVENTION_PREFIX,
    std_col.OTHER_ASSAULT_PREFIX,
    std_col.SELF_HARM_PREFIX,
    std_col.UNINTENTIONAL_PREFIX,
]

RAW_TOTALS_MAP = {
    prefix: std_col.generate_column_name(prefix, std_col.RAW_SUFFIX)
    for prefix in GUN_DETERMINANTS
}

PER_100K_MAP = {
    prefix: std_col.generate_column_name(prefix, std_col.PER_100K_SUFFIX)
    for prefix in GUN_DETERMINANTS
}

print(RAW_TOTALS_MAP)


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

        alls_df = load_wisqars_df_from_data_dir("all", geo_level)
        df = self.generate_breakdown_df(demographic, geo_level, alls_df)

    def generate_breakdown_df(
        self, breakdown: str, geo_level: str, alls_df: pd.DataFrame
    ):
        cols_to_standard = {
            "Year": std_col.TIME_PERIOD_COL,
            "Age Group": std_col.AGE_COL,
            "Population": std_col.POPULATION_COL,
            "Sex": std_col.SEX_COL,
            "Estimated Number_Assault - Other": RAW_TOTALS_MAP[
                std_col.OTHER_ASSAULT_PREFIX
            ],
            "Estimated Number_Assault - Sexual": RAW_TOTALS_MAP[
                std_col.SEXUAL_ASSAULT_PREFIX
            ],
            "Estimated Number_Legal Intervention": RAW_TOTALS_MAP[
                std_col.LEGAL_INTERVENTION_PREFIX
            ],
            "Estimated Number_Self-Harm": RAW_TOTALS_MAP[std_col.SELF_HARM_PREFIX],
            "Estimated Number_Unintentional (Includes undetermined)": RAW_TOTALS_MAP[
                std_col.UNINTENTIONAL_PREFIX
            ],
            "Crude Rate_Assault - Other": PER_100K_MAP[std_col.OTHER_ASSAULT_PREFIX],
            "Crude Rate_Assault - Sexual": PER_100K_MAP[std_col.SEXUAL_ASSAULT_PREFIX],
            "Crude Rate_Legal Intervention": PER_100K_MAP[
                std_col.LEGAL_INTERVENTION_PREFIX
            ],
            "Crude Rate_Self-Harm": PER_100K_MAP[std_col.SELF_HARM_PREFIX],
            "Crude Rate_Unintentional (Includes undetermined)": PER_100K_MAP[
                std_col.UNINTENTIONAL_PREFIX
            ],
        }

        breakdown_group_df = load_wisqars_df_from_data_dir(breakdown, geo_level)

        combined_group_df = pd.concat([breakdown_group_df, alls_df], axis=0)

        df = combined_group_df.rename(columns=cols_to_standard)

        df.to_csv('combined_group_df.csv', index=False)


def load_wisqars_df_from_data_dir(breakdown: str, geo_level: str):
    directory = "cdc_wisqars"
    filename = f"non_fatal-{geo_level}-{breakdown}.csv"
    use_cols = [
        "Intent",
        "Year",
        "Estimated Number",
        "Population",
        "Crude Rate",
        "Age-Adjusted Rate",
    ]

    if breakdown == std_col.AGE_COL:
        use_cols.append('Age Group')

    df = gcs_to_bq_util.load_csv_as_df_from_data_dir(
        directory, filename, na_values='--', usecols=use_cols, dtype={"Year": str}
    )

    df[std_col.STATE_NAME_COL] = US_NAME
    df[std_col.STATE_FIPS_COL] = US_FIPS

    total_index = df[df['Intent'] == 'Total'].index

    if len(total_index) > 0:
        total_index = total_index[0]
        df = df.iloc[:total_index]

    df = df.dropna(subset=['Intent'])

    if breakdown == "all":
        df['Age Group'] = 'All ages'
        df['Sex'] = 'All sexes'

    pivot_df = df.pivot(
        index=[
            'Year',
            # needs to update this line
            'Age Group',
            'Population',
            std_col.STATE_NAME_COL,
            std_col.STATE_FIPS_COL,
        ],
        columns='Intent',
        values=['Estimated Number', 'Crude Rate', 'Age-Adjusted Rate'],
    )

    pivot_df.columns = ['_'.join(col) for col in pivot_df.columns]

    result_df = pivot_df.reset_index()

    return result_df
