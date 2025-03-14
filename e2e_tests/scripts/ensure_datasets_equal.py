import argparse

from google.cloud import bigquery
from pandas._testing import assert_frame_equal

# Makes sure datasets across gcp projects are the same, ignores order and any
# columns called `ingestion_ts`.

# TODO: once all prod and dev tables have been re-ran and no longer contain
# TODO: `ingestion_ts` this script could be simplified

# Good for making sure any refactor didn't accidentally change the output
# of a data pipeline.

# You must be logged into the gcloud cli for this to work

"""
Example usage, comparing COVID datasets on DEV to those on PROD
From directory floor in (.venv):
`python e2e_tests/scripts/ensure_datasets_equal.py -tp het-infra-prod-f6
-ep het-infra-test-05 -d cdc_restricted_data`
"""


parser = argparse.ArgumentParser()
parser.add_argument("-ep", "--expectedproject", help="GCP project name with the reference data")
parser.add_argument("-tp", "--testproject", help="GCP project name with the test data")
parser.add_argument("-d", "--dataset", help="Big query dataset id name to compare")


def main():
    args = parser.parse_args()
    expected_project = args.expectedproject
    test_project = args.testproject
    dataset = args.dataset

    bq_client = bigquery.Client()
    test_tables = bq_client.list_tables(f"{test_project}.{dataset}")

    for table in test_tables:
        test_table_name = f"{table.project}.{table.dataset_id}.{table.table_id}"
        expected_table_name = f"{expected_project}.{table.dataset_id}.{table.table_id}"

        print(f"checking {test_table_name} against {expected_table_name}")

        query_string_test = f"SELECT * FROM `{test_table_name}`"
        query_string_expected = f"SELECT * FROM `{expected_table_name}`"

        test_df = bq_client.query(query_string_test).result().to_dataframe()

        sort_values = list(test_df.columns)
        if "ingestion_ts" in sort_values:
            sort_values.remove("ingestion_ts")

        if "ingestion_ts" in test_df.columns:
            test_df = test_df.drop(columns=["ingestion_ts"]).reset_index(drop=True)

        test_df = test_df.sort_values(by=sort_values).reset_index(drop=True)

        expected_df = bq_client.query(query_string_expected).result().to_dataframe()
        if "ingestion_ts" in expected_df.columns:
            expected_df = expected_df.drop(columns=["ingestion_ts"]).reset_index(drop=True)

        expected_df = expected_df.sort_values(by=sort_values).reset_index(drop=True)

        assert_frame_equal(test_df, expected_df, check_like=True)

    print("%%%%%%%%%%%%%%%%%%%%%% SUCCESS %%%%%%%%%%%%%%%%%%%%%%%%")


if __name__ == "__main__":
    main()
