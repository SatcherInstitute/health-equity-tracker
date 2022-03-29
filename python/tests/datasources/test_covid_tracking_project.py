from io import StringIO
from unittest import mock

import numpy as np
import pandas as pd
import pytest

from datasources.covid_tracking_project import CovidTrackingProject
import ingestion.standardized_columns as col_std


# This is all fake data, does not reflect real values.
test_csv_data = """Date,State,Cases_Total,Cases_White,Cases_Black,Cases_LatinX,Cases_Asian,Cases_AIAN,Cases_NHPI,Cases_Multiracial,Cases_Other,Cases_Unknown,Cases_Ethnicity_Hispanic,Cases_Ethnicity_NonHispanic,Cases_Ethnicity_Unknown,Deaths_Total,Deaths_White,Deaths_Black,Deaths_LatinX,Deaths_Asian,Deaths_AIAN,Deaths_NHPI,Deaths_Multiracial,Deaths_Other,Deaths_Unknown,Deaths_Ethnicity_Hispanic,Deaths_Ethnicity_NonHispanic,Deaths_Ethnicity_Unknown,Hosp_Total,Hosp_White,Hosp_Black,Hosp_LatinX,Hosp_Asian,Hosp_AIAN,Hosp_NHPI,Hosp_Multiracial,Hosp_Other,Hosp_Unknown,Hosp_Ethnicity_Hispanic,Hosp_Ethnicity_NonHispanic,Hosp_Ethnicity_Unknown,Tests_Total,Tests_White,Tests_Black,Tests_LatinX,Tests_Asian,Tests_AIAN,Tests_NHPI,Tests_Multiracial,Tests_Other,Tests_Unknown,Tests_Ethnicity_Hispanic,Tests_Ethnicity_NonHispanic,Tests_Ethnicity_Unknown
20201206,AK,37036,11070,1004,,1353,7323,1083,2605,4477,8121,1864,17628,17544,143,50,6,,13,54,9,6,3,2,1,118,24,799,239,33,,59,216,87,56,32,77,25,563,211,,,,,,,,,,,,,
20201206,AS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
20201206,DE,39912,17298,9804,7585,700,,,,2236,2289,7585,30038,2289,793,527,198,53,2,,,,12,1,53,739,1,,,,,,,,,,,,,,440766,213710,80219,34648,10150,,,,40634,10150,34648,338727,61405
20201206,ID,"110,510","58,632",677,,698,1390,247,0,8943,39923,12650,42979,54880,1035,967,7,,9,18,,,16,18,111,908,16,,,,,,,,,,,,,,,,,,,,,,,,,,
20201202,DE,36698,15755,9073,7128,639,,,,1977,2126,7128,27444,2126,779,517,194,53,2,,,,12,1,53,725,1,,,,,,,,,,,,,,428533,207277,77588,33442,9778,,,,39320,9778,33442,328085,61128
20201202,HI,18044,1780,296,,4020,,5358,,500,6090,,,,244,20,5,,137,,71,,5,6,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
20201202,ID,104734,55855,653,,673,1353,235,0,8566,37399,12293,41108,51332,991,931,7,,9,18,,,16,10,109,874,8,,,,,,,,,,,,,,,,,,,,,,,,,,
"""
_RACE_CATEGORIES = 13
_VARIABLE_TYPES = 4
_NUM_ROWS = 7

metadata_cols = [
    col_std.STATE_POSTAL_COL,
    'variable_type',
    'reports_race',
    'reports_api',
    'reports_ind',
    'race_ethnicity_separately'
]
test_metadata = [
    ['AK', 'cases', True, False, False, True],
    ['AS', 'cases', False, False, False, False],
    ['DE', 'cases', True, True, False, True],
    ['ID', 'cases', True, True, False, True],
    ['HI', 'cases', True, False, True, False],
    ['AK', 'deaths', True, False, False, True],
    ['AS', 'deaths', False, False, False, False],
    ['DE', 'deaths', True, False, False, True],
    ['ID', 'deaths', True, True, False, True],
    ['HI', 'deaths', True, False, True, False]
]


def get_test_data_as_df():
    f = StringIO(test_csv_data)
    return pd.read_csv(f, parse_dates=['Date'], thousands=',')


def get_test_metadata_as_df():
    return pd.DataFrame(test_metadata, columns=metadata_cols)


@mock.patch('datasources.covid_tracking_project.CovidTrackingProject._download_metadata',
            return_value=get_test_metadata_as_df())
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df',
            return_value=get_test_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
            return_value=None)
def testWriteToBq(mock_append_to_bq: mock.MagicMock, mock_csv: mock.MagicMock,
                  mock_download: mock.MagicMock):
    ctp = CovidTrackingProject()
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}
    ctp.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_append_to_bq.call_count == 4
    var_types = ['cases', 'deaths', 'tests', 'hosp']
    for i in range(len(var_types)):
        result = mock_append_to_bq.call_args_list[i].args[0]
        expected_rows = (_RACE_CATEGORIES - 1) * _NUM_ROWS
        expected_col_names = [
            'date', col_std.STATE_POSTAL_COL, col_std.RACE_COL,
            var_types[i], 'reports_race', 'race_ethnicity_separately']
        assert result.shape == (expected_rows, len(expected_col_names))
        assert set(result.columns) == set(expected_col_names)
        expected_ind_rows = {'cases': 1, 'deaths': 1}
        assert (len(result.loc[
            result['race'] == col_std.Race.INDIGENOUS.race].index) ==
            expected_ind_rows.get(var_types[i], 0))
        expected_api_rows = {'cases': 4, 'deaths': 2}
        assert (len(result.loc[
            result['race'] == col_std.Race.API.race].index) ==
            expected_api_rows.get(var_types[i], 0))
        expected_dtypes = {col: np.object for col in result.columns}
        expected_dtypes[var_types[i]] = np.float64
        for col in result.columns:
            assert result[col].dtype == expected_dtypes[col]


def testStandardize():
    ctp = CovidTrackingProject()
    df = get_test_data_as_df()
    df = ctp.standardize(df)

    expected_cols = {
        'date', col_std.STATE_POSTAL_COL, col_std.RACE_COL, 'variable_type', 'value'
    }
    assert set(df.columns) == expected_cols

    expected_race_categories = [r.race for r in col_std.Race]
    assert set(df[col_std.RACE_COL]).issubset(set(expected_race_categories))


def testMergeWithMetadata():
    ctp = CovidTrackingProject()
    df = get_test_data_as_df()
    mdf = get_test_metadata_as_df()

    df = ctp.standardize(df)
    df = ctp.merge_with_metadata(df, mdf)

    expected_cols = {
        'date', col_std.STATE_POSTAL_COL, col_std.RACE_COL, 'variable_type', 'value',
        'reports_race', 'race_ethnicity_separately'
    }
    assert set(df.columns) == expected_cols

    expected_race_categories = {
        col_std.Race.AIAN.race,
        col_std.Race.API.race,
        col_std.Race.ASIAN.race,
        col_std.Race.BLACK.race,
        col_std.Race.HISP.race,
        col_std.Race.INDIGENOUS.race,
        col_std.Race.NHPI.race,
        col_std.Race.MULTI.race,
        col_std.Race.WHITE.race,
        col_std.Race.NH.race,
        col_std.Race.ETHNICITY_UNKNOWN.race,
        col_std.Race.OTHER_NONSTANDARD.race,
        col_std.Race.UNKNOWN.race,
        col_std.Race.TOTAL.race
    }
    assert set(df[col_std.RACE_COL]) == expected_race_categories


def testWriteToBq_MissingAttr():
    ctp = CovidTrackingProject()
    kwargs = {}
    with pytest.raises(RuntimeError, match=r'filename not found'):
        ctp.write_to_bq('dataset', 'gcs_bucket', **kwargs)


@mock.patch('datasources.covid_tracking_project.CovidTrackingProject._download_metadata',
            return_value=pd.DataFrame({}))
@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df',
            return_value=get_test_data_as_df())
def testWriteToBq_MetadataMissing(mock_csv: mock.MagicMock,
                                  mock_download: mock.MagicMock):
    ctp = CovidTrackingProject()
    kwargs = {'filename': 'test_file.csv',
              'table_name': 'output_table'}
    with pytest.raises(RuntimeError,
                       match=r'BigQuery call to dataset returned 0 rows'):
        ctp.write_to_bq('dataset', 'gcs_bucket', **kwargs)
