import os
import pandas as pd
from unittest import mock
from pandas._testing import assert_frame_equal
from ingestion import gcs_to_bq_util

from datasources.acs_condition import AcsCondition

from test_utils import get_acs_metadata_as_json, get_state_fips_codes_as_df

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data', 'acs_condition')

GOLDEN_DATA_NATIONAL_SEX = os.path.join(TEST_DIR, 'golden_data', 'sex_national.csv')
GOLDEN_DATA_STATE_SEX = os.path.join(TEST_DIR, 'golden_data', 'sex_state.csv')
GOLDEN_DATA_COUNTY_SEX = os.path.join(TEST_DIR, 'golden_data', 'sex_county.csv')
GOLDEN_DATA_COUNTY_RACE = os.path.join(TEST_DIR, 'golden_data', 'race_county.csv')


def get_fips_and_county_names_as_df(*args, **kwargs):
    if args[1] == 'fips_codes_all':
        return pd.read_csv(os.path.join(TEST_DIR, 'county_names.csv'), dtype=str)
    else:
        return get_state_fips_codes_as_df()


def _get_by_race_as_df(*args):
    _, filename = args
    return gcs_to_bq_util.values_json_to_df(
        os.path.join(TEST_DIR, filename),
        dtype={'state_fips': str, 'county_fips': str}).reset_index(drop=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=get_fips_and_county_names_as_df)
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_get_by_race_as_df)
def testSexNational(mock_acs: mock.MagicMock, mock_fips: mock.MagicMock):
    acsHealthInsurance = AcsCondition()

    df = acsHealthInsurance.get_raw_data('sex', 'national', get_acs_metadata_as_json(), 'some-bucket')
    df = acsHealthInsurance.post_process(df, 'sex', 'national')

    expected_df = pd.read_csv(GOLDEN_DATA_NATIONAL_SEX, dtype={'state_fips': str})
    cols = list(expected_df.columns)
    assert_frame_equal(df.sort_values(cols).reset_index(drop=True),
                       expected_df.sort_values(cols).reset_index(drop=True),
                       check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=get_fips_and_county_names_as_df)
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_get_by_race_as_df)
def testSexState(mock_acs: mock.MagicMock, mock_fips: mock.MagicMock):
    acsHealthInsurance = AcsCondition()

    df = acsHealthInsurance.get_raw_data('sex', 'state', get_acs_metadata_as_json(), 'some-bucket')
    df = acsHealthInsurance.post_process(df, 'sex', 'state')

    expected_df = pd.read_csv(GOLDEN_DATA_STATE_SEX, dtype={'state_fips': str})
    cols = list(expected_df.columns)
    assert_frame_equal(df.sort_values(cols).reset_index(drop=True),
                       expected_df.sort_values(cols).reset_index(drop=True),
                       check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=get_fips_and_county_names_as_df)
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_get_by_race_as_df)
def testSexCounty(mock_acs: mock.MagicMock, mock_fips: mock.MagicMock):
    acsHealthInsurance = AcsCondition()

    df = acsHealthInsurance.get_raw_data('sex', 'county', get_acs_metadata_as_json(), 'some-bucket')
    df = acsHealthInsurance.post_process(df, 'sex', 'county')

    expected_df = pd.read_csv(GOLDEN_DATA_COUNTY_SEX, dtype={'state_fips': str, 'county_fips': str})
    cols = list(expected_df.columns)
    df.sort_values(cols).reset_index(drop=True).to_csv('/tmp/thing.csv', index=False)
    assert_frame_equal(df.sort_values(cols).reset_index(drop=True),
                       expected_df.sort_values(cols).reset_index(drop=True),
                       check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=get_fips_and_county_names_as_df)
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_get_by_race_as_df)
def testRaceCounty(mock_acs: mock.MagicMock, mock_fips: mock.MagicMock):
    acsHealthInsurance = AcsCondition()

    df = acsHealthInsurance.get_raw_data('race', 'county', get_acs_metadata_as_json(), 'some-bucket')
    df = acsHealthInsurance.post_process(df, 'race', 'county')

    expected_df = pd.read_csv(GOLDEN_DATA_COUNTY_RACE, dtype={'state_fips': str, 'county_fips': str})
    cols = list(expected_df.columns)
    assert_frame_equal(df.sort_values(cols).reset_index(drop=True),
                       expected_df.sort_values(cols).reset_index(drop=True),
                       check_like=True)


@mock.patch('ingestion.census.fetch_acs_metadata',
            return_value=get_acs_metadata_as_json())
@mock.patch('ingestion.gcs_to_bq_util.load_values_as_df',
            side_effect=_get_by_race_as_df)
@mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
            side_effect=get_fips_and_county_names_as_df)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock,
                  mock_fips: mock.MagicMock,
                  mock_acs: mock.MagicMock,
                  mock_json: mock.MagicMock):
    acsHealthInsurance = AcsCondition()

    acsHealthInsurance.write_to_bq('dataset', 'gcs_bucket')

    assert mock_json.call_count == 1

    # One call per race per geo, and then one call for sex at each geo
    # and one for age at each geo
    assert mock_acs.call_count == ((8 * 3) + 3 + 3) * 2
    assert mock_acs.call_args_list[0].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_AIAN.json'
    assert mock_acs.call_args_list[1].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_ASIAN.json'
    assert mock_acs.call_args_list[2].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_HISP.json'
    assert mock_acs.call_args_list[3].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_BLACK.json'
    assert mock_acs.call_args_list[4].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_NHPI.json'
    assert mock_acs.call_args_list[5].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_WHITE.json'
    assert mock_acs.call_args_list[6].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_OTHER_STANDARD.json'
    assert mock_acs.call_args_list[7].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_MULTI.json'

    assert mock_acs.call_args_list[8].args[1] == 'POVERTY_BY_RACE_STATE_AIAN.json'
    assert mock_acs.call_args_list[9].args[1] == 'POVERTY_BY_RACE_STATE_ASIAN.json'
    assert mock_acs.call_args_list[10].args[1] == 'POVERTY_BY_RACE_STATE_HISP.json'
    assert mock_acs.call_args_list[11].args[1] == 'POVERTY_BY_RACE_STATE_BLACK.json'
    assert mock_acs.call_args_list[12].args[1] == 'POVERTY_BY_RACE_STATE_NHPI.json'
    assert mock_acs.call_args_list[13].args[1] == 'POVERTY_BY_RACE_STATE_WHITE.json'
    assert mock_acs.call_args_list[14].args[1] == 'POVERTY_BY_RACE_STATE_OTHER_STANDARD.json'
    assert mock_acs.call_args_list[15].args[1] == 'POVERTY_BY_RACE_STATE_MULTI.json'

    assert mock_acs.call_args_list[16].args[1] == 'HEALTH_INSURANCE_BY_SEX_STATE.json'
    assert mock_acs.call_args_list[17].args[1] == 'POVERTY_BY_SEX_STATE.json'
    assert mock_acs.call_args_list[18].args[1] == 'HEALTH_INSURANCE_BY_SEX_STATE.json'
    assert mock_acs.call_args_list[19].args[1] == 'POVERTY_BY_SEX_STATE.json'

    assert mock_acs.call_args_list[20].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_AIAN.json'
    assert mock_acs.call_args_list[21].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_ASIAN.json'
    assert mock_acs.call_args_list[22].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_HISP.json'
    assert mock_acs.call_args_list[23].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_BLACK.json'
    assert mock_acs.call_args_list[24].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_NHPI.json'
    assert mock_acs.call_args_list[25].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_WHITE.json'
    assert mock_acs.call_args_list[26].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_OTHER_STANDARD.json'
    assert mock_acs.call_args_list[27].args[1] == 'HEALTH_INSURANCE_BY_RACE_STATE_MULTI.json'

    assert mock_acs.call_args_list[28].args[1] == 'POVERTY_BY_RACE_STATE_AIAN.json'
    assert mock_acs.call_args_list[29].args[1] == 'POVERTY_BY_RACE_STATE_ASIAN.json'
    assert mock_acs.call_args_list[30].args[1] == 'POVERTY_BY_RACE_STATE_HISP.json'
    assert mock_acs.call_args_list[31].args[1] == 'POVERTY_BY_RACE_STATE_BLACK.json'
    assert mock_acs.call_args_list[32].args[1] == 'POVERTY_BY_RACE_STATE_NHPI.json'
    assert mock_acs.call_args_list[33].args[1] == 'POVERTY_BY_RACE_STATE_WHITE.json'
    assert mock_acs.call_args_list[34].args[1] == 'POVERTY_BY_RACE_STATE_OTHER_STANDARD.json'
    assert mock_acs.call_args_list[35].args[1] == 'POVERTY_BY_RACE_STATE_MULTI.json'

    assert mock_acs.call_args_list[36].args[1] == 'HEALTH_INSURANCE_BY_SEX_STATE.json'
    assert mock_acs.call_args_list[37].args[1] == 'POVERTY_BY_SEX_STATE.json'
    assert mock_acs.call_args_list[38].args[1] == 'HEALTH_INSURANCE_BY_SEX_STATE.json'
    assert mock_acs.call_args_list[39].args[1] == 'POVERTY_BY_SEX_STATE.json'

    assert mock_acs.call_args_list[40].args[1] == 'HEALTH_INSURANCE_BY_RACE_COUNTY_AIAN.json'
    assert mock_acs.call_args_list[41].args[1] == 'HEALTH_INSURANCE_BY_RACE_COUNTY_ASIAN.json'
    assert mock_acs.call_args_list[42].args[1] == 'HEALTH_INSURANCE_BY_RACE_COUNTY_HISP.json'
    assert mock_acs.call_args_list[43].args[1] == 'HEALTH_INSURANCE_BY_RACE_COUNTY_BLACK.json'
    assert mock_acs.call_args_list[44].args[1] == 'HEALTH_INSURANCE_BY_RACE_COUNTY_NHPI.json'
    assert mock_acs.call_args_list[45].args[1] == 'HEALTH_INSURANCE_BY_RACE_COUNTY_WHITE.json'
    assert mock_acs.call_args_list[46].args[1] == 'HEALTH_INSURANCE_BY_RACE_COUNTY_OTHER_STANDARD.json'
    assert mock_acs.call_args_list[47].args[1] == 'HEALTH_INSURANCE_BY_RACE_COUNTY_MULTI.json'

    assert mock_acs.call_args_list[48].args[1] == 'POVERTY_BY_RACE_COUNTY_AIAN.json'
    assert mock_acs.call_args_list[49].args[1] == 'POVERTY_BY_RACE_COUNTY_ASIAN.json'
    assert mock_acs.call_args_list[50].args[1] == 'POVERTY_BY_RACE_COUNTY_HISP.json'
    assert mock_acs.call_args_list[51].args[1] == 'POVERTY_BY_RACE_COUNTY_BLACK.json'
    assert mock_acs.call_args_list[52].args[1] == 'POVERTY_BY_RACE_COUNTY_NHPI.json'
    assert mock_acs.call_args_list[53].args[1] == 'POVERTY_BY_RACE_COUNTY_WHITE.json'
    assert mock_acs.call_args_list[54].args[1] == 'POVERTY_BY_RACE_COUNTY_OTHER_STANDARD.json'
    assert mock_acs.call_args_list[55].args[1] == 'POVERTY_BY_RACE_COUNTY_MULTI.json'

    assert mock_acs.call_args_list[56].args[1] == 'HEALTH_INSURANCE_BY_SEX_COUNTY.json'
    assert mock_acs.call_args_list[57].args[1] == 'POVERTY_BY_SEX_COUNTY.json'
    assert mock_acs.call_args_list[58].args[1] == 'HEALTH_INSURANCE_BY_SEX_COUNTY.json'
    assert mock_acs.call_args_list[59].args[1] == 'POVERTY_BY_SEX_COUNTY.json'

    # One state name call for each run, and then 1 county name for each county run
    assert mock_fips.call_count == 9 + 3

    assert mock_bq.call_count == 9
    assert mock_bq.call_args_list[0].args[2] == 'by_race_national_processed'
    assert mock_bq.call_args_list[1].args[2] == 'by_age_national_processed'
    assert mock_bq.call_args_list[2].args[2] == 'by_sex_national_processed'

    assert mock_bq.call_args_list[3].args[2] == 'by_race_state_processed'
    assert mock_bq.call_args_list[4].args[2] == 'by_age_state_processed'
    assert mock_bq.call_args_list[5].args[2] == 'by_sex_state_processed'

    assert mock_bq.call_args_list[6].args[2] == 'by_race_county_processed'
    assert mock_bq.call_args_list[7].args[2] == 'by_age_county_processed'
    assert mock_bq.call_args_list[8].args[2] == 'by_sex_county_processed'
