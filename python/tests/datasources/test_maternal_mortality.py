from unittest import mock
import os
from pandas._testing import assert_frame_equal
from datasources.maternal_mortality import MaternalMortalityData
from test_utils import _load_csv_as_df_from_real_data_dir, load_golden_df

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
GOLDEN_DIR = os.path.join(THIS_DIR, os.pardir, "data", "maternal_mortality", "golden_data")

FIPS_TIME_DTYPE = {"state_fips": str, "time_period": str}
FIPS_DTYPE = {"state_fips": str}


@mock.patch("ingestion.gcs_to_bq_util.load_tsv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_real_data_dir)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock, mock_tsv: mock.MagicMock):
    datasource = MaternalMortalityData()

    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
    }

    datasource.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_csv.call_count == 2
    assert mock_tsv.call_count == 1

    df_state_historical, _, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "race_and_ethnicity_state_historical"
    assert_frame_equal(
        df_state_historical, load_golden_df(GOLDEN_DIR, table_name, FIPS_TIME_DTYPE), check_like=True, check_dtype=False
    )

    df_state_current, _, table_name = mock_bq.call_args_list[1][0]
    assert table_name == "race_and_ethnicity_state_current"
    assert_frame_equal(
        df_state_current, load_golden_df(GOLDEN_DIR, table_name, FIPS_DTYPE), check_like=True, check_dtype=False
    )

    df_national_historical, _, table_name = mock_bq.call_args_list[2][0]
    assert table_name == "race_and_ethnicity_national_historical"
    assert_frame_equal(
        df_national_historical,
        load_golden_df(GOLDEN_DIR, table_name, FIPS_TIME_DTYPE),
        check_like=True,
        check_dtype=False,
    )

    df_national_current, _, table_name = mock_bq.call_args_list[3][0]
    assert table_name == "race_and_ethnicity_national_current"
    assert_frame_equal(
        df_national_current, load_golden_df(GOLDEN_DIR, table_name, FIPS_DTYPE), check_like=True, check_dtype=False
    )
