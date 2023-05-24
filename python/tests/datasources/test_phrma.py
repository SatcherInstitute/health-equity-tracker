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
    "national": os.path.join(TEST_DIR, PHRMA_DIR, "mocked_alls", 'national-alls.csv'),
    "state": os.path.join(TEST_DIR, PHRMA_DIR, "mocked_alls", 'state-alls.csv'),
    "county": os.path.join(TEST_DIR, PHRMA_DIR, "mocked_alls", 'county-alls.csv'),
}

GOLDEN_DATA = {
    'age_national': os.path.join(GOLDEN_DIR, 'age_national_output.csv'),
    'race_national': os.path.join(GOLDEN_DIR, 'race_and_ethnicity_national_output.csv'),
    'race_state': os.path.join(GOLDEN_DIR, 'race_and_ethnicity_state_output.csv'),
    'sex_national': os.path.join(GOLDEN_DIR, 'sex_national_output.csv')}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    dtype = kwargs['dtype']
    na_values = kwargs['na_values']
    file_path = os.path.join(TEST_DIR, directory, filename)

    df = pd.read_csv(file_path,
                     na_values=na_values,
                     dtype=dtype)

    return df


# TODO: move this to a util and refactor other sources
# TODO: to use this instead of duplicated
# TODO: fake population data, etc
def _load_df_from_bigquery(*args, **kwargs):
    datasource_name, table_name, dtypes = args
    if "county" in table_name:
        dtypes["county_fips"] = str
    filename = f'{datasource_name}-{table_name}.ndjson'
    file_path = os.path.join(THIS_DIR, "het_bq_tables_for_mocks", filename)

    pop_df = pd.read_json(file_path, lines=True, dtype=dtypes)

    return pop_df


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

# TODO: DELETE - THIS IS ONLY FOR DEVELOPMENT


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery)
def testRunner(
    mock_pop: mock.MagicMock,
    mock_bq: mock.MagicMock,
    mock_data_dir: mock.MagicMock,
):
    datasource = PhrmaData()
    datasource.write_to_bq(dataset="mock_dataset", gcs_bucket="mock_bucket")


# OVERALL BQ

# @mock.patch('datasources.phrma.PhrmaData.generate_breakdown_df', side_effect=_generate_breakdown_df)
# @mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
# @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
# def testOverallBigQueryInteractions(
#         mock_bq: mock.MagicMock,
#         mock_data_dir: mock.MagicMock,
#         mock_breakdown: mock.MagicMock):
#     datasource = PhrmaData()
#     datasource.write_to_bq(dataset="mock_dataset", gcs_bucket="mock_bucket")

#     # 3 geographic, 3 demographics that have an "all". LIS/Elig. use SEX's alls and don't require another load
#     assert mock_data_dir.call_count == 3 * 3

#     # 3 geographic levels, 5 demographic types age/sex/race/LIS/Elig.
#     assert mock_bq.call_count == 3 * 5
#     assert mock_breakdown.call_count == 3 * 5

#     generated_table_names = [
#         call[0][2] for call in mock_bq.call_args_list
#     ]
#     assert generated_table_names == [
#         'LIS_national', 'eligibility_national', 'sex_national', 'age_national', 'race_and_ethnicity_national', 'LIS_state', 'eligibility_state', 'sex_state', 'age_state', 'race_and_ethnicity_state', 'LIS_county', 'eligibility_county', 'sex_county', 'age_county', 'race_and_ethnicity_county'
#     ]


# # BREAKDOWN TESTS

# @mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
# @mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_load_df_from_bigquery)
# def testBreakdownSexNational(
#         mock_pop: mock.MagicMock,
#         mock_data_dir: mock.MagicMock
# ):
#     datasource = PhrmaData()

#     alls_df = pd.read_csv(ALLS_DATA["national"], dtype={"state_fips": str})
#     print(alls_df.to_string())
#     breakdown_df = datasource.generate_breakdown_df(
#         'sex', 'national', alls_df)

#     # one data_dir call per topic
#     assert mock_data_dir.call_count == 3

#     # call to acs_population national
#     assert mock_pop.call_count == 1

#     breakdown_df.to_csv(f'expected_sex_national.csv', index=False)
