from unittest import mock
# from pandas._testing import assert_frame_equal
from datasources.phrma import PhrmaData, PHRMA_DIR
import pandas as pd
import os

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')
# DATA_DIR = os.path.join(THIS_DIR, os.pardir, "../../../data")
GOLDEN_DIR = os.path.join(TEST_DIR, PHRMA_DIR, 'golden_data')

ALLS_DATA = {
    'all_national': os.path.join(TEST_DIR, PHRMA_DIR, 'national-all.csv'),
    'all_state': os.path.join(TEST_DIR, PHRMA_DIR, 'state-all.csv')}

GOLDEN_DATA = {
    'age_national': os.path.join(GOLDEN_DIR, 'age_national_output.csv'),
    'race_national': os.path.join(GOLDEN_DIR, 'race_and_ethnicity_national_output.csv'),
    'race_state': os.path.join(GOLDEN_DIR, 'race_and_ethnicity_state_output.csv'),
    'sex_national': os.path.join(GOLDEN_DIR, 'sex_national_output.csv')}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    dtype = kwargs['dtype']
    na_values = kwargs['na_values']

    # print(
    #     f'mocking read xlsx from /data/{directory}/{filename}, sheet: {sheet_name}')

    file_path = os.path.join(TEST_DIR, directory, filename)

    df = pd.read_csv(file_path,
                     na_values=na_values,
                     dtype=dtype)

    return df


def _load_df_from_bigquery(*args, **kwargs):
    datasource_name, table_name, dtypes = args
    if "county" in table_name:
        dtypes["county_fips"] = str
    filename = f'{datasource_name}-{table_name}.ndjson'
    file_path = os.path.join(THIS_DIR, "het_bq_tables_for_mocks", filename)

    pop_df = pd.read_json(file_path, lines=True, dtype=dtypes)

    return pop_df


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
def testRunner(
    mock_bq: mock.MagicMock,
    mock_pop: mock.MagicMock,
    mock_data_dir: mock.MagicMock
):
    datasource = PhrmaData()

    datasource.write_to_bq(dataset="mock_dataset", gcs_bucket="mock_bucket")

    # def _load_csv_as_df_from_data_dir(*args, **kwargs):
    #     directory, filename = args
    #     subdirectory = kwargs['subdirectory']

    #     df = pd.read_csv(os.path.join(TEST_DIR, directory, subdirectory, filename))

    #     return df

    # @mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
    # def testGenerateAgeNational(mock_data_dir: mock.MagicMock):
    #     datasource = PhrmaData()

    #     alls_df = pd.read_csv(ALLS_DATA["all_national"])

    #     df = datasource.generate_breakdown_df('age', 'national', alls_df)

    #     expected_df = pd.read_csv(GOLDEN_DATA['age_national'], dtype=EXP_DTYPE)

    #     # assert_frame_equal(df, expected_df, check_like=True)

    # @mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
    # def testGenerateRaceNational(mock_data_dir: mock.MagicMock):
    #     datasource = PhrmaData()

    #     alls_df = pd.read_csv(ALLS_DATA["all_national"])

    #     df = datasource.generate_breakdown_df('race_and_ethnicity',
    #                                           'national',
    #                                           alls_df)

    #     expected_df = pd.read_csv(GOLDEN_DATA['race_national'], dtype=EXP_DTYPE)

    #     # assert_frame_equal(df, expected_df, check_like=True)

    # @mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
    # def testGenerateSexNational(mock_data_dir: mock.MagicMock):
    #     datasource = PhrmaData()

    #     alls_df = pd.read_csv(ALLS_DATA["all_national"],
    #                           dtype=DTYPE)

    #     df = datasource.generate_breakdown_df('sex', 'national', alls_df)

    #     expected_df = pd.read_csv(GOLDEN_DATA['sex_national'], dtype=EXP_DTYPE)

    # assert_frame_equal(df, expected_df, check_like=True)

    # @ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
    # def testGenerateRaceState(mock_data_dir: mock.MagicMock):
    #     datasource = PhrmaData()

    #     alls_df = pd.read_csv(ALLS_DATA['all_state'],
    #                           dtype=DTYPE,)

    #     df = datasource.generate_breakdown_df('race_and_ethnicity',
    #                                           'state',
    #                                           alls_df)

    #     expected_df = pd.read_csv(GOLDEN_DATA['race_state'], dtype=EXP_DTYPE)

    #     # assert_frame_equal(df, expected_df, check_like=True)

    # def _generate_breakdown_df(*args):
    #     print("mocking the breakdown calc function")
    #     return pd.DataFrame({
    #         "state_fips": ["01", "02", "03"],
    #         "state_name": ["SomeState01", "SomeState02", "SomeState03"],
    #         "race_category_id": ["Black", "Black", "Black"],
    #         "race_and_ethnicity": ["Black", "Black", "Black"],
    #         "fake_col1": [0, 1, 2],
    #         "fake_col2": ["a", "b", "c"]
    #     })

    # def _load_df_from_data_dir(*args):
    #     print("mocking the generate alls function")
    #     return pd.DataFrame({
    #         "state_fips": ["01", "02", "03"],
    #         "state_name": ["SomeState01", "SomeState02", "SomeState03"],
    #         "race_category_id": ["ALL", "ALL", "ALL"],
    #         "race_and_ethnicity": ["All", "All", "All"],
    #         "fake_col1": [0, 1, 2],
    #         "fake_col2": ["a", "b", "c"]
    #     })

    # @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
    # @mock.patch('datasources.phrma.PhrmaData.generate_breakdown_df', side_effect=_generate_breakdown_df)
    # @mock.patch('datasources.phrma.load_atlas_df_from_data_dir', side_effect=_load_df_from_data_dir)
    # def testWriteToBqCalls(
    #     mock_data_dir_df: mock.MagicMock,
    #     mock_breakdown_df: mock.MagicMock,
    #     mock_bq: mock.MagicMock,
    # ):
    #     datasource = PhrmaData()
    #     datasource.write_to_bq('dataset', 'gcs_bucket')

    #     assert mock_bq.call_count == 9

    #     expected_table_names = [
    #         call[0][2] for call in mock_bq.call_args_list
    #     ]

    #     assert expected_table_names == ["age_county",
    #                                     "race_and_ethnicity_county",
    #                                     "sex_county",
    #                                     "age_national",
    #                                     "race_and_ethnicity_national",
    #                                     "sex_national",
    #                                     "age_state",
    #                                     "race_and_ethnicity_state",
    #                                     "sex_state"]
