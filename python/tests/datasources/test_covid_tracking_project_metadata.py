from unittest import mock
import pandas as pd
from pandas._testing import assert_frame_equal

from datasources.covid_tracking_project_metadata import CtpMetadata
import ingestion.standardized_columns as col_std


def generate_test_data() -> pd.DataFrame:
    # This is a subset of possible columns.
    base_cols = [
        'api', 'defines_other', 'race_ethnicity_separately',
        'race_ethnicity_combined', 'race_mutually_exclusive',
        'combined_category_other_than_api', 'race', 'ethnicity',
        'ai_an', 'asian', 'white', 'black']

    cols = []
    for col in base_cols:
        cols.extend([col + '_cases', col + '_death'])
    states = ['AL', 'PA', 'GA']
    data = [[0 for j in range(len(cols))] for i in range(len(states))]

    df = pd.DataFrame(data, columns=cols)
    df['state_postal_abbreviation'] = states
    # AL: race_includes_hispanic == True
    # PA: race_includes_hispanic == False
    # GA: race_includes_hispanic == True, reports_ethnicity == False
    df.at[0, 'race_ethnicity_separately_cases'] = 1
    df.at[0, 'race_ethnicity_separately_death'] = 1
    df.at[1, 'race_ethnicity_combined_cases'] = 1
    df.at[1, 'race_ethnicity_combined_death'] = 1
    df['race_cases'] = [1, 1, 1]
    df['race_death'] = [1, 1, 1]
    df['ethnicity_cases'] = [1, 1, 0]
    df['ethnicity_death'] = [1, 1, 0]
    df.at[0, 'api_cases'] = 1
    df.at[0, 'api_death'] = 1
    df.at[1, 'combined_category_other_than_api_cases'] = 1
    df.at[1, 'combined_category_other_than_api_death'] = 1
    return df


def get_expected_data() -> pd.DataFrame:
    expected_cols = [
        col_std.STATE_POSTAL_COL,
        'variable_type',
        'reports_api',
        'race_includes_hispanic',
        'race_mutually_exclusive',
        'reports_ind',
        'reports_race',
        'reports_ethnicity']
    expected_data = [
        ['AL', 'cases',  1, 1, 0, 0, 1, 1],
        ['AL', 'deaths', 1, 1, 0, 0, 1, 1],
        ['PA', 'cases',  0, 0, 0, 1, 1, 1],
        ['PA', 'deaths', 0, 0, 0, 1, 1, 1],
        ['GA', 'cases',  0, 1, 0, 0, 1, 0],
        ['GA', 'deaths', 0, 1, 0, 0, 1, 0],
    ]
    return pd.DataFrame(expected_data, columns=expected_cols)


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df',
            return_value=generate_test_data())
@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq')
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    ctp = CtpMetadata()
    kwargs = {'filename': 'test_file.csv', 'table_name': 'output_table'}
    ctp.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    result = mock_bq.call_args.args[0]
    expected = get_expected_data()
    # Check that the contents of the dataframes are the same, ignoring column order.
    assert_frame_equal(
        result.set_index(
            [col_std.STATE_POSTAL_COL, 'variable_type'], drop=False),
        expected.set_index(
            [col_std.STATE_POSTAL_COL, 'variable_type'], drop=False),
        check_like=True)
