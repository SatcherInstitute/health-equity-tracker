from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.cdc_vaccination_county import CDCVaccinationCounty

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_vaccination_county")

GOLDEN_DATA = os.path.join(TEST_DIR, 'cdc_vaccination_county-race_and_ethnicity.csv')


def get_total_vaccinations_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, 'cdc_vaccination_county_test.csv'), dtype=str)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe_from_web',
            return_value=get_total_vaccinations_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    cdcVaccinationCounty = CDCVaccinationCounty()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cdcVaccinationCounty.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 1

    expected_df = pd.read_csv(GOLDEN_DATA, dtype={
        'county_fips': str,
        'vaccinated_first_dose': str,
        'race_includes_hispanic': str,
    })
    assert_frame_equal(mock_bq.call_args_list[0].args[0], expected_df, check_like=True)
