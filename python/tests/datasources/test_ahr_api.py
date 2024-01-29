import pandas as pd
import requests
import os  # Import the os module to access environment variables
from datasources.graphql_ahr import GraphQlAHRData
from unittest import mock

# AGE
asthma_age = {
    "where": {
        "populationId": {"in": [4, 5, 6]},
        "and": [{"description": {"endsWith": "asthma"}}],
    }
}

avoided_care_age = {
    "where": {
        "populationId": {"in": [4, 5, 6]},
        "and": [{"description": {"endsWith": "cost"}}],
    }
}

# RACE
asthma_race_ethnicity = {
    "where": {
        "populationId": {"in": [12, 13, 14, 15, 16, 17, 18, 29, 34]},
        "and": [
            {
                "description": {
                    "endsWith": "adults who reported ever being told by a health professional that they currently have asthma"
                }
            }
        ],
    }
}

# SEX
asthma_sex = {
    "where": {
        "populationId": {"in": [1, 2]},
        "and": [{"description": {"endsWith": "asthma"}}],
    }
}


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWitt(mock_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq(
        'dataset', 'gcs_bucket', demographic='sex', geographic='national'
    )
