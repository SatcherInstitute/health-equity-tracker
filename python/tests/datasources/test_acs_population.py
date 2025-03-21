# pylint: disable=unused-argument
import os
import pandas as pd
from unittest import mock
from pandas._testing import assert_frame_equal

from datasources.acs_population import (  # type: ignore
    ACSPopulationIngester,
    GENERATE_NATIONAL_DATASET,
)
from ingestion import gcs_to_bq_util
from test_utils import get_acs_metadata_as_json

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "acs_population")
GOLDEN_DIR = os.path.join(THIS_DIR, os.pardir, "data", "acs_population", "golden_data")
MOCK_CACHE_DIR = os.path.join(THIS_DIR, os.pardir, "data", "acs_population", "mock_cache")

# single year golden data
GOLDEN_DATA_AGE_NATIONAL_2009 = os.path.join(GOLDEN_DIR, "age_national.csv")
GOLDEN_DATA_RACE = os.path.join(GOLDEN_DIR, "table_by_race_state.csv")
GOLDEN_DATA_SEX_AGE = os.path.join(GOLDEN_DIR, "table_by_sex_age.csv")
GOLDEN_DATA_SEX = os.path.join(GOLDEN_DIR, "table_by_sex.csv")
GOLDEN_DATA_SEX_NATIONAL = os.path.join(GOLDEN_DIR, "table_by_sex_national.csv")
GOLDEN_DATA_RACE_NATIONAL = os.path.join(GOLDEN_DIR, "table_by_race_national.csv")
GOLDEN_DATA_AGE_COUNTY = os.path.join(GOLDEN_DIR, "table_by_age_county.csv")


# time series golden data initial year OVERWRITES

GOLDEN_DATA_SEX_AGE_RACE_TIME_SERIES_OVERWRITES = os.path.join(
    GOLDEN_DIR, "time_series_overwrites", "table_by_sex_age_race_state_time_series.csv"
)

# time series golden data subsequent year APPENDS
GOLDEN_DATA_RACE_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, "time_series_appends", "table_by_race_state_time_series.csv"
)
GOLDEN_DATA_SEX_AGE_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, "time_series_appends", "table_by_sex_age_time_series.csv"
)

GOLDEN_DATA_SEX_TIME_SERIES_APPEND = os.path.join(GOLDEN_DIR, "time_series_appends", "table_by_sex_time_series.csv")
GOLDEN_DATA_SEX_NATIONAL_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, "time_series_appends", "table_by_sex_national_time_series.csv"
)
GOLDEN_DATA_RACE_NATIONAL_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, "time_series_appends", "table_by_race_national_time_series.csv"
)
GOLDEN_DATA_AGE_COUNTY_TIME_SERIES_APPEND = os.path.join(
    GOLDEN_DIR, "time_series_appends", "table_by_age_county_time_series.csv"
)


def _load_values_as_df(*args, **kwargs):
    """mock out the retrieval of cached ACS tables from our
    GCS landing bucket, and instead return the equivalent test csv"""
    _, filename = args
    dtype = {"county_fips": str} if "county" in filename else {"state_fips": str}
    print("mock GCS cache:", filename)
    df = gcs_to_bq_util.values_json_to_df(os.path.join(MOCK_CACHE_DIR, filename), dtype=dtype).reset_index(drop=True)
    return df


# We export this function for use in other packages so it needs its own tests
def testGenerateNationalDatasetRace():
    state_df = pd.read_csv(
        os.path.join(TEST_DIR, "national", "state_by_race.csv"),
        dtype={"state_fips": str},
    )
    expected_df = pd.read_csv(
        os.path.join(TEST_DIR, "national", "national_by_race.csv"),
        dtype={"state_fips": str},
    )
    states_to_include = {"01", "06"}

    national_df = GENERATE_NATIONAL_DATASET(state_df, states_to_include, "race")
    assert_frame_equal(national_df, expected_df, check_like=True)


def testGenerateNationalDatasetSex():
    state_df = pd.read_csv(
        os.path.join(TEST_DIR, "national", "state_by_sex.csv"),
        dtype={"state_fips": str},
    )
    expected_df = pd.read_csv(
        os.path.join(TEST_DIR, "national", "national_by_sex.csv"),
        dtype={"state_fips": str},
    )
    states_to_include = {"01", "06"}

    national_df = GENERATE_NATIONAL_DATASET(state_df, states_to_include, "sex")
    assert_frame_equal(national_df, expected_df, check_like=True)


def testGenerateNationalDatasetAge():
    state_df = pd.read_csv(
        os.path.join(TEST_DIR, "national", "state_by_age.csv"),
        dtype={"state_fips": str},
    )
    expected_df = pd.read_csv(
        os.path.join(TEST_DIR, "national", "national_by_age.csv"),
        dtype={"state_fips": str},
    )
    states_to_include = {"01", "06"}

    national_df = GENERATE_NATIONAL_DATASET(state_df, states_to_include, "age")
    assert_frame_equal(national_df, expected_df, check_like=True)


DTYPE = {
    "county_fips": str,
    "state_fips": str,
    "time_period": str,
}


@mock.patch("ingestion.census.fetch_acs_metadata", return_value=get_acs_metadata_as_json(2009))
@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_load_values_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testOverWriteToBqStateNationalCalls2009(
    mock_bq: mock.MagicMock, mock_cache: mock.MagicMock, mock_json: mock.MagicMock
):
    """Test the overall function structure for a state (and national) level ingester,
    based on the order and structure of the mocked calls to ACS, our cache of ACS, and our BQ
    """

    acsPopulationIngester = ACSPopulationIngester(False, "2009")

    acsPopulationIngester.write_to_bq("dataset", "gcs_bucket")

    # meta data
    assert mock_json.call_args_list[0][0][0] == "https://api.census.gov/data/2009/acs/acs5"

    # our GCS caching of ACS raw tables
    assert mock_cache.call_count == 11
    called_cached_gcs_names_in_order_ALL_CAPS = [call[0][1] for call in mock_cache.call_args_list]
    assert called_cached_gcs_names_in_order_ALL_CAPS == [
        "2009-HISPANIC_OR_LATINO_ORIGIN_BY_RACE_state.json",
        "2009-SEX_BY_AGE_state.json",
        "2009-SEX_BY_AGE_(WHITE_ALONE)_state.json",
        "2009-SEX_BY_AGE_(BLACK_OR_AFRICAN_AMERICAN_ALONE)_state.json",
        "2009-SEX_BY_AGE_(AMERICAN_INDIAN_AND_ALASKA_NATIVE_ALONE)_state.json",
        "2009-SEX_BY_AGE_(ASIAN_ALONE)_state.json",
        "2009-SEX_BY_AGE_(NATIVE_HAWAIIAN_AND_OTHER_PACIFIC_ISLANDER_ALONE)_state.json",
        "2009-SEX_BY_AGE_(SOME_OTHER_RACE_ALONE)_state.json",
        "2009-SEX_BY_AGE_(TWO_OR_MORE_RACES)_state.json",
        "2009-SEX_BY_AGE_(HISPANIC_OR_LATINO)_state.json",
        "2009-SEX_BY_AGE_(WHITE_ALONE,_NOT_HISPANIC_OR_LATINO)_state.json",
    ]

    table_names_for_bq = [call[0][2] for call in mock_bq.call_args_list]

    assert table_names_for_bq == [
        # 2021 should only write to the time_series tables
        "race_state_historical",
        "multi_sex_age_race_state_historical",
        "multi_sex_age_state_historical",
        "age_state_historical",
        "sex_state_historical",
        "age_national_historical",
        "race_national_historical",
        "sex_national_historical",
    ]

    df_age_national_2009_overwrite = mock_bq.call_args_list[5][0][0]
    expected_df_age_national_2009_overwrite = pd.read_csv(GOLDEN_DATA_AGE_NATIONAL_2009, dtype=DTYPE)

    assert_frame_equal(df_age_national_2009_overwrite, expected_df_age_national_2009_overwrite, check_like=True)


@mock.patch("ingestion.census.fetch_acs_metadata", return_value=get_acs_metadata_as_json(2022))
@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_load_values_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqCountyCallsAppend2022(mock_bq: mock.MagicMock, mock_cache: mock.MagicMock, mock_json: mock.MagicMock):
    """Test the overall function structure for a county level ingester,
    based on the order and structure of the mocked calls to ACS, our cache of ACS, and our BQ
    """

    # instantiate with only 2 years to test
    acsPopulationIngester = ACSPopulationIngester(True, "2022")

    acsPopulationIngester.write_to_bq("dataset", "gcs_bucket")

    # meta data
    assert mock_json.call_args_list[0][0][0] == "https://api.census.gov/data/2022/acs/acs5"

    # our GCS caching of ACS raw tables
    assert mock_cache.call_count == 11
    called_cached_gcs_names_in_order_title_cases = [call[0][1] for call in mock_cache.call_args_list]
    assert called_cached_gcs_names_in_order_title_cases == [
        "2022-Hispanic_or_Latino_Origin_by_Race_county.json",
        "2022-Sex_by_Age_county.json",
        "2022-Sex_by_Age_(White_Alone)_county.json",
        "2022-Sex_by_Age_(Black_or_African_American_Alone)_county.json",
        "2022-Sex_by_Age_(American_Indian_and_Alaska_Native_Alone)_county.json",
        "2022-Sex_by_Age_(Asian_Alone)_county.json",
        "2022-Sex_by_Age_(Native_Hawaiian_and_Other_Pacific_Islander_Alone)_county.json",
        "2022-Sex_by_Age_(Some_Other_Race_Alone)_county.json",
        "2022-Sex_by_Age_(Two_or_More_Races)_county.json",
        "2022-Sex_by_Age_(Hispanic_or_Latino)_county.json",
        "2022-Sex_by_Age_(White_Alone,_Not_Hispanic_or_Latino)_county.json",
    ]

    table_names_for_bq = [call[0][2] for call in mock_bq.call_args_list]

    assert table_names_for_bq == [
        # 2022 should write to both SINGLE YEAR and TIME SERIES tables
        "race_county_current",
        "race_county_historical",
        "multi_sex_age_race_county_current",
        "multi_sex_age_race_county_historical",
        "multi_sex_age_county_current",
        "multi_sex_age_county_historical",
        "age_county_current",
        "age_county_historical",
        "sex_county_current",
        "sex_county_historical",
    ]


@mock.patch("ingestion.census.fetch_acs_metadata", return_value=get_acs_metadata_as_json(2022))
@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_load_values_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqRaceAppend2022(mock_bq: mock.MagicMock, mock_cache: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(False, "2022")
    acsPopulationIngester.write_to_bq("dataset", "gcs_bucket")

    # 2022 should send a SINGLE YEAR table
    single_year_df = mock_bq.call_args_list[0][0][0]
    expected_single_year_df = pd.read_csv(GOLDEN_DATA_RACE, dtype=DTYPE)
    assert_frame_equal(single_year_df, expected_single_year_df, check_like=True)

    # 2022 should only APPEND to an existing time_series table
    assert mock_bq.call_args_list[1][1]["overwrite"] is False
    time_series_append_df = mock_bq.call_args_list[1][0][0]
    expected_time_series_append_df = pd.read_csv(GOLDEN_DATA_RACE_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(time_series_append_df, expected_time_series_append_df, check_like=True)


@mock.patch("ingestion.census.fetch_acs_metadata", return_value=get_acs_metadata_as_json(2009))
@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_load_values_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqSexAgeRaceOverwrite2009(
    mock_bq: mock.MagicMock, mock_cache: mock.MagicMock, mock_json: mock.MagicMock
):

    acsPopulationIngester = ACSPopulationIngester(False, "2009")
    acsPopulationIngester.write_to_bq("dataset", "gcs_bucket")

    # 2009 should NOT send a SINGLE YEAR table
    # 2009 should only OVERWRITE an existing time_series table (starting it fresh)
    assert mock_bq.call_args_list[1][1]["overwrite"] is True
    time_series_overwrite_df = mock_bq.call_args_list[1][0][0]
    expected_time_series_overwrite_df = pd.read_csv(GOLDEN_DATA_SEX_AGE_RACE_TIME_SERIES_OVERWRITES, dtype=DTYPE)
    assert_frame_equal(time_series_overwrite_df, expected_time_series_overwrite_df, check_like=True)


@mock.patch("ingestion.census.fetch_acs_metadata", return_value=get_acs_metadata_as_json(2022))
@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_load_values_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqSexAgeAppend2022(mock_bq: mock.MagicMock, mock_cache: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(False, "2022")

    acsPopulationIngester.write_to_bq("dataset", "gcs_bucket")

    # 2022 should send a SINGLE YEAR table
    single_year_df = mock_bq.call_args_list[4][0][0]
    expected_single_year_df = pd.read_csv(GOLDEN_DATA_SEX_AGE, dtype=DTYPE)

    assert_frame_equal(single_year_df, expected_single_year_df, check_like=True)

    # 2022 should only APPEND to an existing time_series table
    assert mock_bq.call_args_list[5][1]["overwrite"] is False
    time_series_append_df = mock_bq.call_args_list[5][0][0]
    expected_time_series_append_df = pd.read_csv(GOLDEN_DATA_SEX_AGE_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(time_series_append_df, expected_time_series_append_df, check_like=True)


@mock.patch("ingestion.census.fetch_acs_metadata", return_value=get_acs_metadata_as_json(2022))
@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_load_values_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqSex2022(mock_bq: mock.MagicMock, mock_cache: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(False, "2022")

    acsPopulationIngester.write_to_bq("dataset", "gcs_bucket")

    # 2022 should send a SINGLE YEAR table
    single_year_df = mock_bq.call_args_list[8][0][0]
    expected_single_year_df = pd.read_csv(GOLDEN_DATA_SEX, dtype=DTYPE)
    assert_frame_equal(single_year_df, expected_single_year_df, check_like=True)

    # 2022 should only APPEND to an existing time_series table
    assert mock_bq.call_args_list[9][1]["overwrite"] is False
    time_series_append_df = mock_bq.call_args_list[9][0][0]

    expected_time_series_append_df = pd.read_csv(GOLDEN_DATA_SEX_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(time_series_append_df, expected_time_series_append_df, check_like=True)


@mock.patch("ingestion.census.fetch_acs_metadata", return_value=get_acs_metadata_as_json(2022))
@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_load_values_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqRaceNational2022(mock_bq: mock.MagicMock, mock_cache: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(False, "2022")
    acsPopulationIngester.write_to_bq("dataset", "gcs_bucket")

    # 2022 should send a SINGLE YEAR table
    single_year_df = mock_bq.call_args_list[12][0][0]
    expected_single_year_df = pd.read_csv(GOLDEN_DATA_RACE_NATIONAL, dtype=DTYPE)
    assert_frame_equal(single_year_df, expected_single_year_df, check_like=True)

    # 2022 should only APPEND to an existing time_series table
    assert mock_bq.call_args_list[13][1]["overwrite"] is False
    time_series_append_df = mock_bq.call_args_list[13][0][0]

    expected_time_series_append_df = pd.read_csv(GOLDEN_DATA_RACE_NATIONAL_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(time_series_append_df, expected_time_series_append_df, check_like=True)


@mock.patch("ingestion.census.fetch_acs_metadata", return_value=get_acs_metadata_as_json(2022))
@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_load_values_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqSexNational2022(mock_bq: mock.MagicMock, mock_cache: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(False, "2022")
    acsPopulationIngester.write_to_bq("dataset", "gcs_bucket")

    # 2022 should send a SINGLE YEAR table
    single_year_df = mock_bq.call_args_list[14][0][0]
    expected_single_year_df = pd.read_csv(GOLDEN_DATA_SEX_NATIONAL, dtype=DTYPE)
    assert_frame_equal(single_year_df, expected_single_year_df, check_like=True)

    # 2022 should only APPEND to an existing time_series table
    assert mock_bq.call_args_list[15][1]["overwrite"] is False
    time_series_append_df = mock_bq.call_args_list[15][0][0]

    expected_time_series_append_df = pd.read_csv(GOLDEN_DATA_SEX_NATIONAL_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(time_series_append_df, expected_time_series_append_df, check_like=True)


# # Do one County level test to make sure our logic there is correct
@mock.patch("ingestion.census.fetch_acs_metadata", return_value=get_acs_metadata_as_json(2022))
@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_load_values_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqAgeCounty2022(mock_bq: mock.MagicMock, mock_cache: mock.MagicMock, mock_json: mock.MagicMock):

    acsPopulationIngester = ACSPopulationIngester(True, "2022")

    acsPopulationIngester.write_to_bq("dataset", "gcs_bucket")

    single_year_df = mock_bq.call_args_list[6][0][0]
    expected_single_year_df = pd.read_csv(GOLDEN_DATA_AGE_COUNTY, dtype=DTYPE)
    assert_frame_equal(single_year_df, expected_single_year_df, check_like=True)

    time_series_append_df = mock_bq.call_args_list[7][0][0]

    expected_time_series_append_df = pd.read_csv(GOLDEN_DATA_AGE_COUNTY_TIME_SERIES_APPEND, dtype=DTYPE)
    assert_frame_equal(time_series_append_df, expected_time_series_append_df, check_like=True)
    assert mock_bq.call_args_list[7][1]["overwrite"] is False
