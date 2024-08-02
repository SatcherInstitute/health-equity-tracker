from airflow import DAG  # pylint: disable = no-name-in-module
from airflow.utils.dates import days_ago  # pylint: disable = no-name-in-module
import util

_GRAPHQL_AHR_WORKFLOW_ID = 'GRAPHQL_AHR_DATA'
_GRAPHQL_AHR_DATASET_NAME = 'graphql_ahr_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'graphql_ahr_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for GRAPHQL AHR',
)

# AGE NATIONAL
graphql_ahr_bq_payload_age_national = util.generate_bq_payload(
    _GRAPHQL_AHR_WORKFLOW_ID,
    _GRAPHQL_AHR_DATASET_NAME,
    category='behavioral_health',
    demographic='age',
    geographic='national',
)
graphql_ahr_bq_operator_age_national = util.create_bq_ingest_operator(
    'graphql_ahr_to_bq_age_national', graphql_ahr_bq_payload_age_national, data_ingestion_dag
)

# AGE STATE
graphql_ahr_bq_payload_age_state = util.generate_bq_payload(
    _GRAPHQL_AHR_WORKFLOW_ID,
    _GRAPHQL_AHR_DATASET_NAME,
    category='behavioral_health',
    demographic='age',
    geographic='state',
)
graphql_ahr_bq_operator_age_state = util.create_bq_ingest_operator(
    'graphql_ahr_to_bq_age_state', graphql_ahr_bq_payload_age_state, data_ingestion_dag
)

# RACE NATIONAL
graphql_ahr_bq_payload_race_national = util.generate_bq_payload(
    _GRAPHQL_AHR_WORKFLOW_ID,
    _GRAPHQL_AHR_DATASET_NAME,
    category='behavioral_health',
    demographic='race_and_ethnicity',
    geographic='national',
)
graphql_ahr_bq_operator_race_national = util.create_bq_ingest_operator(
    'graphql_ahr_to_bq_race_national', graphql_ahr_bq_payload_race_national, data_ingestion_dag
)


# RACE STATE
graphql_ahr_bq_payload_race_state = util.generate_bq_payload(
    _GRAPHQL_AHR_WORKFLOW_ID,
    _GRAPHQL_AHR_DATASET_NAME,
    category='behavioral_health',
    demographic='race_and_ethnicity',
    geographic='state',
)
graphql_ahr_bq_operator_race_state = util.create_bq_ingest_operator(
    'graphql_ahr_to_bq_race_state', graphql_ahr_bq_payload_race_state, data_ingestion_dag
)

# SEX NATIONAL
graphql_ahr_bq_payload_sex_national = util.generate_bq_payload(
    _GRAPHQL_AHR_WORKFLOW_ID,
    _GRAPHQL_AHR_DATASET_NAME,
    category='behavioral_health',
    demographic='sex',
    geographic='national',
)
graphql_ahr_bq_operator_sex_national = util.create_bq_ingest_operator(
    'graphql_ahr_to_bq_sex_national', graphql_ahr_bq_payload_sex_national, data_ingestion_dag
)

# SEX STATE
graphql_ahr_bq_payload_sex_state = util.generate_bq_payload(
    _GRAPHQL_AHR_WORKFLOW_ID,
    _GRAPHQL_AHR_DATASET_NAME,
    category='behavioral_health',
    demographic='sex',
    geographic='state',
)
graphql_ahr_bq_operator_sex_state = util.create_bq_ingest_operator(
    'graphql_ahr_to_bq_sex_state', graphql_ahr_bq_payload_sex_state, data_ingestion_dag
)

# EXPORTERS
payload_age = {'dataset_name': _GRAPHQL_AHR_DATASET_NAME, 'category': 'behavioral_health', 'demographic': "age"}
graphql_ahr_exporter_operator_age = util.create_exporter_operator(
    'graphql_ahr_exporter_age', payload_age, data_ingestion_dag
)

payload_race = {
    'dataset_name': _GRAPHQL_AHR_DATASET_NAME,
    'category': 'behavioral_health',
    'demographic': "race_and_ethnicity",
}
graphql_ahr_exporter_operator_race = util.create_exporter_operator(
    'graphql_ahr_exporter_race', payload_race, data_ingestion_dag
)

payload_sex = {'dataset_name': _GRAPHQL_AHR_DATASET_NAME, 'category': 'behavioral_health', 'demographic': "sex"}
graphql_ahr_exporter_operator_sex = util.create_exporter_operator(
    'graphql_ahr_exporter_sex', payload_sex, data_ingestion_dag
)

# Ingestion Dag
(
    graphql_ahr_bq_operator_age_national
    >> graphql_ahr_bq_operator_age_state
    >> graphql_ahr_bq_operator_race_national
    >> graphql_ahr_bq_operator_race_state
    >> graphql_ahr_bq_operator_sex_national
    >> graphql_ahr_bq_operator_sex_state
    >> [graphql_ahr_exporter_operator_age, graphql_ahr_exporter_operator_race, graphql_ahr_exporter_operator_sex]
)
