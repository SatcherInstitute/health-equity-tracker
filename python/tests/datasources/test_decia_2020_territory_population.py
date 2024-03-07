from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.decia_2020_territory_population import Decia2020TerritoryPopulationData
import pandas as pd
import os


THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')
GOLDEN_DIR = os.path.join(TEST_DIR, 'decia_2020_territory_population', 'golden_data')


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    df = pd.read_csv(os.path.join(TEST_DIR, directory, filename))
    return df


# INTEGRATION TESTS
datasource = Decia2020TerritoryPopulationData()
dtypes = {"state_fips": str, "county_fips": str}
kwargs = {'filename': 'test_file.csv', 'metadata_table_id': 'test_metadata', 'table_name': 'output_table'}


#
# EACH DEMO TYPE AND GEO TYPE IS COVERED BY A TEST BELOW
#


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateAgeTerritory(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    kwargs["demographic"] = "age"
    kwargs["geographic"] = "state"
    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4

    df, _dataset, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "by_age_territory_state_level"
    expected_df = pd.read_csv(os.path.join(GOLDEN_DIR, f'{table_name}.csv'), index_col=False, dtype=dtypes)

    assert_frame_equal(df, expected_df, check_dtype=False)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateRaceTerritory(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    kwargs["demographic"] = "race_and_ethnicity"
    kwargs["geographic"] = "state"
    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4

    df, _dataset, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "by_race_and_ethnicity_territory_state_level"
    expected_df = pd.read_csv(os.path.join(GOLDEN_DIR, f'{table_name}.csv'), index_col=False, dtype=dtypes)

    assert_frame_equal(df, expected_df, check_dtype=False, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateSexTerritoryCountyEquivalent(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    kwargs["demographic"] = "sex"
    kwargs["geographic"] = "county"
    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4

    df, _dataset, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "by_sex_territory_county_level"
    expected_df = pd.read_csv(os.path.join(GOLDEN_DIR, f'{table_name}.csv'), index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)
