from unittest import mock
import os
from datasources.cdc_wonder import CdcWonderData
from ingestion.cdc_wonder_utils import CDC_WONDER_DIR, STATE_CODE_DEFAULT, STATE_CODE_RACE
import pandas as pd
from pandas._testing import assert_frame_equal

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')
GOLDEN_DIR = os.path.join(TEST_DIR, CDC_WONDER_DIR, 'golden_data')

GOLDEN_DATA = {
    'race_and_ethnicity_state_current': os.path.join(GOLDEN_DIR, 'expected_race_and_ethnicity_state.csv'),
    'age_national_current': os.path.join(GOLDEN_DIR, 'expected_age_national.csv'),
    'sex_national_current': os.path.join(GOLDEN_DIR, 'expected_sex_national.csv'),
}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    use_cols = kwargs["usecols"]
    subdirectory = kwargs["subdirectory"]

    df = pd.read_csv(
        os.path.join(TEST_DIR, directory, subdirectory, filename),
        usecols=use_cols,
        na_values=["Not Applicable"],
        dtype={"Year": str, "Population": float, STATE_CODE_RACE: str, STATE_CODE_DEFAULT: str},
        thousands=",",
    )

    return df


# Breakdown Tests
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testBreakdownSexNational(mock_data_dir: mock.MagicMock, mock_bq_write: mock.MagicMock):
    datasource = CdcWonderData()
    datasource.write_to_bq('dataset', 'gcs_bucket', demographic='sex', geographic='national')

    assert mock_data_dir.called

    (mock_current, _mock_historical) = mock_bq_write.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype={"state_fips": str})

    assert table_name == "sex_national_current"
    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testBreakdownAgeNational(mock_data_dir: mock.MagicMock, mock_bq_write: mock.MagicMock):
    datasource = CdcWonderData()
    datasource.write_to_bq('dataset', 'gcs_bucket', demographic='age', geographic='national')

    assert mock_data_dir.called

    (mock_current, _mock_historical) = mock_bq_write.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype={"state_fips": str})

    assert table_name == "age_national_current"
    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testBreakdownRaceState(mock_data_dir: mock.MagicMock, mock_bq_write: mock.MagicMock):
    datasource = CdcWonderData()
    datasource.write_to_bq('dataset', 'gcs_bucket', demographic='race_and_ethnicity', geographic='state')

    assert mock_data_dir.called

    (mock_current, _mock_historical) = mock_bq_write.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype={"state_fips": str})

    assert table_name == "race_and_ethnicity_state_current"
    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
