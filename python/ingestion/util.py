import base64
import json
import logging
import os
from ingestion import census
from ingestion import census_to_bq
from ingestion import county_adjacency
from ingestion import primary_care_access_to_gcs
from ingestion import primary_care_access_to_bq
from ingestion import cdc_to_bq
from ingestion import pubsub_publisher
from ingestion import di_url_file_to_gcs

# Data source name literals. These correspond to a specific data ingestion
# workflow.
_HOUSEHOLD_INCOME = 'HOUSEHOLD_INCOME'
_URGENT_CARE_FACILITIES = 'URGENT_CARE_FACILITIES'
_STATE_NAMES = 'STATE_NAMES'
_COUNTY_NAMES = 'COUNTY_NAMES'
_COUNTY_ADJACENCY = 'COUNTY_ADJACENCY'
_POPULATION_BY_RACE = 'POPULATION_BY_RACE'
_PRIMARY_CARE_ACCESS = 'PRIMARY_CARE_ACCESS'
_CDC_COVID_DEATHS = 'CDC_COVID_DEATHS'


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
    fileprefix = event_dict.get('fileprefix')

    logging.info("Data ingestion recieved message: %s", workflow_id)

    if 'PROJECT_ID' not in os.environ:
        raise RuntimeError("Environment variable PROJECT_ID missing.")
    if 'NOTIFY_DATA_INGESTED_TOPIC' not in os.environ:
        raise RuntimeError(
            "Environment variable NOTIFY_DATA_INGESTED_TOPIC missing.")

    project_id = os.environ['PROJECT_ID']
    notify_data_ingested_topic = os.environ['NOTIFY_DATA_INGESTED_TOPIC']

    if workflow_id == _HOUSEHOLD_INCOME:
        census.upload_household_income(url, gcs_bucket, filename)
    elif workflow_id == _STATE_NAMES:
        census.upload_state_names(url, gcs_bucket, filename)
    elif workflow_id == _COUNTY_NAMES:
        census.upload_county_names(url, gcs_bucket, filename)
    elif workflow_id == _POPULATION_BY_RACE:
        census.upload_population_by_race(url, gcs_bucket, filename)
    elif (workflow_id == _URGENT_CARE_FACILITIES
          or workflow_id == _COUNTY_ADJACENCY
          or workflow_id == _CDC_COVID_DEATHS):
        di_url_file_to_gcs.url_file_to_gcs(url, None, gcs_bucket, filename)
    elif workflow_id == _PRIMARY_CARE_ACCESS:
        primary_care_access_to_gcs.upload_primary_care_access(
            gcs_bucket, fileprefix)
    else:
        raise RuntimeError("ID: {}, is not a valid id".format(workflow_id))

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
    fileprefix = attributes.get('fileprefix')

    if 'DATASET_NAME' not in os.environ:
        raise RuntimeError("Environment variable DATASET_NAME missing.")

    dataset = os.environ['DATASET_NAME']

    if workflow_id == _URGENT_CARE_FACILITIES:
        # TODO implement
        pass
    elif workflow_id == _STATE_NAMES:
        census_to_bq.write_state_names_to_bq(
            dataset, 'state_names', gcs_bucket, filename)
    elif workflow_id == _COUNTY_NAMES:
        census_to_bq.write_county_names_to_bq(
            dataset, 'county_names', gcs_bucket, filename)
    elif workflow_id == _COUNTY_ADJACENCY:
        county_adjacency.write_adjacencies_to_bq(
            dataset, 'county_adjacency', gcs_bucket, filename)
    elif workflow_id == _POPULATION_BY_RACE:
        census_to_bq.write_population_by_race_to_bq(
            dataset, 'population_by_race', gcs_bucket, filename)
    elif workflow_id == _PRIMARY_CARE_ACCESS:
        primary_care_access_to_bq.write_primary_care_access_to_bq(
            dataset, 'primary_care_access', gcs_bucket, fileprefix)
    elif workflow_id == _CDC_COVID_DEATHS:
        cdc_to_bq.write_covid_deaths_to_bq(
            dataset, 'covid_deaths', gcs_bucket, filename)
    elif workflow_id == _HOUSEHOLD_INCOME:
        census_to_bq.write_household_income_to_bq(
            dataset, 'SAIPE_household_income_poverty_estimates', gcs_bucket,
            filename)
    else:
        raise RuntimeError("ID: {}, is not a valid id".format(workflow_id))

    logging.info(
        "Successfully uploaded to BigQuery for workflow %s", workflow_id)
