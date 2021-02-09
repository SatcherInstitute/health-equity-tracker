import pandas as pd
from unittest import mock

from datasources.covid_tracking_project_metadata import CtpMetadata


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
    data = {}
    for col in cols:
        data[col] = [1, 0, 1]
    data['state_postal_abbreviation'] = states

    df = pd.DataFrame(data)
    return df


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe',
            return_value=generate_test_data())
@mock.patch('ingestion.gcs_to_bq_util.append_dataframe_to_bq')
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    ctp = CtpMetadata()
    kwargs = {'filename': 'test_file.csv', 'table_name': 'output_table'}
    ctp.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    result = mock_bq.call_args.args[0]
    expected_cols = [
         'state_postal_abbreviation', 'reports_api', 'defines_other',
         'race_ethnicity_separately', 'race_ethnicity_combined',
         'race_mutually_exclusive', 'reports_ind', 'reports_race',
         'reports_ethnicity', 'variable_type']
    assert set(result.columns) == set(expected_cols)
    # We should have a record for each state/variable_type (e.g. cases, death)
    # combo
    assert len(result.index) == 3 * 2
    assert result.loc[result['state_postal_abbreviation'] == 'AL'].all().all()
    assert not result.loc[result['state_postal_abbreviation'] == 'PA', 'reports_api':].any().any()
    assert result.loc[result['state_postal_abbreviation'] == 'GA'].all().all()
    assert result['variable_type'].isin(['cases', 'deaths']).all()
