from unittest import mock

import json
import pytest

import pandas as pd

from pandas.testing import assert_frame_equal
from ingestion import gcs_to_bq_util, dataset_utils  # pylint: disable=no-name-in-module

_fake_race_data = [
    ['state_fips', 'state_name', 'race', 'population'],
    ['01', 'Alabama', 'Asian alone', '660'],
    ['01', 'Alabama', 'Some other race alone', '700'],
    ['01', 'Alabama', 'Two or more races', '919'],
    ['01', 'Alabama', 'An underespresented race', '1'],
    ['01', 'Alabama', 'TOTAL', '2280'],
    ['02', 'Alaska', 'Asian alone', '45'],
    ['02', 'Alaska', 'Some other race alone', '11'],
    ['02', 'Alaska', 'Two or more races', '60'],
    ['02', 'Alaska', 'TOTAL', '116'],
    ['04', 'Arizona', 'Asian alone', '23'],
    ['04', 'Arizona', 'Some other race alone', '46'],
    ['04', 'Arizona', 'Two or more races', '26'],
    ['04', 'Arizona', 'TOTAL', '95'],
]

_expected_pct_share_data = [
    ['state_fips', 'state_name', 'race', 'population', 'pct_share'],
    ['01', 'Alabama', 'Asian alone', '660', '28.9'],
    ['01', 'Alabama', 'Some other race alone', '700', '30.7'],
    ['01', 'Alabama', 'Two or more races', '919', '40.3'],
    ['01', 'Alabama', 'An underespresented race', '1', '.04'],
    ['01', 'Alabama', 'TOTAL', '2280', '100'],
    ['02', 'Alaska', 'Asian alone', '45', '38.8'],
    ['02', 'Alaska', 'Some other race alone', '11', '9.5'],
    ['02', 'Alaska', 'Two or more races', '60', '51.7'],
    ['02', 'Alaska', 'TOTAL', '116', '100'],
    ['04', 'Arizona', 'Asian alone', '23', '24.2'],
    ['04', 'Arizona', 'Some other race alone', '46', '48.4'],
    ['04', 'Arizona', 'Two or more races', '26', '27.4'],
    ['04', 'Arizona', 'TOTAL', '95', '100'],
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
    ['01', 'Alabama', 'TOTAL', '228'],
    ['02', 'Alaska', 'TOTAL', '116'],
    ['04', 'Arizona', 'TOTAL', '95'],
]


_data_without_fips_codes = [
    ['state_name', 'other_col'],
    ['California', 'something'],
    ['Georgia', 'something_else'],
]


_fips_codes_from_bq = [
    ['state_fips_code', 'state_postal_abbreviation', 'state_name', 'state_gnisid'],
    ['06', 'CA', 'California', '01779778'],
    ['13', 'GA', 'Georgia', '01705317'],
]


_expected_merged_fips = [
    ['state_name', 'other_col', 'state_fips'],
    ['California', 'something', '06'],
    ['Georgia', 'something_else', '13'],
]


def _get_fips_codes_as_df():
    return gcs_to_bq_util.values_json_to_dataframe(
        json.dumps(_fips_codes_from_bq), dtype=str).reset_index(drop=True)


def testRatioRoundToNone():
    assert dataset_utils.ratio_round_to_None(1, 3) == 0.3
    assert dataset_utils.ratio_round_to_None(1, 11) is None


def testPercentAvoidRoundingToZero():
    assert dataset_utils.percent_avoid_rounding_to_zero(1, 3) == 33.3
    assert dataset_utils.percent_avoid_rounding_to_zero(1, 5000) == .02


def testAddSumOfRows():
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_race_data_without_totals)).reset_index(drop=True)

    df['population'] = df['population'].astype(int)

    df = dataset_utils.add_sum_of_rows(df, 'race', 'population', 'TOTAL')

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_race_data_with_totals)).reset_index(drop=True)

    expected_df['population'] = expected_df['population'].astype(int)

    assert_frame_equal(expected_df, df)


def testGeneratePctShareCol():
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_race_data)).reset_index(drop=True)

    df['population'] = df['population'].astype(int)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_pct_share_data)).reset_index(drop=True)

    expected_df['population'] = expected_df['population'].astype(int)
    expected_df['pct_share'] = expected_df['pct_share'].astype(float)

    df = dataset_utils.generate_pct_share_col(
        df, 'population', 'pct_share', 'race', 'TOTAL')

    assert_frame_equal(expected_df, df)


def testGeneratePctShareColNoTotalError():
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_race_data)).reset_index(drop=True)

    df = df.loc[df['race'] != 'TOTAL']

    df['population'] = df['population'].astype(int)

    expected_error = r"There is no TOTAL value for this chunk of data"
    with pytest.raises(ValueError, match=expected_error):
        df = dataset_utils.generate_pct_share_col(
            df, 'population', 'pct_share', 'race', 'TOTAL')


def testGeneratePctShareColExtraTotalError():
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_fake_race_data)).reset_index(drop=True)

    extra_row = pd.DataFrame([{
        'state_fips': '01',
        'state_name': 'Alabama',
        'race': 'TOTAL',
        'population': '66',
    }])

    df = pd.concat([df, extra_row])

    df['population'] = df['population'].astype(int)

    expected_error = r"There are multiple TOTAL values for this chunk of data, there should only be one"
    with pytest.raises(ValueError, match=expected_error):
        df = dataset_utils.generate_pct_share_col(
            df, 'population', 'pct_share', 'race', 'TOTAL')


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=_get_fips_codes_as_df())
def testMergeFipsCodes(mock_bq: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_dataframe(
        json.dumps(_data_without_fips_codes), dtype=str).reset_index(drop=True)
    expected_df = gcs_to_bq_util.values_json_to_dataframe(
        json.dumps(_expected_merged_fips), dtype=str).reset_index(drop=True)

    df = dataset_utils.merge_fips_codes(df)

    assert mock_bq.call_count == 1
    assert_frame_equal(df, expected_df, check_like=True)
