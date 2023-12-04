from unittest import mock
from pandas._testing import assert_frame_equal
from datasources.cdc_wisqars import CDCWisqarsData
import pandas as pd
import os
from test_utils import _load_public_dataset_from_bigquery_as_df

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data")
GOLDEN_DIR = os.path.join(TEST_DIR, "cdc_wisqars")


def _load_csv_as_df_from_data_dir(*args, **kwargs):
    directory, filename = args
    use_cols = kwargs["usecols"]

    df = pd.read_csv(
        os.path.join(TEST_DIR, directory, filename),
        usecols=use_cols,
        na_values='--',
        dtype={"Year": str},
        thousands=',',
    )
    return df


@mock.patch(
    "ingestion.gcs_to_bq_util.load_csv_as_df_from_data_dir",
    side_effect=_load_csv_as_df_from_data_dir,
)
def test_write_to_bq_age_national(
    mock_data_dir: mock.MagicMock,
    # mock_bq: mock.MagicMock,
):
    datasource = CDCWisqarsData()
    datasource.write_to_bq(
        "dataset", "gcs_bucket", demographic="age", geographic="national"
    )
