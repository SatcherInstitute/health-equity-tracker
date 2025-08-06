from unittest import mock
import os
from io import StringIO
import pandas as pd
from pandas._testing import assert_frame_equal
import json
import requests

from datasources.cawp import (
    CAWPData,
    US_CONGRESS_HISTORICAL_URL,
    US_CONGRESS_CURRENT_URL,
    get_consecutive_time_periods,
    extract_term_years,
    FIPS_TO_STATE_TABLE_MAP,
)


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


# INTEGRATION TEST SETUP

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp")
GOLDEN_DATA_DIR = os.path.join(TEST_DIR, "golden_data")


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
    # mocked and reduced files for testing

    [_folder, filename] = args

    print("MOCK READ FROM /data:", filename, kwargs)

    usecols = kwargs.get("usecols", None)

    if filename == "cawp-by_race_and_ethnicity_time_series.csv":
        # READ IN CAWP DB (numerators)
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
        # READ IN MANUAL TERRITORY STATELEG TOTAL TABLES
        if filename != "cawp_state_leg_60.csv":
            filename = "cawp_state_leg_ZZ_territory.csv"
        test_input_data_types = {"state_fips": str, "time_period": str}
        return pd.read_csv(
            os.path.join(TEST_DIR, "mock_territory_leg_tables", filename),
            dtype=test_input_data_types,
            index_col=False,
        )


def _load_csv_as_df_from_web(*args, **kwargs):
    # mocked and reduced files for testing
    url = args[0]
    dtype = kwargs.get("dtype", {})

    # reverse lookup the FIPS based on the incoming url string arg
    fips = next(fips for fips, state in FIPS_TO_STATE_TABLE_MAP.items() if state in url)

    # mock out a placeholder file for all FIPS not included in our test files
    if fips in FIPS_TO_TEST:
        print("\t\tread mock stleg table by fips:", fips)
    else:
        fips = "XX"

    return pd.read_csv(
        os.path.join(TEST_DIR, "mock_cawp_state_leg_tables", f"cawp_state_leg_{fips}.csv"),
        dtype=dtype,
    )


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch("ingestion.gcs_to_bq_util.fetch_json_from_web", side_effect=_fetch_json_from_web)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_web",
    side_effect=_load_csv_as_df_from_web,
)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
@mock.patch(
    "datasources.cawp.get_consecutive_time_periods",
    side_effect=_get_consecutive_time_periods,
)
@mock.patch("datasources.cawp.get_state_level_fips", return_value=FIPS_TO_TEST)
def testWriteToBq(
    mock_test_fips: mock.MagicMock,  # only use a restricted set of FIPS codes in test
    mock_test_time_periods: mock.MagicMock,  # only use a restricted number of years in test
    mock_data_dir: mock.MagicMock,  # reading either CAWP LINE ITEM CSV or MANUAL TERRITORY LEG.
    mock_csv_from_web: mock.MagicMock,  # reading STATE LEG TOTAL from CAWP site
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
    # SCAFFOLD STATELEG BY ALL + SCAFFOLD STATELEG BY RACE
    assert mock_test_time_periods.call_count == 6

    # CAWP LINE ITEM CSV + 6 TERRITORY LEG. TOTAL CSVS
    assert mock_data_dir.call_count == 7

    # STATE LEG TOTALS FOR 50 STATES
    assert mock_csv_from_web.call_count == 50

    # CURRENT + HISTORICAL CONGRESS TOTALS
    assert mock_json_from_web.call_count == 2

    # [ NATIONAL+STATE X CURRENT+HISTORICAL ] + STATE NAMES
    assert mock_bq.call_count == 5

    # NAMES TABLE OUTPUT (can't really test df content due to csv weirdness)
    (
        names_call,
        state_historical_call,
        state_current_call,
        national_historical_call,
        national_current_call,
    ) = mock_bq.call_args_list
    (_df_names, _dataset, table_name_names), _bq_types = names_call
    assert table_name_names == "race_and_ethnicity_state_historical_names"

    # STATE DATA HISTORICAL OUTPUT
    (
        df_state_historical,
        _dataset,
        table_name_state_historical,
    ), _bq_types = state_historical_call
    assert table_name_state_historical == "race_and_ethnicity_state_historical"

    expected_df_state_historical = pd.read_csv(
        os.path.join(GOLDEN_DATA_DIR, "race_and_ethnicity_state_historical.csv"),
        dtype={"state_fips": str, "time_period": str},
    )

    # df_state_historical.to_csv(table_name_state_historical, index=False)

    assert_frame_equal(
        df_state_historical,
        expected_df_state_historical,
        check_like=True,
    )

    # STATE DATA CURRENT OUTPUT
    (
        df_state_current,
        _dataset,
        table_name_state_current,
    ), _bq_types = state_current_call
    assert table_name_state_current == "race_and_ethnicity_state_current"

    expected_df_state_current = pd.read_csv(
        os.path.join(GOLDEN_DATA_DIR, "race_and_ethnicity_state_current.csv"),
        dtype={"state_fips": str, "time_period": str},
    )

    # df_state_current.to_csv(table_name_state_current, index=False)

    assert_frame_equal(
        df_state_current,
        expected_df_state_current,
        check_like=True,
    )

    # NATIONAL DATA HISTORICAL OUTPUT
    (
        df_national_historical,
        _dataset,
        table_name_national_historical,
    ), _bq_types = national_historical_call
    assert table_name_national_historical == "race_and_ethnicity_national_historical"

    expected_df_national_historical = pd.read_csv(
        os.path.join(GOLDEN_DATA_DIR, "race_and_ethnicity_national_historical.csv"),
        dtype={"state_fips": str, "time_period": str},
    )

    # df_national_historical.to_csv(table_name_national_historical, index=False)

    assert_frame_equal(
        df_national_historical,
        expected_df_national_historical,
        check_like=True,
    )

    # NATIONAL DATA CURRENT OUTPUT
    (
        df_national_current,
        _dataset,
        table_name_national_current,
    ), _bq_types = national_current_call

    assert table_name_national_current == "race_and_ethnicity_national_current"

    expected_df_national_current = pd.read_csv(
        os.path.join(GOLDEN_DATA_DIR, "race_and_ethnicity_national_current.csv"),
        dtype={"state_fips": str, "time_period": str},
    )

    # df_national_current.to_csv(table_name_national_current, index=False)

    assert_frame_equal(
        df_national_current,
        expected_df_national_current,
        check_like=True,
    )


def test_territorial_leg_counts_are_current():
    WIKI_API_URL = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "parse",
        "page": "List_of_United_States_state_legislatures",
        "format": "json",
        "prop": "text",
        "contentmodel": "wikitext",
    }
    response = requests.get(WIKI_API_URL, params=params)
    data = response.json()
    html_content = data["parse"]["text"]["*"]
    tables = pd.read_html(StringIO(html_content))
    terr_table = None

    for table in tables:
        lowercase_cols = [col.lower() for col in table.columns]
        if "total seats" in lowercase_cols and "u.s. territories" in lowercase_cols:
            terr_table = table
            break

    # Find the actual column name that matches "Total seats" case-insensitively
    total_seats_col = next(
        (col for col in terr_table.columns if col.lower() == "total seats"),
        None,
    )
    assert total_seats_col is not None, "Column with total seats not found"

    assert terr_table[total_seats_col].to_list() == [
        39,
        13,
        15,
        29,
        78,
        15,
    ], "Territorial counts need to be updated here and in the data/cawp/ files"
