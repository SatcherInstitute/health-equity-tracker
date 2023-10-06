from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
import json
from test_utils import (
    _load_public_dataset_from_bigquery_as_df,
    _load_df_from_bigquery,
)

from datasources.cawp_time import (
    CAWPTimeData,
    US_CONGRESS_HISTORICAL_URL,
    US_CONGRESS_CURRENT_URL,
    get_postal_from_cawp_phrase,
    get_consecutive_time_periods,
    FIPS_TO_STATE_TABLE_MAP,
)

FIPS_TO_TEST = ["02", "60"]

# UNIT TESTS


def testPostalFromCAWPPhrase():
    assert get_postal_from_cawp_phrase("American Samoa - AS") == "AS"
    assert get_postal_from_cawp_phrase("American Samoa - AM") == "AS"
    assert get_postal_from_cawp_phrase("Anything At All - XX") == "XX"


def test_get_consecutive_time_periods():
    assert get_consecutive_time_periods(2020, 2022) == ["2020", "2021", "2022"]
    default_time_periods = get_consecutive_time_periods()
    assert default_time_periods[0] == "1915"
    assert default_time_periods[-1] == "2023"


# INTEGRATION TEST SETUP

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cawp_time")
GOLDEN_DATA_DIR = os.path.join(TEST_DIR, "golden_data")


def _get_consecutive_time_periods(*args, **kwargs):
    print("mocking with reduced years")
    if len(kwargs) == 1:
        return get_consecutive_time_periods(first_year=2018)
    return get_consecutive_time_periods(first_year=2018, last_year=2022)


def _fetch_json_from_web(*args):
    [url] = args
    if url == US_CONGRESS_HISTORICAL_URL:
        file_name = "test_legislators-historical.json"
    elif url == US_CONGRESS_CURRENT_URL:
        file_name = "test_legislators-current.json"
    print(f'reading mock US CONGRESS: {file_name}')
    with open(os.path.join(TEST_DIR, file_name)) as file:
        return json.load(file)


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    # mocked and reduced files for testing

    [_folder, filename] = args

    print("MOCK READ FROM /data:", filename)

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
            os.path.join(TEST_DIR, f'test_input_{filename}'),
            dtype=test_input_data_types,
            index_col=False,
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
    fips = [i for i in FIPS_TO_STATE_TABLE_MAP if FIPS_TO_STATE_TABLE_MAP[i] in url][0]

    # mock out a placeholder file for all FIPS not included in our test files
    if fips in FIPS_TO_TEST:
        print("\t\tread mock stleg table by fips:", fips)
    else:
        fips = "XX"

    return pd.read_csv(
        os.path.join(
            TEST_DIR, "mock_cawp_state_leg_tables", f'cawp_state_leg_{fips}.csv'
        ),
        dtype=dtype,
    )


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.fetch_json_from_web', side_effect=_fetch_json_from_web
)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
    side_effect=_load_csv_as_df_from_web,
)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_data_dir,
)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df",
    side_effect=_load_public_dataset_from_bigquery_as_df,
)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery
)
@mock.patch(
    'datasources.cawp_time.get_consecutive_time_periods',
    side_effect=_get_consecutive_time_periods,
)
@mock.patch('datasources.cawp_time.get_state_level_fips', return_value=FIPS_TO_TEST)
def testWriteToBq(
    mock_test_fips: mock.MagicMock,  # only use a restricted set of FIPS codes in test
    mock_test_time_periods: mock.MagicMock,  # only use a restricted number of years in test
    mock_df_from_bq: mock.MagicMock,  # shared util mock for any read from HET generated BQ tables like acs_population
    mock_public_bq: mock.MagicMock,  # shared mock mock for any read from public BQ tables like FIPS CODES
    mock_data_dir: mock.MagicMock,  # reading either CAWP LINE ITEM CSV or MANUAL TERRITORY LEG. TOTAL CSV
    mock_csv_from_web: mock.MagicMock,  # reading STATE LEG TOTAL from CAWP site
    mock_json_from_web: mock.MagicMock,  # reading CONGRESS TOTALS from UNITEDSTATES.IO
    mock_bq: mock.MagicMock,  # writing HET tables to HET BQ
):
    """Test overall tables output from write_to_bq method.
    Since the code generates a base_df first and then creates other state/national/names
     tables from that base, it doesn't make sense to split across multiple dag steps"""
    print("testWriteToBq()")

    kwargs_for_bq = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
    }
    cawp_data = CAWPTimeData()
    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs_for_bq)

    # (CONGRESS + STATE LEG) * (BY RACES + BY ALL)
    assert mock_test_fips.call_count == 4

    # CONGRESS TOTALS + ADD AIANAPI +
    # SCAFFOLD CONGRESS BY ALL + SCAFFOLD CONGRESS BY RACE +
    # SCAFFOLD STATELEG BY ALL + SCAFFOLD STATELEG BY RACE
    assert mock_test_time_periods.call_count == 6

    # TODO: REFACTOR - THIS IS CALLING THE SAME HET TABLES MULTIPLE TIMES
    assert mock_df_from_bq.call_count == 8

    # TODO: REFACTOR - THIS IS CALLING THE PUBLIC FIPS TABLE 5 TIMES
    assert mock_public_bq.call_count == 5

    # CAWP LINE ITEM CSV + 6 TERRITORY LEG. TOTAL CSVS
    assert mock_data_dir.call_count == 7

    # STATE LEG TOTALS FOR 50 STATES
    assert mock_csv_from_web.call_count == 50

    # CURRENT + HISTORICAL CONGRESS TOTALS
    assert mock_json_from_web.call_count == 2

    # NATIONAL / STATE / STATE NAMES
    assert mock_bq.call_count == 3

    # NAMES TABLE OUTPUT (can't really test df content due to csv weirdness)
    names_call, state_call, national_call = mock_bq.call_args_list
    (df_names, _dataset, table_name_names), _bq_types = names_call
    assert table_name_names == "race_and_ethnicity_state_time_series_names"

    # STATE DATA OUTPUT
    (df_state, _dataset, table_name_state), _bq_types = state_call
    assert table_name_state == "race_and_ethnicity_state_time_series"
    expected_df_state = pd.read_csv(
        os.path.join(GOLDEN_DATA_DIR, "race_and_ethnicity_state_time_series.csv"),
        dtype={"state_fips": str, "time_period": str},
    )
    assert_frame_equal(
        df_state,
        expected_df_state,
        check_like=True,
    )

    # NATIONAL DATA OUTPUT
    (df_national, _dataset, table_name_national), _bq_types = national_call
    assert table_name_national == "race_and_ethnicity_national_time_series"
    expected_df_national = pd.read_csv(
        os.path.join(GOLDEN_DATA_DIR, "race_and_ethnicity_national_time_series.csv"),
        dtype={"state_fips": str, "time_period": str},
    )
    assert_frame_equal(
        df_national,
        expected_df_national,
        check_like=True,
    )
