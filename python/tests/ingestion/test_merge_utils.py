from unittest import mock
import json
import pandas as pd

from pandas.testing import assert_frame_equal
from ingestion import gcs_to_bq_util, merge_utils

import ingestion.standardized_columns as std_col

_fips_codes_from_bq = [
    ['state_fips_code', 'state_postal_abbreviation', 'state_name', 'state_gnisid'],
    ['06', 'CA', 'California', '01779778'],
    ['13', 'GA', 'Georgia', '01705317'],
    ['78', 'VI', 'U.S. Virgin Islands', 'NEED_THIS_CODE'],
]

_county_names_from_bq = [
    ['county_fips_code', 'area_name', 'summary_level_name'],
    ['06123', 'California County', 'state-county'],
    ['13345', 'Georgia County', 'state-county'],
]

_pop_2010_data = [
    ['state_fips', 'race_category_id', 'population', 'population_pct'],
    ['78', 'BLACK_NH', 200, 40.0],
    ['78', 'WHITE_NH', 300, 60.0],
]

_pop_data = [
    ['state_fips', 'race_category_id', 'population', 'population_pct'],
    ['01', 'BLACK_NH', 100, 25.0],
    ['01', 'WHITE_NH', 300, 75.0],
    ['02', 'BLACK_NH', 100, 50.0],
    ['100', 'BLACK_NH', 100, 50.0],
]

_pop_data_county = [
    ['state_fips', 'county_fips', 'race_category_id', 'population', 'population_pct'],
    ['01', '01000', 'BLACK_NH', 100, 25.0],
    ['01', '01000', 'WHITE_NH', 300, 75.0],
    ['01', '01234', 'BLACK_NH', 100, 50.0],
    ['100', '10101', 'BLACK_NH', 100, 50.0],
]

_data_with_bad_county_names = [
    ['state_postal', 'county_fips', 'county_name'],
    ['CA', '06123', 'drop-me'],
    ['GA', '13345', 'also-drop-me'],
]

_expected_merged_fips_county = [
    ['state_name', 'state_fips', 'county_fips', 'county_name'],
    ['California', '06', '06123', 'California County'],
    ['Georgia', '13', '13345', 'Georgia County'],
]

_data_without_fips_codes = [
    ['state_name', 'state_postal', 'other_col'],
    ['United States', 'US', 'something_cool'],
    ['California', 'CA', 'something'],
    ['Georgia', 'GA', 'something_else'],
    ['U.S. Virgin Islands', 'VI', 'something_else_entirely'],
    ['Unknown', 'Unknown', 'who_am_i'],
]

_expected_merged_fips = [
    ['state_name', 'other_col', 'state_fips'],
    ['United States', 'something_cool', '00'],
    ['California', 'something', '06'],
    ['Georgia', 'something_else', '13'],
    ['U.S. Virgin Islands', 'something_else_entirely', '78'],
    ['Unknown', 'who_am_i', 'Unknown'],
]

_data_without_pop_numbers = [
    ['state_fips', 'race_category_id', 'other_col'],
    ['01', 'BLACK_NH', 'something_cool'],
    ['01', 'WHITE_NH', 'something_else_cool'],
    ['02', 'BLACK_NH', 'something_cooler'],
    ['78', 'WHITE_NH', 'something_else_entirely'],
    ['78', 'BLACK_NH', 'something_else_entirely'],
]

_expected_merged_with_pop_numbers = [
    ['state_fips', 'race_category_id', 'population', 'population_pct', 'other_col'],
    ['01', 'BLACK_NH', 100, 25.0, 'something_cool'],
    ['01', 'WHITE_NH', 300, 75.0, 'something_else_cool'],
    ['02', 'BLACK_NH', 100, 50.0, 'something_cooler'],
    ['78', 'WHITE_NH', 300, 60.0, 'something_else_entirely'],
    ['78', 'BLACK_NH', 200, 40.0, 'something_else_entirely'],
]

_data_without_pop_numbers_county = [
    ['state_fips', 'county_fips', 'race_category_id', 'other_col'],
    ['01', '01000', 'BLACK_NH', 'something_cool'],
    ['01', '01000', 'WHITE_NH', 'something_else_cool'],
    ['01', '01234', 'BLACK_NH', 'something_cooler'],
]

_expected_merged_with_pop_numbers_county = [
    ['state_fips', 'county_fips', 'race_category_id',
        'population', 'population_pct', 'other_col'],
    ['01', '01000', 'BLACK_NH', 100, 25.0, 'something_cool'],
    ['01', '01000', 'WHITE_NH', 300, 75.0, 'something_else_cool'],
    ['01', '01234', 'BLACK_NH', 100, 50.0, 'something_cooler'],
]


def _get_fips_codes_as_df(*args, **kwargs):
    return gcs_to_bq_util.values_json_to_df(
        json.dumps(_fips_codes_from_bq), dtype=str).reset_index(drop=True)


def _get_county_names_as_df(*args, **kwargs):
    return gcs_to_bq_util.values_json_to_df(
        json.dumps(_county_names_from_bq), dtype=str).reset_index(drop=True)


def _get_pop_data_as_df(*args):

    pop_dtype = {std_col.STATE_FIPS_COL: str,
                 std_col.POPULATION_COL: float,
                 std_col.POPULATION_PCT_COL: float}

    if args[1].endswith("_territory"):
        return gcs_to_bq_util.values_json_to_df(
            json.dumps(_pop_2010_data), dtype=pop_dtype).reset_index(drop=True)

    elif 'state' in args[1]:
        return gcs_to_bq_util.values_json_to_df(
            json.dumps(_pop_data), dtype=pop_dtype).reset_index(drop=True)

    elif 'county' in args[1]:
        return gcs_to_bq_util.values_json_to_df(
            json.dumps(_pop_data_county), dtype=pop_dtype).reset_index(drop=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=_get_fips_codes_as_df())
def testMergeFipsCodesCounty(mock_bq: mock.MagicMock):
    mock_bq.side_effect = [
        _get_county_names_as_df(),
        _get_fips_codes_as_df(),
    ]
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_with_bad_county_names), dtype=str).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_fips_county), dtype=str).reset_index(drop=True)

    df = merge_utils.merge_fips_codes(df, county_level=True)

    assert mock_bq.call_count == 2
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=_get_fips_codes_as_df())
def testMergeFipsCodesStateName(mock_bq: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_without_fips_codes), dtype=str).reset_index(drop=True)

    df = df[['state_name', 'other_col']]

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_fips), dtype=str).reset_index(drop=True)

    df = merge_utils.merge_fips_codes(df)

    assert mock_bq.call_count == 1
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=_get_fips_codes_as_df())
def testMergeFipsCodesStatePostal(mock_bq: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_without_fips_codes), dtype=str).reset_index(drop=True)

    df = df[['state_postal', 'other_col']]

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_fips), dtype=str).reset_index(drop=True)

    df = merge_utils.merge_fips_codes(df)

    assert mock_bq.call_count == 1
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=_get_pop_data_as_df)
def testMergePopNumbersState(mock_bq: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_without_pop_numbers),
        dtype={std_col.STATE_FIPS_COL: str}).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_with_pop_numbers),
        dtype={std_col.STATE_FIPS_COL: str}).reset_index(drop=True)

    df = merge_utils.merge_pop_numbers(df, 'race', 'state')

    assert mock_bq.call_count == 2

    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=_get_pop_data_as_df)
def testMergePopNumbersCounty(mock_bq: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_without_pop_numbers_county),
        dtype={std_col.STATE_FIPS_COL: str}).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_with_pop_numbers_county),
        dtype={std_col.STATE_FIPS_COL: str}).reset_index(drop=True)

    df = merge_utils.merge_pop_numbers(df, 'race', 'county')

    assert mock_bq.call_count == 1

    assert_frame_equal(df, expected_df, check_like=True)
