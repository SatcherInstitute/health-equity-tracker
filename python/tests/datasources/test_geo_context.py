from unittest import mock
import os
import pandas as pd
from pandas._testing import assert_frame_equal
from datasources.geo_context import GeoContext
from test_utils import load_golden_df

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
GOLDEN_DIR = os.path.join(THIS_DIR, os.pardir, "data", "geo_context", "golden_data")


def testGenerateNationalBreakdown():
    geoContext = GeoContext()
    national_df = geoContext.generate_breakdown("national")
    expected_national_df = load_golden_df(GOLDEN_DIR, "geo_context_national", {"state_fips": str})
    assert_frame_equal(national_df, expected_national_df, check_like=True)


@mock.patch(
    "ingestion.dataset_utils.scaffold_fips_df",
    side_effect=lambda level: pd.DataFrame({"state_fips": ["01", "78"]}) if level == "state" else None,
)
def testGenerateStateLevelBreakdown(mock_scaffold: mock.MagicMock):
    geoContext = GeoContext()
    state_level_df = geoContext.generate_breakdown("state")
    expected_state_level_df = load_golden_df(GOLDEN_DIR, "geo_context_state", {"state_fips": str})

    assert mock_scaffold.call_count == 1
    assert_frame_equal(state_level_df, expected_state_level_df, check_like=True)


@mock.patch(
    "ingestion.dataset_utils.scaffold_fips_df",
    side_effect=lambda level: (
        pd.DataFrame({"county_fips": ["01001", "04021", "06007", "24019"]}) if level == "county" else None
    ),
)
@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    return_value=pd.read_csv(
        os.path.join(THIS_DIR, os.pardir, "data", "geo_context", "cdc_svi_county_test.csv"), dtype={"FIPS": str}
    ),
)
def testGenerateCountyBreakdown(mock_svi_data: mock.MagicMock, mock_scaffold: mock.MagicMock):
    geoContext = GeoContext()
    county_df = geoContext.generate_breakdown("county")
    expected_county_df = load_golden_df(GOLDEN_DIR, "geo_context_county", {"county_fips": str})

    assert mock_svi_data.call_count == 1
    assert mock_scaffold.call_count == 1
    assert_frame_equal(county_df, expected_county_df, check_like=True)
