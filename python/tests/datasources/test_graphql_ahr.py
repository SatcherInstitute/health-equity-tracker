import json
import os
import pandas as pd
from datasources.graphql_ahr import GraphQlAHRData
from ingestion.constants import AGE, CURRENT, NATIONAL_LEVEL, SEX, STATE_LEVEL
from ingestion.standardized_columns import RACE_OR_HISPANIC_COL, STATE_FIPS_COL
from pandas._testing import assert_frame_equal
from unittest import mock

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "graphql_ahr")
GOLDEN_DIR = os.path.join(TEST_DIR, "golden_data")

GOLDEN_DATA = {
    'behavioral_health_age_national_current': os.path.join(GOLDEN_DIR, 'behavioral_health_age_national_current.csv'),
    'behavioral_health_sex_national_current': os.path.join(GOLDEN_DIR, 'behavioral_health_sex_national_current.csv'),
    'behavioral_health_race_and_ethnicity_state_current': os.path.join(
        GOLDEN_DIR, 'behavioral_health_race_and_ethnicity_state_current.csv'
    ),
    'non-behavioral_health_age_national_current': os.path.join(
        GOLDEN_DIR, 'non-behavioral_health_age_national_current.csv'
    ),
    'non-behavioral_health_sex_national_current': os.path.join(
        GOLDEN_DIR, 'non-behavioral_health_sex_national_current.csv'
    ),
    'non-behavioral_health_race_and_ethnicity_state_current': os.path.join(
        GOLDEN_DIR, 'non-behavioral_health_race_and_ethnicity_state_current.csv'
    ),
}


def _fetch_ahr_data_from_graphql(demographic: str, geo_level: str, category: str):
    print(f"MOCK - AHR GraphQL API response for {category}_{demographic}_{geo_level}")
    with open(
        os.path.join(TEST_DIR, f'{category}_{demographic}_{geo_level}_response.json'), 'r', encoding='utf-8'
    ) as file:
        data = json.load(file)

    return data


# @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
# @mock.patch('datasources.graphql_ahr.fetch_ahr_data_from_graphql', side_effect=_fetch_ahr_data_from_graphql)
# def testWriteToBqBehavioralHealthAgeNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
#     datasource = GraphQlAHRData()
#     datasource.write_to_bq(
#         'dataset', 'gcs_bucket', demographic=AGE, geographic=NATIONAL_LEVEL, category='behavioral_health'
#     )

#     actual_df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
#     expected_df = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str})

#     assert table_name == f"behavioral_health_{AGE}_{NATIONAL_LEVEL}_{CURRENT}"
#     assert mock_add_df_to_bq.call_count == 1

#     actual_df.to_csv(table_name, index=False)

#     print(actual_df.to_string())

#     assert_frame_equal(actual_df, expected_df, check_like=True)


# @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
# @mock.patch('datasources.graphql_ahr.fetch_ahr_data_from_graphql', side_effect=_fetch_ahr_data_from_graphql)
# def testWriteToBqNonBehavioralHealthAgeNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
#     datasource = GraphQlAHRData()
#     datasource.write_to_bq(
#         'dataset', 'gcs_bucket', demographic=AGE, geographic=NATIONAL_LEVEL, category='non-behavioral_health'
#     )

#     actual_df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
#     expected_df = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str})

#     assert table_name == f"non-behavioral_health_{AGE}_{NATIONAL_LEVEL}_{CURRENT}"
#     assert mock_add_df_to_bq.call_count == 1

#     actual_df.to_csv(table_name, index=False)

#     print(actual_df.to_string())

#     assert_frame_equal(actual_df, expected_df, check_like=True)


# @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
# @mock.patch('datasources.graphql_ahr.fetch_ahr_data_from_graphql', side_effect=_fetch_ahr_data_from_graphql)
# def testWriteToBqRaceState(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
#     datasource = GraphQlAHRData()
#     datasource.write_to_bq(
#         'dataset', 'gcs_bucket', demographic=RACE_OR_HISPANIC_COL, geographic=STATE_LEVEL, category='behavioral_health'
#     )

#     actual_df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
#     expected_df = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str})

#     assert table_name == f"behavioral_health_{RACE_OR_HISPANIC_COL}_{STATE_LEVEL}_{CURRENT}"
#     assert mock_add_df_to_bq.call_count == 1

#     # actual_df.to_csv(table_name, index=False)

#     assert_frame_equal(actual_df, expected_df, check_like=True)


# @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
# @mock.patch('datasources.graphql_ahr.fetch_ahr_data_from_graphql', side_effect=_fetch_ahr_data_from_graphql)
# def testWriteToBqBehavioralHealthSexNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
#     datasource = GraphQlAHRData()
#     datasource.write_to_bq(
#         'dataset', 'gcs_bucket', demographic=SEX, geographic=NATIONAL_LEVEL, category='behavioral_health'
#     )

#     actual_df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
#     expected_df = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str})

#     assert table_name == f"behavioral_health_{SEX}_{NATIONAL_LEVEL}_{CURRENT}"
#     assert mock_add_df_to_bq.call_count == 1

#     actual_df.to_csv(table_name, index=False)

#     print(actual_df.to_string())

#     assert_frame_equal(actual_df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('datasources.graphql_ahr.fetch_ahr_data_from_graphql', side_effect=_fetch_ahr_data_from_graphql)
def testWriteToBqNonBehavioralHealthSexNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq(
        'dataset', 'gcs_bucket', demographic=SEX, geographic=NATIONAL_LEVEL, category='non-behavioral_health'
    )

    actual_df, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
    expected_df = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str})

    assert table_name == f"non-behavioral_health_{SEX}_{NATIONAL_LEVEL}_{CURRENT}"
    assert mock_add_df_to_bq.call_count == 1

    actual_df.to_csv(table_name, index=False)
    print(actual_df.to_string())

    assert_frame_equal(actual_df, expected_df, check_like=True)
