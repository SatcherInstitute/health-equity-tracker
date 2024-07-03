from airflow import DAG  # pylint: disable=no-name-in-module
from airflow.utils.dates import days_ago  # pylint: disable=no-name-in-module

import util

_PHRMA_WORKFLOW_ID = 'PHRMA_DATA'
_PHRMA_DATASET_NAME = 'phrma_data'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'phrma_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for Phrma',
)

# INGEST BY GEO / DEMO

# sex_national
phrma_bq_payload_sex_national = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='sex',
    geographic='national',
)
phrma_bq_operator_sex_national = util.create_bq_ingest_operator(
    'phrma_to_bq_sex_national', phrma_bq_payload_sex_national, data_ingestion_dag
)

# race_national
phrma_bq_payload_race_national = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='race_and_ethnicity',
    geographic='national',
)
phrma_bq_operator_race_national = util.create_bq_ingest_operator(
    'phrma_to_bq_race_national', phrma_bq_payload_race_national, data_ingestion_dag
)

# age_national
phrma_bq_payload_age_national = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='age',
    geographic='national',
)
phrma_bq_operator_age_national = util.create_bq_ingest_operator(
    'phrma_to_bq_age_national', phrma_bq_payload_age_national, data_ingestion_dag
)

# lis_national
phrma_bq_payload_lis_national = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='lis',
    geographic='national',
)
phrma_bq_operator_lis_national = util.create_bq_ingest_operator(
    'phrma_to_bq_lis_national', phrma_bq_payload_lis_national, data_ingestion_dag
)

# elig_national
phrma_bq_payload_elig_national = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='eligibility',
    geographic='national',
)
phrma_bq_operator_elig_national = util.create_bq_ingest_operator(
    'phrma_to_bq_elig_national', phrma_bq_payload_elig_national, data_ingestion_dag
)


# sex_state
phrma_bq_payload_sex_state = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='sex',
    geographic='state',
)
phrma_bq_operator_sex_state = util.create_bq_ingest_operator(
    'phrma_to_bq_sex_state', phrma_bq_payload_sex_state, data_ingestion_dag
)

# race_state
phrma_bq_payload_race_state = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='race_and_ethnicity',
    geographic='state',
)
phrma_bq_operator_race_state = util.create_bq_ingest_operator(
    'phrma_to_bq_race_state', phrma_bq_payload_race_state, data_ingestion_dag
)

# age_state
phrma_bq_payload_age_state = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='age',
    geographic='state',
)
phrma_bq_operator_age_state = util.create_bq_ingest_operator(
    'phrma_to_bq_age_state', phrma_bq_payload_age_state, data_ingestion_dag
)

# lis_state
phrma_bq_payload_lis_state = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='lis',
    geographic='state',
)
phrma_bq_operator_lis_state = util.create_bq_ingest_operator(
    'phrma_to_bq_lis_state', phrma_bq_payload_lis_state, data_ingestion_dag
)

# elig_state
phrma_bq_payload_elig_state = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='eligibility',
    geographic='state',
)
phrma_bq_operator_elig_state = util.create_bq_ingest_operator(
    'phrma_to_bq_elig_state', phrma_bq_payload_elig_state, data_ingestion_dag
)


# sex_county
phrma_bq_payload_sex_county = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='sex',
    geographic='county',
)
phrma_bq_operator_sex_county = util.create_bq_ingest_operator(
    'phrma_to_bq_sex_county', phrma_bq_payload_sex_county, data_ingestion_dag
)

# race_county
phrma_bq_payload_race_county = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='race_and_ethnicity',
    geographic='county',
)
phrma_bq_operator_race_county = util.create_bq_ingest_operator(
    'phrma_to_bq_race_county', phrma_bq_payload_race_county, data_ingestion_dag
)

# age_county
phrma_bq_payload_age_county = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='age',
    geographic='county',
)
phrma_bq_operator_age_county = util.create_bq_ingest_operator(
    'phrma_to_bq_age_county', phrma_bq_payload_age_county, data_ingestion_dag
)

# lis_county
phrma_bq_payload_lis_county = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='lis',
    geographic='county',
)
phrma_bq_operator_lis_county = util.create_bq_ingest_operator(
    'phrma_to_bq_lis_county', phrma_bq_payload_lis_county, data_ingestion_dag
)

# elig_county
phrma_bq_payload_elig_county = util.generate_bq_payload(
    _PHRMA_WORKFLOW_ID,
    _PHRMA_DATASET_NAME,
    demographic='eligibility',
    geographic='county',
)
phrma_bq_operator_elig_county = util.create_bq_ingest_operator(
    'phrma_to_bq_elig_county', phrma_bq_payload_elig_county, data_ingestion_dag
)


# EXPORT BY DEMOGRAPHIC

payload_race = {
    'dataset_name': _PHRMA_DATASET_NAME,
    'demographic': "race_and_ethnicity",
}
phrma_exporter_operator_race = util.create_exporter_operator('phrma_exporter_race', payload_race, data_ingestion_dag)

payload_age = {'dataset_name': _PHRMA_DATASET_NAME, 'demographic': "age"}
phrma_exporter_operator_age = util.create_exporter_operator('phrma_exporter_age', payload_age, data_ingestion_dag)


payload_sex = {'dataset_name': _PHRMA_DATASET_NAME, 'demographic': "sex"}
phrma_exporter_operator_sex = util.create_exporter_operator('phrma_exporter_sex', payload_sex, data_ingestion_dag)


payload_lis = {'dataset_name': _PHRMA_DATASET_NAME, 'demographic': "lis"}
phrma_exporter_operator_lis = util.create_exporter_operator('phrma_exporter_lis', payload_lis, data_ingestion_dag)


payload_eligibility = {
    'dataset_name': _PHRMA_DATASET_NAME,
    'demographic': "eligibility",
}
phrma_exporter_operator_eligibility = util.create_exporter_operator(
    'phrma_exporter_eligibility', payload_eligibility, data_ingestion_dag
)
# Ingestion DAG
(
    phrma_bq_operator_race_national
    >> [
        phrma_bq_operator_age_national,
        phrma_bq_operator_elig_national,
        phrma_bq_operator_lis_national,
        phrma_bq_operator_sex_national,
    ]
    >> phrma_bq_operator_race_state
    >> [
        phrma_bq_operator_age_state,
        phrma_bq_operator_elig_state,
        phrma_bq_operator_lis_state,
        phrma_bq_operator_sex_state,
    ]
    >> phrma_bq_operator_race_county
    >> [
        phrma_bq_operator_elig_county,
        phrma_bq_operator_lis_county,
        phrma_bq_operator_sex_county,
    ]
    >> phrma_bq_operator_age_county
    >> phrma_exporter_operator_race
    >> [
        phrma_exporter_operator_eligibility,
        phrma_exporter_operator_lis,
        phrma_exporter_operator_sex,
    ]
    >> phrma_exporter_operator_age,
)
