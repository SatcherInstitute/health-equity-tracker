import os
from itertools import chain, repeat
import pytest
import pandas as pd
from unittest import mock
from pandas._testing import assert_frame_equal
from ingestion import gcs_to_bq_util
from datasources.acs_condition import (
    AcsCondition,
    ACS_ITEMS_2022_AND_LATER,
    HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE,
)

from test_utils import (
    get_acs_metadata_as_json,
)

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "acs_condition")

GOLDEN_BASE_TABLE_NATIONAL_SEX = os.path.join(TEST_DIR, "golden_data", "sex_national.csv")
GOLDEN_BASE_TABLE_STATE_SEX = os.path.join(TEST_DIR, "golden_data", "sex_state.csv")
GOLDEN_BASE_TABLE_COUNTY_SEX = os.path.join(TEST_DIR, "golden_data", "sex_county.csv")
GOLDEN_BASE_TABLE_COUNTY_RACE = os.path.join(TEST_DIR, "golden_data", "race_and_ethnicity_county.csv")

GOLDEN_2024_TABLE_NATIONAL_SEX = os.path.join(TEST_DIR, "golden_data", "sex_national_2024.csv")
GOLDEN_2024_TABLE_STATE_SEX = os.path.join(TEST_DIR, "golden_data", "sex_state_2024.csv")
GOLDEN_2024_TABLE_COUNTY_SEX = os.path.join(TEST_DIR, "golden_data", "sex_county_2024.csv")
GOLDEN_2024_TABLE_COUNTY_RACE = os.path.join(TEST_DIR, "golden_data", "race_and_ethnicity_county_2024.csv")
GOLDEN_2024_TABLE_COUNTY_AGE = os.path.join(TEST_DIR, "golden_data", "age_county_2024.csv")


# NOT USING SHARED POPULATION MOCKS BECAUSE THESE ARE THE CACHED ACS_CONDITION TABLES,
# NOT THE NORMAL FETCHED ACS_POPULATION CALLS
def _get_by_race_as_df(*args):
    _, filename = args
    return gcs_to_bq_util.values_json_to_df(
        os.path.join(TEST_DIR, filename), dtype={"state_fips": str, "county_fips": str}
    ).reset_index(drop=True)


acsCondition = AcsCondition()
acsCondition.year = "2022"

acsCondition2024 = AcsCondition()
acsCondition2024.year = "2024"


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testSexNationalBaseTable(mock_acs: mock.MagicMock):
    df = acsCondition.get_raw_data(
        "sex", "national", get_acs_metadata_as_json(2022), ACS_ITEMS_2022_AND_LATER, "some-bucket", "2022"
    )
    df = acsCondition.post_process(
        df,
        "sex",
        "national",
        ACS_ITEMS_2022_AND_LATER,
        HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE,
    )

    expected_df = pd.read_csv(GOLDEN_BASE_TABLE_NATIONAL_SEX, dtype={"state_fips": str})
    cols = list(expected_df.columns)

    assert mock_acs.call_count == 3

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testSexStateBaseTable(mock_acs: mock.MagicMock):
    df = acsCondition.get_raw_data(
        "sex", "state", get_acs_metadata_as_json(2022), ACS_ITEMS_2022_AND_LATER, "some-bucket", "2022"
    )
    df = acsCondition.post_process(
        df,
        "sex",
        "state",
        ACS_ITEMS_2022_AND_LATER,
        HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE,
    )

    expected_df = pd.read_csv(GOLDEN_BASE_TABLE_STATE_SEX, dtype={"state_fips": str})
    cols = list(expected_df.columns)

    assert mock_acs.call_count == 3

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testSexCountyBaseTable(mock_acs: mock.MagicMock):
    df = acsCondition.get_raw_data(
        "sex", "county", get_acs_metadata_as_json(2022), ACS_ITEMS_2022_AND_LATER, "some-bucket", "2022"
    )
    df = acsCondition.post_process(
        df,
        "sex",
        "county",
        ACS_ITEMS_2022_AND_LATER,
        HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE,
    )

    expected_df = pd.read_csv(GOLDEN_BASE_TABLE_COUNTY_SEX, dtype={"state_fips": str, "county_fips": str})
    cols = list(expected_df.columns)

    assert mock_acs.call_count == 3

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testRaceCountyBaseTable(mock_acs: mock.MagicMock):
    df = acsCondition.get_raw_data(
        "race", "county", get_acs_metadata_as_json(2022), ACS_ITEMS_2022_AND_LATER, "some-bucket", "2022"
    )
    df = acsCondition.post_process(
        df,
        "race",
        "county",
        ACS_ITEMS_2022_AND_LATER,
        HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE,
    )

    expected_df = pd.read_csv(GOLDEN_BASE_TABLE_COUNTY_RACE, dtype={"state_fips": str, "county_fips": str})
    cols = list(expected_df.columns)

    assert mock_acs.call_count == 24

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testAgeCountyBaseTable2024(mock_acs: mock.MagicMock):
    df = acsCondition2024.get_raw_data(
        "age", "county", get_acs_metadata_as_json(2024), ACS_ITEMS_2022_AND_LATER, "some-bucket", "2024"
    )
    df = acsCondition2024.post_process(
        df,
        "age",
        "county",
        ACS_ITEMS_2022_AND_LATER,
        HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE,
    )

    expected_df = pd.read_csv(GOLDEN_2024_TABLE_COUNTY_AGE, dtype={"state_fips": str, "county_fips": str})
    cols = list(expected_df.columns)

    assert mock_acs.call_count == 3

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.census.fetch_acs_metadata", return_value=get_acs_metadata_as_json(2012))
@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqOverwriteEarliestYear(
    mock_bq: mock.MagicMock,
    mock_acs: mock.MagicMock,
    mock_json: mock.MagicMock,
):
    acsCondition2012 = AcsCondition()
    acsCondition2012.write_to_bq("dataset", "gcs_bucket", year="2012")

    assert mock_acs.call_count == 90
    assert mock_json.call_count == 1

    for call in mock_bq.call_args_list:
        # This earliest year should OVERWRITE and create brand new BQ tables
        assert call[1]["overwrite"] is True
        # Column names should match between the shipped df and the BQ types object
        df_cols = sorted(call[0][0].columns)
        bq_types_cols = sorted(call[1]["column_types"].keys())
        assert df_cols == bq_types_cols


@mock.patch("ingestion.census.fetch_acs_metadata", return_value=get_acs_metadata_as_json(2022))
@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBqAppend2024(
    mock_bq: mock.MagicMock,
    mock_acs: mock.MagicMock,
    mock_json: mock.MagicMock,
):
    # NOTE: this only verifies year="2024" produces the correct request filenames/BQ
    # call shape; it does not assert on the actual 2024 values (that would require a
    # dedicated golden-output test, out of scope here). The 2024-*.json fixtures
    # themselves are real cached ACS responses as of #5140, not placeholder copies
    # of 2022.
    acsCondition2024 = AcsCondition()
    acsCondition2024.write_to_bq("dataset", "gcs_bucket", year="2024")

    # Non-earliest year like this should APPEND its TIME_SERIES yearly data onto the existing BQ tables
    # This most current year should also generate a CURRENT table with an undefined overwrite arg
    assert mock_bq.call_args_list[0][1]["overwrite"] is False
    assert "overwrite" not in mock_bq.call_args_list[1][1]
    assert mock_bq.call_args_list[2][1]["overwrite"] is False
    assert "overwrite" not in mock_bq.call_args_list[3][1]
    assert mock_bq.call_args_list[4][1]["overwrite"] is False
    assert "overwrite" not in mock_bq.call_args_list[5][1]
    assert mock_bq.call_args_list[6][1]["overwrite"] is False
    assert "overwrite" not in mock_bq.call_args_list[7][1]
    assert mock_bq.call_args_list[8][1]["overwrite"] is False
    assert "overwrite" not in mock_bq.call_args_list[9][1]
    assert mock_bq.call_args_list[10][1]["overwrite"] is False
    assert "overwrite" not in mock_bq.call_args_list[11][1]
    assert mock_bq.call_args_list[12][1]["overwrite"] is False
    assert "overwrite" not in mock_bq.call_args_list[13][1]
    assert mock_bq.call_args_list[14][1]["overwrite"] is False
    assert "overwrite" not in mock_bq.call_args_list[15][1]
    assert mock_bq.call_args_list[16][1]["overwrite"] is False
    assert "overwrite" not in mock_bq.call_args_list[17][1]

    assert mock_json.call_count == 1

    # One call per race per measure per geo, plus one sex-table call per measure for
    # each of the age and sex demos at every geo. National reads the STATE files, so
    # the first two geo blocks both request STATE, and only the third requests COUNTY.
    measures = ["HEALTH_INSURANCE", "POVERTY", "EMPLOYMENT"]
    races = ["AIAN", "ASIAN", "HISP", "BLACK", "NHPI", "WHITE", "OTHER_STANDARD", "MULTI"]

    def expected_calls_for_geo(file_geo):
        calls = []
        # race demo: every measure x every race
        for measure in measures:
            for race in races:
                calls.append(f"2024-{measure}_BY_RACE_{file_geo}_{race}.json")
        # age demo then sex demo: one sex-table call per measure each
        for _ in range(2):
            for measure in measures:
                calls.append(f"2024-{measure}_BY_SEX_{file_geo}.json")
        return calls

    expected_filenames = (
        expected_calls_for_geo("STATE")  # national (reads STATE files)
        + expected_calls_for_geo("STATE")  # state
        + expected_calls_for_geo("COUNTY")  # county
    )
    assert mock_acs.call_count == len(expected_filenames) == ((8 * 3) + 3 + 3) * 3
    actual_filenames = [call.args[1] for call in mock_acs.call_args_list]
    assert actual_filenames == expected_filenames

    # One call for each table write to BQ
    assert mock_bq.call_count == 18

    assert mock_bq.call_args_list[0].args[2] == "race_and_ethnicity_national_historical"
    assert mock_bq.call_args_list[1].args[2] == "race_and_ethnicity_national_current"

    assert mock_bq.call_args_list[2].args[2] == "age_national_historical"
    assert mock_bq.call_args_list[3].args[2] == "age_national_current"

    assert mock_bq.call_args_list[4].args[2] == "sex_national_historical"
    assert mock_bq.call_args_list[5].args[2] == "sex_national_current"

    assert mock_bq.call_args_list[6].args[2] == "race_and_ethnicity_state_historical"
    assert mock_bq.call_args_list[7].args[2] == "race_and_ethnicity_state_current"

    assert mock_bq.call_args_list[8].args[2] == "age_state_historical"
    assert mock_bq.call_args_list[9].args[2] == "age_state_current"

    assert mock_bq.call_args_list[10].args[2] == "sex_state_historical"
    assert mock_bq.call_args_list[11].args[2] == "sex_state_current"

    assert mock_bq.call_args_list[12].args[2] == "race_and_ethnicity_county_historical"
    assert mock_bq.call_args_list[13].args[2] == "race_and_ethnicity_county_current"

    assert mock_bq.call_args_list[14].args[2] == "age_county_historical"
    assert mock_bq.call_args_list[15].args[2] == "age_county_current"

    assert mock_bq.call_args_list[16].args[2] == "sex_county_historical"
    assert mock_bq.call_args_list[17].args[2] == "sex_county_current"


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testSexNationalBaseTable2024(mock_acs: mock.MagicMock):
    df = acsCondition2024.get_raw_data(
        "sex", "national", get_acs_metadata_as_json(2024), ACS_ITEMS_2022_AND_LATER, "some-bucket", "2024"
    )
    df = acsCondition2024.post_process(
        df,
        "sex",
        "national",
        ACS_ITEMS_2022_AND_LATER,
        HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE,
    )

    expected_df = pd.read_csv(GOLDEN_2024_TABLE_NATIONAL_SEX, dtype={"state_fips": str})
    cols = list(expected_df.columns)

    assert mock_acs.call_count == 3

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testSexStateBaseTable2024(mock_acs: mock.MagicMock):
    df = acsCondition2024.get_raw_data(
        "sex", "state", get_acs_metadata_as_json(2024), ACS_ITEMS_2022_AND_LATER, "some-bucket", "2024"
    )
    df = acsCondition2024.post_process(
        df,
        "sex",
        "state",
        ACS_ITEMS_2022_AND_LATER,
        HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE,
    )

    expected_df = pd.read_csv(GOLDEN_2024_TABLE_STATE_SEX, dtype={"state_fips": str})
    cols = list(expected_df.columns)

    assert mock_acs.call_count == 3

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testSexCountyBaseTable2024(mock_acs: mock.MagicMock):
    df = acsCondition2024.get_raw_data(
        "sex", "county", get_acs_metadata_as_json(2024), ACS_ITEMS_2022_AND_LATER, "some-bucket", "2024"
    )
    df = acsCondition2024.post_process(
        df,
        "sex",
        "county",
        ACS_ITEMS_2022_AND_LATER,
        HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE,
    )

    expected_df = pd.read_csv(GOLDEN_2024_TABLE_COUNTY_SEX, dtype={"state_fips": str, "county_fips": str})
    cols = list(expected_df.columns)

    assert mock_acs.call_count == 3

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testRaceCountyBaseTable2024(mock_acs: mock.MagicMock):
    df = acsCondition2024.get_raw_data(
        "race", "county", get_acs_metadata_as_json(2024), ACS_ITEMS_2022_AND_LATER, "some-bucket", "2024"
    )
    df = acsCondition2024.post_process(
        df,
        "race",
        "county",
        ACS_ITEMS_2022_AND_LATER,
        HEALTH_INSURANCE_RACE_TO_CONCEPT_TITLE,
    )

    expected_df = pd.read_csv(GOLDEN_2024_TABLE_COUNTY_RACE, dtype={"state_fips": str, "county_fips": str})
    cols = list(expected_df.columns)

    assert mock_acs.call_count == 24

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("datasources.acs_condition.url_file_to_gcs.url_file_to_gcs", autospec=True, return_value=None)
def testUploadToGcsRaisesOnShortfall(mock_upload: mock.MagicMock):
    """A failed GCS write (None return) must raise rather than silently succeed."""
    condition = AcsCondition()
    with pytest.raises(RuntimeError, match="ACS_CONDITION pre-cache wrote"):
        condition.upload_to_gcs("some-bucket", year="2024")
    assert mock_upload.call_count > 0


@mock.patch("datasources.acs_condition.url_file_to_gcs.url_file_to_gcs", autospec=True, return_value=False)
def testUploadToGcsSucceedsWhenAllFilesWritten(mock_upload: mock.MagicMock):
    """All writes succeeding (even with no diff) must not raise."""
    condition = AcsCondition()
    result = condition.upload_to_gcs("some-bucket", year="2024")
    assert result is False
    assert mock_upload.call_count > 0


@mock.patch("datasources.acs_condition.url_file_to_gcs.url_file_to_gcs", autospec=True)
def testUploadToGcsRaisesOnPartialShortfall(mock_upload: mock.MagicMock):
    """One None out of many calls must still raise — partial failure must not be silenced."""
    mock_upload.side_effect = chain([None], repeat(False))
    condition = AcsCondition()
    with pytest.raises(RuntimeError, match=r"pre-cache wrote \d+/\d+"):
        condition.upload_to_gcs("some-bucket", year="2024")
    assert mock_upload.call_count > 1
