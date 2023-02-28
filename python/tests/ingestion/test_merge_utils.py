from unittest import mock
import json
from pandas.testing import assert_frame_equal
from ingestion import gcs_to_bq_util, merge_utils
from ingestion.merge_utils import ACS_LATEST_YEAR
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

_pop_data_time_series = [
    ['time_period', 'state_fips', 'race_category_id', 'population', 'population_pct'],
    ['2019', '01', 'BLACK_NH', 200, 50.0],
    ['2019', '01', 'WHITE_NH', 200, 50.0],
    ['2019', '02', 'BLACK_NH', 200, 50.0],
    ['2019', '100', 'BLACK_NH', 200, 50.0],
    [ACS_LATEST_YEAR, '01', 'BLACK_NH', 100, 25.0],
    [ACS_LATEST_YEAR, '01', 'WHITE_NH', 300, 75.0],
    [ACS_LATEST_YEAR, '02', 'BLACK_NH', 100, 50.0],
    [ACS_LATEST_YEAR, '100', 'BLACK_NH', 100, 50.0],

]

_data_with_bad_county_names = [
    ['state_postal', 'county_fips', 'county_name'],
    ['CA', '06123', 'drop-me'],
    ['GA', '13345', 'also-drop-me'],
    ['VI', '78010', 'bad-county-equivalent-name'],
]

_data_with_good_county_names = [
    ['state_postal', 'county_fips', 'county_name'],
    ['CA', '06123', 'California County'],
    ['GA', '13345', 'Georgia County'],
    ['VI', '78010', 'St. Croix'],

]

_expected_merged_fips_county = [
    ['state_name', 'state_fips', 'county_fips', 'county_name'],
    ['California', '06', '06123', 'California County'],
    ['Georgia', '13', '13345', 'Georgia County'],
    ['U.S. Virgin Islands', '78', '78010', 'St. Croix']
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

_data_time_series_without_pop_numbers = [
    ['time_period', 'state_fips', 'race_category_id', 'other_col'],
    ['2008', '01', 'BLACK_NH', 'something_cool'],
    ['2008', '01', 'WHITE_NH', 'something_else_cool'],
    ['2008', '02', 'BLACK_NH', 'something_cooler'],
    ['2008', '78', 'WHITE_NH', 'something_else_entirely'],
    ['2008', '78', 'BLACK_NH', 'something_else_entirely'],
    ['2019', '01', 'BLACK_NH', 'something_cool'],
    ['2019', '01', 'WHITE_NH', 'something_else_cool'],
    ['2019', '02', 'BLACK_NH', 'something_cooler'],
    ['2019', '78', 'WHITE_NH', 'something_else_entirely'],
    ['2019', '78', 'BLACK_NH', 'something_else_entirely'],
    [ACS_LATEST_YEAR, '01', 'BLACK_NH', 'something_cool'],
    [ACS_LATEST_YEAR, '01', 'WHITE_NH', 'something_else_cool'],
    [ACS_LATEST_YEAR, '02', 'BLACK_NH', 'something_cooler'],
    [ACS_LATEST_YEAR, '78', 'WHITE_NH', 'something_else_entirely'],
    [ACS_LATEST_YEAR, '78', 'BLACK_NH', 'something_else_entirely'],
    ['9999', '01', 'BLACK_NH', 'something_cool'],
    ['9999', '01', 'WHITE_NH', 'something_else_cool'],
    ['9999', '02', 'BLACK_NH', 'something_cooler'],
    ['9999', '78', 'WHITE_NH', 'something_else_entirely'],
    ['9999', '78', 'BLACK_NH', 'something_else_entirely'],
]


# 2008 should not get pop data because it's too early for the ACS range
# 2009-ACS_LATEST_YEAR should get pop data that matches year for year
# After ACS_LATEST_YEAR should get the same pop data as ACS_LATEST_YEAR
_expected_time_series_merged_with_pop_numbers = [
    ['time_period', 'state_fips', 'race_category_id',
        'population', 'population_pct', 'other_col'],
    ['2008', '01', 'BLACK_NH', None, None, 'something_cool'],
    ['2008', '01', 'WHITE_NH', None, None, 'something_else_cool'],
    ['2008', '02', 'BLACK_NH', None, None, 'something_cooler'],
    ['2008', '78', 'WHITE_NH', None, None, 'something_else_entirely'],
    ['2008', '78', 'BLACK_NH', None, None, 'something_else_entirely'],
    ['2019', '01', 'BLACK_NH', 200, 50.0, 'something_cool'],
    ['2019', '01', 'WHITE_NH', 200, 50.0, 'something_else_cool'],
    ['2019', '02', 'BLACK_NH', 200, 50.0, 'something_cooler'],
    ['2019', '78', 'WHITE_NH', 300, 60.0, 'something_else_entirely'],
    ['2019', '78', 'BLACK_NH', 200, 40.0, 'something_else_entirely'],
    [ACS_LATEST_YEAR, '01', 'BLACK_NH', 100, 25.0, 'something_cool'],
    [ACS_LATEST_YEAR, '01', 'WHITE_NH',
        300, 75.0, 'something_else_cool'],
    [ACS_LATEST_YEAR, '02', 'BLACK_NH', 100, 50.0, 'something_cooler'],
    [ACS_LATEST_YEAR, '78', 'WHITE_NH',
        300, 60.0, 'something_else_entirely'],
    [ACS_LATEST_YEAR, '78', 'BLACK_NH',
        200, 40.0, 'something_else_entirely'],
    ['9999', '01', 'BLACK_NH', 100, 25.0, 'something_cool'],
    ['9999', '01', 'WHITE_NH', 300, 75.0, 'something_else_cool'],
    ['9999', '02', 'BLACK_NH', 100, 50.0, 'something_cooler'],
    ['9999', '78', 'WHITE_NH', 300, 60.0, 'something_else_entirely'],
    ['9999', '78', 'BLACK_NH', 200, 40.0, 'something_else_entirely']
]

_data_without_pop_numbers_multiple_rows = [
    ['state_fips', 'race_category_id', 'cases', 'deaths'],
    ['01', 'BLACK_NH', 10, 1],
    ['01', 'WHITE_NH', 100, None],
    ['02', 'BLACK_NH', 20, None],
    ['78', 'WHITE_NH', 10, 2],
    ['78', 'BLACK_NH', 5, 0],
]

_expected_merge_with_pop_numbers_multiple_rows = [
    ['state_fips', 'race_category_id', 'cases', 'deaths',
        'cases_population', 'deaths_population'],
    ['01', 'BLACK_NH', 10, 1, 100, 100],
    ['01', 'WHITE_NH', 100, None, 300, 300],
    ['02', 'BLACK_NH', 20, None, 100, 100],
    ['78', 'WHITE_NH', 10, 2, 300, 300],
    ['78', 'BLACK_NH', 5, 0, 200, 200],
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

    if args[1].endswith('time_series'):
        pop_dtype[std_col.TIME_PERIOD_COL] = str
        return gcs_to_bq_util.values_json_to_df(
            json.dumps(_pop_data_time_series), dtype=pop_dtype).reset_index(drop=True)

    if args[1].endswith("_territory"):
        return gcs_to_bq_util.values_json_to_df(
            json.dumps(_pop_2010_data), dtype=pop_dtype).reset_index(drop=True)

    if 'state' in args[1]:
        return gcs_to_bq_util.values_json_to_df(
            json.dumps(_pop_data), dtype=pop_dtype).reset_index(drop=True)

    if 'county' in args[1]:
        return gcs_to_bq_util.values_json_to_df(
            json.dumps(_pop_data_county), dtype=pop_dtype).reset_index(drop=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=_get_fips_codes_as_df())
def testStandardizeCountyNames(mock_public_dataset: mock.MagicMock):

    mock_public_dataset.side_effect = [
        _get_county_names_as_df(),
    ]

    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_with_bad_county_names), dtype=str).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_with_good_county_names), dtype=str).reset_index(drop=True)

    df = merge_utils.merge_county_names(df)

    assert mock_public_dataset.call_count == 1
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=_get_fips_codes_as_df())
def testMergeFipsCodesCounty(mock_public_dataset: mock.MagicMock):
    mock_public_dataset.side_effect = [
        _get_fips_codes_as_df(),
    ]
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_with_good_county_names), dtype=str).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_fips_county), dtype=str).reset_index(drop=True)

    df = merge_utils.merge_state_ids(df)

    assert mock_public_dataset.call_count == 1
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=_get_fips_codes_as_df())
def testMergeStateInfoByName(mock_public_dataset: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_without_fips_codes), dtype=str).reset_index(drop=True)

    df = df[['state_name', 'other_col']]

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_fips), dtype=str).reset_index(drop=True)

    df = merge_utils.merge_state_ids(df)

    assert mock_public_dataset.call_count == 1
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=_get_fips_codes_as_df())
def testMergeStateInfoByPostal(mock_public_dataset: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_without_fips_codes), dtype=str).reset_index(drop=True)

    df = df[['state_postal', 'other_col']]

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_fips), dtype=str).reset_index(drop=True)

    df = merge_utils.merge_state_ids(df)

    assert mock_public_dataset.call_count == 1
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            return_value=_get_fips_codes_as_df())
def testMergeStateInfoByFips(mock_public_dataset: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_with_only_fips_codes), dtype=str).reset_index(drop=True)

    df = df[['state_fips', 'other_col']]

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_names_from_fips), dtype=str).reset_index(drop=True)

    df = merge_utils.merge_state_ids(df)

    assert mock_public_dataset.call_count == 1
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=_get_pop_data_as_df)
def testMergePopNumbersState(mock_pop: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_without_pop_numbers),
        dtype={std_col.STATE_FIPS_COL: str}).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_with_pop_numbers),
        dtype={std_col.STATE_FIPS_COL: str}).reset_index(drop=True)

    df = merge_utils.merge_pop_numbers(df, 'race', 'state')

    assert mock_pop.call_count == 2

    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=_get_pop_data_as_df)
def testMergePopNumbersCounty(mock_pop: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_without_pop_numbers_county),
        dtype={std_col.STATE_FIPS_COL: str}).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merged_with_pop_numbers_county),
        dtype={std_col.STATE_FIPS_COL: str}).reset_index(drop=True)

    df = merge_utils.merge_pop_numbers(df, 'race', 'county')

    assert mock_pop.call_count == 1
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=_get_pop_data_as_df)
def testMergeYearlyPopNumbers(
    mock_pop: mock.MagicMock
):
    df_no_pop = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_time_series_without_pop_numbers),
        dtype={std_col.STATE_FIPS_COL: str, std_col.TIME_PERIOD_COL: str}).reset_index(drop=True)

    df = merge_utils.merge_yearly_pop_numbers(
        df_no_pop, 'race', 'state')

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_time_series_merged_with_pop_numbers),
        dtype={std_col.STATE_FIPS_COL: str, std_col.TIME_PERIOD_COL: str}).reset_index(drop=True)

    # state + territory for ACS-matching years,
    # and again for most recent source years merged onto most recent ACS years
    assert mock_pop.call_count == 4
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery',
            side_effect=_get_pop_data_as_df)
def testMergeMultiplePopCols(mock_pop: mock.MagicMock):
    df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_data_without_pop_numbers_multiple_rows),
        dtype={std_col.STATE_FIPS_COL: str}).reset_index(drop=True)

    expected_df = gcs_to_bq_util.values_json_to_df(
        json.dumps(_expected_merge_with_pop_numbers_multiple_rows),
        dtype={std_col.STATE_FIPS_COL: str}).reset_index(drop=True)

    df = merge_utils.merge_multiple_pop_cols(
        df, 'race', ['cases_population', 'deaths_population'])

    assert mock_pop.call_count == 2

    assert_frame_equal(df, expected_df, check_like=True)
