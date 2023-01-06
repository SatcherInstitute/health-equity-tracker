from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.geo_context import GeoContext, format_svi

# insert unit tests


def test_format_svi():
    assert format_svi(0.4354) == .44


# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "geo_context")
REAL_SVI_DIR = os.path.abspath('data/cdc_svi_county')


GOLDEN_DATA_COUNTY = os.path.join(
    TEST_DIR, 'test_output_geo_context_county.csv')


def _get_svi_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_svi_county_test.csv'), dtype={"FIPS": str})


def _get_full_svi_as_df():
    return pd.read_csv(os.path.join(REAL_SVI_DIR, 'cdc_svi_county_totals.csv'), dtype={"FIPS": str})


def get_county_names():
    return pd.read_csv(os.path.join(TEST_DIR, 'county_names.csv'), dtype={"county_fips_code": str})


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', return_value=_get_full_svi_as_df())
# @mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df', return_value=get_county_names())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testWriteToBq(
    mock_bq: mock.MagicMock,
    # mock_county_names: mock.MagicMock,
    mock_csv: mock.MagicMock
):
    geoContext = GeoContext()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    geoContext.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 3
    # assert mock_county_names.call_count == 1
    # assert mock_csv.call_count == 1

    expected_df_county = pd.read_csv(GOLDEN_DATA_COUNTY, dtype={
        'county_fips': str,
    })
    # assert_frame_equal(
    #     mock_bq.call_args_list[0].args[0], expected_df_county, check_like=True)
