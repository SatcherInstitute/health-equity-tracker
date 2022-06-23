import json
import pytest
import pandas as pd

from pandas.testing import assert_frame_equal
from ingestion import gcs_to_bq_util, dataset_utils

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

_fake_data_missing_zeros = [
    ['state_fips', 'state_name', 'race', 'population'],
    ['1', 'Alabama', 'Asian alone', '66'],
    ['1', 'Alabama', 'Some other race alone', '70'],
    ['1', 'Alabama', 'Two or more races', '92'],
    ['2', 'Alaska', 'Asian alone', '45'],
    ['2', 'Alaska', 'Some other race alone', '11'],
    ['2', 'Alaska', 'Two or more races', '60'],
    ['4', 'Arizona', 'Asian alone', '23'],
    ['4', 'Arizona', 'Some other race alone', '46'],
    ['4', 'Arizona', 'Two or more races', '26'],
]


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
    df['population'] = df['population'].astype(float)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_pct_share_data_without_unknowns)).reset_index(drop=True)

    expected_df['population'] = expected_df['population'].astype(float)

    expected_df['pct_share'] = expected_df['pct_share'].astype(float)

    df = dataset_utils.generate_pct_share_col_without_unknowns(
        df, {'population': 'pct_share'}, 'race', 'ALL')

    assert_frame_equal(expected_df, df)


def testGeneratePctShareColWithUnknowns():
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_race_data)).reset_index(drop=True)

    df['population'] = df['population'].astype(float)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_pct_share_data_with_unknowns)).reset_index(drop=True)

    expected_df['population'] = expected_df['population'].astype(float)

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
    df['population'] = df['population'].astype(float)

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


def test_ensure_leading_zeros():

    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_data_missing_zeros)).reset_index(drop=True)
    df = dataset_utils.ensure_leading_zeros(df, "state_fips", 2)

    assert_frame_equal(df, _fake_race_data_without_totals, check_like=True)
