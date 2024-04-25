from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.maternal_mortality import MaternalMortalityData

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "maternal_mortality")

GOLDEN_DIR = os.path.join(TEST_DIR, 'golden_data')
GOLDEN_DATA_RACE_STATE_HISTORICAL = os.path.join(
    GOLDEN_DIR, 'maternal_mortality_output_race_and_ethnicity_state_historical.csv'
)

GOLDEN_DATA_RACE_NATIONAL_HISTORICAL = os.path.join(
    GOLDEN_DIR, 'maternal_mortality_output_race_and_ethnicity_national_historical.csv'
)

GOLDEN_DATA_RACE_STATE_CURRENT = os.path.join(
    GOLDEN_DIR, 'maternal_mortality_output_race_and_ethnicity_state_current.csv'
)

GOLDEN_DATA_RACE_NATIONAL_CURRENT = os.path.join(
    GOLDEN_DIR, 'maternal_mortality_output_race_and_ethnicity_national_current.csv'
)

# NATIONAL, STATE, CURRENT, HISTORICAL


# RUN THIS TO LOAD FAKE TEST DATA INSTEAD OF THE REAL /data
def get_test_data_as_df(*args, **kwargs):
    print("Reading test input data rather than actual /data dir")
    print(args[1])
    print(kwargs)
    df = pd.read_csv(os.path.join(TEST_DIR, args[1]))
    return df


# READ IN FAKE TEST DATA INSTEAD OF REAL /data
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=get_test_data_as_df,
)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBq(
    mock_bq: mock.MagicMock,
    mock_csv: mock.MagicMock,
):
    datasource = MaternalMortalityData()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
    }

    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # ASSERT THAT THE MOCKED READ CSV FUNCTION WAS CALLED FOR THE SOURCE RATES AND THE SOURCE COUNTS TABLES
    assert mock_csv.call_count == 2

    # STATE + HISTORICAL
    df_state_historical, _, table_name = mock_bq.call_args_list[0][0]
    assert table_name == 'by_race_state_historical'
    print(df_state_historical.dtypes)
    # TODO: assert that the df_state is the same as the golden data file loaded via pd.read_csv

    expected_state_historical_df = pd.read_csv(GOLDEN_DATA_RACE_STATE_HISTORICAL, dtype={'state_fips': str})
    print(expected_state_historical_df.dtypes)
    assert_frame_equal(df_state_historical, expected_state_historical_df, check_like=True, check_dtype=False)

    # # STATE + CURRENT
    df_state_current, _, table_name = mock_bq.call_args_list[1][0]
    assert table_name == 'by_race_state_current'
    print(df_state_current.dtypes)
    # # TODO: assert that the df_state is the same as the golden data file loaded via pd.read_csv

    expected_state_current_df = pd.read_csv(GOLDEN_DATA_RACE_STATE_CURRENT, dtype={'state_fips': str})
    print(expected_state_current_df.dtypes)
    assert_frame_equal(df_state_current, expected_state_current_df, check_like=True, check_dtype=False)

    # # NATIONAL + HISTORICAL
    df_national_historical, _, table_name = mock_bq.call_args_list[2][0]
    assert table_name == 'by_race_national_historical'
    print(df_national_historical.dtypes)
    # # TODO: assert that the df_national is the same as the golden data file loaded via pd.read_csv

    expected_national_historical_df = pd.read_csv(GOLDEN_DATA_RACE_NATIONAL_HISTORICAL, dtype={'state_fips': str})
    print(expected_national_historical_df.dtypes)
    assert_frame_equal(df_national_historical, expected_national_historical_df, check_like=True, check_dtype=False)

    # # NATIONAL + CURRENT
    df_national_current, _, table_name = mock_bq.call_args_list[3][0]
    assert table_name == 'by_race_national_current'
    print(df_national_current.dtypes)
    # # TODO: assert that the df_national is the same as the golden data file loaded via pd.read_csv

    expected_national_current_df = pd.read_csv(GOLDEN_DATA_RACE_NATIONAL_CURRENT, dtype={'state_fips': str})
    print(expected_national_current_df.dtypes)
    assert_frame_equal(df_national_current, expected_national_current_df, check_like=True, check_dtype=False)
