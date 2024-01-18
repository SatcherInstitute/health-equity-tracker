import pandas as pd

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util
from ingestion.graphql_ahr_utils import AHR_QUERY, AHR_VARS


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
        df = graphql_response_to_dataframe(AHR_QUERY, AHR_VARS)
        df.to_csv('testing_output.csv', index=False)
        gcs_to_bq_util.add_df_to_bq()


def graphql_response_to_dataframe(query, variables):
    dataframes = []

    response_data = gcs_to_bq_util.fetch_ahr_data_from_graphql(query, variables)

    for field_name, field_data in response_data.items():
        measures_list = field_data[0]['data']

        data_label_list = [measure['dateLabel'] for measure in measures_list]
        measure_name_list = [measure['measure']['name'] for measure in measures_list]
        state_list = [measure['state'] for measure in measures_list]
        value_list = [measure['value'] for measure in measures_list]

        df = pd.DataFrame(
            {
                'time_period': data_label_list,
                'measure': measure_name_list,
                'state_postal': state_list,
                'per_100k': value_list,
            }
        )

        df.sort_values(
            by=['time_period', 'state_postal'], ascending=[False, True], inplace=True
        )
        dataframes.append(df)

    final_df = pd.concat(dataframes, ignore_index=True)

    return final_df
