from unittest import mock
from datasources.cdc_hiv_diagnoses import CDCHIVDiagnosesData
import pandas as pd
import os

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cdc_hiv_diagnoses",)


# AGE

def get_ages_13_24_county():
    return pd.read_csv(os.path.join(TEST_DIR, '_ages_13-24_county_2019.csv'))


def get_ages_25_34_county():
    return pd.read_csv(os.path.join(TEST_DIR, '_ages_25-34_county_2019.csv'))


def get_ages_35_44_county():
    return pd.read_csv(os.path.join(TEST_DIR, '_ages_35-44_county_2019.csv'))


def get_ages_45_54_county():
    return pd.read_csv(os.path.join(TEST_DIR, '_ages_45-54_county_2019.csv'))


def get_ages_over_54_county():
    return pd.read_csv(os.path.join(TEST_DIR, '_ages_55+_county_2019.csv'))


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    print('mocking load from data dir')
    for arg in args:
        print("-")
        print(arg)

    for kwarg in kwargs:
        print("--")
        print(kwarg)

    dataset, filename = args
    return pd.read_csv(os.path.join(TEST_DIR, filename))


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir', side_effect=_load_csv_as_df_from_data_dir)
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testRunner(
    mock_bq: mock.MagicMock,
    mock_data_dir: mock.MagicMock,
):
    datasource = CDCHIVDiagnosesData()
    datasource.write_to_bq('dataset', 'gcs_bucket')

    # def testGenerateBreakdownAgeCounty():

    #     df_ages_13_24 = get_ages_13_24_county()
    #     df_ages_25_34 = get_ages_25_34_county()
    #     df_ages_35_44 = get_ages_35_44_county()
    #     df_ages_45_54 = get_ages_45_54_county()
    #     df_ages_over_54 = get_ages_over_54_county()

    #     table_list = [df_ages_13_24, df_ages_25_34,
    #                   df_ages_35_44, df_ages_45_54, df_ages_over_54]

    #     datasource = CDCHIVDiagnosesData()
    #     df = datasource.generate_breakdown_df('age', 'county', table_list)

    #     # update assert statements here
    #     pass

    # def testGenerateBreakdownAgeState():
    #     pass
