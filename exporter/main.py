import logging
import os

from flask import Flask, request
from google.cloud import bigquery, storage


app = Flask(__name__)


@app.route('/', methods=['POST'])
def export_dataset_tables():
    """Exports the tables in the given dataset to GCS.

       Request form must include the dataset name."""
    data = request.get_json()

    if data.get('dataset_name') is None:
        return ('Request must include dataset name.', 400)

    dataset_name = data['dataset_name']
    project_id = os.environ.get('PROJECT_ID')
    export_bucket = os.environ.get('EXPORT_BUCKET')
    dataset_id = f'{project_id}.{dataset_name}'

    bq_client = bigquery.Client()
    dataset = bq_client.get_dataset(dataset_id)
    tables = list(bq_client.list_tables(dataset))

    # If there are no tables in the dataset, return an error so the pipeline will alert
    # and a human can look into any potential issues.
    if not tables:
        return ('Dataset has no tables.', 500)

    for table in tables:
        # split up county-level tables by state and export those individually
        # print("export split county")
        export_split_county_tables(bq_client, table, export_bucket)

        # export the full table
        dest_uri = f'gs://{export_bucket}/{dataset_name}-{table.table_id}.json'
        table_ref = dataset.table(table.table_id)
        try:
            # print("about to export table")
            export_table(bq_client, table_ref, dest_uri,
                         'NEWLINE_DELIMITED_JSON')

            std_table_suffix = "_std"
            if not table.table_id.endswith(std_table_suffix):
                continue

            dest_uri = f'gs://{export_bucket}/{dataset_name}-{table.table_id}.csv'
            export_table(bq_client, table_ref, dest_uri, 'CSV')
        except Exception as err:
            logging.error(err)
            return (f'Error exporting table {table.table_id} to {dest_uri}:\n{err}', 500)

    return ('', 204)


def export_table(bq_client, table_ref, dest_uri, dest_fmt):
    """ Run the extract job to export the given table to the given destination and wait for completion"""
    job_config = bigquery.ExtractJobConfig(destination_format=dest_fmt)
    extract_job = bq_client.extract_table(
        table_ref, dest_uri, location='US', job_config=job_config)
    extract_job.result()
    logging.info(f'Exported {table_ref.table_id} to {dest_uri}')


def export_split_county_tables(bq_client, table, export_bucket):
    """ Split county-level table by parent state FIPS,
    and export as individual blobs to the given destination and wait for completion"""

    # print("export_split_county_tables()")

    table_name = get_table_name(table)
    if "county" not in table_name:
        return

    bucket = prepare_bucket(export_bucket)

    for fips in STATE_LEVEL_FIPS_LIST:
        state_file_name = f'{table.dataset_id}-{table.table_id}-{fips}.json'

        # print(state_file_name)

        query = f"""
            SELECT *
            FROM {table_name}
            WHERE county_fips LIKE '{fips}___'
            """

        try:
            blob = prepare_blob(bucket, state_file_name)

            state_df = get_query_results_as_df(bq_client, query)
            if state_df is not None:
                nd_json = state_df.to_json(orient="records",
                                           lines=True)
            else:
                nd_json = "{}"

            export_nd_json_to_blob(blob, nd_json)

        except Exception as err:
            logging.error(err)
            return (
                f'Error splitting county-level table {table_name} into {state_file_name}:\n {err}',
                500
            )


def get_table_name(table):
    # print("get_table_name()")
    return f'{table.project}.{table.dataset_id}.{table.table_id}'


def get_query_results_as_df(bq_client, query):
    # print("get_query_results_as_df()")
    bq_client.query(query)


def prepare_bucket(export_bucket):
    # print("prepare_bucket()")
    storage_client = storage.Client()  # Storage API request
    return storage_client.get_bucket(export_bucket)


def prepare_blob(bucket, state_file_name):
    # print("prepare_blob()")
    return bucket.blob(state_file_name)


def export_nd_json_to_blob(blob, nd_json):
    # print("export_nd_json_to_blob()")
    blob.upload_from_string(
        nd_json, content_type='application/octet-stream')


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))


STATE_LEVEL_FIPS_LIST = [
    "01", "02", "04", "05", "06", "08", "09", "10",
    "11", "12", "13", "15", "16", "17", "18", "19", "20",
    "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
    "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
    "41", "42", "44", "45", "46", "47", "48", "49", "50",
    "51", "53", "54", "55", "56", "60",
    "66", "69", "72", "78"
]
