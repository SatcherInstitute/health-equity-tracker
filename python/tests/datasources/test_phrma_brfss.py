from unittest import mock
from datasources.phrma_brfss import PhrmaBrfssData, PHRMA_DIR
import os
from test_utils import _load_csv_as_df_from_real_data_dir

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, 'data')
GOLDEN_DIR = os.path.join(TEST_DIR, PHRMA_DIR, 'golden_data')


GOLDEN_DATA = {
    'race_and_ethnicity_national': os.path.join(GOLDEN_DIR, 'expected_race_and_ethnicity_national.csv'),
}


# # # BREAKDOWN TESTS


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_real_data_dir,
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


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownRaceState(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaBrfssData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race_and_ethnicity", geographic="state")

    assert mock_data_dir.called

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'race_and_ethnicity_state'
    print("\ntable_name:", table_name)
    print(breakdown_df)
    # breakdown_df.to_csv(table_name, index=False)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownAgeNational(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaBrfssData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="age", geographic="national")

    assert mock_data_dir.called

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'age_national'
    print("\ntable_name:", table_name)
    print(breakdown_df)
    # breakdown_df.to_csv(table_name, index=False)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownAgeState(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaBrfssData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="age", geographic="state")

    assert mock_data_dir.called

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'age_state'
    print("\ntable_name:", table_name)
    print(breakdown_df)
    # breakdown_df.to_csv(table_name, index=False)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownInsuranceNational(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaBrfssData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="insurance_status", geographic="national")

    assert mock_data_dir.called

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'insurance_status_national'
    print("\ntable_name:", table_name)
    print(breakdown_df)
    # breakdown_df.to_csv(table_name, index=False)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownInsuranceState(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaBrfssData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="insurance_status", geographic="state")

    assert mock_data_dir.called

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'insurance_status_state'
    print("\ntable_name:", table_name)
    print(breakdown_df)
    # breakdown_df.to_csv(table_name, index=False)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownEducationNational(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaBrfssData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="education", geographic="national")

    assert mock_data_dir.called

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'education_national'
    print("\ntable_name:", table_name)
    print(breakdown_df)
    # breakdown_df.to_csv(table_name, index=False)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownEducationState(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaBrfssData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="education", geographic="state")

    assert mock_data_dir.called

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'education_state'
    print("\ntable_name:", table_name)
    print(breakdown_df)
    # breakdown_df.to_csv(table_name, index=False)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownIncomeNational(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaBrfssData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="income", geographic="national")

    assert mock_data_dir.called

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'income_national'
    print("\ntable_name:", table_name)
    print(breakdown_df)
    # breakdown_df.to_csv(table_name, index=False)


@mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq', return_value=None)
@mock.patch(
    'ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir',
    side_effect=_load_csv_as_df_from_real_data_dir,
)
def testBreakdownIncomeState(
    mock_data_dir: mock.MagicMock,
    mock_bq_write: mock.MagicMock,
):
    datasource = PhrmaBrfssData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="income", geographic="state")

    assert mock_data_dir.called

    (breakdown_df, _dataset, table_name), _dtypes = mock_bq_write.call_args
    assert table_name == 'income_state'
    print("\ntable_name:", table_name)
    print(breakdown_df)
    # breakdown_df.to_csv(table_name, index=False)
