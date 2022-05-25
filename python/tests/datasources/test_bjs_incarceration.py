from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
import ingestion.standardized_columns as std_col
from test_utils import get_state_fips_codes_as_df
from datasources.bjs import (BJSData)
from datasources.bjs_prisoners_tables_utils import (
    missing_data_to_none,
    swap_race_col_names_to_codes,
    filter_cols,
    set_state_col,
    bjs_prisoners_tables,
    keep_only_states,
    keep_only_national,
    strip_footnote_refs_from_df,
    cols_to_rows,
)


# UNIT TESTS

def test_set_state_col():

    _fake_df = pd.DataFrame({
        'Jurisdiction': ["Federal", None, None],
        'Unnamed: 1': [None, "Georgia", "Alaska"],
        'ignored_values': [1.0, 1.0, 1.0]
    })
    _expected_df_set_state_cols = pd.DataFrame({
        std_col.STATE_NAME_COL: ["Federal", "Georgia", "Alaska"],
        'Jurisdiction': ["Federal", None, None],
        'Unnamed: 1': [None, "Georgia", "Alaska"],
        'ignored_values': [1.0, 1.0, 1.0]
    })

    assert_frame_equal(
        set_state_col(_fake_df),
        _expected_df_set_state_cols,
        check_like=True)


def test_filter_cols():

    _fake_by_sex_df = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        'Male': [2.0, 4.0, 6.0],
        'Female': [1.0, 3.0, 5.0],
        'ignored_values': [1.0, 1.0, 1.0]
    })

    _expected_by_sex_filtered_cols = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        'Male': [2.0, 4.0, 6.0],
        'Female': [1.0, 3.0, 5.0],
    })

    assert_frame_equal(
        filter_cols(_fake_by_sex_df, std_col.SEX_COL),
        _expected_by_sex_filtered_cols,
        check_like=True)


_fake_by_race_df = pd.DataFrame({
    std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
    'Asian': [1_000_000, "~", 1000],
    'Black': [1_000_000, 100, "/"]
})

_expected_by_race_df_missing_to_none = pd.DataFrame({
    std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida"],
    'Asian': [1_000_000, None, 1000],
    'Black': [1_000_000, 100, None]
})

_expected_by_race_df_only_states = pd.DataFrame({
    std_col.STATE_NAME_COL: ["Maine", "Florida"],
    'Asian': ["~", 1000],
    'Black': [100, "/"]
})


def test_missing_data_to_none():
    assert missing_data_to_none(
        _fake_by_race_df).equals(_expected_by_race_df_missing_to_none)


def test_keep_only_states():
    assert keep_only_states(
        _fake_by_race_df).reset_index(drop=True).equals(
            _expected_by_race_df_only_states.reset_index(drop=True))


def test_keep_only_national():
    _fake_by_age_df_with_total = pd.DataFrame({
        std_col.STATE_NAME_COL: ["Federal", "Maine", "Florida", ],
        '15-17': [1000, 100, 10],
        '18+': [1_000_000, 100_000, 10_000]
    })

    _fake_by_age_df_without_total = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        '15-17': [1110, 100, 10],
        '18+': [1_110_000, 100_000, 10_000]
    })

    _expected_by_age_df_only_national = pd.DataFrame({
        std_col.STATE_NAME_COL: ["United States", ],
        '15-17': [1110],
        '18+': [1_110_000]
    })

    assert_frame_equal(
        keep_only_national(_fake_by_age_df_with_total,
                           ["15-17", "18+"]),
        _expected_by_age_df_only_national,
        check_like=True)

    assert_frame_equal(
        keep_only_national(_fake_by_age_df_without_total,
                           ["15-17",
                            "18+"]),
        _expected_by_age_df_only_national,
        check_like=True)


def test_cols_to_rows():

    _fake_bjs_table_df = pd.DataFrame({
        std_col.STATE_NAME_COL: ["Maine", "Florida", ],
        'Asian': [100, 200],
        'Black': [1000, 2000]
    })

    _expected_bjs_table_df_flipped_cols_to_rows = pd.DataFrame({
        std_col.STATE_NAME_COL: ["Maine", "Florida", "Maine", "Florida", ],
        'race': ["Asian", "Asian", "Black", "Black"],
        'some_value': [100, 200, 1000, 2000]
    })

    assert_frame_equal(
        cols_to_rows(_fake_bjs_table_df, [
            "Asian", "Black"], "race", "some_value"),
        _expected_bjs_table_df_flipped_cols_to_rows,
        check_like=True)


def test_strip_footnote_refs():
    _fake_df_with_footnote_refs = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total/a", "Maine/b,c", "Florida", ],
        'Asian/e': [1, 2, 3],
        'Black': [4, 5, 6]
    })

    _expected_df_stripped_of_footnote_refs = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        'Asian': [1, 2, 3],
        'Black': [4, 5, 6]
    })

    assert_frame_equal(
        strip_footnote_refs_from_df(_fake_df_with_footnote_refs),
        _expected_df_stripped_of_footnote_refs,
        check_like=True)


def test_swap_race_col_names_to_codes():

    _fake_df = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        'American Indian/Alaska Native': [1, 2, 3],
        'Total': [4, 5, 6]
    })

    _expected_df_swapped_cols = pd.DataFrame({
        std_col.STATE_NAME_COL: ["U.S. total", "Maine", "Florida", ],
        'AIAN_NH': [1, 2, 3],
        'ALL': [4, 5, 6]
    })

    assert_frame_equal(
        swap_race_col_names_to_codes(_fake_df),
        _expected_df_swapped_cols,
        check_like=True)

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


# INTEGRATION TEST SETUP
# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "bjs_corrections")

GOLDEN_DATA = {
    'race_and_ethnicity_national': os.path.join(TEST_DIR, 'bjs_test_output_race_and_ethnicity_national.json'),
    'race_national': os.path.join(TEST_DIR, 'bjs_test_output_race_and_ethnicity_national.json'),
    'race_and_ethnicity_state': os.path.join(TEST_DIR, 'bjs_test_output_race_and_ethnicity_state.json'),
    'race_state': os.path.join(TEST_DIR, 'bjs_test_output_race_and_ethnicity_state.json'),
    'age_national': os.path.join(TEST_DIR, 'bjs_test_output_age_national.json'),
    'age_state': os.path.join(TEST_DIR, 'bjs_test_output_age_state.json'),
    'sex_national': os.path.join(TEST_DIR, 'bjs_test_output_sex_national.json'),
    'sex_state': os.path.join(TEST_DIR, 'bjs_test_output_sex_state.json'),
}


# RUN INTEGRATION TESTS ON NATIONAL LEVEL


@ mock.patch('ingestion.gcs_to_bq_util.load_df_from_bigquery', side_effect=_get_pop_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.load_public_dataset_from_bigquery_as_df',
             return_value=get_state_fips_codes_as_df())
@ mock.patch('datasources.bjs.load_tables',
             return_value=get_test_table_files())
@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
def testWriteNationalLevelToBq(mock_bq: mock.MagicMock,
                               mock_zip: mock.MagicMock,
                               mock_fips: mock.MagicMock,
                               mock_pop: mock.MagicMock
                               ):

    bjs_data = BJSData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    bjs_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    assert mock_bq.call_count == 6
    mock_df_national_age = mock_bq.call_args_list[0][0][0]
    mock_df_national_race = mock_bq.call_args_list[1][0][0]
    mock_df_national_sex = mock_bq.call_args_list[2][0][0]
    mock_df_state_age = mock_bq.call_args_list[3][0][0]
    mock_df_state_race = mock_bq.call_args_list[4][0][0]
    mock_df_state_sex = mock_bq.call_args_list[5][0][0]

    assert mock_zip.call_count == 1

    assert mock_fips.call_count == 6
    for call_arg in mock_fips.call_args_list:
        assert call_arg.args[1] == "fips_codes_states"

    assert mock_pop.call_count == 9
    assert mock_pop.call_args_list[0].args[1] == 'by_age_national'
    assert mock_pop.call_args_list[1].args[1] == 'by_race_national'
    assert mock_pop.call_args_list[2].args[1] == 'by_sex_national'
    assert mock_pop.call_args_list[3].args[1] == 'by_age_state'
    assert mock_pop.call_args_list[4].args[1] == 'by_age_territory'
    assert mock_pop.call_args_list[5].args[1] == 'by_race_state_std'
    assert mock_pop.call_args_list[6].args[1] == 'by_race_and_ethnicity_territory'
    assert mock_pop.call_args_list[7].args[1] == 'by_sex_state'
    assert mock_pop.call_args_list[8].args[1] == 'by_sex_territory'


# COMPARE MOCKED BREAKDOWNS (PROCESSED TEST INPUT) TO EXPECTED BREAKDOWNS (TEST OUTPUT)

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

    # read test OUTPUT file
    expected_df_age_national = pd.read_json(
        GOLDEN_DATA['age_national'], dtype=expected_dtype_age)

    expected_df_race_national = pd.read_json(
        GOLDEN_DATA['race_and_ethnicity_national'], dtype=expected_dtype_race)

    expected_df_sex_national = pd.read_json(
        GOLDEN_DATA['sex_national'], dtype=expected_dtype_sex)

    expected_df_age_state = pd.read_json(
        GOLDEN_DATA['age_state'], dtype=expected_dtype_age)

    expected_df_race_state = pd.read_json(
        GOLDEN_DATA['race_state'], dtype=expected_dtype_race)

    expected_df_sex_state = pd.read_json(
        GOLDEN_DATA['sex_state'], dtype=expected_dtype_sex)

    # save NATIONAL results to file
    mock_df_national_age.to_json(
        "bjs_data-age_national.json", orient="records")
    mock_df_national_race.to_json(
        "bjs_data-race_and_ethnicity_national.json", orient="records")
    mock_df_national_sex.to_json(
        "bjs_data-sex_national.json", orient="records")

    # # save STATE/TERRITORY results to file
    mock_df_state_age.to_json(
        "bjs_data-age_state.json", orient="records")
    mock_df_state_race.to_json(
        "bjs_data-race_and_ethnicity_state.json", orient="records")
    mock_df_state_sex.to_json(
        "bjs_data-sex_state.json", orient="records")

    # output created in mocked load_csv_as_df_from_web() should be the same as the expected df

    assert set(mock_df_national_race.columns) == set(
        expected_df_race_national.columns)
    assert_frame_equal(
        mock_df_national_race, expected_df_race_national, check_like=True)

    assert set(mock_df_national_sex.columns) == set(
        expected_df_sex_national.columns)
    assert_frame_equal(
        mock_df_national_sex, expected_df_sex_national, check_like=True)

    assert set(mock_df_national_age.columns) == set(
        expected_df_age_national.columns)
    assert_frame_equal(
        mock_df_national_age, expected_df_age_national, check_like=True)

    assert set(mock_df_state_race.columns) == set(
        expected_df_race_state.columns)
    assert_frame_equal(
        mock_df_state_race, expected_df_race_state, check_like=True)

    assert set(mock_df_state_sex.columns) == set(
        expected_df_sex_state.columns)
    assert_frame_equal(
        mock_df_state_sex, expected_df_sex_state, check_like=True)
    assert set(mock_df_state_age.columns) == set(
        expected_df_age_state.columns)
    assert_frame_equal(
        mock_df_state_age, expected_df_age_state, check_like=True)
