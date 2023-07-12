from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.cdc_hiv import CDCHIVData, DTYPE, NA_VALUES
import pandas as pd
import os

HIV_DIR = 'cdc_hiv'
BLACK_HIV_DIR = 'cdc_hiv_black_women'
COLS_TO_EXCLUDE = ('Indictor', 'Transmission Category',
                   'Rate LCI', 'Rate UCI')
RACE_COLS_TO_EXCLUDE = COLS_TO_EXCLUDE + ('Age Group', 'Sex')
AGE_COLS_TO_EXCLUDE = COLS_TO_EXCLUDE + ('Race/Ethnicity', 'Sex')
SEX_COLS_TO_EXCLUDE = COLS_TO_EXCLUDE + ('Age Group', 'Race/Ethnicity')

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')
GOLDEN_DIR = os.path.join(TEST_DIR, HIV_DIR, 'golden_data')
BLACK_GOLDEN_DIR = os.path.join(TEST_DIR, BLACK_HIV_DIR, 'golden_data')

ALLS_DATA = {
    'all_national': os.path.join(TEST_DIR, HIV_DIR, 'hiv-national-all.csv'),
    'all_state': os.path.join(TEST_DIR, HIV_DIR, 'hiv-state-all.csv'),
    'all_black_women_national': os.path.join(TEST_DIR, BLACK_HIV_DIR, 'hiv-black-women-national-all.csv')}

GOLDEN_DATA = {
    'age_national': os.path.join(GOLDEN_DIR, 'age_national_output.csv'),
    'race_age_national': os.path.join(GOLDEN_DIR, 'race_age_national_output.csv'),
    'race_national': os.path.join(GOLDEN_DIR, 'race_and_ethnicity_national_output.csv'),
    'race_state': os.path.join(GOLDEN_DIR, 'race_and_ethnicity_state_output.csv'),
    'sex_national': os.path.join(GOLDEN_DIR, 'sex_national_output.csv'),
    'age_black_women_national': os.path.join(BLACK_GOLDEN_DIR, 'age_black_women_national_output.csv')}

EXP_DTYPE = {'state_fips': str, 'time_period': str}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    subdirectory = kwargs['subdirectory']
    usecols = kwargs['usecols']
    df = pd.read_csv(os.path.join(TEST_DIR, directory, subdirectory, filename),
                     dtype=DTYPE,
                     skiprows=8,
                     na_values=NA_VALUES,
                     usecols=usecols,
                     thousands=',')

    return df


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateRaceAgeNational(mock_data_dir: mock.MagicMock):
    datasource = CDCHIVData()
    df = datasource.generate_race_age_deaths_df('national')
    expected_df = pd.read_csv(GOLDEN_DATA['race_age_national'], dtype=EXP_DTYPE)
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateAgeNational(mock_data_dir: mock.MagicMock):
    datasource = CDCHIVData()
    alls_df = pd.read_csv(ALLS_DATA["all_national"],
                          dtype=DTYPE,
                          skiprows=8,
                          usecols=lambda x: x not in AGE_COLS_TO_EXCLUDE,
                          thousands=',')
    df = datasource.generate_breakdown_df('age', 'national', alls_df)
    expected_df = pd.read_csv(GOLDEN_DATA['age_national'], dtype=EXP_DTYPE)
    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateRaceNational(mock_data_dir: mock.MagicMock):
    datasource = CDCHIVData()

    alls_df = pd.read_csv(ALLS_DATA["all_national"],
                          dtype=DTYPE,
                          skiprows=8,
                          na_values=NA_VALUES,
                          usecols=lambda x: x not in RACE_COLS_TO_EXCLUDE,
                          thousands=',')

    df = datasource.generate_breakdown_df('race_and_ethnicity',
                                          'national',
                                          alls_df)

    expected_df = pd.read_csv(
        GOLDEN_DATA['race_national'], dtype=EXP_DTYPE)

    assert_frame_equal(df, expected_df, check_like=True)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateSexNational(mock_data_dir: mock.MagicMock):
    datasource = CDCHIVData()

    alls_df = pd.read_csv(ALLS_DATA["all_national"],
                          usecols=lambda x: x not in SEX_COLS_TO_EXCLUDE,
                          skiprows=8,
                          thousands=',',
                          dtype=DTYPE)

    df = datasource.generate_breakdown_df('sex', 'national', alls_df)

    expected_df = pd.read_csv(GOLDEN_DATA['sex_national'], dtype=EXP_DTYPE)

    assert_frame_equal(df, expected_df, check_like=True)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateRaceState(mock_data_dir: mock.MagicMock):
    datasource = CDCHIVData()

    alls_df = pd.read_csv(ALLS_DATA['all_state'],
                          usecols=lambda x: x not in RACE_COLS_TO_EXCLUDE,
                          skiprows=8,
                          thousands=',',
                          dtype=DTYPE,)

    df = datasource.generate_breakdown_df('race_and_ethnicity',
                                          'state',
                                          alls_df)

    expected_df = pd.read_csv(GOLDEN_DATA['race_state'], dtype=EXP_DTYPE)

    assert_frame_equal(df, expected_df, check_like=True)


@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
def testGenerateBlackWomenAge(mock_data_dir: mock.MagicMock):
    datasource = CDCHIVData()

    alls_df = pd.read_csv(ALLS_DATA['all_black_women_national'],
                          usecols=lambda x: x not in COLS_TO_EXCLUDE,
                          skiprows=8,
                          thousands=',',
                          dtype=DTYPE,)

    df = datasource.generate_breakdown_df('black_women',
                                          'national',
                                          alls_df)

    expected_df = pd.read_csv(
        GOLDEN_DATA['age_black_women_national'], dtype=EXP_DTYPE)

    assert_frame_equal(df, expected_df, check_like=True)


def _generate_breakdown_df(*args):
    print("mocking the breakdown calc function")
    return pd.DataFrame({
        "state_fips": ["01", "02", "03"],
        "state_name": ["SomeState01", "SomeState02", "SomeState03"],
        "race_category_id": ["Black", "Black", "Black"],
        "race_and_ethnicity": ["Black", "Black", "Black"],
        "fake_col1": [0, 1, 2],
        "fake_col2": ["a", "b", "c"]
    })


def _generate_race_age_deaths_df(*args):
    print("mocking the race-age breakdown step")
    return pd.DataFrame({
        "state_fips": ["01", "02", "03"],
        "state_name": ["SomeState01", "SomeState02", "SomeState03"],
        "race_category_id": ["Black", "Black", "Black"],
        "race_and_ethnicity": ["Black", "Black", "Black"],
        "age": ["10-19", "20-29", "30-39"],
        "fake_col1": [0, 1, 2],
        "fake_col2": ["a", "b", "c"]
    })


def _load_df_from_data_dir(*args):
    print("mocking the generate alls function")
    return pd.DataFrame({
        "state_fips": ["01", "02", "03"],
        "state_name": ["SomeState01", "SomeState02", "SomeState03"],
        "race_category_id": ["ALL", "ALL", "ALL"],
        "race_and_ethnicity": ["All", "All", "All"],
        "fake_col1": [0, 1, 2],
        "fake_col2": ["a", "b", "c"]
    })


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('datasources.cdc_hiv.CDCHIVData.generate_breakdown_df', side_effect=_generate_breakdown_df)
@mock.patch('datasources.cdc_hiv.CDCHIVData.generate_race_age_deaths_df', side_effect=_generate_race_age_deaths_df)
@mock.patch('datasources.cdc_hiv.load_atlas_df_from_data_dir', side_effect=_load_df_from_data_dir)
def testWriteToBqCallsRace(
    mock_alls: mock.MagicMock,
    mock_race_age_df: mock.MagicMock,
    mock_breakdown_df: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCHIVData()
    datasource.write_to_bq('dataset', 'gcs_bucket', demographic="race")

    assert mock_bq.call_count == 5

    expected_table_names = [
        call[0][2] for call in mock_bq.call_args_list
    ]

    assert expected_table_names == [
        'by_race_age_national',
        'by_race_age_state',
        'race_and_ethnicity_national_time_series',
        'race_and_ethnicity_state_time_series',
        'race_and_ethnicity_county_time_series'
    ]


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('datasources.cdc_hiv.CDCHIVData.generate_breakdown_df', side_effect=_generate_breakdown_df)
@mock.patch('datasources.cdc_hiv.load_atlas_df_from_data_dir', side_effect=_load_df_from_data_dir)
def testWriteToBqCallsAge(
    mock_data_dir_df: mock.MagicMock,
    mock_breakdown_df: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCHIVData()
    datasource.write_to_bq('dataset', 'gcs_bucket', demographic="age")

    assert mock_bq.call_count == 3

    expected_table_names = [
        call[0][2] for call in mock_bq.call_args_list
    ]

    assert expected_table_names == [
        'age_national_time_series',
        'age_state_time_series',
        'age_county_time_series',
    ]


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('datasources.cdc_hiv.CDCHIVData.generate_breakdown_df', side_effect=_generate_breakdown_df)
@mock.patch('datasources.cdc_hiv.load_atlas_df_from_data_dir', side_effect=_load_df_from_data_dir)
def testWriteToBqCallsSex(
    mock_data_dir_df: mock.MagicMock,
    mock_breakdown_df: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCHIVData()
    datasource.write_to_bq('dataset', 'gcs_bucket', demographic="sex")

    assert mock_bq.call_count == 3

    expected_table_names = [
        call[0][2] for call in mock_bq.call_args_list
    ]

    assert expected_table_names == [
        'sex_national_time_series',
        'sex_state_time_series',
        'sex_county_time_series'
    ]


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('datasources.cdc_hiv.CDCHIVData.generate_breakdown_df', side_effect=_generate_breakdown_df)
@mock.patch('datasources.cdc_hiv.load_atlas_df_from_data_dir', side_effect=_load_df_from_data_dir)
def testWriteToBqCallsBlackWomen(
    mock_data_dir_df: mock.MagicMock,
    mock_breakdown_df: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCHIVData()
    datasource.write_to_bq('dataset', 'gcs_bucket', demographic="black_women")

    assert mock_bq.call_count == 2

    expected_table_names = [
        call[0][2] for call in mock_bq.call_args_list
    ]

    assert expected_table_names == [
        'black_women_national_time_series',
        'black_women_state_time_series'
    ]
