import logging
import os
import sys
from datasources.data_sources import DATA_SOURCES_DICT
from flask import Flask, request

# Set up logging to stdout for Cloud Run
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Log startup
logger.info("Starting ingest service")

app = Flask(__name__)


@app.route("/", methods=["POST"])
def ingest_bucket_to_bq():
    """Main function for moving data from buckets to bigquery. Triggered by
    topic specific GitHub action DAG workflow."""
    logger.info("Received request at ingest endpoint")
    envelope = request.get_json()
    if not envelope:
        logger.error("No Pub/Sub message received.")
        return ("", 400)

    if not isinstance(envelope, dict) or "message" not in envelope:
        logger.error("Invalid Pub/Sub message format: %s", envelope)
        return ("", 400)

    event = envelope["message"]
    logger.info("Parsed message: %s", event)

    try:
        logger.info("Starting ingestion process")
        do_ingestion(event)
        logger.info("Ingestion completed successfully")
        return ("", 204)
    except Exception as e:
        logger.exception("Ingestion failed with error: %s", str(e))
        return ("", 400)


def do_ingestion(event):
    """Main entry point for moving data from buckets to bigquery.

    event: Dict containing the Pub/Sub method. The payload will be a base-64
           encoded string in the 'data' field with additional attributes in
           the 'attributes' field."""
    logger.info("Processing event: %s", event)

    is_dag_pipeline_run = event.get("is_dag_pipeline_run", False)
    logger.info("Is DAG pipeline run: %s", is_dag_pipeline_run)

    if is_dag_pipeline_run:
        attrs = event
        logger.info("Using event as attributes (DAG pipeline run)")
    else:
        if "attributes" not in event:
            logger.error("PubSub message missing 'attributes' field")
            raise RuntimeError("PubSub message missing 'attributes' field")
        attrs = event["attributes"]
        logger.info("Extracted attributes from event: %s", attrs)

    if "id" not in attrs or "gcs_bucket" not in attrs:
        logger.error("Missing required attributes. Attributes: %s", attrs)
        raise RuntimeError("PubSub data missing 'id' or 'gcs_bucket' field")

    workflow_id = attrs.pop("id")
    gcs_bucket = attrs.pop("gcs_bucket")
    logger.info("Working with workflow_id: %s, gcs_bucket: %s", workflow_id, gcs_bucket)

    dataset = attrs.pop("dataset", None)
    if dataset is None:
        if "DATASET_NAME" not in os.environ:
            logger.error("Environment variable DATASET_NAME missing")
            raise RuntimeError("Environment variable DATASET_NAME missing.")
        dataset = os.environ["DATASET_NAME"]
    logger.info("Using dataset: %s", dataset)

    if workflow_id not in DATA_SOURCES_DICT.keys():
        logger.error("Invalid workflow ID: %s", workflow_id)
        raise RuntimeError(f"ID: {workflow_id}, is not a valid id")

    logger.info("Retrieving data source for workflow: %s", workflow_id)
    data_source = DATA_SOURCES_DICT[workflow_id]

    logger.info(f"Retrieved data source type: {type(data_source)}")  # Add this line

    logger.info(
        "Starting BigQuery write operation with parameters: dataset=%s, bucket=%s, additional_attrs=%s",
        dataset,
        gcs_bucket,
        attrs,
    )
    data_source.write_to_bq(dataset, gcs_bucket, **attrs)

    logger.info("Successfully uploaded to BigQuery for workflow %s", workflow_id)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    logger.info("Starting Flask app on port %d", port)
    app.run(debug=True, host="0.0.0.0", port=port)
