from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.vera_incarceration_county import (
    VeraIncarcerationCounty,
    VERA_COL_TYPES,
)

# Current working directory .
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "vera_incarceration_county")


GOLDEN_DATA = {
    'by_race_and_ethnicity_county_current': os.path.join(
        TEST_DIR, "golden_data", 'by_race_and_ethnicity_county_current.csv'
    ),
    'by_race_and_ethnicity_county_historical': os.path.join(
        TEST_DIR, "golden_data", 'by_race_and_ethnicity_county_historical.csv'
    ),
    'by_age_county_current': os.path.join(TEST_DIR, "golden_data", 'by_age_county_current.csv'),
    'by_age_county_historical': os.path.join(TEST_DIR, "golden_data", 'by_age_county_historical.csv'),
    'by_sex_county_current': os.path.join(TEST_DIR, "golden_data", 'by_sex_county_current.csv'),
    'by_sex_county_historical': os.path.join(TEST_DIR, "golden_data", 'by_sex_county_historical.csv'),
}


def get_mocked_data_as_df():
    df = pd.read_csv(
        os.path.join(TEST_DIR, 'test_input_incarceration_trends.csv'),
        dtype=VERA_COL_TYPES,
    )
    return df


dtypes = {
    "time_period": str,
    "county_fips": str,
    "county_name": str,
    "jail_per_100k": float,
    "prison_per_100k": float,
    "jail_pct_share": float,
    "prison_pct_share": float,
    "incarceration_population_pct": float,
    "jail_pct_relative_inequity": float,
    "prison_pct_relative_inequity": float,
    "jail_estimated_total": float,
    "prison_estimated_total": float,
    "incarceration_population_estimated_total": float,
    "confined_children_estimated_total": float,
}

kwargs = {
    'filename': 'test_file.csv',
    'metadata_table_id': 'test_metadata',
    'table_name': 'output_table',
}

veraIncarcerationCounty = VeraIncarcerationCounty()


@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
    return_value=get_mocked_data_as_df(),
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqSex(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    kwargs["demographic"] = "sex"
    veraIncarcerationCounty.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # writes 1 current and 1 historical table per demo breakdown
    assert mock_bq.call_count == 2
    assert mock_csv.call_count == 1

    df_current, _, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "by_sex_county_current"
    # df_current.to_csv(table_name, index=False)
    expected_df_current = pd.read_csv(GOLDEN_DATA[table_name], dtype=dtypes)
    assert_frame_equal(df_current, expected_df_current, check_dtype=False)

    df_historical, _, table_name = mock_bq.call_args_list[1][0]
    assert table_name == "by_sex_county_historical"
    # df_historical.to_csv(table_name, index=False)
    expected_df_historical = pd.read_csv(GOLDEN_DATA[table_name], dtype=dtypes)
    assert_frame_equal(df_historical, expected_df_historical, check_dtype=False)


@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
    return_value=get_mocked_data_as_df(),
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqAge(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    kwargs["demographic"] = "age"
    veraIncarcerationCounty.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # writes 1 current and 1 historical table per demo breakdown
    assert mock_bq.call_count == 2
    assert mock_csv.call_count == 1

    df_current, _, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "by_age_county_current"
    # df_current.to_csv(table_name, index=False)
    expected_df_current = pd.read_csv(GOLDEN_DATA[table_name], dtype=dtypes)
    assert_frame_equal(df_current, expected_df_current, check_dtype=False)

    df_historical, _, table_name = mock_bq.call_args_list[1][0]
    assert table_name == "by_age_county_historical"
    # df_historical.to_csv(table_name, index=False)
    expected_df_historical = pd.read_csv(GOLDEN_DATA[table_name], dtype=dtypes)
    assert_frame_equal(df_historical, expected_df_historical, check_dtype=False)


@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
    return_value=get_mocked_data_as_df(),
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBqRace(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    kwargs["demographic"] = "race_and_ethnicity"
    veraIncarcerationCounty.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # writes 1 current and 1 historical table per demo breakdown
    assert mock_bq.call_count == 2
    assert mock_csv.call_count == 1

    df_current, _, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "by_race_and_ethnicity_county_current"
    # df_current.to_csv(table_name, index=False)
    expected_df_current = pd.read_csv(GOLDEN_DATA[table_name], dtype=dtypes)
    assert_frame_equal(df_current, expected_df_current, check_dtype=False)

    df_historical, _, table_name = mock_bq.call_args_list[1][0]
    assert table_name == "by_race_and_ethnicity_county_historical"
    # df_historical.to_csv(table_name, index=False)
    expected_df_historical = pd.read_csv(GOLDEN_DATA[table_name], dtype=dtypes)
    assert_frame_equal(df_historical, expected_df_historical, check_dtype=False)
