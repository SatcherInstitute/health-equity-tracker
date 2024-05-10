# pylint: disable=no-member
# NOTE: pylint not treating output from read_json as a df, despite trying chunksize None

import json
from io import StringIO
from pandas.testing import assert_frame_equal
from ingestion import gcs_to_bq_util, merge_utils
import ingestion.standardized_columns as std_col
import numpy as np


_data_with_bad_county_names = [
    ['state_postal', 'county_fips', 'county_name'],
    ['CA', '06059', 'drop-me'],
    ['GA', '13133', 'also-drop-me'],
    ['VI', '78010', 'bad-county-equivalent-name'],
]

_data_with_good_county_names = [
    ['state_postal', 'county_fips', 'county_name'],
    ['CA', '06059', 'Orange County'],
    ['GA', '13133', 'Greene County'],
    ['VI', '78010', 'St. Croix'],
]

_expected_merged_fips_county = [
    ['state_name', 'state_fips', 'county_fips', 'county_name'],
    ['California', '06', '06059', 'Orange County'],
    ['Georgia', '13', '13133', 'Greene County'],
    ['U.S. Virgin Islands', '78', '78010', 'St. Croix'],
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

_data_with_only_fips_codes = [
    ['state_fips', 'other_col'],
    ['00', 'something_cool'],
    ['06', 'something'],
    ['13', 'something_else'],
    ['78', 'something_else_entirely'],
]

_expected_merged_names_from_fips = [
    ['state_name', 'other_col', 'state_fips'],
    ['United States', 'something_cool', '00'],
    ['California', 'something', '06'],
    ['Georgia', 'something_else', '13'],
    ['U.S. Virgin Islands', 'something_else_entirely', '78'],
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
    ['01', 'BLACK_NH', 1318388, 26.2, 'something_cool'],
    ['01', 'WHITE_NH', 3247262, 64.6, 'something_else_cool'],
    ['02', 'BLACK_NH', 22400, 3.0, 'something_cooler'],
    ['78', 'WHITE_NH', 11036, 12.7, 'something_else_entirely'],
    ['78', 'BLACK_NH', 55936, 64.2, 'something_else_entirely'],
]

_data_without_pop_numbers_county = [
    ['state_fips', 'county_fips', 'race_category_id', 'other_col'],
    ['01', '01001', 'BLACK_NH', 'something_cool'],
    ['01', '01003', 'WHITE_NH', 'something_else_cool'],
    ['01', '01005', 'BLACK_NH', 'something_cooler'],
    ['78', '78010', 'BLACK_NH', 'something_territory'],
]

_expected_merged_with_pop_numbers_county = [
    [
        'state_fips',
        'county_fips',
        'race_category_id',
        'population',
        'population_pct',
        'other_col',
    ],
    ['01', '01001', 'BLACK_NH', 11496, 19.6, 'something_cool'],
    ['01', '01003', 'WHITE_NH', 192161, 82.3, 'something_else_cool'],
    ['01', '01005', 'BLACK_NH', 11662, 46.9, 'something_cooler'],
    ['78', '78010', 'BLACK_NH', 24995, 61.0, 'something_territory'],
]
_data_time_series_without_pop_numbers = [
    ['time_period', 'state_fips', 'race_category_id', 'other_col'],
    ['2008', '01', 'BLACK_NH', 'something_cool'],
    ['2008', '01', 'WHITE_NH', 'something_else_cool'],
    ['2008', '02', 'BLACK_NH', 'something_cooler'],
    ['2008', '78', 'WHITE_NH', 'something_else_entirely'],
    ['2008', '78', 'BLACK_NH', 'something_else_entirely'],
    ["2010", '78', 'WHITE_NH', 'something_something'],
    ["2010", '78', 'BLACK_NH', 'something_something'],
    ['2019', '01', 'BLACK_NH', 'something_cool'],
    ['2019', '01', 'WHITE_NH', 'something_else_cool'],
    ['2019', '02', 'BLACK_NH', 'something_cooler'],
    ['2019', '78', 'WHITE_NH', 'something_else_entirely'],
    ['2019', '78', 'BLACK_NH', 'something_else_entirely'],
    ["2021", '01', 'BLACK_NH', 'something_cool'],
    ["2021", '01', 'WHITE_NH', 'something_else_cool'],
    ["2021", '02', 'BLACK_NH', 'something_cooler'],
    ["2021", '78', 'WHITE_NH', 'something_else_entirely'],
    ["2021", '78', 'BLACK_NH', 'something_else_entirely'],
    ['9999', '01', 'BLACK_NH', 'something_cool'],
    ['9999', '01', 'WHITE_NH', 'something_else_cool'],
    ['9999', '02', 'BLACK_NH', 'something_cooler'],
    ['9999', '78', 'WHITE_NH', 'something_else_entirely'],
    ['9999', '78', 'BLACK_NH', 'something_else_entirely'],
]

# 2008 should not get pop data because it's too early for the ACS range
# 2009-RECENT_YEAR should get pop data that matches year for year
# After RECENT_YEAR should get the same pop data as RECENT_YEAR
_expected_time_series_merged_with_pop_numbers = [
    [
        'time_period',
        'state_fips',
        'race_category_id',
        'population',
        'population_pct',
        'other_col',
    ],
    #  Pre-2009 rows should not get population data
    ['2008', '01', 'BLACK_NH', np.nan, np.nan, 'something_cool'],
    ['2008', '01', 'WHITE_NH', np.nan, np.nan, 'something_else_cool'],
    ['2008', '02', 'BLACK_NH', np.nan, np.nan, 'something_cooler'],
    ['2008', '78', 'WHITE_NH', np.nan, np.nan, 'something_else_entirely'],
    ['2008', '78', 'BLACK_NH', np.nan, np.nan, 'something_else_entirely'],
    # Territories / Years 2009-2015 should merge against 2010 Decennial (decia_2010)
    ["2010", '78', 'WHITE_NH', 14352, 13.5, 'something_something'],
    ["2010", '78', 'BLACK_NH', 70379, 66.1, 'something_something'],
    # States / Years within ACS range should merge directly onto ACS years
    ['2019', '01', 'BLACK_NH', 1291524, 26.5, 'something_cool'],
    ['2019', '01', 'WHITE_NH', 3194929, 65.5, 'something_else_cool'],
    ['2019', '02', 'BLACK_NH', 22857, 3.1, 'something_cooler'],
    # Territories / Years 2016-current should merge against 2020 Decennial (decia_2020)
    ['2019', '78', 'WHITE_NH', 11036, 12.7, 'something_else_entirely'],
    ['2019', '78', 'BLACK_NH', 55936, 64.2, 'something_else_entirely'],
    # States / Years within ACS range should merge directly onto ACS years
    ["2021", '01', 'BLACK_NH', 1316314, 26.3, 'something_cool'],
    ["2021", '01', 'WHITE_NH', 3241003, 64.9, 'something_else_cool'],
    ["2021", '02', 'BLACK_NH', 22787, 3.1, 'something_cooler'],
    # Territories / Years 2016-current should merge against 2020 Decennial (decia_2020)
    ["2021", '78', 'WHITE_NH', 11036, 12.7, 'something_else_entirely'],
    ["2021", '78', 'BLACK_NH', 55936, 64.2, 'something_else_entirely'],
    # Years AFTER ACS range should merge against the most recent ACS year
    ['9999', '01', 'BLACK_NH', 1318388, 26.2, 'something_cool'],
    ['9999', '01', 'WHITE_NH', 3247262, 64.6, 'something_else_cool'],
    ['9999', '02', 'BLACK_NH', 22400, 3.0, 'something_cooler'],
    ['9999', '78', 'WHITE_NH', 11036, 12.7, 'something_else_entirely'],
    ['9999', '78', 'BLACK_NH', 55936, 64.2, 'something_else_entirely'],
]

_data_without_pop_numbers_multiple_rows = [
    ['state_fips', 'race_category_id', 'cases', 'deaths'],
    ['01', 'BLACK_NH', 10, 1],
    ['01', 'WHITE_NH', 100, np.nan],
    ['02', 'BLACK_NH', 20, np.nan],
    ['78', 'WHITE_NH', 10, 2],
    ['78', 'BLACK_NH', 5, 0],
]

_expected_merge_with_pop_numbers_multiple_rows = [
    [
        'state_fips',
        'race_category_id',
        'cases',
        'deaths',
        'cases_population',
        'deaths_population',
    ],
    ['01', 'BLACK_NH', 10, 1, 1318388, 1318388],
    ['01', 'WHITE_NH', 100, np.nan, 3247262, 3247262],
    ['02', 'BLACK_NH', 20, np.nan, 22400, 22400],
    ['78', 'WHITE_NH', 10, 2, 11036, 11036],
    ['78', 'BLACK_NH', 5, 0, 55936, 55936],
]


def testStandardizeCountyNames():

    df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_data_with_bad_county_names)), dtype=str).reset_index(
        drop=True
    )

    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_data_with_good_county_names)), dtype=str
    ).reset_index(drop=True)

    df = merge_utils.merge_county_names(df)
    assert_frame_equal(df, expected_df, check_like=True, check_dtype=False)


def testMergeFipsCodesCounty():

    df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_data_with_good_county_names)), dtype=str).reset_index(
        drop=True
    )

    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_merged_fips_county)), dtype=str
    ).reset_index(drop=True)

    df = merge_utils.merge_state_ids(df)

    assert_frame_equal(df, expected_df, check_like=True, check_dtype=False)


def testMergeStateInfoByName():
    df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_data_without_fips_codes)), dtype=str).reset_index(
        drop=True
    )

    df = df[['state_name', 'other_col']]

    expected_df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_expected_merged_fips)), dtype=str).reset_index(
        drop=True
    )

    df = merge_utils.merge_state_ids(df)

    assert_frame_equal(df, expected_df, check_like=True, check_dtype=False)


def testMergeStateInfoByPostal():
    df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_data_without_fips_codes)), dtype=str).reset_index(
        drop=True
    )

    df = df[['state_postal', 'other_col']]

    expected_df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_expected_merged_fips)), dtype=str).reset_index(
        drop=True
    )

    df = merge_utils.merge_state_ids(df)

    assert_frame_equal(df, expected_df, check_like=True, check_dtype=False)


def testMergeStateInfoByFips():
    df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_data_with_only_fips_codes)), dtype=str).reset_index(
        drop=True
    )

    df = df[['state_fips', 'other_col']]

    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_merged_names_from_fips)), dtype=str
    ).reset_index(drop=True)

    df = merge_utils.merge_state_ids(df)

    assert_frame_equal(df, expected_df, check_like=True, check_dtype=False)


def testMergePopNumbersState():
    df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_data_without_pop_numbers)), dtype={std_col.STATE_FIPS_COL: str}
    ).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_merged_with_pop_numbers)),
        dtype={std_col.STATE_FIPS_COL: str},
    ).reset_index(drop=True)

    df = merge_utils.merge_pop_numbers(df, 'race', 'state')

    assert_frame_equal(df, expected_df, check_like=True, check_dtype=False)


def testMergePopNumbersCounty():
    df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_data_without_pop_numbers_county)),
        dtype={std_col.STATE_FIPS_COL: str, std_col.COUNTY_FIPS_COL: str},
    ).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_merged_with_pop_numbers_county)),
        dtype={std_col.STATE_FIPS_COL: str, std_col.COUNTY_FIPS_COL: str},
    ).reset_index(drop=True)

    df = merge_utils.merge_pop_numbers(df, 'race', 'county')

    assert_frame_equal(df, expected_df, check_like=True, check_dtype=False)


def testMergeYearlyPopNumbers():
    df_no_pop = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_data_time_series_without_pop_numbers)),
        dtype={std_col.STATE_FIPS_COL: str, std_col.TIME_PERIOD_COL: str},
    ).reset_index(drop=True)

    df = merge_utils.merge_yearly_pop_numbers(df_no_pop, 'race', 'state')

    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_time_series_merged_with_pop_numbers)),
        dtype={std_col.STATE_FIPS_COL: str, std_col.TIME_PERIOD_COL: str},
    ).reset_index(drop=True)

    assert_frame_equal(df, expected_df, check_like=True, check_dtype=False)


def testMergeMultiplePopCols():
    df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_data_without_pop_numbers_multiple_rows)),
        dtype={std_col.STATE_FIPS_COL: str},
    ).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_merge_with_pop_numbers_multiple_rows)),
        dtype={std_col.STATE_FIPS_COL: str},
    ).reset_index(drop=True)

    df = merge_utils.merge_multiple_pop_cols(df, 'race', ['cases_population', 'deaths_population'])

    assert_frame_equal(df, expected_df, check_like=True, check_dtype=False)
