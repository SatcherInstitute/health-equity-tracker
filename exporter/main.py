import logging
import os

from flask import Flask, request
from google.cloud import bigquery

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
    dataset_id = "{}.{}".format(project_id, dataset_name)

    bq_client = bigquery.Client()
    dataset = bq_client.get_dataset(dataset_id)
    tables = list(bq_client.list_tables(dataset))

    # If there are no tables in the dataset, return an error so the pipeline will alert
    # and a human can look into any potential issues.
    if not tables:
        return ('Dataset has no tables.', 500)

    for table in tables:
        dest_uri = "gs://{}/{}-{}.json".format(
            export_bucket, dataset_name, table.table_id)
        table_ref = dataset.table(table.table_id)
        try:
            export_table(bq_client, table_ref, dest_uri,
                         'NEWLINE_DELIMITED_JSON')

            std_table_suffix = "_std"
            if not table.table_id.endswith(std_table_suffix):
                continue

            dest_uri = "gs://{}/{}-{}.csv".format(
                export_bucket, dataset_name, table.table_id)
            export_table(bq_client, table_ref, dest_uri, 'CSV')
        except Exception as err:
            logging.error(err)
            return ('Error exporting table, {}, to {}: {}'.format(table.table_id, dest_uri, err), 500)

    return ('', 204)


def export_table(bq_client, table_ref, dest_uri, dest_fmt):
    """ Run the extract job to export the give table to the given destination and wait for completion"""
    job_config = bigquery.ExtractJobConfig(destination_format=dest_fmt)
    extract_job = bq_client.extract_table(
        table_ref, dest_uri, location='US', job_config=job_config)
    extract_job.result()
    logging.info("Exported %s to %s", table_ref.table_id, dest_uri)


# def export_table(bq_client, table_ref, dest_uri, dest_fmt):
#     """ Run the extract job to export the give table to the given destination and wait for completion"""
#     job_config = bigquery.ExtractJobConfig(destination_format=dest_fmt)

#     state_fips = "01"
#     state_fips_matcher = f'{state_fips}%'

#     query_job = bq_client.query(
#         f'SELECT * FROM {table_ref} WHERE county_fips LIKE {state_fips_matcher};',
#         job_config=job_config,
#     )

#     extract_job = bq_client.extract_table(
#         table_ref, dest_uri, location='US', job_config=job_config, query_job=query_job)
#     extract_job.result()
#     logging.info("Exported %s to %s", table_ref.table_id, dest_uri)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
