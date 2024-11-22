from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.cdc_hiv import CDCHIVData, DTYPE, NA_VALUES
import pandas as pd
import os

HIV_DIR = "cdc_hiv"
BLACK_HIV_DIR = "cdc_hiv_black_women"
COLS_TO_EXCLUDE = ("Indictor", "Transmission Category", "Rate LCI", "Rate UCI")
RACE_COLS_TO_EXCLUDE = COLS_TO_EXCLUDE + ("Age Group", "Sex")
AGE_COLS_TO_EXCLUDE = COLS_TO_EXCLUDE + ("Race/Ethnicity", "Sex")
SEX_COLS_TO_EXCLUDE = COLS_TO_EXCLUDE + ("Age Group", "Race/Ethnicity")

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, HIV_DIR, "golden_data")
BLACK_GOLDEN_DIR = os.path.join(TEST_DIR, BLACK_HIV_DIR, "golden_data")

GOLDEN_DATA = {
    "age_national_current": os.path.join(GOLDEN_DIR, "age_national_current.csv"),
    "age_national_historical": os.path.join(GOLDEN_DIR, "age_national_historical.csv"),
    "race_age_national": os.path.join(GOLDEN_DIR, "by_race_age_national.csv"),
    "race_national_current": os.path.join(GOLDEN_DIR, "race_and_ethnicity_national_current.csv"),
    "race_national_historical": os.path.join(GOLDEN_DIR, "race_and_ethnicity_national_historical.csv"),
    "sex_state_current": os.path.join(GOLDEN_DIR, "sex_state_current.csv"),
    "sex_state_historical": os.path.join(GOLDEN_DIR, "sex_state_historical.csv"),
    "sex_county_current": os.path.join(GOLDEN_DIR, "sex_county_current.csv"),
    "sex_county_historical": os.path.join(GOLDEN_DIR, "sex_county_historical.csv"),
    "black_women_national_current": os.path.join(BLACK_GOLDEN_DIR, "black_women_national_current.csv"),
    "black_women_national_historical": os.path.join(BLACK_GOLDEN_DIR, "black_women_national_historical.csv"),
}

EXP_DTYPE = {"state_fips": str, "county_fips": str, "time_period": str}


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    subdirectory = kwargs["subdirectory"]

    print("MOCKING FILE READ:", directory, subdirectory, filename)
    usecols = kwargs["usecols"]
    df = pd.read_csv(
        os.path.join(TEST_DIR, directory, subdirectory, filename),
        dtype=DTYPE,
        na_values=NA_VALUES,
        usecols=usecols,
        thousands=",",
    )
    return df


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_race_national(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCHIVData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="race", geographic="national")

    assert mock_data_dir.call_count == 20

    assert mock_bq.call_count == 3
    (
        mock_bq_race_age_national,
        mock_bq_race_national_current,
        mock_bq_race_national_historical,
    ) = mock_bq.call_args_list

    # RACE/AGE NATIONAL TABLE NEEDED FOR AGE ADJUSTMENT
    (
        race_age_national_df,
        _dataset,
        race_age_table_name,
    ), _col_types = mock_bq_race_age_national
    assert race_age_table_name == "by_race_age_national"
    expected_race_age_national_df = pd.read_csv(GOLDEN_DATA["race_age_national"], dtype=EXP_DTYPE)

    race_age_national_df = race_age_national_df.sort_values(by=['time_period', 'race_and_ethnicity']).reset_index(
        drop=True
    )
    expected_race_age_national_df = expected_race_age_national_df.sort_values(
        by=['time_period', 'race_and_ethnicity']
    ).reset_index(drop=True)

    assert_frame_equal(race_age_national_df, expected_race_age_national_df, check_like=True)

    # BY RACE NATIONAL CURRENT
    (
        race_national_current_df,
        _dataset,
        race_current_table_name,
    ), _col_types = mock_bq_race_national_current
    assert race_current_table_name == "by_race_and_ethnicity_national_current"
    expected_race_national_current_df = pd.read_csv(GOLDEN_DATA["race_national_current"], dtype=EXP_DTYPE)

    race_national_current_df = race_national_current_df.sort_values(by=['race_and_ethnicity']).reset_index(drop=True)
    expected_race_national_current_df = expected_race_national_current_df.sort_values(
        by=['race_and_ethnicity']
    ).reset_index(drop=True)

    assert_frame_equal(
        race_national_current_df,
        expected_race_national_current_df,
        check_like=True,
    )

    # BY RACE NATIONAL HISTORICAL
    (
        race_national_historical_df,
        _dataset,
        race_historical_table_name,
    ), _col_types = mock_bq_race_national_historical

    assert race_historical_table_name == "by_race_and_ethnicity_national_historical"
    expected_race_national_historical_df = pd.read_csv(GOLDEN_DATA["race_national_historical"], dtype=EXP_DTYPE)

    assert_frame_equal(
        race_national_historical_df.sort_values(by=['time_period', 'race_and_ethnicity']).reset_index(drop=True),
        expected_race_national_historical_df.sort_values(by=['time_period', 'race_and_ethnicity']).reset_index(
            drop=True
        ),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_age_national(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCHIVData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="age", geographic="national")

    assert mock_data_dir.call_count == 16

    assert mock_bq.call_count == 2
    (
        mock_bq_age_national_current,
        mock_bq_age_national_historical,
    ) = mock_bq.call_args_list

    (
        age_national_current_df,
        _dataset,
        table_name,
    ), _col_types = mock_bq_age_national_current
    assert table_name == "by_age_national_current"
    expected_age_national_current_df = pd.read_csv(GOLDEN_DATA["age_national_current"], dtype=EXP_DTYPE)

    age_national_current_df = age_national_current_df.sort_values(by=['age']).reset_index(drop=True)
    expected_age_national_current_df = expected_age_national_current_df.sort_values(by=['age']).reset_index(drop=True)

    assert_frame_equal(
        age_national_current_df,
        expected_age_national_current_df,
        check_like=True,
    )

    (
        age_national_historical_df,
        _dataset,
        table_name,
    ), _col_types = mock_bq_age_national_historical
    assert table_name == "by_age_national_historical"
    expected_age_national_historical_df = pd.read_csv(GOLDEN_DATA["age_national_historical"], dtype=EXP_DTYPE)

    age_national_historical_df = age_national_historical_df.sort_values(by=['time_period', 'age']).reset_index(
        drop=True
    )
    expected_age_national_historical_df = expected_age_national_historical_df.sort_values(
        by=['time_period', 'age']
    ).reset_index(drop=True)

    assert_frame_equal(
        age_national_historical_df,
        expected_age_national_historical_df,
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_sex_state(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCHIVData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="sex", geographic="state")

    assert mock_data_dir.call_count == 11

    assert mock_bq.call_count == 2
    mock_bq_sex_state_current, mock_bq_sex_state_historical = mock_bq.call_args_list

    (sex_state_current_df, _dataset, table_name), _col_types = mock_bq_sex_state_current
    assert table_name == "by_sex_state_current"
    expected_sex_state_current_df = pd.read_csv(GOLDEN_DATA["sex_state_current"], dtype=EXP_DTYPE)

    sex_state_current_df = sex_state_current_df.sort_values(by=['state_name', 'sex']).reset_index(drop=True)
    expected_sex_state_current_df = expected_sex_state_current_df.sort_values(by=['state_name', 'sex']).reset_index(
        drop=True
    )

    assert_frame_equal(
        sex_state_current_df,
        expected_sex_state_current_df,
        check_like=True,
    )

    (
        sex_state_historical_df,
        _dataset,
        table_name,
    ), _col_types = mock_bq_sex_state_historical
    assert table_name == "by_sex_state_historical"
    expected_sex_state_historical_df = pd.read_csv(GOLDEN_DATA["sex_state_historical"], dtype=EXP_DTYPE)

    sex_state_historical_df = sex_state_historical_df.sort_values(by=['time_period', 'sex', 'state_name']).reset_index(
        drop=True
    )
    expected_sex_state_historical_df = expected_sex_state_historical_df.sort_values(
        by=['time_period', 'sex', 'state_name']
    ).reset_index(drop=True)

    assert_frame_equal(
        sex_state_historical_df,
        expected_sex_state_historical_df,
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_sex_county(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCHIVData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="sex", geographic="county")

    assert mock_data_dir.call_count == 8

    assert mock_bq.call_count == 2
    mock_bq_sex_county_current, mock_bq_sex_county_historical = mock_bq.call_args_list

    (
        sex_county_current_df,
        _dataset,
        table_name,
    ), _col_types = mock_bq_sex_county_current
    assert table_name == "by_sex_county_current"
    expected_sex_county_current_df = pd.read_csv(GOLDEN_DATA["sex_county_current"], dtype=EXP_DTYPE)

    assert_frame_equal(sex_county_current_df, expected_sex_county_current_df, check_like=True)

    (
        sex_county_historical_df,
        _dataset,
        table_name,
    ), _col_types = mock_bq_sex_county_historical
    assert table_name == "by_sex_county_historical"
    expected_sex_county_historical_df = pd.read_csv(GOLDEN_DATA["sex_county_historical"], dtype=EXP_DTYPE)
    assert_frame_equal(
        sex_county_historical_df.sort_values(by=['time_period', 'sex']).reset_index(drop=True),
        expected_sex_county_historical_df.sort_values(by=['time_period', 'sex']).reset_index(drop=True),
        check_like=True,
    )


@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_black_women_national(
    mock_data_dir: mock.MagicMock,
    mock_bq: mock.MagicMock,
):
    datasource = CDCHIVData()
    datasource.write_to_bq("dataset", "gcs_bucket", demographic="black_women", geographic="national")

    assert mock_data_dir.call_count == 6

    assert mock_bq.call_count == 2
    (
        mock_bq_black_women_national_current,
        mock_bq_black_women_national_historical,
    ) = mock_bq.call_args_list

    (
        black_women_national_current_df,
        _dataset,
        table_name,
    ), _col_types = mock_bq_black_women_national_current
    assert table_name == "black_women_by_age_national_current"
    expected_black_women_national_current_df = pd.read_csv(GOLDEN_DATA["black_women_national_current"], dtype=EXP_DTYPE)
    assert_frame_equal(
        black_women_national_current_df.sort_values(by=['age']).reset_index(drop=True),
        expected_black_women_national_current_df.sort_values(by=['age']).reset_index(drop=True),
        check_like=True,
    )

    (
        black_women_national_historical_df,
        _dataset,
        table_name,
    ), _col_types = mock_bq_black_women_national_historical
    assert table_name == "black_women_by_age_national_historical"
    expected_black_women_national_historical_df = pd.read_csv(
        GOLDEN_DATA["black_women_national_historical"], dtype=EXP_DTYPE
    )
    assert_frame_equal(
        black_women_national_historical_df.sort_values(by=['time_period', 'age']).reset_index(drop=True),
        expected_black_women_national_historical_df.sort_values(by=['time_period', 'age']).reset_index(drop=True),
        check_like=True,
    )
