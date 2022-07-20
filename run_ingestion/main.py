import base64
from http import HTTPStatus
import json

import logging
import os
from datasources.data_sources import DATA_SOURCES_DICT
from flask import Flask, request
app = Flask(__name__)


@app.route('/', methods=['POST'])
def ingest_data():
    """Main function for data ingestion. Receives Pub/Sub trigger and triages
       to the appropriate data ingestion workflow.

       Returns 400 for a bad rechquest and 204 for successful new file downloads
       or 201 for successful non file download execution."""
    envelope = request.get_json()
    if not envelope:
        logging.error('No Pub/Sub message received.')
        return ('', HTTPStatus.BAD_REQUEST)

    if not isinstance(envelope, dict) or 'message' not in envelope:
        logging.error('Invalid Pub/Sub message format')
        return ('', HTTPStatus.BAD_REQUEST)

    event = envelope['message']
    logging.info(f"message: {event}")

    try:
        ingest_data_to_gcs(event)
        return ('', HTTPStatus.CREATED)
    except Exception as e:
        logging.exception(e)
        return ('', HTTPStatus.BAD_REQUEST)


def ingest_data_to_gcs(event):
    """
    Main entry point for data ingestion. Receives Pub/Sub trigger and triages
    to the appropriate data ingestion workflow.

    Parameters:
       event: Dict containing the Pub/Sub method. The payload will be a base-64
              encoded string in the 'data' field.
    """
    is_airflow_run = event['is_airflow_run']
    if is_airflow_run:
        event_dict = event
    else:
        if 'data' not in event:
            raise RuntimeError("PubSub message missing 'data' field")
        data = base64.b64decode(event['data']).decode('utf-8')
        event_dict = json.loads(data)

    attrs = event_dict.copy()
    if 'id' not in attrs or 'gcs_bucket' not in attrs:
        raise RuntimeError("PubSub data missing 'id' or 'gcs_bucket' field")
    workflow_id = attrs.pop('id')
    gcs_bucket = attrs.pop('gcs_bucket')

    logging.info("Data ingestion received message: %s", workflow_id)

    if workflow_id not in DATA_SOURCES_DICT.keys():
        raise RuntimeError("ID: {}, is not a valid id".format(workflow_id))

    data_source = DATA_SOURCES_DICT[workflow_id]
    data_source.upload_to_gcs(gcs_bucket, **attrs)

    logging.info(
        "Successfully uploaded data to GCS for workflow %s", workflow_id)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
