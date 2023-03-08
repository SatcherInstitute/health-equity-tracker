from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.decia_2020_territory_population import Decia2020TerritoryPopulationData
import pandas as pd
import os


DTYPE = {'GEO_ID': str}
# EXP_DTYPE = {'state_fips': str, 'time_period': str,
#              'hiv_diagnoses': str, 'hiv_diagnoses_per_100k': str}

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')
GOLDEN_DIR = os.path.join(TEST_DIR, 'golden_data')

GOLDEN_DATA = {
    'age_national': os.path.join(GOLDEN_DIR, 'age_national_output.csv'),
    'race_national': os.path.join(GOLDEN_DIR, 'race_and_ethnicity_national_output.csv'),
    'race_state': os.path.join(GOLDEN_DIR, 'race_and_ethnicity_state_output.csv'),
    'sex_national': os.path.join(GOLDEN_DIR, 'sex_national_output.csv')}


def _load_csv_as_df_from_data_dir(*args, **kwargs):

    print("MOCK: reading from test/ instead of data/ ")

    directory, filename = args

    df = pd.read_csv(os.path.join(TEST_DIR, directory, filename),
                     dtype=DTYPE,
                     )

    return df


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateSexTerritory(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock
):
    print("\n\n")

    datasource = Decia2020TerritoryPopulationData()

    datasource.write_to_bq('dataset', 'gcs_bucket')

    for call in mock_bq.call_args_list:
        df, _dataset, table_name = call[0]

        print(table_name)
        print(df)
