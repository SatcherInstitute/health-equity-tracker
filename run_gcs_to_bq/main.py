import logging
import os
from datasources.data_sources import DATA_SOURCES_DICT
from flask import Flask, request

app = Flask(__name__)


@app.route("/", methods=["POST"])
def ingest_bucket_to_bq():
    """Main function for moving data from buckets to bigquery. Triggered by
    notify-data-ingested topic."""
    envelope = request.get_json()
    if not envelope:
        logging.error("No Pub/Sub message received.")
        return ("", 400)

    if not isinstance(envelope, dict) or "message" not in envelope:
        logging.error("Invalid Pub/Sub message format")
        return ("", 400)

    event = envelope["message"]
    logging.info("Received message: %s", event)

    try:
        do_ingestion(event)
        return ("", 204)
    except Exception as e:
        logging.exception(e)
        return ("", 400)


def do_ingestion(event):
    """Main entry point for moving data from buckets to bigquery. Triggered by
    notify-data-ingested topic.

    event: Dict containing the Pub/Sub method. The payload will be a base-64
           encoded string in the 'data' field with additional attributes in
           the 'attributes' field."""
    is_airflow_run = event["is_airflow_run"]
    if is_airflow_run:
        attrs = event
    else:
        if "attributes" not in event:
            raise RuntimeError("PubSub message missing 'attributes' field")
        attrs = event["attributes"]
    if "id" not in attrs or "gcs_bucket" not in attrs:
        raise RuntimeError("PubSub data missing 'id' or 'gcs_bucket' field")

    workflow_id = attrs.pop("id")
    gcs_bucket = attrs.pop("gcs_bucket")

    dataset = attrs.pop("dataset", None)
    if dataset is None:
        if "DATASET_NAME" not in os.environ:
            raise RuntimeError("Environment variable DATASET_NAME missing.")
        dataset = os.environ["DATASET_NAME"]

    if workflow_id not in DATA_SOURCES_DICT.keys():
        raise RuntimeError(f"ID: {workflow_id}, is not a valid id")

    data_source = DATA_SOURCES_DICT[workflow_id]
    data_source.write_to_bq(dataset, gcs_bucket, **attrs)

    logging.info("Successfully uploaded to BigQuery for workflow %s", workflow_id)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
