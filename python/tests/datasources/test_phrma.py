from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.phrma import PhrmaData
from ingestion.phrma_utils import PHRMA_DIR
import os
from test_utils import _load_csv_as_df_from_real_data_dir, load_golden_df

# Path Setup
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, PHRMA_DIR, "golden_data")
EXP_DTYPE = {"state_fips": str, "county_fips": str}


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_real_data_dir,
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
    assert table_name == "lis_national_current"

    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownEligibilityNational(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="eligibility", geographic="national")

    assert mock_data_dir.call_count == 11 * 2

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == "eligibility_national_current"

    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownSexNational(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="sex", geographic="national")

    assert mock_data_dir.call_count == 11 * 2

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == "sex_national_current"

    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownSexState(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="sex", geographic="state")

    assert mock_data_dir.call_count == 11 * 2

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == "sex_state_current"

    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownRaceState(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="state")

    assert mock_data_dir.call_count == 11 * 2

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == "race_and_ethnicity_state_current"

    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownAgeCounty(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="age", geographic="county")

    assert mock_data_dir.call_count == 11 * 2

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == "age_county_current"

    expected_df = load_golden_df(GOLDEN_DIR, table_name, EXP_DTYPE)
    assert_frame_equal(breakdown_df, expected_df, check_dtype=False, check_like=True)
