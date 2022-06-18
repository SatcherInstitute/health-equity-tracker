from unittest import mock
import os

import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.vera_incarceration_county import VeraIncarcerationCounty, VERA_COL_TYPES

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data",
                        "vera_incarceration_county")

GOLDEN_DATA = {
    'prison_race_county': os.path.join(TEST_DIR, 'vera_incarceration_county-prison_race_and_ethnicity.json'),
    'prison_age_county': os.path.join(TEST_DIR, 'vera_incarceration_county-prison_age.json'),
    'prison_sex_county': os.path.join(TEST_DIR, 'vera_incarceration_county-prison_sex.json'),
    'jail_race_county': os.path.join(TEST_DIR, 'vera_incarceration_county-jail_race_and_ethnicity.json'),
    'jail_age_county': os.path.join(TEST_DIR, 'vera_incarceration_county-jail_age.json'),
    'jail_sex_county': os.path.join(TEST_DIR, 'vera_incarceration_county-jail_sex.json'),
}


def get_mocked_data_as_df():
    df = pd.read_csv(os.path.join(
        TEST_DIR, 'vera_incarceration_county_test_input.csv'), dtype=VERA_COL_TYPES,)
    return df


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
            return_value=get_mocked_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):

    veraIncarcerationCounty = VeraIncarcerationCounty()

    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    veraIncarcerationCounty.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 4

    print(mock_bq.call_args_list)

    assert mock_bq.call_args_list[0].args[2] == 'prison_race_and_ethnicity'
    assert mock_bq.call_args_list[1].args[2] == 'prison_sex'
    assert mock_bq.call_args_list[2].args[2] == 'jail_race_and_ethnicity'
    assert mock_bq.call_args_list[3].args[2] == 'jail_sex'
    # TODO Add AGE calls

    for call_arg in mock_bq.call_args_list:
        mock_df, _, bq_table_name = call_arg[0]
        print("\n\n")
        print(bq_table_name)
        print(mock_df)
        mock_df.to_json(
            f'vera_incarceration_county-{bq_table_name}.json', orient="records")


def testCountyPrisonRace():

    veraIncarcerationCounty = VeraIncarcerationCounty()

    _fake_df = []

    generated_df = veraIncarcerationCounty.generate_for_bq(
        _fake_df, "prison", "race_and_ethnicity")

    expected_df = pd.read_csv(GOLDEN_DATA['prison_race_county'], dtype={
        'county_fips': str,
        'prison_per_100k': float,
        'prison_pct_share': float,
        'population_pct_share': float,
        'race_includes_hispanic': str,
    })
    assert_frame_equal(
        generated_df, expected_df, check_like=True)
