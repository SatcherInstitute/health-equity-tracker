import json
from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.decia_2020_territory_population import (
    Decia2020TerritoryPopulationData)
import pandas as pd
import os
from ingestion import gcs_to_bq_util


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


def _load_public_dataset_from_bigquery_as_df(*args, **kwargs):

    _public_state_dataset_from_bq = [
        ['state_fips_code', 'state_postal_abbreviation',
            'state_name', 'state_gnisid'],
        ['60', 'AS', 'American Samoa', 'SOME_CODE_CODE'],
        ['66', 'GU', 'Guam', 'SOME_CODE_CODE'],
        ['69', 'MP', 'Northern Mariana Islands', 'SOME_CODE_CODE'],
        ['78', 'VI', 'U.S. Virgin Islands', 'SOME_CODE_CODE'],
    ]

    _public_county_dataset_from_bq = [
        ["summary_level", "summary_level_name", "state_fips_code", "county_fips_code",
            "county_subdivision_fips_code", "place_fips_code", "consolidated_city_fips_code", "area_name"],
        # we don't actually use the BigQuery public county names for territory equivalents,
        # we have them hard-coded in constants.py; however we still need to mock the call
        # that happens before merging the hard-coded ones
    ]

    # within merge_state_ids()
    if args[1] == "fips_codes_states":
        return gcs_to_bq_util.values_json_to_df(
            json.dumps(_public_state_dataset_from_bq), dtype=str).reset_index(drop=True)

    # within merge_county_names()
    if args[1] == "fips_codes_all":
        return gcs_to_bq_util.values_json_to_df(
            json.dumps(_public_county_dataset_from_bq), dtype=str).reset_index(drop=True)

    return TypeError(f'Unexpected *args: {args}')


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
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             side_effect=_load_public_dataset_from_bigquery_as_df)
def testGenerateSexTerritory(
    mock_geo_names: mock.MagicMock,
    mock_data_dir: mock.MagicMock,
):
    df = datasource.generate_breakdown_df("sex", "state")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    # 1 fetch for public BQ names: state
    mock_geo_names.call_count == 1

    expected_df = pd.read_csv(
        GOLDEN_DATA['sex_state'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             side_effect=_load_public_dataset_from_bigquery_as_df)
def testGenerateSexTerritoryCountyEquivalent(
    mock_geo_names: mock.MagicMock,
    mock_data_dir: mock.MagicMock,
):
    df = datasource.generate_breakdown_df("sex", "county")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    # 2 fetches for public BQ names: county + state
    mock_geo_names.call_count == 2

    expected_df = pd.read_csv(
        GOLDEN_DATA['sex_county'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             side_effect=_load_public_dataset_from_bigquery_as_df)
def testGenerateAgeTerritory(
    mock_geo_names: mock.MagicMock,
    mock_data_dir: mock.MagicMock
):
    df = datasource.generate_breakdown_df("age", "state")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    # fetch for public BQ names: state
    assert mock_geo_names.call_count == 1
    expected_df = pd.read_csv(
        GOLDEN_DATA['age_state'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             side_effect=_load_public_dataset_from_bigquery_as_df)
def testGenerateAgeTerritoryCountyEquivalent(
    mock_geo_names: mock.MagicMock,
    mock_data_dir: mock.MagicMock
):
    df = datasource.generate_breakdown_df("age", "county")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    # fetch for public BQ names: state
    assert mock_geo_names.call_count == 2
    expected_df = pd.read_csv(
        GOLDEN_DATA['age_county'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             side_effect=_load_public_dataset_from_bigquery_as_df)
def testGenerateRaceTerritory(
    mock_geo_names: mock.MagicMock,
    mock_data_dir: mock.MagicMock
):
    df = datasource.generate_breakdown_df("race_and_ethnicity", "state")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    # fetch for public BQ names: state
    assert mock_geo_names.call_count == 1
    expected_df = pd.read_csv(
        GOLDEN_DATA['race_state'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             side_effect=_load_public_dataset_from_bigquery_as_df)
def testGenerateRaceTerritoryCountyEquivalent(
    mock_geo_names: mock.MagicMock,
    mock_data_dir: mock.MagicMock
):
    df = datasource.generate_breakdown_df("race_and_ethnicity", "county")
    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    # fetch for public BQ names: state
    assert mock_geo_names.call_count == 2
    expected_df = pd.read_csv(
        GOLDEN_DATA['race_county'], index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)
