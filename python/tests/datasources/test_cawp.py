from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
import json

import ingestion.standardized_columns as std_col
from datasources.cawp import (
    CAWPData,
    US_CONGRESS_HISTORICAL_URL,
    US_CONGRESS_CURRENT_URL,
    get_consecutive_time_periods,
    extract_term_years,
    get_us_congress_members_df,
    DISTRICT,
    CONGRESSIONAL_DISTRICTS_COL,
    FIPS_TO_STATE_TABLE_MAP,  # used to count expected data-dir calls
)
from test_utils import load_golden_df

FIPS_TO_TEST = ["02", "60"]

# UNIT TESTS


def test_extract_term_years():

    entry_with_jan = {
        "type": "rep",
        "start": "2017-01-03",
        "end": "2019-01-03",
        "state": "MI",
        "district": 5,
        "party": "Democrat",
        "phone": "202-225-3611",
        "url": "https://dankildee.house.gov",
        "rss_url": "http://dankildee.house.gov/rss.xml",
        "address": "227 Cannon House Office Building; Washington DC 20515-2205",
        "office": "227 Cannon House Office Building",
        "fax": "202-225-6393",
    }

    term_years_excluding_jan = extract_term_years(entry_with_jan)
    assert term_years_excluding_jan == [2017, 2018]

    entry_special_election = {
        "type": "sen",
        "start": "2023-01-23",
        "end": "2024-11-05",
        "how": "appointment",
        "end-type": "special-election",
        "state": "NE",
        "class": 2,
        "state_rank": "junior",
        "party": "Republican",
        "url": "https://www.ricketts.senate.gov",
        "address": "139 Russell Senate Office Building Washington DC 20510",
        "office": "139 Russell Senate Office Building",
        "phone": "202-224-4224",
    }

    term_years_special_election = extract_term_years(entry_special_election)
    assert term_years_special_election == [2023, 2024]


def test_get_consecutive_time_periods():
    assert get_consecutive_time_periods(2020, 2022) == ["2020", "2021", "2022"]
    default_time_periods = get_consecutive_time_periods()
    assert default_time_periods[0] == "1915"
    assert default_time_periods[-1] == "2025"  # TODO: make dynamic; see GitHub #2897


def _load_test_legislators_json(url, *_args, **_kwargs):
    if url == US_CONGRESS_HISTORICAL_URL:
        filename = "test_legislators-historical.json"
    else:
        filename = "test_legislators-current.json"
    with open(os.path.join(TEST_DIR, filename)) as f:
        return json.load(f)


@mock.patch(
    "ingestion.gcs_to_bq_util.fetch_json_from_web",
    side_effect=_load_test_legislators_json,
)
def test_get_us_congress_members_df(mock_fetch):
    df = get_us_congress_members_df()

    assert DISTRICT in df.columns

    reps = df[df["type"] == "rep"]
    sens = df[df["type"] == "sen"]

    assert reps[DISTRICT].notna().all(), "all House reps should have a district number"
    assert sens[DISTRICT].isna().all(), "all senators should have district=None"

    assert mock_fetch.call_count == 2


# INTEGRATION TEST SETUP

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp")
GOLDEN_DIR = os.path.join(TEST_DIR, "golden_data")

FIPS_TIME_DTYPE = {"state_fips": str, "time_period": str}


def _get_consecutive_time_periods(*args, **kwargs):
    print("mocking with reduced years", args, kwargs)
    # NOTE: ensure this end date is updated to reflect current test data set's last year
    return get_consecutive_time_periods(first_year=2018, last_year=2024)


def _fetch_json_from_web(*args):
    [url] = args
    file_name = ""
    if url == US_CONGRESS_HISTORICAL_URL:
        file_name = "test_legislators-historical.json"
    elif url == US_CONGRESS_CURRENT_URL:
        file_name = "test_legislators-current.json"
    print(f"reading mock US CONGRESS: {file_name}")
    with open(os.path.join(TEST_DIR, file_name)) as file:
        return json.load(file)


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    [_folder, filename] = args

    print("MOCK READ FROM /data:", filename, kwargs)

    usecols = kwargs.get("usecols", None)

    if filename == "cawp-by_race_and_ethnicity_time_series.csv":
        test_input_data_types = {
            "id": str,
            "year": str,
            "first_name": str,
            "middle_name": str,
            "last_name": str,
            "party": str,
            "level": str,
            "position": str,
            "state": str,
            "district": str,
            "race_ethnicity": str,
        }
        return pd.read_csv(
            os.path.join(TEST_DIR, f"test_input_{filename}"),
            dtype=test_input_data_types,
            index_col=False,
            usecols=usecols,
        )
    else:
        # fips 02 and 60 have specific fixtures; everything else uses a generic stub
        if filename not in ("cawp_state_leg_02.csv", "cawp_state_leg_60.csv"):
            filename = "cawp_state_leg_ZZ_territory.csv"
        test_input_data_types = {"state_fips": str, "time_period": str}
        return pd.read_csv(
            os.path.join(TEST_DIR, "mock_territory_leg_tables", filename),
            dtype=test_input_data_types,
            index_col=False,
        )


def _load_county_crosswalk():
    from ingestion.constants import TERRITORY_FIPS_LIST  # pylint: disable=import-outside-toplevel

    df = (
        pd.read_csv(
            os.path.join(TEST_DIR, "mock_county_crosswalk.txt"),
            sep="|",
            dtype=str,
            encoding="utf-8-sig",
            usecols=["GEOID_CD118_20", "GEOID_COUNTY_20"],
        )
        .rename(columns={"GEOID_COUNTY_20": "county_fips"})
        .assign(
            state_fips=lambda df: df["GEOID_CD118_20"].str[:2],
            district_num=lambda df: df["GEOID_CD118_20"].str[2:],
        )
    )
    territory_mask = df["state_fips"].isin(TERRITORY_FIPS_LIST) & (df["district_num"] == "98")
    df.loc[territory_mask, "district_num"] = "00"
    df.loc[territory_mask, "GEOID_CD118_20"] = df.loc[territory_mask, "state_fips"] + "00"
    return df


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.fetch_json_from_web", side_effect=_fetch_json_from_web)
@mock.patch("ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir", side_effect=_load_csv_as_df_from_data_dir)
@mock.patch("datasources.cawp.get_consecutive_time_periods", side_effect=_get_consecutive_time_periods)
@mock.patch("datasources.cawp.get_state_level_fips", return_value=FIPS_TO_TEST)
@mock.patch("datasources.cawp.load_county_crosswalk", side_effect=_load_county_crosswalk)
def testWriteToBq(
    mock_county_crosswalk: mock.MagicMock,  # county crosswalk file from TEST_DIR
    mock_test_fips: mock.MagicMock,  # only use a restricted set of FIPS codes in test
    mock_test_time_periods: mock.MagicMock,  # only use a restricted number of years in test
    mock_data_dir: mock.MagicMock,  # CAWP line items CSV + all 50-state + 6-territory leg CSVs
    mock_json_from_web: mock.MagicMock,  # reading CONGRESS TOTALS from UNITEDSTATES.IO
    mock_bq: mock.MagicMock,  # writing HET tables to HET BQ
):
    """Test overall tables output from write_to_bq method.
    Since the code generates a base_df first and then creates other state/national/names
     tables from that base, it doesn't make sense to split across multiple dag steps"""
    print("testWriteToBq()")

    kwargs_for_bq = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
    }
    cawp_data = CAWPData()
    cawp_data.write_to_bq("dataset", "gcs_bucket", **kwargs_for_bq)

    # (CONGRESS + STATE LEG) * (BY RACES + BY ALL)
    assert mock_test_fips.call_count == 4

    # CONGRESS TOTALS + ADD AIANAPI +
    # SCAFFOLD CONGRESS BY ALL + SCAFFOLD CONGRESS BY RACE +
    # SCAFFOLD STATELEG BY ALL + SCAFFOLD STATELEG BY RACE +
    # COUNTY: get_us_congress_members_df + generate_county_breakdown acs_years
    assert mock_test_time_periods.call_count == 8

    # CAWP LINE ITEM CSV + 50 STATE LEG CSVS + 6 TERRITORY LEG CSVS +
    # COUNTY: CAWP LINE ITEM CSV in get_women_congress_by_county_df
    assert mock_data_dir.call_count == 1 + len(FIPS_TO_STATE_TABLE_MAP) + 6 + 1

    # STATE/NATIONAL: CURRENT + HISTORICAL +
    # COUNTY: get_us_congress_members_df (CURRENT + HISTORICAL)
    assert mock_json_from_web.call_count == 4

    # [ NATIONAL+STATE X CURRENT+HISTORICAL ] + STATE NAMES + [ COUNTY X CURRENT+HISTORICAL ]
    assert mock_bq.call_count == 7

    assert mock_county_crosswalk.call_count == 1

    (
        names_call,
        state_historical_call,
        state_current_call,
        national_historical_call,
        national_current_call,
        county_historical_call,
        county_current_call,
    ) = mock_bq.call_args_list

    # NAMES TABLE (can't really test df content due to csv weirdness)
    (_df_names, _dataset, table_name_names), _bq_types = names_call
    assert table_name_names == "race_and_ethnicity_state_historical_names"

    # STATE HISTORICAL
    (df_state_historical, _dataset, table_name), _bq_types = state_historical_call
    assert table_name == "race_and_ethnicity_state_historical"
    # df_state_historical.to_csv(os.path.join(GOLDEN_DIR, table_name + ".csv"), index=False)
    assert_frame_equal(df_state_historical, load_golden_df(GOLDEN_DIR, table_name, FIPS_TIME_DTYPE), check_like=True)

    # STATE CURRENT
    (df_state_current, _dataset, table_name), _bq_types = state_current_call
    assert table_name == "race_and_ethnicity_state_current"
    # df_state_current.to_csv(os.path.join(GOLDEN_DIR, table_name + ".csv"), index=False)
    assert_frame_equal(df_state_current, load_golden_df(GOLDEN_DIR, table_name, FIPS_TIME_DTYPE), check_like=True)

    # NATIONAL HISTORICAL
    (df_national_historical, _dataset, table_name), _bq_types = national_historical_call
    assert table_name == "race_and_ethnicity_national_historical"
    # df_national_historical.to_csv(os.path.join(GOLDEN_DIR, table_name + ".csv"), index=False)
    assert_frame_equal(df_national_historical, load_golden_df(GOLDEN_DIR, table_name, FIPS_TIME_DTYPE), check_like=True)

    # NATIONAL CURRENT
    (df_national_current, _dataset, table_name), _bq_types = national_current_call
    assert table_name == "race_and_ethnicity_national_current"
    # df_national_current.to_csv(os.path.join(GOLDEN_DIR, table_name + ".csv"), index=False)
    assert_frame_equal(df_national_current, load_golden_df(GOLDEN_DIR, table_name, FIPS_TIME_DTYPE), check_like=True)

    # COUNTY HISTORICAL
    (df_county_historical, _dataset, table_name), _bq_types = county_historical_call
    assert table_name == "race_and_ethnicity_county_historical"
    assert std_col.COUNTY_FIPS_COL in df_county_historical.columns
    assert CONGRESSIONAL_DISTRICTS_COL not in df_county_historical.columns
    # df_county_historical.to_csv(os.path.join(GOLDEN_DIR, table_name + ".csv"), index=False)
    assert_frame_equal(
        df_county_historical,
        load_golden_df(GOLDEN_DIR, table_name, {std_col.COUNTY_FIPS_COL: str, std_col.TIME_PERIOD_COL: str}),
        check_like=True,
    )

    # COUNTY CURRENT
    (df_county_current, _dataset, table_name), _bq_types = county_current_call
    assert table_name == "race_and_ethnicity_county_current"
    assert std_col.COUNTY_FIPS_COL in df_county_current.columns
    assert CONGRESSIONAL_DISTRICTS_COL in df_county_current.columns
    # df_county_current.to_csv(os.path.join(GOLDEN_DIR, table_name + ".csv"), index=False)
    assert_frame_equal(
        df_county_current,
        load_golden_df(GOLDEN_DIR, table_name, {std_col.COUNTY_FIPS_COL: str, std_col.TIME_PERIOD_COL: str}),
        check_like=True,
        check_exact=False,
    )
