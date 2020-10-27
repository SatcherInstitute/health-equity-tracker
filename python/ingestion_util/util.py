import base64
import json
import logging
import os

from datasources import DATA_SOURCE_DICT
from ingestion import (cdc_to_bq, census, census_to_bq, county_adjacency,
                       di_url_file_to_gcs, primary_care_access_to_bq,
                       primary_care_access_to_gcs, pubsub_publisher,
                       gcs_to_bq_util)


def ingest_data_to_gcs(event):
    """Main entry point for data ingestion. Receives Pub/Sub trigger and triages
       to the appropriate data ingestion workflow.

       event: Dict containing the Pub/Sub method. The payload will be a base-64
              encoded string in the 'data' field."""
    if 'data' not in event:
        raise RuntimeError("PubSub message missing 'data' field")
    data = base64.b64decode(event['data']).decode('utf-8')
    event_dict = json.loads(data)

    if 'id' not in event_dict or 'gcs_bucket' not in event_dict:
        raise RuntimeError("PubSub data missing 'id' or 'gcs_bucket' field")
    workflow_id = event_dict['id']
    gcs_bucket = event_dict['gcs_bucket']

    # Not all of these will be populated depending on message type.
    # TODO add per-data-source validation that the event has the right fields.
    url = event_dict.get('url')
    filename = event_dict.get('filename')
    if filename is None:
        filename = event_dict.get('fileprefix')

    logging.info("Data ingestion recieved message: %s", workflow_id)

    if 'PROJECT_ID' not in os.environ:
        raise RuntimeError("Environment variable PROJECT_ID missing.")
    if 'NOTIFY_DATA_INGESTED_TOPIC' not in os.environ:
        raise RuntimeError(
            "Environment variable NOTIFY_DATA_INGESTED_TOPIC missing.")

    project_id = os.environ['PROJECT_ID']
    notify_data_ingested_topic = os.environ['NOTIFY_DATA_INGESTED_TOPIC']

    if workflow_id not in DATA_SOURCE_DICT.keys():
        raise RuntimeError("ID: {}, is not a valid id".format(workflow_id))

    data_source = DATA_SOURCE_DICT[workflow_id]
    data_source.upload_to_gcs(data_source, url, gcs_bucket, filename)

    logging.info(
        "Successfully uploaded data to GCS for workflow %s", workflow_id)
    pubsub_publisher.notify_topic(
        project_id, notify_data_ingested_topic, **event_dict)


def ingest_bucket_to_bq(event):
    """Main entry point for moving data from buckets to bigquery. Triggered by
       notify-data-ingested topic.

       event: Dict containing the Pub/Sub method. The payload will be a base-64
              encoded string in the 'data' field with additional attributes in
              the 'attributes' field."""
    if 'attributes' not in event:
        raise RuntimeError("PubSub message missing 'attributes' field")
    attributes = event['attributes']
    if 'id' not in attributes or 'gcs_bucket' not in attributes:
        raise RuntimeError("PubSub data missing 'id' or 'gcs_bucket' field")

    workflow_id = attributes['id']
    gcs_bucket = attributes['gcs_bucket']

    # Not all of these will be populated depending on message type.
    # TODO add per-data-source validation that the event has the right fields.
    filename = attributes.get('filename')
    if filename is None:
        filename = attributes.get('fileprefix')

    if 'DATASET_NAME' not in os.environ:
        raise RuntimeError("Environment variable DATASET_NAME missing.")

    dataset = os.environ['DATASET_NAME']

    if workflow_id not in DATA_SOURCE_DICT.keys():
        raise RuntimeError("ID: {}, is not a valid id".format(workflow_id))

    data_source = DATA_SOURCE_DICT[workflow_id]
    data_source.write_to_bq(data_source, dataset, gcs_bucket, filename)

    logging.info(
        "Successfully uploaded to BigQuery for workflow %s", workflow_id)
