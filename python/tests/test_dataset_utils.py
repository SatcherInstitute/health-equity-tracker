import json
import pandas as pd

from pandas.testing import assert_frame_equal
from ingestion import census, gcs_to_bq_util, dataset_utils

_fake_race_data = [
    ['state_fips', 'state_name', 'race', 'population'],
    ['01', 'Alabama', 'Asian alone', '66'],
    ['01', 'Alabama', 'Some other race alone', '70'],
    ['01', 'Alabama', 'Two or more races', '92'],
    ['01', 'Alabama', 'TOTAL', '228'],
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
    ['01', 'Alabama', 'Asian alone', '66', '28.9'],
    ['01', 'Alabama', 'Some other race alone', '70', '30.7'],
    ['01', 'Alabama', 'Two or more races', '92', '40.4'],
    ['01', 'Alabama', 'TOTAL', '228', '100'],
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


def testAddSumOfRows():
    df = gcs_to_bq_util.values_json_to_dataframe(
        json.dumps(_fake_race_data_without_totals)).reset_index(drop=True)

    df['population'] = df['population'].astype(int)

    df = dataset_utils.add_sum_of_rows(df, 'race', 'population', 'TOTAL')

    expected_df = gcs_to_bq_util.values_json_to_dataframe(
        json.dumps(_expected_race_data_with_totals)).reset_index(drop=True)

    expected_df['population'] = expected_df['population'].astype(int)

    assert_frame_equal(expected_df, df)


# def testGeneratePctShareCol():
#     df = gcs_to_bq_util.values_json_to_dataframe(
#         json.dumps(_fake_race_data)).reset_index(drop=True)

#     df['population'] = df['population'].astype(int)

#     expected_df = gcs_to_bq_util.values_json_to_dataframe(
#         json.dumps(_expected_pct_share_data)).reset_index(drop=True)

#     expected_df['population'] = expected_df['population'].astype(int)

#     df = dataset_utils.generate_pct_share_col(df, 'population', 'pct_share', 'race', 'state_fips')

#     assert_frame_equal(expected_df, df)
