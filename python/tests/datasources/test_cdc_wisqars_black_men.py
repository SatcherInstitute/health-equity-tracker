import os
from unittest import mock
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.cdc_wisqars_black_men import CDCWisqarsBlackMenData
from ingestion import standardized_columns as std_col
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, "cdc_wisqars", "golden_data")

DTYPE = {std_col.TIME_PERIOD_COL: str, std_col.STATE_FIPS_COL: str}

GOLDEN_DATA = {
    "black_men_by_urbanicity_national_current": os.path.join(
        GOLDEN_DIR, "black_men_by_urbanicity_national_current.csv"
    ),
    "black_men_by_urbanicity_national_historical": os.path.join(
        GOLDEN_DIR, "black_men_by_urbanicity_national_historical.csv"
    ),
    "black_men_by_urbanicity_state_current": os.path.join(GOLDEN_DIR, "black_men_by_urbanicity_state_current.csv"),
    "black_men_by_urbanicity_state_historical": os.path.join(
        GOLDEN_DIR, "black_men_by_urbanicity_state_historical.csv"
    ),
    "black_men_by_age_national_current": os.path.join(GOLDEN_DIR, "black_men_by_age_national_current.csv"),
    "black_men_by_age_national_historical": os.path.join(GOLDEN_DIR, "black_men_by_age_national_historical.csv"),
    "black_men_by_age_state_current": os.path.join(GOLDEN_DIR, "black_men_by_age_state_current.csv"),
    "black_men_by_age_state_historical": os.path.join(GOLDEN_DIR, "black_men_by_age_state_historical.csv"),
}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    print("\nLoading Test Source Data: ", directory, filename)
    use_cols = kwargs["usecols"]

    df = pd.read_csv(
        os.path.join(TEST_DIR, directory, filename),
        usecols=use_cols,
        na_values=["--"],
        dtype={"Year": str, "Population": float},
        thousands=",",
    )

    return df


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_black_men_by_urbanicity_national(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsBlackMenData()
    datasource.write_to_bq(
        "dataset",
        "gcs_bucket",
        demographic="urbanicity",
        geographic=NATIONAL_LEVEL,
    )

    # calls for the ALL source table and the BY_URBANICITY table
    assert mock_data_dir.call_count == 2

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "black_men_by_urbanicity_national_current"
    # actual_current_df.to_csv(table_name, index=False)

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "black_men_by_urbanicity_national_historical"
    # actual_historical_df.to_csv(table_name, index=False)

    actual_historical_df = actual_historical_df.sort_values(by=["time_period", "urbanicity"]).reset_index(drop=True)
    expected_historical_df = expected_historical_df.sort_values(by=["time_period", "urbanicity"]).reset_index(drop=True)

    # calls writing NATIONAL + STATE to bq
    assert mock_bq.call_count == 2

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_black_men_by_urbanicity_state(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsBlackMenData()
    datasource.write_to_bq(
        "dataset",
        "gcs_bucket",
        demographic="urbanicity",
        geographic=STATE_LEVEL,
    )

    # calls for the ALL source table and the BY_URBANICITY table
    assert mock_data_dir.call_count == 2

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "black_men_by_urbanicity_state_current"
    # actual_current_df.to_csv(table_name, index=False)

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "black_men_by_urbanicity_state_historical"
    # actual_historical_df.to_csv(table_name, index=False)

    # calls writing NATIONAL + STATE to bq
    assert mock_bq.call_count == 2

    actual_historical_df = actual_historical_df.sort_values(by=["time_period", "state_name", "urbanicity"]).reset_index(
        drop=True
    )
    expected_historical_df = expected_historical_df.sort_values(
        by=["time_period", "state_name", "urbanicity"]
    ).reset_index(drop=True)

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_black_men_by_age_national(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsBlackMenData()
    datasource.write_to_bq(
        "dataset",
        "gcs_bucket",
        demographic="age",
        geographic=NATIONAL_LEVEL,
    )

    # calls for the ALL source table and the BY_URBANICITY table
    assert mock_data_dir.call_count == 2

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "black_men_by_age_national_current"
    # actual_current_df.to_csv(table_name, index=False)

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "black_men_by_age_national_historical"
    # actual_historical_df.to_csv(table_name, index=False)

    # calls writing NATIONAL + STATE to bq
    assert mock_bq.call_count == 2

    actual_historical_df = actual_historical_df.sort_values(by=["time_period", "age"]).reset_index(drop=True)
    expected_historical_df = expected_historical_df.sort_values(by=["time_period", "age"]).reset_index(drop=True)

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_black_men_by_age_state(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsBlackMenData()
    datasource.write_to_bq(
        "dataset",
        "gcs_bucket",
        demographic="age",
        geographic=STATE_LEVEL,
    )

    # calls for the ALL source table and the BY_URBANICITY table
    assert mock_data_dir.call_count == 2

    (mock_current, mock_historical) = mock_bq.call_args_list

    actual_current_df, _, table_name = mock_current[0]
    expected_current_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "black_men_by_age_state_current"
    # actual_current_df.to_csv(table_name, index=False)

    actual_historical_df, _, table_name = mock_historical[0]
    expected_historical_df = pd.read_csv(GOLDEN_DATA[table_name], dtype=DTYPE)
    assert table_name == "black_men_by_age_state_historical"
    # actual_historical_df.to_csv(table_name, index=False)

    # calls writing NATIONAL + STATE to bq
    assert mock_bq.call_count == 2

    actual_historical_df = actual_historical_df.sort_values(by=["time_period", "state_name", "age"]).reset_index(
        drop=True
    )
    expected_historical_df = expected_historical_df.sort_values(by=["time_period", "state_name", "age"]).reset_index(
        drop=True
    )

    assert_frame_equal(actual_current_df, expected_current_df, check_like=True)
    assert_frame_equal(actual_historical_df, expected_historical_df, check_like=True)
