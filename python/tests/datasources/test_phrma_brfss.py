from unittest import mock
from datasources.phrma_brfss import PhrmaBrfssData, PHRMA_DIR
import pandas as pd
import os

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')
GOLDEN_DIR = os.path.join(TEST_DIR, PHRMA_DIR, 'golden_data')
REAL_DATA_DIR = os.path.abspath("./data")


GOLDEN_DATA = {
    'race_and_ethnicity_national': os.path.join(GOLDEN_DIR, 'expected_race_and_ethnicity_national.csv'),
}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    print("ACTUALLY LOADING FROM /data", filename)
    dtype = kwargs['dtype']
    na_values = kwargs['na_values']
    subdirectory = kwargs['subdirectory']
    usecols = kwargs['usecols']
    file_path = os.path.join(REAL_DATA_DIR, directory, 'cancer_screening', subdirectory, filename)

    df = pd.read_csv(file_path, na_values=na_values, dtype=dtype, usecols=usecols)
    return df


# # # # BREAKDOWN TESTS


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_data_dir,
)
def testBreakdownRaceNational(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaBrfssData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="national")

    assert mock_data_dir.called

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'race_and_ethnicity_national'
    print("\ntable_name:", table_name)
    print(breakdown_df)
    # breakdown_df.to_csv(table_name, index=False)
