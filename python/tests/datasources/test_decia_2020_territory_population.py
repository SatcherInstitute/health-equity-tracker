import json
from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.decia_2020_territory_population import (
    Decia2020TerritoryPopulationData)
import pandas as pd
import os
from ingestion import gcs_to_bq_util


THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')
GOLDEN_DIR = os.path.join(
    TEST_DIR, 'decia_2020_territory_population', 'golden_data')


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    df = pd.read_csv(
        os.path.join(TEST_DIR, directory, filename))
    return df


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
kwargs = {'filename': 'test_file.csv',
          'metadata_table_id': 'test_metadata',
          'table_name': 'output_table'}


#
# EACH DEMO TYPE AND GEO TYPE IS COVERED BY A TEST BELOW
#

@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=_load_public_dataset_from_bigquery_as_df)
def testGenerateAgeTerritory(
    mock_geo_names: mock.MagicMock,
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    kwargs["demographic"] = "age"
    kwargs["geographic"] = "state"
    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    # 1 fetch for public BQ names: state
    mock_geo_names.call_count == 1

    df, _dataset, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "by_age_territory_state_level"
    expected_df = pd.read_csv(
        os.path.join(GOLDEN_DIR, f'{table_name}.csv'), index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=_load_public_dataset_from_bigquery_as_df)
def testGenerateRaceTerritory(
    mock_geo_names: mock.MagicMock,
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    kwargs["demographic"] = "race_and_ethnicity"
    kwargs["geographic"] = "state"
    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    # 1 fetch for public BQ names: state
    mock_geo_names.call_count == 1

    df, _dataset, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "by_race_and_ethnicity_territory_state_level"
    expected_df = pd.read_csv(
        os.path.join(GOLDEN_DIR, f'{table_name}.csv'), index_col=False, dtype=dtypes)

    print(df.to_string())
    print(expected_df.to_string())

    assert_frame_equal(df, expected_df, check_dtype=False)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=_load_public_dataset_from_bigquery_as_df)
def testGenerateSexTerritoryCountyEquivalent(
    mock_geo_names: mock.MagicMock,
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    kwargs["demographic"] = "sex"
    kwargs["geographic"] = "county"
    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    # loads in 4 files, 1 per Island Area
    assert mock_data_dir.call_count == 4
    # 2 fetches for public BQ names: county + state
    mock_geo_names.call_count == 2

    df, _dataset, table_name = mock_bq.call_args_list[0][0]
    assert table_name == "by_sex_territory_county_level"
    expected_df = pd.read_csv(
        os.path.join(GOLDEN_DIR, f'{table_name}.csv'), index_col=False, dtype=dtypes)
    assert_frame_equal(df, expected_df, check_dtype=False)
