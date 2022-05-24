from unittest import mock

import json
import pytest
import pandas as pd

from pandas.testing import assert_frame_equal
from ingestion import gcs_to_bq_util, dataset_utils  # pylint: disable=no-name-in-module

import ingestion.standardized_columns as std_col

_fake_race_data = [
    ['state_fips', 'state_name', 'race', 'population'],
    ['01', 'Alabama', 'Asian alone', '660'],
    ['01', 'Alabama', 'Some other race alone', '700'],
    ['01', 'Alabama', 'Two or more races', '919'],
    ['01', 'Alabama', 'An underrepresented race', '1'],
    ['01', 'Alabama', 'ALL', '2280'],
    ['01', 'Alabama', 'UNKNOWN', '30'],
    ['02', 'Alaska', 'Asian alone', '45'],
    ['02', 'Alaska', 'Some other race alone', '11'],
    ['02', 'Alaska', 'Two or more races', '60'],
    ['02', 'Alaska', 'ALL', '116'],
    ['02', 'Alaska', 'UNKNOWN', '20'],
    ['04', 'Arizona', 'Asian alone', '23'],
    ['04', 'Arizona', 'Some other race alone', '46'],
    ['04', 'Arizona', 'Two or more races', '26'],
    ['04', 'Arizona', 'ALL', '95'],
    ['04', 'Arizona', 'UNKNOWN', '10'],
]

_expected_pct_share_data_without_unknowns = [
    ['state_fips', 'state_name', 'race', 'population', 'pct_share'],
    ['01', 'Alabama', 'Asian alone', '660', '28.9'],
    ['01', 'Alabama', 'Some other race alone', '700', '30.7'],
    ['01', 'Alabama', 'Two or more races', '919', '40.3'],
    ['01', 'Alabama', 'An underrepresented race', '1', '.04'],
    ['01', 'Alabama', 'ALL', '2280', '100'],
    ['02', 'Alaska', 'Asian alone', '45', '38.8'],
    ['02', 'Alaska', 'Some other race alone', '11', '9.5'],
    ['02', 'Alaska', 'Two or more races', '60', '51.7'],
    ['02', 'Alaska', 'ALL', '116', '100'],
    ['04', 'Arizona', 'Asian alone', '23', '24.2'],
    ['04', 'Arizona', 'Some other race alone', '46', '48.4'],
    ['04', 'Arizona', 'Two or more races', '26', '27.4'],
    ['04', 'Arizona', 'ALL', '95', '100'],
]

_expected_pct_share_data_with_unknowns = [
    ['state_fips', 'state_name', 'race', 'population', 'pct_share'],
    ['01', 'Alabama', 'Asian alone', '660', '28.9'],
    ['01', 'Alabama', 'Some other race alone', '700', '30.7'],
    ['01', 'Alabama', 'Two or more races', '919', '40.3'],
    ['01', 'Alabama', 'An underrepresented race', '1', '.04'],
    ['01', 'Alabama', 'ALL', '2280', '100'],
    ['01', 'Alabama', 'UNKNOWN', '30', '1.3'],
    ['02', 'Alaska', 'Asian alone', '45', '38.8'],
    ['02', 'Alaska', 'Some other race alone', '11', '9.5'],
    ['02', 'Alaska', 'Two or more races', '60', '51.7'],
    ['02', 'Alaska', 'ALL', '116', '100'],
    ['02', 'Alaska', 'UNKNOWN', '20', '17.2'],
    ['04', 'Arizona', 'Asian alone', '23', '24.2'],
    ['04', 'Arizona', 'Some other race alone', '46', '48.4'],
    ['04', 'Arizona', 'Two or more races', '26', '27.4'],
    ['04', 'Arizona', 'ALL', '95', '100'],
    ['04', 'Arizona', 'UNKNOWN', '10', '10.5'],
]

_fake_condition_data = [
    ['state_fips', 'state_name', 'race', 'some_condition_total', 'population'],
    ['01', 'Alabama', 'Asian alone', 100, 1000],
    ['01', 'Alabama', 'Some other race alone', 200, 5000],
    ['02', 'Alaska', 'Two or more races', 10, 2000],
    ['02', 'Alaska', 'TOTAL', 100, 4000],
    ['04', 'Arizona', 'Two or more races', 20, 4000],
    ['04', 'Arizona', 'TOTAL', 10, 2000],
]

_fake_condition_data_with_per_100k = [
    ['state_fips', 'state_name', 'race', 'some_condition_total',
        'population', 'condition_per_100k'],
    ['01', 'Alabama', 'Asian alone', 100, 1000, 10000],
    ['01', 'Alabama', 'Some other race alone', 200, 5000, 4000],
    ['02', 'Alaska', 'Two or more races', 10, 2000, 500],
    ['02', 'Alaska', 'TOTAL', 100, 4000, 2500],
    ['04', 'Arizona', 'Two or more races', 20, 4000, 500],
    ['04', 'Arizona', 'TOTAL', 10, 2000, 500],
]

_fake_race_data_without_totals = [
    ['state_fips', 'state_name', 'race', 'population'],
    ['01', 'Alabama', 'Asian alone', '66'],
    ['01', 'Alabama', 'Some other race alone', '70'],
    ['01', 'Alabama', 'Two or more races', '92'],
    ['02', 'Alaska', 'Asian alone', '45'],
    ['02', 'Alaska', 'Some other race alone', '11'],
    ['02', 'Alaska', 'Two or more races', '60'],
    ['04', 'Arizona', 'Asian alone', '23'],
    ['04', 'Arizona', 'Some other race alone', '46'],
    ['04', 'Arizona', 'Two or more races', '26'],
]

_expected_race_data_with_totals = [
    ['state_fips', 'state_name', 'race', 'population'],
    ['01', 'Alabama', 'Asian alone', '66'],
    ['01', 'Alabama', 'Some other race alone', '70'],
    ['01', 'Alabama', 'Two or more races', '92'],
    ['02', 'Alaska', 'Asian alone', '45'],
    ['02', 'Alaska', 'Some other race alone', '11'],
    ['02', 'Alaska', 'Two or more races', '60'],
    ['04', 'Arizona', 'Asian alone', '23'],
    ['04', 'Arizona', 'Some other race alone', '46'],
    ['04', 'Arizona', 'Two or more races', '26'],
    ['01', 'Alabama', 'ALL', '228'],
    ['02', 'Alaska', 'ALL', '116'],
    ['04', 'Arizona', 'ALL', '95'],
]

_data_without_fips_codes = [
    ['state_name', 'state_postal', 'other_col'],
    ['United States', 'US', 'something_cool'],
    ['California', 'CA', 'something'],
    ['Georgia', 'GA', 'something_else'],
    ['U.S. Virgin Islands', 'VI', 'something_else_entirely'],
    ['Unknown', 'Unknown', 'who_am_i'],
]

_data_without_state_names = [
    ['state_postal_abbreviation', 'some_other_col'],
    ['US', 'something_american'],
    ['CA', 'something_cool'],
    ['GA', 'something_else'],
    ['VI', 'something_else_entirely'],
]

_fips_codes_from_bq = [
    ['state_fips_code', 'state_postal_abbreviation', 'state_name', 'state_gnisid'],
    ['06', 'CA', 'California', '01779778'],
    ['13', 'GA', 'Georgia', '01705317'],
    ['78', 'VI', 'U.S. Virgin Islands', 'NEED_THIS_CODE'],
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

_pop_data = [
    ['state_fips', 'race_category_id', 'population', 'population_pct'],
    ['01', 'BLACK_NH', 100, 25.0],
    ['01', 'WHITE_NH', 300, 75.0],
    ['02', 'BLACK_NH', 100, 50.0],
    ['100', 'BLACK_NH', 100, 50.0],
]

_pop_2010_data = [
    ['state_fips', 'race_category_id', 'population', 'population_pct'],
    ['78', 'BLACK_NH', 200, 40.0],
    ['78', 'WHITE_NH', 300, 60.0],
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

_pop_data_county = [
    ['state_fips', 'county_fips', 'race_category_id', 'population', 'population_pct'],
    ['01', '01000', 'BLACK_NH', 100, 25.0],
    ['01', '01000', 'WHITE_NH', 300, 75.0],
    ['01', '01234', 'BLACK_NH', 100, 50.0],
    ['100', '10101', 'BLACK_NH', 100, 50.0],
]

_expected_merged_with_pop_numbers_county = [
    ['state_fips', 'county_fips', 'race_category_id',
        'population', 'population_pct', 'other_col'],
    ['01', '01000', 'BLACK_NH', 100, 25.0, 'something_cool'],
    ['01', '01000', 'WHITE_NH', 300, 75.0, 'something_else_cool'],
    ['01', '01234', 'BLACK_NH', 100, 50.0, 'something_cooler'],
]

_expected_swapped_abbr_for_names = [
    ['state_name', 'some_other_col'],
    ['United States', 'something_american'],
    ['California', 'something_cool'],
    ['Georgia', 'something_else'],
    ['U.S. Virgin Islands', 'something_else_entirely'],
]


def _get_fips_codes_as_df(*args, **kwargs):
    return gcs_to_bq_util.values_json_to_df(
        json.dumps(_fips_codes_from_bq), dtype=str).reset_index(drop=True)


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


def testRatioRoundToNone():
    assert dataset_utils.ratio_round_to_None(1, 3) == 0.3
    assert dataset_utils.ratio_round_to_None(1, 11) is None


def testPercentAvoidRoundingToZero():
    assert dataset_utils.percent_avoid_rounding_to_zero(1, 3) == 33.3
    assert dataset_utils.percent_avoid_rounding_to_zero(1, 5000) == .02
    assert dataset_utils.percent_avoid_rounding_to_zero(1, 0) is None


def testAddSumOfRows():
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_race_data_without_totals)).reset_index(drop=True)

    df['population'] = df['population'].astype(int)
    df = dataset_utils.add_sum_of_rows(df, 'race', 'population', 'ALL')

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_race_data_with_totals)).reset_index(drop=True)

    expected_df['population'] = expected_df['population'].astype(int)

    assert_frame_equal(expected_df, df)


def testGeneratePctShareColWithoutUnknowns():
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_race_data)).reset_index(drop=True)

    df = df.loc[df['race'] != 'UNKNOWN']
    df['population'] = df['population'].astype(int)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_pct_share_data_without_unknowns)).reset_index(drop=True)

    expected_df['population'] = expected_df['population'].astype(int)

    expected_df['pct_share'] = expected_df['pct_share'].astype(float)

    df = dataset_utils.generate_pct_share_col_without_unknowns(
        df, {'population': 'pct_share'}, 'race', 'ALL')

    assert_frame_equal(expected_df, df)


def testGeneratePctShareColWithUnknowns():
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_race_data)).reset_index(drop=True)

    df['population'] = df['population'].astype(int)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_pct_share_data_with_unknowns)).reset_index(drop=True)

    expected_df['population'] = expected_df['population'].astype(int)

    expected_df['pct_share'] = expected_df['pct_share'].astype(float)

    df = dataset_utils.generate_pct_share_col_with_unknowns(
        df, {'population': 'pct_share'}, 'race', 'ALL', 'UNKNOWN')

    df = df.sort_values(by=['state_fips']).reset_index(drop=True)
    assert_frame_equal(expected_df, df)


def testGeneratePctShareColExtraTotalError():
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_race_data)).reset_index(drop=True)

    extra_row = pd.DataFrame([{
        'state_fips': '01',
        'state_name': 'Alabama',
        'race': 'ALL',
        'population': '66',
    }])

    df = pd.concat([df, extra_row])

    df = df.loc[df['race'] != 'UNKNOWN']
    df['population'] = df['population'].astype(int)

    expected_error = r"Fips 01 has 2 ALL rows, there should be 1"
    with pytest.raises(ValueError, match=expected_error):
        df = dataset_utils.generate_pct_share_col_without_unknowns(
            df, {'population': 'pct_share'}, 'race', 'ALL')


def testGeneratePer100kCol():
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_condition_data)).reset_index(drop=True)

    df = dataset_utils.generate_per_100k_col(
        df, 'some_condition_total', 'population', 'condition_per_100k')

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_condition_data_with_per_100k)).reset_index(drop=True)

    expected_df['condition_per_100k'] = df['condition_per_100k'].astype(float)

    assert_frame_equal(expected_df, df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=_get_fips_codes_as_df())
def testMergeFipsCodesStateName(mock_bq: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_without_fips_codes), dtype=str).reset_index(drop=True)

    df = df[['state_name', 'other_col']]

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_fips), dtype=str).reset_index(drop=True)

    df = dataset_utils.merge_fips_codes(df)

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

    df = dataset_utils.merge_fips_codes(df)

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

    df = dataset_utils.merge_pop_numbers(df, 'race', 'state')

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

    df = dataset_utils.merge_pop_numbers(df, 'race', 'county')

    assert mock_bq.call_count == 1

    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=_get_fips_codes_as_df)
def test_replace_state_abbr_with_names(mock_bq: mock.MagicMock):

    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_without_state_names), dtype=str).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_swapped_abbr_for_names), dtype=str).reset_index(drop=True)

    df = dataset_utils.replace_state_abbr_with_names(df)

    assert mock_bq.call_count == 1

    assert_frame_equal(df, expected_df, check_like=True)
