from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.phrma import PhrmaData
from ingestion.phrma_utils import PHRMA_DIR
import pandas as pd
import os

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')
GOLDEN_DIR = os.path.join(TEST_DIR, PHRMA_DIR, 'golden_data')

ALLS_DATA = {
    "national": os.path.join(TEST_DIR, PHRMA_DIR, "mocked_alls", 'national-alls.csv'),
    "state": os.path.join(TEST_DIR, PHRMA_DIR, "mocked_alls", 'state-alls.csv'),
    "county": os.path.join(TEST_DIR, PHRMA_DIR, "mocked_alls", 'county-alls.csv'),
}

GOLDEN_DATA = {
    'lis_national_current': os.path.join(GOLDEN_DIR, 'expected_lis_national.csv'),
    'eligibility_national_current': os.path.join(GOLDEN_DIR, 'expected_eligibility_national.csv'),
    'sex_national_current': os.path.join(GOLDEN_DIR, 'expected_sex_national.csv'),
    'sex_state_current': os.path.join(GOLDEN_DIR, 'expected_sex_state.csv'),
    'race_and_ethnicity_state_current': os.path.join(GOLDEN_DIR, 'expected_race_and_ethnicity_state.csv'),
    'age_county_current': os.path.join(GOLDEN_DIR, 'expected_age_county.csv'),
}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    print("MOCKING FILE READ FROM /data", directory, filename)
    dtype = kwargs['dtype']
    na_values = kwargs['na_values']
    subdirectory = kwargs['subdirectory']
    usecols = kwargs['usecols']
    file_path = os.path.join(TEST_DIR, directory, 'test_input_data', subdirectory, filename)

    df = pd.read_csv(file_path, na_values=na_values, dtype=dtype, usecols=usecols)

    return df


def _generate_breakdown_df(*args):
    print("mocking _generate_breakdown_df()")
    print("args:", args)
    return pd.DataFrame(
        {
            "state_fips": ["01", "02", "03"],
            "state_name": ["SomeState01", "SomeState02", "SomeState03"],
            "race_category_id": ["BLACK", "BLACK", "BLACK"],
            "race_and_ethnicity": ["Black", "Black", "Black"],
            "fake_col1": [0, 1, 2],
            "fake_col2": ["a", "b", "c"],
        }
    )


# BREAKDOWN TESTS


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_data_dir,
)
def testBreakdownLisNational(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="lis", geographic="national")

    # two calls for each topics (by all + by demographic)
    assert mock_data_dir.call_count == 11 * 2

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'lis_national_current'

    expected_df = pd.read_csv(GOLDEN_DATA['lis_national_current'], dtype={"state_fips": str})
    # breakdown_df.to_csv(table_name, index=False)
    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_data_dir,
)
def testBreakdownEligibilityNational(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="eligibility", geographic="national")

    # two calls for each topics (by all + by demographic)
    assert mock_data_dir.call_count == 11 * 2

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'eligibility_national_current'

    expected_df = pd.read_csv(GOLDEN_DATA['eligibility_national_current'], dtype={"state_fips": str})
    # breakdown_df.to_csv(table_name, index=False)
    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_data_dir,
)
def testBreakdownSexNational(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="sex", geographic="national")

    # two calls for each topics (by all + by demographic)
    assert mock_data_dir.call_count == 11 * 2

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'sex_national_current'

    expected_df = pd.read_csv(GOLDEN_DATA['sex_national_current'], dtype={"state_fips": str})
    # breakdown_df.to_csv(table_name, index=False)
    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_data_dir,
)
def testBreakdownSexState(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="sex", geographic="state")

    # two calls for each topics (by all + by demographic)
    assert mock_data_dir.call_count == 11 * 2

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'sex_state_current'

    expected_df = pd.read_csv(GOLDEN_DATA['sex_state_current'], dtype={"state_fips": str})
    # breakdown_df.to_csv(table_name, index=False)
    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_data_dir,
)
def testBreakdownRaceState(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="state")

    # two calls for each topics (by all + by demographic)
    assert mock_data_dir.call_count == 11 * 2

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'race_and_ethnicity_state_current'

    expected_df = pd.read_csv(GOLDEN_DATA['race_and_ethnicity_state_current'], dtype={"state_fips": str})
    # breakdown_df.to_csv(table_name, index=False)
    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_data_dir,
)
def testBreakdownAgeCounty(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="age", geographic="county")

    # two calls for each topics (by all + by demographic)
    assert mock_data_dir.call_count == 11 * 2

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'age_county_current'

    expected_df = pd.read_csv(GOLDEN_DATA['age_county_current'], dtype={"county_fips": str, "state_fips": str})
    # breakdown_df.to_csv(table_name, index=False)

    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)
