import pandas as pd
import numpy as np
from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col
from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, github_util
from ingestion.dataset_utils import generate_pct_rate_col
from ingestion.merge_utils import merge_state_ids, merge_pop_numbers
from ingestion.constants import STATE_LEVEL, RACE, CURRENT

BASE_KFF_URL_TOTALS_STATE = (
    "https://raw.githubusercontent.com/KFFData/COVID-19-Data/kff_master/State%20Trend%20Data/State_Trend_Data.csv"
)

BASE_GITHUB_API_URL = "https://api.github.com/repos/KFFData/COVID-19-Data/git/trees/kff_master?recursive=1"

TOTAL_KEY = "one_dose"

UNKNOWN_TO_STANDARD = {
    "% of Vaccinations with Unknown Race": Race.UNKNOWN.value,
    "% of Vaccinations with Unknown Ethnicity": Race.ETHNICITY_UNKNOWN.value,
}

KFF_RACES_PCT_SHARE = [
    "White",
    "Black",
    "Hispanic",
    "Asian",
    "American Indian or Alaska Native",
    "Native Hawaiian or Other Pacific Islander",
    "Other",
]

KFF_RACES_PCT_TOTAL = ["White", "Black", "Hispanic", "Asian"]

KFF_RACES_TO_STANDARD_NH = {
    "White": Race.WHITE_NH.value,
    "Black": Race.BLACK_NH.value,
    "Hispanic": Race.HISP.value,
    "Asian": Race.ASIAN_NH.value,
    "American Indian or Alaska Native": Race.AIAN_NH.value,
    "Native Hawaiian or Other Pacific Islander": Race.NHPI_NH.value,
    "AAPI": Race.API_NH.value,
    "Other": Race.OTHER_NONSTANDARD_NH.value,
}

KFF_RACES_TO_STANDARD = {
    "White": Race.WHITE.value,
    "Black": Race.BLACK.value,
    "Hispanic": Race.HISP.value,
    "Asian": Race.ASIAN.value,
    "American Indian or Alaska Native": Race.AIAN.value,
    "Native Hawaiian or Other Pacific Islander": Race.NHPI.value,
    "AAPI": Race.API.value,
    "Other": Race.OTHER_NONSTANDARD.value,
}

AAPI_STATES = {
    "Arizona",
    "Connecticut",
    "District of Columbia",
    "Michigan",
    "Minnesota",
    "Nevada",
    "New Mexico",
    "North Carolina",
    "Oklahoma",
    "South Carolina",
    "Virginia",
}

KFF_TERRITORIES = ["Guam", "Puerto Rico", "Northern Mariana Islands"]
VACCINATED_FIRST_DOSE = "one_dose"


def get_data_url(data_type):
    """Gets the latest url from the kff's github data repo for the given data type

    data_type: string value representing which url to get from
    the github api; must be either 'pct_total', 'pct_share',
    or 'pct_population'
    """
    data_types_to_strings = {
        "pct_total": "Percent of Total Population that has Received a COVID-19 Vaccine by RaceEthnicity",
        "pct_share": "COVID19 Vaccinations by RE",
        "pct_population": "Distribution of Vaccinations, Cases, Deaths",
    }
    df = gcs_to_bq_util.load_json_as_df_from_web_based_on_key(BASE_GITHUB_API_URL, "tree")

    df = df.loc[df["path"].str.contains(data_types_to_strings[data_type])]

    urls = df.loc[df["path"] == df["path"].max()].url

    if len(urls) != 1:
        raise ValueError(f"Found {len(urls)} urls, should have only found 1")

    return urls.values[0]


def generate_total_pct_key(race):
    return f"% of Total {race} Population Vaccinated"


def generate_pct_share_key(race):
    return f"{race} % of Vaccinations"


def generate_pct_of_population_key(race):
    return f"{race} Percent of Total Population"


def get_unknown_rows(df, state):
    """Gets unknown race and unknown ethnicity from the df,
    returns them in two rows

    df: Pandas dataframe with percent share of vaccines per race
    state: State to get the unknown percentage from
    """
    rows = []
    for key, standard in UNKNOWN_TO_STANDARD.items():
        output_row = {}
        output_row[std_col.STATE_NAME_COL] = state
        output_row[std_col.RACE_CATEGORY_ID_COL] = standard
        output_row[std_col.VACCINATED_PCT_SHARE] = str(df[key].values[0])

        rows.append(output_row)

    return rows


def generate_output_row(state_row_pct_share, state_row_pct_total, state_row_pct_population, state, race):
    """Generates the row with vaccine information for the given race and state
    The pct total spreadsheet has a subset of races of the pct_share sheet.

    state_row_pct_share: Pandas dataframe row with percent share of vaccines per race
    state_row_pct_total: Pandas dataframe row with percent total of each race vaccinated
    state_row_pct_population: Pandas dataframe row with population percentages for each race
    state: String state name to find vaccine information of
    race: String race name to find vaccine information of
    """
    races_map = KFF_RACES_TO_STANDARD

    if state_row_pct_share["Race Categories Include Hispanic Individuals"].values[0] != "Yes":
        races_map = KFF_RACES_TO_STANDARD_NH

    output_row = {}
    output_row[std_col.STATE_NAME_COL] = state
    output_row[std_col.VACCINATED_PCT_SHARE] = str(state_row_pct_share[generate_pct_share_key(race)].values[0])

    if race in KFF_RACES_PCT_TOTAL:
        output_row[std_col.VACCINATED_PCT_RATE] = str(state_row_pct_total[generate_total_pct_key(race)].values[0])
        output_row[std_col.VACCINATED_POP_PCT] = str(
            state_row_pct_population[generate_pct_of_population_key(race)].values[0]
        )

    if race == "Asian" and state in AAPI_STATES:
        race = "AAPI"

    output_row[std_col.RACE_CATEGORY_ID_COL] = races_map[race]

    return output_row


def generate_total_row(state_row_totals, state):
    """Generates the total vaccinated percentage row for a given state

    state_row_totals: Pandas dataframe row with state vaccination totals information
    state: String of state name
    """
    output_row = {}
    output_row[std_col.STATE_NAME_COL] = state
    output_row[std_col.RACE_CATEGORY_ID_COL] = Race.ALL.value

    state_row_totals = state_row_totals.loc[~state_row_totals["one_dose"].isnull()]
    latest_row = state_row_totals.loc[state_row_totals["date"] == state_row_totals["date"].max()]
    output_row[VACCINATED_FIRST_DOSE] = str(latest_row[TOTAL_KEY].values[0])
    output_row[std_col.VACCINATED_POP_PCT] = "1.0"
    return output_row


class KFFVaccination(DataSource):
    @staticmethod
    def get_id():
        return "KFF_VACCINATION"

    @staticmethod
    def get_table_name():
        return "kff_vaccination"

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError("upload_to_gcs should not be called for KFFVaccination")

    def parse_data(self):
        """Parses vaccine data from all needed data sources and places
        all needed info into HET style df."""

        percentage_of_total_url = get_data_url("pct_total")
        percentage_of_total_df = github_util.decode_json_from_url_into_df(percentage_of_total_url)

        pct_share_url = get_data_url("pct_share")
        pct_share_df = github_util.decode_json_from_url_into_df(pct_share_url)

        pct_population_url = get_data_url("pct_population")
        pct_population_df = github_util.decode_json_from_url_into_df(pct_population_url)

        total_df = gcs_to_bq_util.load_csv_as_df_from_web(BASE_KFF_URL_TOTALS_STATE, dtype={TOTAL_KEY: str})

        output = []
        columns = [
            std_col.STATE_NAME_COL,
            std_col.RACE_CATEGORY_ID_COL,
            std_col.VACCINATED_PCT_SHARE,
            std_col.VACCINATED_PCT_RATE,
            VACCINATED_FIRST_DOSE,
            std_col.VACCINATED_POP_PCT,
        ]

        states = percentage_of_total_df["Location"].drop_duplicates().to_list()
        states.remove("United States")

        for state in states:
            state_row_pct_share = pct_share_df.loc[pct_share_df["Location"] == state]
            state_row_pct_total = percentage_of_total_df.loc[percentage_of_total_df["Location"] == state]
            state_row_totals = total_df.loc[total_df["state"] == state]
            state_row_pct_population = pct_population_df.loc[pct_population_df["State"] == state]

            output.extend(get_unknown_rows(state_row_pct_share, state))

            # Get race metrics
            for race in KFF_RACES_PCT_SHARE:
                output.append(
                    generate_output_row(
                        state_row_pct_share,
                        state_row_pct_total,
                        state_row_pct_population,
                        state,
                        race,
                    )
                )

            output.append(generate_total_row(state_row_totals, state))

        for territory in KFF_TERRITORIES:
            state_row_totals = total_df.loc[total_df["state"] == territory]
            output.append(generate_total_row(state_row_totals, territory))

        return pd.DataFrame(output, columns=columns)

    def post_process(self, df):
        """Takes in dataframe with raw vaccine data and runs all needed operations
        on it.
        Returns an dataframe ready for the frontend."""

        df = merge_state_ids(df)

        df = clean_row(df, std_col.VACCINATED_PCT_SHARE)
        df[std_col.VACCINATED_PCT_SHARE] = df[std_col.VACCINATED_PCT_SHARE] * 100

        df = clean_row(df, std_col.VACCINATED_POP_PCT)
        df[std_col.VACCINATED_POP_PCT] = df[std_col.VACCINATED_POP_PCT] * 100

        df = clean_row(df, std_col.VACCINATED_PCT_RATE)
        df[std_col.VACCINATED_PCT_RATE] = df[std_col.VACCINATED_PCT_RATE] * 100

        total_df = df.loc[~df[VACCINATED_FIRST_DOSE].isnull()].reset_index(drop=True)
        total_df = merge_pop_numbers(total_df, RACE, STATE_LEVEL)
        total_df = generate_pct_rate_col(
            total_df, VACCINATED_FIRST_DOSE, std_col.POPULATION_COL, std_col.VACCINATED_PCT_RATE
        )

        df = df.loc[df[VACCINATED_FIRST_DOSE].isnull()].reset_index(drop=True)
        df = pd.concat([df, total_df])

        df = df.drop(columns=std_col.POPULATION_PCT_COL)

        df = merge_pop_numbers(df, RACE, STATE_LEVEL)
        df = df.rename(
            columns={
                std_col.POPULATION_PCT_COL: std_col.ACS_VACCINATED_POP_PCT,
                VACCINATED_FIRST_DOSE: std_col.VACCINATED_RAW,
            }
        )

        df[std_col.VACCINATED_RAW] = df[std_col.VACCINATED_RAW].astype(float)

        df = df[
            [
                std_col.STATE_NAME_COL,
                std_col.STATE_FIPS_COL,
                std_col.RACE_CATEGORY_ID_COL,
                std_col.VACCINATED_PCT_SHARE,
                std_col.VACCINATED_PCT_RATE,
                std_col.VACCINATED_POP_PCT,
                std_col.ACS_VACCINATED_POP_PCT,
                std_col.VACCINATED_RAW,
            ]
        ]

        return df

    def write_to_bq(self, dataset, gcs_bucket, write_local_instead_of_bq=False, **attrs):
        df = self.parse_data()
        df = self.post_process(df)

        float_cols = [
            std_col.VACCINATED_PCT_SHARE,
            std_col.VACCINATED_PCT_RATE,
            std_col.VACCINATED_POP_PCT,
            std_col.ACS_VACCINATED_POP_PCT,
            std_col.VACCINATED_RAW,
        ]

        # WRITE RACE TABLE
        std_col.swap_race_id_col_for_names_col(df)
        col_types = gcs_to_bq_util.get_bq_column_types(df, float_cols)
        table_id = gcs_to_bq_util.make_bq_table_id(std_col.RACE_OR_HISPANIC_COL, STATE_LEVEL, CURRENT)
        gcs_to_bq_util.add_df_to_bq(df, dataset, table_id, column_types=col_types)


def clean_row(df, column):
    """Removes non float KFF data from the raw data and replaces
    them with np.nan, as that is how we have chosen to display the
    data to the user.

    df: KFF Dataframe to clean data notes from.
    column: Column name to clean."""
    df[column] = df[column].fillna(np.nan)
    df[column] = df[column].replace(0, np.nan)
    df[column] = df[column].replace("<0.01", np.nan)
    df[column] = df[column].replace("NR", np.nan)
    df[column] = df[column].replace(">.99", 1.0)
    df[column] = df[column].astype(float)
    return df
