from unittest import mock
import os
from io import StringIO
import pandas as pd
from pandas._testing import assert_frame_equal
from test_utils import get_state_fips_codes_as_df
from datasources.bjs_incarceration import (BJSIncarcerationData)
from datasources.bjs_table_utils import (bjs_prisoners_tables,
                                         strip_footnote_refs_from_df,
                                         missing_data_to_none,
                                         set_state_col)

# MOCKS FOR READING IN TABLES


def get_test_table_files():

    loaded_tables = {}
    for file in bjs_prisoners_tables.keys():
        if file in bjs_prisoners_tables:
            source_df = pd.read_csv(os.path.join(
                TEST_DIR, f'bjs_test_input_{file}'),
                encoding="ISO-8859-1",
                thousands=',',
                engine="python",
            )

            source_df = strip_footnote_refs_from_df(source_df)
            source_df = missing_data_to_none(source_df)
            loaded_tables[file] = set_state_col(source_df)

    return loaded_tables


def _get_pop_as_df(*args):
    # retrieve fake ACS table subsets
    data_source, table_name, _dtypes = args

    df = pd.read_json(os.path.join(TEST_DIR, data_source,
                                   f'{table_name}.json'),
                      dtype={'state_fips': str})

    return df


def _get_standardized_table2():
    """generate a df that matches the cleaned and standardized BJS table
needed for generate_breakdown_df()"""
    table_2_data = StringIO("""All,Male,Female,state_name
1215821.0,1132767.0,83054.0,U.S. total
25328.0,23166.0,2162.0,Alabama""")
    df_2 = pd.read_csv(table_2_data, sep=",")
    return df_2


def _get_standardized_table10():
    """generate a df that matches the cleaned and standardized BJS table
needed for generate_breakdown_df()"""
    table_10_data = StringIO("""age,prison_pct_share,state_name
All,100.0,United States
18-19,0.6,United States
20-24,7.5,United States
25-29,14.5,United States
30-34,16.3,United States
35-39,15.8,United States
40-44,13.0,United States
45-49,10.1,United States
50-54,8.1,United States
55-59,6.5,United States
60-64,4.0,United States
65+,3.5,United States
Number of sentenced prisoners,1182166.0,United States""")
    df_10 = pd.read_csv(table_10_data, sep=",")
    return df_10


def _get_standardized_table13():
    """generate a df that matches the cleaned and standardized BJS table
needed for generate_breakdown_df()"""
    table_13_data = StringIO("""state_name,prison_estimated_total,age
United States,352,0-17
Alabama,1,0-17
    """)
    df_13 = pd.read_csv(table_13_data, sep=",")
    return df_13


def _get_standardized_table23():
    """generate a df that matches the cleaned and standardized BJS table
needed for generate_breakdown_df()"""
    table_23_data = StringIO("""ALL,state_name
196.0,American Samoa""")
    df_23 = pd.read_csv(table_23_data, sep=",")
    return df_23


def _get_standardized_table_app2():
    table_app_2_data = StringIO("""ALL,WHITE_NH,BLACK_NH,HISP,AIAN_NH,ASIAN_NH,NHPI_NH,MULTI_NH,OTHER_STANDARD_NH,UNKNOWN,state_name
152156.0,44852.0,55391.0,46162.0,3488.0,2262.0,,,0.0,1.0,Federal
,,,,,,,,,,State
25328.0,11607.0,13519.0,0.0,2.0,3.0,0.0,0.0,0.0,197.0,Alabama""")
    df_app_2 = pd.read_csv(table_app_2_data, sep=",")
    return df_app_2


# INTEGRATION TEST SETUP
# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "bjs_incarceration")

GOLDEN_DATA = {
    'race_national': os.path.join(TEST_DIR, 'bjs_test_output_race_and_ethnicity_national.json'),
    'age_national': os.path.join(TEST_DIR, 'bjs_test_output_age_national.json'),
    'age_state': os.path.join(TEST_DIR, 'bjs_test_output_age_state.json'),
    'sex_state': os.path.join(TEST_DIR, 'bjs_test_output_sex_state.json'),
}

expected_dtype = {
    'state_name': str,
    'state_fips': str,
    "prison_per_100k": float,
    "prison_pct_share": float,
    "population": object,
    "population_pct": float,
}
expected_dtype_age = {
    **expected_dtype,
    'age': str,
}
expected_dtype_race = {
    **expected_dtype,
    'race_and_ethnicity': str,
    'race': str,
    'race_includes_hispanic': object,
    'race_category_id': str,
}

expected_dtype_sex = {
    **expected_dtype,
    'sex': str,
}

# INTEGRATION TEST - NATIONAL AGE


@ mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_get_pop_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             return_value=get_state_fips_codes_as_df())
def testGenerateBreakdownAgeNational(mock_fips: mock.MagicMock, mock_pop: mock.MagicMock):

    df_10 = _get_standardized_table10()
    df_13 = _get_standardized_table13()

    datasource = BJSIncarcerationData()
    df = datasource.generate_breakdown_df(
        "age", "national", [df_10, df_13])

    expected_df_age_national = pd.read_json(
        GOLDEN_DATA['age_national'], dtype=expected_dtype_age)

    assert_frame_equal(df, expected_df_age_national, check_like=True)

# INTEGRATION TEST - STATE AGE


@ mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_get_pop_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             return_value=get_state_fips_codes_as_df())
def testGenerateBreakdownAgeState(mock_fips: mock.MagicMock, mock_pop: mock.MagicMock):

    df_2 = _get_standardized_table2()
    df_13 = _get_standardized_table13()
    df_23 = _get_standardized_table23()

    datasource = BJSIncarcerationData()
    df = datasource.generate_breakdown_df(
        "age", "state", [df_2, df_13, df_23])

    expected_df_age_state = pd.read_json(
        GOLDEN_DATA['age_state'], dtype=expected_dtype_age)

    assert_frame_equal(df, expected_df_age_state, check_like=True)


# INTEGRATION TEST - NATIONAL RACE


@ mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_get_pop_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             return_value=get_state_fips_codes_as_df())
def testGenerateBreakdownRaceNational(mock_fips: mock.MagicMock, mock_pop: mock.MagicMock):

    df_app_2 = _get_standardized_table_app2()
    df_23 = _get_standardized_table23()

    datasource = BJSIncarcerationData()
    df = datasource.generate_breakdown_df(
        "race_and_ethnicity", "national", [df_app_2, df_23])

    expected_df_race_national = pd.read_json(
        GOLDEN_DATA['race_national'], dtype=expected_dtype_race)

    assert_frame_equal(df, expected_df_race_national, check_like=True)


# INTEGRATION TEST - STATE SEX


@ mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_get_pop_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             return_value=get_state_fips_codes_as_df())
def testGenerateBreakdownSexState(mock_fips: mock.MagicMock, mock_pop: mock.MagicMock):

    df_2 = _get_standardized_table2()
    df_23 = _get_standardized_table23()

    datasource = BJSIncarcerationData()
    df = datasource.generate_breakdown_df(
        "sex", "state", [df_2, df_23])

    expected_df_sex_state = pd.read_json(
        GOLDEN_DATA['sex_state'], dtype=expected_dtype_sex)

    assert_frame_equal(df, expected_df_sex_state, check_like=True)


# INTEGRATION TEST - CORRECT NETWORK CALLS


@ mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_get_pop_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             return_value=get_state_fips_codes_as_df())
@ mock.patch('datasources.bjs_incarceration.load_tables',
             return_value=get_test_table_files())
@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
def testWriteToBqNetworkCalls(mock_bq: mock.MagicMock,
                              mock_zip: mock.MagicMock,
                              mock_fips: mock.MagicMock,
                              mock_pop: mock.MagicMock
                              ):

    datasource = BJSIncarcerationData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    datasource.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 6

    # Un-comment to view output
    # mock_df_national_age = mock_bq.call_args_list[0][0][0]
    # mock_df_national_race = mock_bq.call_args_list[1][0][0]
    # mock_df_national_sex = mock_bq.call_args_list[2][0][0]
    # mock_df_state_age = mock_bq.call_args_list[3][0][0]
    # mock_df_state_race = mock_bq.call_args_list[4][0][0]
    # mock_df_state_sex = mock_bq.call_args_list[5][0][0]

    assert mock_zip.call_count == 1

    assert mock_fips.call_count == 7
    for call_arg in mock_fips.call_args_list:
        assert call_arg.args[1] == "fips_codes_states"

    assert mock_pop.call_count == 10
    assert mock_pop.call_args_list[0].args[1] == 'by_age_national'
    assert mock_pop.call_args_list[1].args[1] == 'by_age_national'
    assert mock_pop.call_args_list[2].args[1] == 'by_race_national'
    assert mock_pop.call_args_list[3].args[1] == 'by_sex_national'
    assert mock_pop.call_args_list[4].args[1] == 'by_age_state'
    assert mock_pop.call_args_list[5].args[1] == 'by_age_territory'
    assert mock_pop.call_args_list[6].args[1] == 'by_race_state_std'
    assert mock_pop.call_args_list[7].args[1] == 'by_race_and_ethnicity_territory'
    assert mock_pop.call_args_list[8].args[1] == 'by_sex_state'
    assert mock_pop.call_args_list[9].args[1] == 'by_sex_territory'
