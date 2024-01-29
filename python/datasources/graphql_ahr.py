import pandas as pd

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.graphql_ahr_utils import AHR_QUERY, AHR_VARS, AHR_SEX_VARS
from ingestion.standardized_columns import STATE_POSTAL_COL, TIME_PERIOD_COL
from ingestion.constants import US_ABBR, STATE_LEVEL, NATIONAL_LEVEL
from ingestion.merge_utils import merge_state_ids

TEST_LIST = [
    'Asthma',
    'Avoided Care Due to Cost',
    'Cardiovascular Diseases',
    'Diabetes',
    'Depression',
    'Excessive Drinking',
    'Frequent Mental Distress',
]

AHR_AGE_GROUPS = ['18-44', '45-64', '65+']

AHR_RACE_GROUPS = [
    'American Indian/Alaska Native',
    'Asian',
    'Asian/Pacific Islander',
    'Black',
    'Hawaiian/Pacific Islander',
    'Hispanic',
    'Multiracial',
    'Other Race',
    'White',
    'All',
]

AHR_SEX_GROUPS = ['Male', 'Female']


class GraphQlAHRData(DataSource):
    @staticmethod
    def get_id():
        return 'GRAPHQL_AHR_DATA'

    @staticmethod
    def get_table_name():
        return 'graphql_ahr_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError('upload_to_gcs should not be called for AHRData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        demographic = self.get_attr(attrs, "demographic")
        geographic = self.get_attr(attrs, "geographic")
        table_name = f'{demographic}_{geographic}'

        response_data = gcs_to_bq_util.fetch_ahr_data_from_graphql(
            AHR_QUERY, AHR_SEX_VARS
        )

        df = graphql_response_to_dataframe(response_data, demographic)
        df = parse_raw_data(df, geographic, demographic)
        # df = post_process(df)

        df.to_csv(f'{table_name}1.csv', index=False)

        # gcs_to_bq_util.add_df_to_bq()


def graphql_response_to_dataframe(response_data, breakdown):
    output_df = pd.DataFrame(columns=[TIME_PERIOD_COL, STATE_POSTAL_COL])
    ahr_determinants = []

    for field_name, field_data in response_data.items():
        ahr_determinants.append(field_name)

        data_entries = []

        for data in field_data:
            row_data = data['data']
            data_entries.extend(row_data)

        df = pd.DataFrame(
            {
                TIME_PERIOD_COL: [entry['dateLabel'] for entry in data_entries],
                STATE_POSTAL_COL: [entry['state'] for entry in data_entries],
                breakdown: [entry['measure']['name'] for entry in data_entries],
                f'{field_name}_per_100k': [entry['value'] for entry in data_entries],
            }
        )

        output_df = output_df.merge(df, how='outer')

    output_df[STATE_POSTAL_COL].replace('ALL', US_ABBR, inplace=True)
    output_df.sort_values(
        by=[TIME_PERIOD_COL, STATE_POSTAL_COL],
        ascending=[False, True],
        inplace=True,
    )

    return output_df


def parse_raw_data(df: pd.DataFrame, geographic: str, breakdown):
    loc_df = df.copy()

    if geographic == NATIONAL_LEVEL:
        loc_df = loc_df.loc[loc_df[STATE_POSTAL_COL] == US_ABBR]
    else:
        loc_df = loc_df.loc[loc_df[STATE_POSTAL_COL] != US_ABBR]

    for sex in AHR_SEX_GROUPS:
        loc_df[breakdown] = loc_df[breakdown].str.replace(
            f'.*{sex}.*', f'{sex}', regex=True
        )

    return loc_df


def post_process(df: pd.DataFrame):
    df = merge_state_ids(df)

    cols = [col for col in df.columns if col not in {'state_name', 'state_fips'}]
    cols[1:1] = ['state_name', 'state_fips']

    df = df[cols]

    return df
