from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.phrma import PhrmaData, PHRMA_DIR
from test_utils import (
    _load_public_dataset_from_bigquery_as_df
)
import pandas as pd
import os

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')
GOLDEN_DIR = os.path.join(TEST_DIR, PHRMA_DIR, 'golden_data')

ALLS_DATA = {
    "national": os.path.join(TEST_DIR, PHRMA_DIR, "mocked_alls", 'national-alls.csv'),
    "state": os.path.join(TEST_DIR, PHRMA_DIR, "mocked_alls", 'state-alls.csv'),
    "county": os.path.join(TEST_DIR, PHRMA_DIR, "mocked_alls", 'county-alls.csv'),
}

GOLDEN_DATA = {
    'lis_national': os.path.join(GOLDEN_DIR, 'expected_lis_national.csv'),
    'eligibility_national': os.path.join(GOLDEN_DIR, 'expected_eligibility_national.csv'),
    'sex_national': os.path.join(GOLDEN_DIR, 'expected_sex_national.csv'),
    'race_and_ethnicity_state': os.path.join(GOLDEN_DIR,
                                             'expected_race_and_ethnicity_state.csv'),
    'age_county': os.path.join(GOLDEN_DIR, 'expected_age_county.csv')
}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    dtype = kwargs['dtype']
    na_values = kwargs['na_values']
    subdirectory = kwargs['subdirectory']
    file_path = os.path.join(
        TEST_DIR, directory, f'test_input_{subdirectory}', filename)

    df = pd.read_csv(file_path,
                     na_values=na_values,
                     dtype=dtype)

    return df


def _generate_breakdown_df(*args):
    print("mocking _generate_breakdown_df()")
    return pd.DataFrame({
        "state_fips": ["01", "02", "03"],
        "state_name": ["SomeState01", "SomeState02", "SomeState03"],
        "race_category_id": ["BLACK", "BLACK", "BLACK"],
        "race_and_ethnicity": ["Black", "Black", "Black"],
        "fake_col1": [0, 1, 2],
        "fake_col2": ["a", "b", "c"]
    })


# # # OVERALL BQ

@mock.patch('datasources.phrma.PhrmaData.generate_breakdown_df',
            side_effect=_generate_breakdown_df)
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
            side_effect=_load_csv_as_df_from_data_dir)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testOverallBigQueryInteractions(
        mock_bq: mock.MagicMock,
        mock_data_dir: mock.MagicMock,
        mock_breakdown: mock.MagicMock):
    datasource = PhrmaData()
    datasource.write_to_bq(dataset="mock_dataset", gcs_bucket="mock_bucket")
    # 3 geographic, 9 condition sheets
    assert mock_data_dir.call_count == 9 * 3
    # 3 geographic levels, 5 demographic types age/sex/race/list/elig.
    assert mock_bq.call_count == 3 * 5
    assert mock_breakdown.call_count == 3 * 5
    generated_table_names = [
        call[0][2] for call in mock_bq.call_args_list
    ]
    assert generated_table_names == [
        'lis_national', 'eligibility_national',
        'sex_national', 'age_national', 'race_and_ethnicity_national',
        'lis_state', 'eligibility_state',
        'sex_state', 'age_state', 'race_and_ethnicity_state',
        'lis_county', 'eligibility_county',
        'sex_county', 'age_county', 'race_and_ethnicity_county'
    ]


# # # # BREAKDOWN TESTS

@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
            side_effect=_load_csv_as_df_from_data_dir)
def testBreakdownLisNational(
        mock_data_dir: mock.MagicMock
):
    datasource = PhrmaData()
    alls_df = pd.read_csv(ALLS_DATA["national"], dtype={"state_fips": str})
    breakdown_df = datasource.generate_breakdown_df(
        'lis', 'national', alls_df)
    # one data_dir call per topic
    assert mock_data_dir.call_count == 9
    expected_df = pd.read_csv(
        GOLDEN_DATA['lis_national'], dtype={"state_fips": str})

    assert_frame_equal(breakdown_df, expected_df,
                       check_dtype=False, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
            side_effect=_load_csv_as_df_from_data_dir)
def testBreakdownEligibilityNational(
        mock_data_dir: mock.MagicMock
):
    datasource = PhrmaData()
    alls_df = pd.read_csv(ALLS_DATA["national"], dtype={"state_fips": str})
    breakdown_df = datasource.generate_breakdown_df(
        'eligibility', 'national', alls_df)
    # one data_dir call per topic
    assert mock_data_dir.call_count == 9
    expected_df = pd.read_csv(
        GOLDEN_DATA['eligibility_national'], dtype={"state_fips": str})
    assert_frame_equal(breakdown_df, expected_df,
                       check_dtype=False, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
            side_effect=_load_csv_as_df_from_data_dir)
def testBreakdownSexNational(
        mock_data_dir: mock.MagicMock
):
    datasource = PhrmaData()
    alls_df = pd.read_csv(ALLS_DATA["national"], dtype={"state_fips": str})
    breakdown_df = datasource.generate_breakdown_df(
        'sex', 'national', alls_df)
    # one data_dir call per topic
    assert mock_data_dir.call_count == 9
    expected_df = pd.read_csv(
        GOLDEN_DATA['sex_national'], dtype={"state_fips": str})
    assert_frame_equal(breakdown_df, expected_df,
                       check_dtype=False, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
            side_effect=_load_csv_as_df_from_data_dir)
def testBreakdownRaceState(
        mock_data_dir: mock.MagicMock
):
    datasource = PhrmaData()
    alls_df = pd.read_csv(ALLS_DATA["state"], dtype={"state_fips": str})
    breakdown_df = datasource.generate_breakdown_df(
        'race_and_ethnicity', 'state', alls_df)
    # one data_dir call per topic
    assert mock_data_dir.call_count == 9
    expected_df = pd.read_csv(
        GOLDEN_DATA['race_and_ethnicity_state'], dtype={"state_fips": str})
    assert_frame_equal(
        breakdown_df,
        expected_df,
        check_dtype=False,
        check_like=True
    )


@mock.patch(
    'ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
    side_effect=_load_public_dataset_from_bigquery_as_df
)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_data_dir
)
def testBreakdownAgeCounty(
        mock_data_dir: mock.MagicMock,
        mock_county_names: mock.MagicMock
):
    datasource = PhrmaData()
    alls_df = pd.read_csv(ALLS_DATA["county"], dtype={
                          "county_fips": str, "state_fips": str})
    breakdown_df = datasource.generate_breakdown_df(
        'age', 'county', alls_df)
    # one data_dir call per topic
    assert mock_data_dir.call_count == 9
    # call to public BQ for county names
    assert mock_county_names.call_count == 1
    expected_df = pd.read_csv(
        GOLDEN_DATA['age_county'], dtype={"state_fips": str, "county_fips": str})
    assert_frame_equal(breakdown_df, expected_df,
                       check_dtype=False, check_like=True)
