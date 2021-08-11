import pandas as pd

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util


### Source URL: https://data.cdc.gov/Vaccinations/COVID-19-Vaccination-Demographics-in-the-United-St/km4m-vcsb

BASE_KFF_URL_PCT_SHARE_RACE = 'https://docs.google.com/spreadsheets/d/15TWTFIdtRgJ2mVijCChuOt_Zvwxp4xFByzFD1p6wazI/gviz/tq?tqx=out:csv'
BASE_KFF_URL_PERCENTAGES_BY_RACE_OF_TOTAL = 'https://docs.google.com/spreadsheets/d/1kKWHZtwFWUcpoy4lLyKa0QPxlVyhDjn1Ob4g5HF4NEw/gviz/tq?tqx=out:csv'

UNKNOWN_TO_STANDARD = {
    '% of Vaccinations with Unknown Race Percent--narrow': Race.UNKNOWN.value,
    '% of Vaccinations with Unknown Ethnicity Percent--narrow': Race.ETHNICITY_UNKNOWN.value,
}

KFF_RACES_PCT_SHARE = [
    'White',
    'Black',
    'Hispanic',
    'Asian',
    'American Indian or Alaska Native',
    'Native Hawaiian or Other Pacific Islander',
    'Other'
]

KFF_RACES_PCT_TOTAL = ['White', 'Black', 'Hispanic', 'Asian']

KFF_RACES_TO_STANDARD_NH = {
    'White': Race.WHITE_NH.value,
    'Black': Race.BLACK_NH.value,
    'Hispanic': Race.HISP.value,
    'Asian': Race.ASIAN_NH.value,
    'American Indian or Alaska Native': Race.AIAN_NH.value,
    'Native Hawaiian or Other Pacific Islander': Race.NHPI_NH.value,
    'Other': Race.OTHER_NONSTANDARD_NH.value
}

KFF_RACES_TO_STANDARD = {
    'White': Race.WHITE.value,
    'Black': Race.BLACK.value,
    'Hispanic': Race.HISP.value,
    'Asian': Race.ASIAN.value,
    'American Indian or Alaska Native': Race.AIAN.value,
    'Native Hawaiian or Other Pacific Islander': Race.NHPI.value,
    'Other': Race.OTHER_NONSTANDARD.value
}

def generate_total_pct_key(race):
    return '%% of Total %s Population Vaccinated Percent--narrow' % race

def generate_pct_share_key(race):
    return '%s %% of Vaccinations Percent--narrow' % race

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

def generate_output_row(state_row_pct_share, state_row_pct_total, state, race):
    """Generates the row with vaccine information for the given race and state
    The pct total spreadheet has a subset of races of the pct_share sheet.
    Return an empty row if the percent share of vaccinations is less than 1%

    state_row_pct_share: Pandas dataframe row with percent share of vaccines per race
    state_row_pct_total: Pandas dataframe row with percent total of each race vaccinatd
    state: String state name to find vaccine information of
    race: String race name to find vaccine information of
    """
    races_map = KFF_RACES_TO_STANDARD
    if state_row_pct_share['Race Categories Include Hispanic Individuals Yes/No'].values[0] != 'Yes':
        races_map = KFF_RACES_TO_STANDARD_NH

    output_row = {}
    output_row[std_col.STATE_NAME_COL] = state
    output_row[std_col.RACE_CATEGORY_ID_COL] = races_map[race]
    output_row[std_col.VACCINATED_PCT_SHARE] = str(state_row_pct_share[generate_pct_share_key(race)].values[0])

    if race in KFF_RACES_PCT_TOTAL:
        output_row[std_col.VACCINATED_PCT] = str(state_row_pct_total[generate_total_pct_key(race)].values[0])

    return output_row


class KFFVaccination(DataSource):

    @staticmethod
    def get_id():
        return 'KFF_VACCINATION'

    @staticmethod
    def get_table_name():
        return 'kff_vaccination'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for KFFVaccination')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        percentage_of_total_df = gcs_to_bq_util.load_csv_as_dataframe_from_web(BASE_KFF_URL_PERCENTAGES_BY_RACE_OF_TOTAL)
        pct_share_df = gcs_to_bq_util.load_csv_as_dataframe_from_web(BASE_KFF_URL_PCT_SHARE_RACE)

        output = []
        columns = [std_col.STATE_NAME_COL, std_col.RACE_CATEGORY_ID_COL, std_col.VACCINATED_PCT_SHARE, std_col.VACCINATED_PCT]

        percentage_of_total_df = percentage_of_total_df.rename(columns={'Unnamed: 0': 'state'})
        pct_share_df = pct_share_df.rename(columns={'Unnamed: 0': 'state'})

        states = percentage_of_total_df['state'].drop_duplicates().to_list()
        states.remove('United States')

        for state in states:
            state_row_pct_share = pct_share_df.loc[pct_share_df['state'] == state]
            state_row_pct_total = percentage_of_total_df.loc[percentage_of_total_df['state'] == state]

            output.extend(get_unknown_rows(state_row_pct_share, state))

            ## Get race metrics
            for race in KFF_RACES_PCT_SHARE:
                output.append(generate_output_row(state_row_pct_share, state_row_pct_total, state, race))

        output_df = pd.DataFrame(output, columns=columns)
        std_col.add_race_columns_from_category_id(output_df)

        column_types = {c: 'STRING' for c in output_df.columns}
        column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

        gcs_to_bq_util.add_dataframe_to_bq(
            output_df, dataset, std_col.RACE_OR_HISPANIC_COL, column_types=column_types)
