import argparse

from google.cloud import bigquery
from pandas._testing import assert_frame_equal

# Makes sure datasets across gcp projects are the same, ignores order and any
# columns called `ingestion_ts`.

# Good for making sure any refactor didn't accidentally change the output
# of a data pipeline.

# You must be logged into the gcloud cli for this to work

parser = argparse.ArgumentParser()
parser.add_argument("-ep", "--expectedproject", help="GCP project name with the reference data")
parser.add_argument("-tp", "--testproject", help="GCP project name with the test data")
parser.add_argument("-d", "--dataset", help="Big query dataset id name to compare")


def main():
    args = parser.parse_args()
    expected_project = args.expectedproject
    test_project = args.testproject
    dataset = args.dataset

    bqclient = bigquery.Client()
    test_tables = bqclient.list_tables('%s.%s' % (test_project, dataset))

    for table in test_tables:
        test_table_name = "{}.{}.{}".format(table.project, table.dataset_id, table.table_id)
        expected_table_name = "{}.{}.{}".format(expected_project, table.dataset_id, table.table_id)

        print('checking %s against %s' % (test_table_name, expected_table_name))

        query_string_test = 'SELECT * FROM `%s`' % test_table_name
        query_string_expected = 'SELECT * FROM `%s`' % expected_table_name

        test_df = bqclient.query(query_string_test).result().to_dataframe()

        sort_values = list(test_df.columns)
        if 'ingestion_ts' in sort_values:
            sort_values.remove('ingestion_ts')

        if 'ingestion_ts' in test_df.columns:
            test_df = test_df.drop(columns=['ingestion_ts']).reset_index(drop=True)

        test_df = test_df.sort_values(by=sort_values).reset_index(drop=True)

        expected_df = bqclient.query(query_string_expected).result().to_dataframe()
        if 'ingestion_ts' in expected_df.columns:
            expected_df = expected_df.drop(columns=['ingestion_ts']).reset_index(drop=True)

        expected_df = expected_df.sort_values(by=sort_values).reset_index(drop=True)

        assert_frame_equal(test_df, expected_df, check_like=True)

    print("%%%%%%%%%%%%%%%%%%%%%% SUCCEESS %%%%%%%%%%%%%%%%%%%%%%%%")


if __name__ == "__main__":
    main()
