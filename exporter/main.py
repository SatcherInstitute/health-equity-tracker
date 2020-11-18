import logging
import os

from flask import Flask, request
from google.cloud import bigquery

app = Flask(__name__)


@app.route('/', methods=['POST'])
def export_dataset_tables():
    """Exports the tables in the given dataset to GCS.

       Request form must include the dataset name."""
    dataset_name = request.form['dataset_name']
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
        dest_uri = "gs://{}/{}-{}.json".format(export_bucket, dataset_name, table.table_id)
        table_ref = dataset.table(table.table_id)
        try:
            extract_job = bq_client.extract_table(table_ref, dest_uri, location='US')
            extract_job.result()
            logging.info("Exported %s to %s", table.table_id, dest_uri)
        except Exception as err:
            logging.error(err)
            return ('Error exporting table, {}: {}'.format(table.table_id, err), 500)

    return ('', 204)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
