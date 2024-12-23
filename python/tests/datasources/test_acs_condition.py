import os
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
GOLDEN_BASE_TABLE_COUNTY_RACE = os.path.join(TEST_DIR, "golden_data", "race_county.csv")


# NOT USING SHARED POPULATION MOCKS BECAUSE THESE ARE THE CACHED ACS_CONDITION TABLES,
# NOT THE NORMAL FETCHED ACS_POPULATION CALLS
def _get_by_race_as_df(*args):
    _, filename = args
    return gcs_to_bq_util.values_json_to_df(
        os.path.join(TEST_DIR, filename), dtype={"state_fips": str, "county_fips": str}
    ).reset_index(drop=True)


acsCondition = AcsCondition()
acsCondition.year = "2022"


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testSexNationalBaseTable(mock_acs: mock.MagicMock):
    df = acsCondition.get_raw_data(
        "sex", "national", get_acs_metadata_as_json(2022), ACS_ITEMS_2022_AND_LATER, "some-bucket"
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

    assert mock_acs.call_count == 2

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testSexStateBaseTable(mock_acs: mock.MagicMock):
    df = acsCondition.get_raw_data(
        "sex", "state", get_acs_metadata_as_json(2022), ACS_ITEMS_2022_AND_LATER, "some-bucket"
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

    assert mock_acs.call_count == 2

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testSexCountyBaseTable(mock_acs: mock.MagicMock):
    df = acsCondition.get_raw_data(
        "sex", "county", get_acs_metadata_as_json(2022), ACS_ITEMS_2022_AND_LATER, "some-bucket"
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

    assert mock_acs.call_count == 2

    assert_frame_equal(
        df.sort_values(cols).reset_index(drop=True),
        expected_df.sort_values(cols).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.load_values_as_df", side_effect=_get_by_race_as_df)
def testRaceCountyBaseTable(mock_acs: mock.MagicMock):
    df = acsCondition.get_raw_data(
        "race", "county", get_acs_metadata_as_json(2022), ACS_ITEMS_2022_AND_LATER, "some-bucket"
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

    assert mock_acs.call_count == 16

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

    assert mock_acs.call_count == 60
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
def testWriteToBqAppend2022(
    mock_bq: mock.MagicMock,
    mock_acs: mock.MagicMock,
    mock_json: mock.MagicMock,
):
    acsCondition2022 = AcsCondition()
    acsCondition2022.write_to_bq("dataset", "gcs_bucket", year="2022")

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

    # One call per race per geo, and then one call for sex at each geo
    # and one for age at each geo
    assert mock_acs.call_count == ((8 * 3) + 3 + 3) * 2
    assert mock_acs.call_args_list[0].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_AIAN.json"
    assert mock_acs.call_args_list[1].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_ASIAN.json"
    assert mock_acs.call_args_list[2].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_HISP.json"
    assert mock_acs.call_args_list[3].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_BLACK.json"
    assert mock_acs.call_args_list[4].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_NHPI.json"
    assert mock_acs.call_args_list[5].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_WHITE.json"
    assert mock_acs.call_args_list[6].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_OTHER_STANDARD.json"
    assert mock_acs.call_args_list[7].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_MULTI.json"

    assert mock_acs.call_args_list[8].args[1] == "2022-POVERTY_BY_RACE_STATE_AIAN.json"
    assert mock_acs.call_args_list[9].args[1] == "2022-POVERTY_BY_RACE_STATE_ASIAN.json"
    assert mock_acs.call_args_list[10].args[1] == "2022-POVERTY_BY_RACE_STATE_HISP.json"
    assert mock_acs.call_args_list[11].args[1] == "2022-POVERTY_BY_RACE_STATE_BLACK.json"
    assert mock_acs.call_args_list[12].args[1] == "2022-POVERTY_BY_RACE_STATE_NHPI.json"
    assert mock_acs.call_args_list[13].args[1] == "2022-POVERTY_BY_RACE_STATE_WHITE.json"
    assert mock_acs.call_args_list[14].args[1] == "2022-POVERTY_BY_RACE_STATE_OTHER_STANDARD.json"
    assert mock_acs.call_args_list[15].args[1] == "2022-POVERTY_BY_RACE_STATE_MULTI.json"

    assert mock_acs.call_args_list[16].args[1] == "2022-HEALTH_INSURANCE_BY_SEX_STATE.json"
    assert mock_acs.call_args_list[17].args[1] == "2022-POVERTY_BY_SEX_STATE.json"
    assert mock_acs.call_args_list[18].args[1] == "2022-HEALTH_INSURANCE_BY_SEX_STATE.json"
    assert mock_acs.call_args_list[19].args[1] == "2022-POVERTY_BY_SEX_STATE.json"

    assert mock_acs.call_args_list[20].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_AIAN.json"
    assert mock_acs.call_args_list[21].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_ASIAN.json"
    assert mock_acs.call_args_list[22].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_HISP.json"
    assert mock_acs.call_args_list[23].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_BLACK.json"
    assert mock_acs.call_args_list[24].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_NHPI.json"
    assert mock_acs.call_args_list[25].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_WHITE.json"
    assert mock_acs.call_args_list[26].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_OTHER_STANDARD.json"
    assert mock_acs.call_args_list[27].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_STATE_MULTI.json"

    assert mock_acs.call_args_list[28].args[1] == "2022-POVERTY_BY_RACE_STATE_AIAN.json"
    assert mock_acs.call_args_list[29].args[1] == "2022-POVERTY_BY_RACE_STATE_ASIAN.json"
    assert mock_acs.call_args_list[30].args[1] == "2022-POVERTY_BY_RACE_STATE_HISP.json"
    assert mock_acs.call_args_list[31].args[1] == "2022-POVERTY_BY_RACE_STATE_BLACK.json"
    assert mock_acs.call_args_list[32].args[1] == "2022-POVERTY_BY_RACE_STATE_NHPI.json"
    assert mock_acs.call_args_list[33].args[1] == "2022-POVERTY_BY_RACE_STATE_WHITE.json"
    assert mock_acs.call_args_list[34].args[1] == "2022-POVERTY_BY_RACE_STATE_OTHER_STANDARD.json"
    assert mock_acs.call_args_list[35].args[1] == "2022-POVERTY_BY_RACE_STATE_MULTI.json"

    assert mock_acs.call_args_list[36].args[1] == "2022-HEALTH_INSURANCE_BY_SEX_STATE.json"
    assert mock_acs.call_args_list[37].args[1] == "2022-POVERTY_BY_SEX_STATE.json"
    assert mock_acs.call_args_list[38].args[1] == "2022-HEALTH_INSURANCE_BY_SEX_STATE.json"
    assert mock_acs.call_args_list[39].args[1] == "2022-POVERTY_BY_SEX_STATE.json"

    assert mock_acs.call_args_list[40].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_COUNTY_AIAN.json"
    assert mock_acs.call_args_list[41].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_COUNTY_ASIAN.json"
    assert mock_acs.call_args_list[42].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_COUNTY_HISP.json"
    assert mock_acs.call_args_list[43].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_COUNTY_BLACK.json"
    assert mock_acs.call_args_list[44].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_COUNTY_NHPI.json"
    assert mock_acs.call_args_list[45].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_COUNTY_WHITE.json"
    assert mock_acs.call_args_list[46].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_COUNTY_OTHER_STANDARD.json"
    assert mock_acs.call_args_list[47].args[1] == "2022-HEALTH_INSURANCE_BY_RACE_COUNTY_MULTI.json"

    assert mock_acs.call_args_list[48].args[1] == "2022-POVERTY_BY_RACE_COUNTY_AIAN.json"
    assert mock_acs.call_args_list[49].args[1] == "2022-POVERTY_BY_RACE_COUNTY_ASIAN.json"
    assert mock_acs.call_args_list[50].args[1] == "2022-POVERTY_BY_RACE_COUNTY_HISP.json"
    assert mock_acs.call_args_list[51].args[1] == "2022-POVERTY_BY_RACE_COUNTY_BLACK.json"
    assert mock_acs.call_args_list[52].args[1] == "2022-POVERTY_BY_RACE_COUNTY_NHPI.json"
    assert mock_acs.call_args_list[53].args[1] == "2022-POVERTY_BY_RACE_COUNTY_WHITE.json"
    assert mock_acs.call_args_list[54].args[1] == "2022-POVERTY_BY_RACE_COUNTY_OTHER_STANDARD.json"
    assert mock_acs.call_args_list[55].args[1] == "2022-POVERTY_BY_RACE_COUNTY_MULTI.json"

    assert mock_acs.call_args_list[56].args[1] == "2022-HEALTH_INSURANCE_BY_SEX_COUNTY.json"
    assert mock_acs.call_args_list[57].args[1] == "2022-POVERTY_BY_SEX_COUNTY.json"
    assert mock_acs.call_args_list[58].args[1] == "2022-HEALTH_INSURANCE_BY_SEX_COUNTY.json"
    assert mock_acs.call_args_list[59].args[1] == "2022-POVERTY_BY_SEX_COUNTY.json"

    # One call for each table write to BQ
    assert mock_bq.call_count == 18

    assert mock_bq.call_args_list[0].args[2] == "race_national_historical"
    assert mock_bq.call_args_list[1].args[2] == "race_national_current"

    assert mock_bq.call_args_list[2].args[2] == "age_national_historical"
    assert mock_bq.call_args_list[3].args[2] == "age_national_current"

    assert mock_bq.call_args_list[4].args[2] == "sex_national_historical"
    assert mock_bq.call_args_list[5].args[2] == "sex_national_current"

    assert mock_bq.call_args_list[6].args[2] == "race_state_historical"
    assert mock_bq.call_args_list[7].args[2] == "race_state_current"

    assert mock_bq.call_args_list[8].args[2] == "age_state_historical"
    assert mock_bq.call_args_list[9].args[2] == "age_state_current"

    assert mock_bq.call_args_list[10].args[2] == "sex_state_historical"
    assert mock_bq.call_args_list[11].args[2] == "sex_state_current"

    assert mock_bq.call_args_list[12].args[2] == "race_county_historical"
    assert mock_bq.call_args_list[13].args[2] == "race_county_current"

    assert mock_bq.call_args_list[14].args[2] == "age_county_historical"
    assert mock_bq.call_args_list[15].args[2] == "age_county_current"

    assert mock_bq.call_args_list[16].args[2] == "sex_county_historical"
    assert mock_bq.call_args_list[17].args[2] == "sex_county_current"
