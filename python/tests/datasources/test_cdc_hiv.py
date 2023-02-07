from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.cdc_hiv import CDCHIVData
import pandas as pd
import os
import ingestion.standardized_columns as std_col
import csv

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data",)
GOLDEN_DIR = 'cdc_hiv/golden_data'

GOLDEN_DATA = {
    'race_national': os.path.join(TEST_DIR, GOLDEN_DIR, 'race_and_ethnicity_national_output.csv'),
    'race_state': os.path.join(TEST_DIR, GOLDEN_DIR, 'race_and_ethnicity_state_output.csv'),
    'race_county': os.path.join(TEST_DIR, GOLDEN_DIR, 'race_and_ethnicity_county_output'),
    'alls_national': os.path.join(TEST_DIR, 'cdc_hiv/national', 'totals_national_2019.csv')
}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    dataset, filename = args
    df = pd.read_csv(os.path.join(TEST_DIR, dataset, filename),
                     dtype={'FIPS': str, 'Population': float}, skiprows=9, thousands=',', quoting=1)
    return df


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testRunner(
    mock_bq: mock.MagicMock,
    mock_data_dir: mock.MagicMock,
):
    datasource = CDCHIVData()
    datasource.write_to_bq('dataset', 'gcs_bucket')


# def _generate_breakdown(*args):
#     print("mocking the breakdown calc function")
#     return pd.DataFrame({
#         "state_fips": ["01", "02", "03"],
#         "state_name": ["SomeState01", "SomeState02", "SomeState03"],
#         "race_category_id": ["Black", "Black", "Black"],
#         "race_and_ethnicity": ["Black", "Black", "Black"],
#         "fake_col1": [0, 1, 2],
#         "fake_col2": ["a", "b", "c"]
#     })


# def _generate_alls_df(*args):
#     print("mocking the generate alls function")
#     return pd.DataFrame({
#         "state_fips": ["01", "02", "03"],
#         "state_name": ["SomeState01", "SomeState02", "SomeState03"],
#         "race_category_id": ["ALL", "ALL", "ALL"],
#         "race_and_ethnicity": ["All", "All", "All"],
#         "fake_col1": [0, 1, 2],
#         "fake_col2": ["a", "b", "c"]
#     })


# @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
#             return_value=None)
# @mock.patch('datasources.cdc_hiv.CDCHIVData.generate_breakdown_df',
#             side_effect=_generate_breakdown)
# @mock.patch('datasources.cdc_hiv.generate_alls_df',
#             side_effect=_generate_alls_df)
# def testWriteToBqCalls(
#     mock_alls: mock.MagicMock,
#     mock_breakdown: mock.MagicMock,
#     mock_bq: mock.MagicMock,
# ):
#     datasource = CDCHIVData()
#     datasource.write_to_bq('dataset', 'gcs_bucket')

#     assert mock_bq.call_count == 9

#     expected_table_names = [
#         call[0][2] for call in mock_bq.call_args_list
#     ]
#     assert expected_table_names == ["age_county",
#                                     "race_and_ethnicity_county",
#                                     "sex_county",
#                                     "age_state",
#                                     "race_and_ethnicity_state",
#                                     "sex_state",
#                                     "age_national",
#                                     "race_and_ethnicity_national",
#                                     "sex_national"]


# @mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
# def testGeneratedBreakdownRaceNational(mock_data_dir: mock.MagicMock):
#     cols = ['Sex', 'Age Group', 'Race/Ethnicity']
#     alls_df = pd.read_csv(GOLDEN_DATA['alls_national'], skiprows=9)
#     alls_df[cols] = 'All'
#     alls_df['FIPS'] = '00'
#     alls_df['Geography'] = 'United States'

#     datasource = CDCHIVData()
#     df = datasource.generate_breakdown_df(
#         'race_and_ethnicity', 'national', alls_df, 'state_fips')

#     expected_df_race_national = pd.read_csv(
#         GOLDEN_DATA['race_national'], dtype={'state_fips': str})

#     assert_frame_equal(df, expected_df_race_national, check_like=True)


# @mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
#             return_value=None)
# def testRunner(
#     mock_bq: mock.MagicMock,
# ):
#     datasource = CDCHIVDiagnosesData()
#     datasource.write_to_bq('dataset', 'gcs_bucket')
