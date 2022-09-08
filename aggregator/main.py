import logging
import os

from flask import Flask, request
from google.cloud import bigquery

app = Flask(__name__)


# Prefix for aggregation routines
AGGREGATOR_PREFIX = "AGG_"


@app.route('/', methods=['POST'])
def run_aggregation_queries():
    """Runs aggregation queries for the given data source and persists
       results in BigQuery.

       Request form must include the dataset name."""
    data = request.get_json()

    if data.get('dataset_name') is None:
        logging.error('Request must include dataset name.')
        return('', 400)

    dataset_name = data['dataset_name']
    project_id = os.environ.get('PROJECT_ID')
    dataset_id = "{}.{}".format(project_id, dataset_name)

    logging.info("Running aggregation queries on dataset: %s", dataset_id)
    # List and call routines for the dataset. (These have been uploaded to BQ 
    # through terraform)
    bq_client = bigquery.Client() 
    routines = bq_client.list_routines(dataset_id)

    for routine in routines:
        routine_ref = routine.reference
        # Only run aggregation routines
        if not routine_ref.routine_id.startswith(AGGREGATOR_PREFIX):
            continue

        query = "CALL `{}`();".format(routine_ref)
        try:
            query_job = bq_client.query(query)
            query_job.result()
            logging.info("Successfully ran aggregator routine: %s", routine_ref)
        except Exception as err:
            logging.error(err)
            return ('Error running aggregator routine: {}'.format(routine_ref), 500)

    return ('', 204)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
