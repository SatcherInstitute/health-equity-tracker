from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.decia_2020_territory_population import (
    Decia2020TerritoryPopulationData)
import pandas as pd
import os


DTYPE = {'GEO_ID': str}
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')
GOLDEN_DIR = os.path.join(
    TEST_DIR, 'decia_2020_territory_population', 'golden_data')

GOLDEN_DATA = {
    'sex_state': os.path.join(GOLDEN_DIR, 'by_sex_territory_state_level.csv'),
    'sex_county': os.path.join(GOLDEN_DIR, 'by_sex_territory_county_level.csv'),
    'age_state': os.path.join(GOLDEN_DIR, 'by_age_territory_state_level.csv'),
    'age_county': os.path.join(GOLDEN_DIR, 'by_age_territory_county_level.csv'),
    'race_state': os.path.join(GOLDEN_DIR, 'by_race_and_ethnicity_territory_state_level.csv'),
    'race_county': os.path.join(GOLDEN_DIR, 'by_race_and_ethnicity_territory_county_level.csv')
}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    df = pd.read_csv(
        os.path.join(TEST_DIR, directory, filename),
        dtype=DTYPE)
    return df


def _generate_breakdown_df():
    return pd.DataFrame({'col1': ['a', 'b', 'c', 'd'],
                         'col2': [1, 2, 3, 4]})


# INTEGRATION TESTS

datasource = Decia2020TerritoryPopulationData()
dtypes = {"state_fips": str, "county_fips": str}


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'datasources.decia_2020_territory_population.Decia2020TerritoryPopulationData.generate_breakdown_df',
    return_value=_generate_breakdown_df()
)
def testBigQueryCalls(
    mock_gen_breakdown: mock.MagicMock,
    mock_bq: mock.MagicMock
):
    datasource.write_to_bq('dataset', 'gcs_bucket')
    # 6 breakdowns = 3 demos * 2 geos
    assert mock_gen_breakdown.call_count == 6
    generated_table_names = [call_arg[0][2]
                             for call_arg in mock_bq.call_args_list]
    assert generated_table_names == [
        'by_age_territory_county_level',
        'by_race_and_ethnicity_territory_county_level',
        'by_sex_territory_county_level',
        'by_age_territory_state_level',
        'by_race_and_ethnicity_territory_state_level',
        'by_sex_territory_state_level'
    ]


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateSexTerritory(mock_data_dir: mock.MagicMock):
    df = datasource.generate_breakdown_df("sex", "state")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    expected_df = pd.read_csv(
        GOLDEN_DATA['sex_state'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateSexTerritoryCountyEquivalent(mock_data_dir: mock.MagicMock):
    df = datasource.generate_breakdown_df("sex", "county")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    expected_df = pd.read_csv(
        GOLDEN_DATA['sex_county'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateAgeTerritory(mock_data_dir: mock.MagicMock):
    df = datasource.generate_breakdown_df("age", "state")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    expected_df = pd.read_csv(
        GOLDEN_DATA['age_state'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateAgeTerritoryCountyEquivalent(mock_data_dir: mock.MagicMock):
    df = datasource.generate_breakdown_df("age", "county")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    expected_df = pd.read_csv(
        GOLDEN_DATA['age_county'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateRaceTerritory(mock_data_dir: mock.MagicMock):
    df = datasource.generate_breakdown_df("race_and_ethnicity", "state")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    expected_df = pd.read_csv(
        GOLDEN_DATA['race_state'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateRaceTerritoryCountyEquivalent(mock_data_dir: mock.MagicMock):
    df = datasource.generate_breakdown_df("race_and_ethnicity", "county")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    expected_df = pd.read_csv(
        GOLDEN_DATA['race_county'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)
