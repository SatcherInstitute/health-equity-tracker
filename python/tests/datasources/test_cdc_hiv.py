from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.cdc_hiv import CDCHIVData
import pandas as pd
import os


THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')

GOLDEN_DATA = {
    'race_national': os.path.join(TEST_DIR, 'cdc_hiv/golden_data', 'race_and_ethnicity_national_output.csv'),
    'age_national': os.path.join(TEST_DIR, 'cdc_hiv/golden_data', 'age_national_output.csv'),
    'sex_national': os.path.join(TEST_DIR, 'cdc_hiv/golden_data', 'sex_national_output.csv'),
    'race_state': os.path.join(TEST_DIR, 'cdc_hiv/golden_data', 'race_and_ethnicity_state_output.csv'),
}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    subdirectory = kwargs['subdirectory']
    directory, filename = args
    df = pd.read_csv(os.path.join(TEST_DIR, directory, subdirectory, filename),
                     dtype={'FIPS': str}, skiprows=9, thousands=',')

    return df


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateRaceNational(
    mock_data_dir: mock.MagicMock,
):
    datasource = CDCHIVData()
    df = datasource.generate_breakdown_df(
        'race_and_ethnicity', 'national')
    expected_df_race_national = pd.read_csv(
        GOLDEN_DATA['race_national'], dtype={'state_fips': str})

    assert_frame_equal(df, expected_df_race_national, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateAgeNational(
    mock_data_dir: mock.MagicMock,
):
    datasource = CDCHIVData()
    df = datasource.generate_breakdown_df(
        'age', 'national')
    expected_df_age_national = pd.read_csv(
        GOLDEN_DATA['age_national'], dtype={'state_fips': str})

    assert_frame_equal(df, expected_df_age_national, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateSexNational(
    mock_data_dir: mock.MagicMock,
):
    datasource = CDCHIVData()
    df = datasource.generate_breakdown_df(
        'sex', 'national')
    expected_df_sex_national = pd.read_csv(
        GOLDEN_DATA['sex_national'], dtype={'state_fips': str})

    assert_frame_equal(df, expected_df_sex_national, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateRaceState(
    mock_data_dir: mock.MagicMock,
):
    datasource = CDCHIVData()
    df = datasource.generate_breakdown_df(
        'race_and_ethnicity', 'state')
    expected_df_race_sex = pd.read_csv(
        GOLDEN_DATA['race_state'], dtype={'state_fips': str})

    assert_frame_equal(df, expected_df_race_sex, check_like=True)


def _generate_breakdown(*args):
    print("mocking the breakdown calc function")
    return pd.DataFrame({
        "state_fips": ["01", "02", "03"],
        "state_name": ["SomeState01", "SomeState02", "SomeState03"],
        "race_category_id": ["Black", "Black", "Black"],
        "race_and_ethnicity": ["Black", "Black", "Black"],
        "fake_col1": [0, 1, 2],
        "fake_col2": ["a", "b", "c"]
    })


def _generate_alls_df(*args):
    print("mocking the generate alls function")
    return pd.DataFrame({
        "state_fips": ["01", "02", "03"],
        "state_name": ["SomeState01", "SomeState02", "SomeState03"],
        "race_category_id": ["ALL", "ALL", "ALL"],
        "race_and_ethnicity": ["All", "All", "All"],
        "fake_col1": [0, 1, 2],
        "fake_col2": ["a", "b", "c"]
    })


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
@mock.patch('datasources.cdc_hiv.CDCHIVData.generate_breakdown_df',
            side_effect=_generate_breakdown)
@mock.patch('datasources.cdc_hiv.generate_alls_df',
            side_effect=_generate_alls_df)
def testWriteToBqCalls(
    mock_alls: mock.MagicMock,
    mock_breakdown: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCHIVData()
    datasource.write_to_bq('dataset', 'gcs_bucket')

    assert mock_bq.call_count == 9

    expected_table_names = [
        call[0][2] for call in mock_bq.call_args_list
    ]
    assert expected_table_names == ["age_county",
                                    "race_and_ethnicity_county",
                                    "sex_county",
                                    "age_state",
                                    "race_and_ethnicity_state",
                                    "sex_state",
                                    "age_national",
                                    "race_and_ethnicity_national",
                                    "sex_national"]
