import json
import os
import pandas as pd
from datasources.graphql_ahr import GraphQlAHRData
from ingestion.standardized_columns import STATE_FIPS_COL
from pandas._testing import assert_frame_equal
from unittest import mock

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "graphql_ahr")
GOLDEN_DIR = os.path.join(TEST_DIR, "golden_data")

GOLDEN_DATA = {
    "behavioral_health_age_national_current": os.path.join(GOLDEN_DIR, "behavioral_health_age_national_current.csv"),
    "behavioral_health_sex_national_current": os.path.join(GOLDEN_DIR, "behavioral_health_sex_national_current.csv"),
    "behavioral_health_race_and_ethnicity_state_current": os.path.join(
        GOLDEN_DIR, "behavioral_health_race_and_ethnicity_state_current.csv"
    ),
    "non-behavioral_health_age_national_current": os.path.join(
        GOLDEN_DIR, "non-behavioral_health_age_national_current.csv"
    ),
    "non-behavioral_health_sex_national_current": os.path.join(
        GOLDEN_DIR, "non-behavioral_health_sex_national_current.csv"
    ),
    "non-behavioral_health_race_and_ethnicity_state_current": os.path.join(
        GOLDEN_DIR, "non-behavioral_health_race_and_ethnicity_state_current.csv"
    ),
    "behavioral_health_age_national_historical": os.path.join(
        GOLDEN_DIR, "behavioral_health_age_national_historical.csv"
    ),
    "behavioral_health_sex_national_historical": os.path.join(
        GOLDEN_DIR, "behavioral_health_sex_national_historical.csv"
    ),
    "behavioral_health_race_and_ethnicity_state_historical": os.path.join(
        GOLDEN_DIR, "behavioral_health_race_and_ethnicity_state_historical.csv"
    ),
    "non-behavioral_health_age_national_historical": os.path.join(
        GOLDEN_DIR, "non-behavioral_health_age_national_historical.csv"
    ),
    "non-behavioral_health_sex_national_historical": os.path.join(
        GOLDEN_DIR, "non-behavioral_health_sex_national_historical.csv"
    ),
    "non-behavioral_health_race_and_ethnicity_state_historical": os.path.join(
        GOLDEN_DIR, "non-behavioral_health_race_and_ethnicity_state_historical.csv"
    ),
}


def _fetch_ahr_data_from_graphql(demographic: str, geo_level: str, category: str):
    print(f"MOCK - AHR GraphQL API response for {category}_{demographic}_{geo_level}")
    with open(
        os.path.join(TEST_DIR, f"{category}_{demographic}_{geo_level}_response.json"), "r", encoding="utf-8"
    ) as file:
        data = json.load(file)

    return data


# @mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
# @mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
# def testWriteToBqBehavioralHealthAgeNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
#     datasource = GraphQlAHRData()
#     datasource.write_to_bq(
#         "dataset", "gcs_bucket", demographic="age", geographic="national", category="behavioral_health"
#     )

#     assert mock_add_df_to_bq.call_count == 2

#     actual_df_current, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
#     expected_df_current = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str})
#     assert table_name == "behavioral_health_age_national_current"
#     # actual_df_current.to_csv(table_name, index=False)
#     # print(actual_df_current.to_string())
#     assert_frame_equal(actual_df_current, expected_df_current, check_like=True)

#     actual_df_historical, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
#     expected_df_historical = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str, "time_period": str})
#     assert table_name == "behavioral_health_age_national_historical"
#     # actual_df_historical.to_csv(table_name, index=False)
#     # print(actual_df_historical.to_string())
#     assert_frame_equal(actual_df_historical, expected_df_historical, check_like=True)


# @mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
# @mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
# def testWriteToBqNonBehavioralHealthAgeNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
#     datasource = GraphQlAHRData()
#     datasource.write_to_bq(
#         "dataset", "gcs_bucket", demographic="age", geographic="national", category="non-behavioral_health"
#     )

#     assert mock_add_df_to_bq.call_count == 2

#     actual_df_current, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
#     expected_df_current = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str})
#     assert table_name == "non-behavioral_health_age_national_current"
#     # actual_df_current.to_csv(table_name, index=False)
#     # print(actual_df_current.to_string())
#     assert_frame_equal(actual_df_current, expected_df_current, check_like=True)

#     actual_df_historical, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
#     expected_df_historical = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str, "time_period": str})
#     assert table_name == "non-behavioral_health_age_national_historical"
#     # actual_df_historical.to_csv(table_name, index=False)
#     # print(actual_df_historical.to_string())
#     assert_frame_equal(actual_df_historical, expected_df_historical, check_like=True)


# @mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
# @mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
# def testWriteToBqBehavioralHealthRaceState(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
#     datasource = GraphQlAHRData()
#     datasource.write_to_bq(
#         "dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="state", category="behavioral_health"
#     )

#     assert mock_add_df_to_bq.call_count == 2

#     actual_df_current, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
#     expected_df_current = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str})
#     assert table_name == "behavioral_health_race_and_ethnicity_state_current"
#     # actual_df_current.to_csv(table_name, index=False)
#     # print(actual_df_current.to_string())
#     assert_frame_equal(actual_df_current, expected_df_current, check_like=True)

#     actual_df_historical, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
#     expected_df_historical = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str, "time_period": str})
#     assert table_name == "behavioral_health_race_and_ethnicity_state_historical"
#     # actual_df_historical.to_csv(table_name, index=False)
#     # print(actual_df_historical.to_string())
#     assert_frame_equal(actual_df_historical, expected_df_historical, check_like=True)


# @mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
# @mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
# def testWriteToBqNonBehavioralHealthRaceState(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
#     datasource = GraphQlAHRData()
#     datasource.write_to_bq(
#         "dataset",
#         "gcs_bucket",
#         demographic="race_and_ethnicity",
#         geographic="state",
#         category="non-behavioral_health",
#     )

#     assert mock_add_df_to_bq.call_count == 2

#     actual_df_current, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
#     expected_df_current = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str})
#     assert table_name == "non-behavioral_health_race_and_ethnicity_state_current"
#     # actual_df_current.to_csv(table_name, index=False)
#     # print(actual_df_current.to_string())
#     assert_frame_equal(actual_df_current, expected_df_current, check_like=True)

#     actual_df_historical, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
#     expected_df_historical = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str, "time_period": str})
#     assert table_name == "non-behavioral_health_race_and_ethnicity_state_historical"
#     # actual_df_historical.to_csv(table_name, index=False)
#     # print(actual_df_historical.to_string())
#     assert_frame_equal(actual_df_historical, expected_df_historical, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
def testWriteToBqBehavioralHealthSexNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
    datasource = GraphQlAHRData()
    datasource.write_to_bq(
        "dataset", "gcs_bucket", demographic="sex", geographic="national", category="behavioral_health"
    )

    assert mock_add_df_to_bq.call_count == 2

    actual_df_current, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
    expected_df_current = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str})
    assert table_name == "behavioral_health_sex_national_current"
    actual_df_current.to_csv(table_name, index=False)
    # print(actual_df_current.to_string())
    # assert_frame_equal(actual_df_current, expected_df_current, check_like=True)

    actual_df_historical, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
    expected_df_historical = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str, "time_period": str})
    assert table_name == "behavioral_health_sex_national_historical"
    actual_df_historical.to_csv(table_name, index=False)
    # print(actual_df_historical.to_string())
    # assert_frame_equal(actual_df_historical, expected_df_historical, check_like=True)


# @mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
# @mock.patch("datasources.graphql_ahr.fetch_ahr_data_from_graphql", side_effect=_fetch_ahr_data_from_graphql)
# def testWriteToBqNonBehavioralHealthSexNational(_mock_fetch: mock.MagicMock, mock_add_df_to_bq: mock.MagicMock):
#     datasource = GraphQlAHRData()
#     datasource.write_to_bq(
#         "dataset", "gcs_bucket", demographic="sex", geographic="national", category="non-behavioral_health"
#     )

#     assert mock_add_df_to_bq.call_count == 2

#     actual_df_current, _, table_name = mock_add_df_to_bq.call_args_list[0][0]
#     expected_df_current = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str})
#     assert table_name == "non-behavioral_health_sex_national_current"
#     # actual_df_current.to_csv(table_name, index=False)
#     # print(actual_df_current.to_string())
#     assert_frame_equal(actual_df_current, expected_df_current, check_like=True)

#     actual_df_historical, _, table_name = mock_add_df_to_bq.call_args_list[1][0]
#     expected_df_historical = pd.read_csv(GOLDEN_DATA[table_name], dtype={STATE_FIPS_COL: str, "time_period": str})
#     assert table_name == "non-behavioral_health_sex_national_historical"
#     # actual_df_historical.to_csv(table_name, index=False)
#     # print(actual_df_historical.to_string())
#     assert_frame_equal(actual_df_historical, expected_df_historical, check_like=True)
