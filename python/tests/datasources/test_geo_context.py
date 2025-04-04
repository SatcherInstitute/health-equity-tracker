import math
from unittest import mock
import os
import pytest
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.geo_context import GeoContext, format_svi
from ingestion.gcs_to_bq_util import BQ_STRING, BQ_FLOAT

# UNIT TESTS


def test_format_svi():
    # normal number between 0-1
    assert format_svi(0.4354) == 0.44
    # special case of -999
    assert math.isnan(format_svi(-999.0))
    # otherwise should error
    with pytest.raises(ValueError):
        format_svi(12345)
        format_svi(None)


# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "geo_context")
REAL_SVI_DIR = os.path.abspath("data/cdc_svi_county")

GOLDEN_DATA_NATIONAL = os.path.join(TEST_DIR, "test_output_geo_context_national.csv")
GOLDEN_DATA_STATE = os.path.join(TEST_DIR, "test_output_geo_context_state.csv")
GOLDEN_DATA_COUNTY = os.path.join(TEST_DIR, "test_output_geo_context_county.csv")


def _scaffold_fips_df(*args):
    """For testing, we only want to produce tables with a
    select few states or counties, so we use this mock function."""
    geo_level = args[0]

    if geo_level == "state":
        return pd.DataFrame({"state_fips": ["01", "78"]})
    if geo_level == "county":
        return pd.DataFrame({"county_fips": ["01001", "04021", "06007", "24019"]})


def _get_svi_as_df():
    return pd.read_csv(os.path.join(TEST_DIR, "cdc_svi_county_test.csv"), dtype={"FIPS": str})


def _generate_breakdown(*args):
    print("mocking generate_breakdown()", args)
    return pd.DataFrame({"fake_col1": [0, 1, 2], "fake_col2": ["a", "b", "c"]})


# TESTS


@mock.patch(
    "datasources.geo_context.GeoContext.generate_breakdown",
    side_effect=_generate_breakdown,
)
@mock.patch("ingestion.gcs_to_bq_util.add_df_to_bq", return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_generate_breakdown: mock.MagicMock):
    """Ensures the correct structure and arguments were
    generated to be written to BigQuery"""
    geoContext = GeoContext()
    kwargs = {
        "filename": "test_file.csv",
        "metadata_table_id": "test_metadata",
        "table_name": "output_table",
    }
    geoContext.write_to_bq("dataset", "gcs_bucket", **kwargs)

    assert mock_generate_breakdown.call_count == 3
    assert mock_bq.call_count == 3
    national_call, state_call, county_call = mock_bq.call_args_list

    assert (
        national_call[1]["column_types"]
        == state_call[1]["column_types"]
        == {
            "fake_col1": BQ_STRING,
            "fake_col2": BQ_STRING,
            "population": BQ_FLOAT,
        }
    )
    assert county_call[1]["column_types"] == {
        "fake_col1": BQ_STRING,
        "fake_col2": BQ_STRING,
        "svi": BQ_FLOAT,
        "population": BQ_FLOAT,
    }


def testGenerateNationalBreakdown():
    """Tests the generation of national breakdown"""
    geoContext = GeoContext()
    national_df = geoContext.generate_breakdown("national")

    expected_national_df = pd.read_csv(
        GOLDEN_DATA_NATIONAL,
        dtype={
            "state_fips": str,
        },
    )
    assert_frame_equal(national_df, expected_national_df, check_like=True)


@mock.patch("ingestion.dataset_utils.scaffold_fips_df", side_effect=_scaffold_fips_df)
def testGenerateStateLevelBreakdown(
    mock_scaffold: mock.MagicMock,
):
    """Tests the generation of state and territory breakdown"""
    print("testGenerateStateLevelBreakdown()")

    geoContext = GeoContext()
    state_level_df = geoContext.generate_breakdown("state")
    expected_state_level_df = pd.read_csv(
        GOLDEN_DATA_STATE,
        dtype={
            "state_fips": str,
        },
    )

    assert mock_scaffold.call_count == 1

    assert_frame_equal(state_level_df, expected_state_level_df, check_like=True)


@mock.patch("ingestion.dataset_utils.scaffold_fips_df", side_effect=_scaffold_fips_df)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    return_value=_get_svi_as_df(),
)
def testGenerateCountyBreakdown(
    mock_svi_data: mock.MagicMock,
    mock_scaffold: mock.MagicMock,
):
    """Tests the generation of county breakdown"""
    print("testGenerateCountyBreakdown()")

    geoContext = GeoContext()
    county_df = geoContext.generate_breakdown("county")

    assert mock_svi_data.call_count == 1
    assert mock_scaffold.call_count == 1

    expected_county_df = pd.read_csv(GOLDEN_DATA_COUNTY, dtype={"county_fips": str})

    assert_frame_equal(county_df, expected_county_df, check_like=True)
