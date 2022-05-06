from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
import ingestion.standardized_columns as std_col
from datasources.bjs import BJSData, drop_unnamed, strip_footnote_refs, missing_data_to_none

# UNIT TESTS

_fake_by_race_state_national_df = pd.DataFrame({std_col.STATE_NAME_COL: ["Maine", "Florida"],
                                                'Asian': ["~", 1000],
                                                'Black': [100, "/"]
                                                })

_expected_by_race_state_national_df_missing_to_none = pd.DataFrame({std_col.STATE_NAME_COL: ["Maine", "Florida"],
                                                                    'Asian': [None, 1000],
                                                                    'Black': [100, None]
                                                                    })


def test_strip_footnote_refs():
    assert strip_footnote_refs(
        "Native Hawaiian/Other Pacific Islander/a") == "Native Hawaiian/Other Pacific Islander"
    assert strip_footnote_refs("Anything/a,b,c,d,e,z") == "Anything"
    assert strip_footnote_refs(1) == 1


def test_missing_data_to_none():
    assert missing_data_to_none(
        _fake_by_race_state_national_df).equals(_expected_by_race_state_national_df_missing_to_none)


# INTEGRATION TEST SETUP
# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "bjs_corrections")

GOLDEN_DATA = {
    'race_and_ethnicity_national': os.path.join(TEST_DIR, 'bjs_test_output_race_and_ethnicity_national.json'),
}


def _get_test_data_as_df(*args):
    [filename] = args
    test_input_data_types = {
        "state": str,
        "race_ethnicity": str
    }

    header_rows = list(range(0, 10))

    test_input_filename = f'bjs_test_input_{filename}'
    df = pd.read_csv(os.path.join(TEST_DIR, test_input_filename),
                     dtype=test_input_data_types, skiprows=[*header_rows, 12], skipfooter=13, engine="python")

    df = df.rename(
        columns={'Jurisdiction': std_col.STATE_NAME_COL})

    df[std_col.STATE_NAME_COL] = df[std_col.STATE_NAME_COL].combine_first(
        df["Unnamed: 1"])

    df = drop_unnamed(df)

    # strip out footnote references from column headers and state name col
    df.columns = [strip_footnote_refs(col_name) for col_name in df.columns]
    df[std_col.STATE_NAME_COL] = df[std_col.STATE_NAME_COL].apply(
        strip_footnote_refs)

    df = missing_data_to_none(df)

    print(df.to_string())
    return df


# RUN INTEGRATION TESTS ON NATIONAL LEVEL
@ mock.patch('ingestion.gcs_to_bq_util.load_csv_as_df_from_web',
             side_effect=_get_test_data_as_df)
@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
def testWriteNationalLevelToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):

    bjs_data = BJSData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    bjs_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)

    mock_bq.assert_called_once
    mock_csv.assert_called_once

    expected_dtype = {
        'state_name': str,
        'state_fips': str,
        "prison_per_100k": float,
        "prison_pct_share": float,
        "population": object,
        "population_pct": float,
        'race_and_ethnicity': str,
        'race': str,
        'race_includes_hispanic': object,
        'race_category_id': str,
    }

    # read test OUTPUT file
    expected_df_national = pd.read_json(
        GOLDEN_DATA['race_and_ethnicity_national'], dtype=expected_dtype)

    # print(mock_bq.call_args_list)

    args, kwargs = mock_bq.call_args_list

    # print(args, kwargs)

    # # save NATIONAL results to file
    # mock_df_national.to_json(
    #     "bjs-run-results-national.json", orient="records")

    # # output created in mocked load_csv_as_df_from_web() should be the same as the expected df
    # assert set(mock_df_national) == set(
    #     expected_df_national.columns)
    # assert_frame_equal(
    #     mock_df_national, expected_df_national, check_like=True)
