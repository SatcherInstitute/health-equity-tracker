import pandas as pd
import requests
import json
import os  # Import the os module to access environment variables
from datasources.graphql_ahr import GraphQlAHRData
from test_utils import _load_df_from_bigquery
from unittest import mock

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "graphql_ahr")
TEST_FILE = os.path.join(TEST_DIR, 'suicide_input.json')


def _fetch_ahr_data_from_graphql():
    with open(TEST_FILE, 'r') as file:
        data = json.load(file)

    return data


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.fetch_ahr_data_from_graphql', side_effect=_fetch_ahr_data_from_graphql)
@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery)
def testWriteToBqAgeNational(mock_pop: mock.MagicMock, mock_fetch: mock.MagicMock, mock_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq('dataset', 'gcs_bucket', demographic='age', geographic='national')


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.fetch_ahr_data_from_graphql', side_effect=_fetch_ahr_data_from_graphql)
@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery)
def testWriteToBqRaceNational(mock_pop: mock.MagicMock, mock_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq('dataset', 'gcs_bucket', demographic='race_and_ethnicity', geographic='state')


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.fetch_ahr_data_from_graphql', side_effect=_fetch_ahr_data_from_graphql)
@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery)
def testWriteToBqSexNational(mock_pop: mock.MagicMock, mock_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq('dataset', 'gcs_bucket', demographic='sex', geographic='national')
