import json

from pandas.testing import assert_frame_equal
from ingestion import gcs_to_bq_util, dataset_utils  # pylint: disable=no-name-in-module

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


def testAddSumOfRows():
    df = gcs_to_bq_util.values_json_to_dataframe(
        json.dumps(_fake_race_data_without_totals)).reset_index(drop=True)

    df['population'] = df['population'].astype(int)

    df = dataset_utils.add_sum_of_rows(df, 'race', 'population', 'TOTAL')

    expected_df = gcs_to_bq_util.values_json_to_dataframe(
        json.dumps(_expected_race_data_with_totals)).reset_index(drop=True)

    expected_df['population'] = expected_df['population'].astype(int)

    assert_frame_equal(expected_df, df)
