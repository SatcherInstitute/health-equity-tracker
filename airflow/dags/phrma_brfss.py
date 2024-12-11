# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
import util
from datetime import timedelta


_PHRMA_BRFSS_WORKFLOW_ID = 'PHRMA_BRFSS_DATA'
_PHRMA_BRFSS_DATASET_NAME = 'phrma_brfss_data'

default_args = {
    'start_date': days_ago(0),
    'execution_timeout': timedelta(minutes=15),
}

data_ingestion_dag = DAG(
    'phrma_brfss_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for Phrma Brfss',
)

# INGEST BY GEO / DEMO


# race_national
phrma_brfss_bq_payload_race_national = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='race_and_ethnicity',
    geographic='national',
)
phrma_brfss_bq_operator_race_national = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_race_national', phrma_brfss_bq_payload_race_national, data_ingestion_dag
)

# age_national
phrma_brfss_bq_payload_age_national = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='age',
    geographic='national',
)
phrma_brfss_bq_operator_age_national = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_age_national', phrma_brfss_bq_payload_age_national, data_ingestion_dag
)

# sex_national
phrma_brfss_bq_payload_sex_national = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='sex',
    geographic='national',
)
phrma_brfss_bq_operator_sex_national = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_sex_national', phrma_brfss_bq_payload_sex_national, data_ingestion_dag
)

# education_national
phrma_brfss_bq_payload_education_national = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='education',
    geographic='national',
)
phrma_brfss_bq_operator_education_national = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_education_national', phrma_brfss_bq_payload_education_national, data_ingestion_dag
)

# income_national
phrma_brfss_bq_payload_income_national = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='income',
    geographic='national',
)
phrma_brfss_bq_operator_income_national = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_income_national', phrma_brfss_bq_payload_income_national, data_ingestion_dag
)

# insurance_status_national
phrma_brfss_bq_payload_insurance_status_national = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='insurance_status',
    geographic='national',
)
phrma_brfss_bq_operator_insurance_status_national = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_insurance_status_national', phrma_brfss_bq_payload_insurance_status_national, data_ingestion_dag
)


# race_state
phrma_brfss_bq_payload_race_state = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='race_and_ethnicity',
    geographic='state',
)
phrma_brfss_bq_operator_race_state = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_race_state', phrma_brfss_bq_payload_race_state, data_ingestion_dag
)

# age_state
phrma_brfss_bq_payload_age_state = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='age',
    geographic='state',
)
phrma_brfss_bq_operator_age_state = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_age_state', phrma_brfss_bq_payload_age_state, data_ingestion_dag
)

# sex_state
phrma_brfss_bq_payload_sex_state = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='sex',
    geographic='state',
)
phrma_brfss_bq_operator_sex_state = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_sex_state', phrma_brfss_bq_payload_sex_state, data_ingestion_dag
)

# education_state
phrma_brfss_bq_payload_education_state = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='education',
    geographic='state',
)
phrma_brfss_bq_operator_education_state = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_education_state', phrma_brfss_bq_payload_education_state, data_ingestion_dag
)

# income_state
phrma_brfss_bq_payload_income_state = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='income',
    geographic='state',
)
phrma_brfss_bq_operator_income_state = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_income_state', phrma_brfss_bq_payload_income_state, data_ingestion_dag
)

# insurance_status_state
phrma_brfss_bq_payload_insurance_status_state = util.generate_bq_payload(
    _PHRMA_BRFSS_WORKFLOW_ID,
    _PHRMA_BRFSS_DATASET_NAME,
    demographic='insurance_status',
    geographic='state',
)
phrma_brfss_bq_operator_insurance_status_state = util.create_bq_ingest_operator(
    'phrma_brfss_to_bq_insurance_status_state', phrma_brfss_bq_payload_insurance_status_state, data_ingestion_dag
)


# EXPORT BY DEMOGRAPHIC

payload_race = {
    'dataset_name': _PHRMA_BRFSS_DATASET_NAME,
    'demographic': "race_and_ethnicity",
}
phrma_brfss_exporter_operator_race = util.create_exporter_operator(
    'phrma_brfss_exporter_race', payload_race, data_ingestion_dag
)

payload_age = {'dataset_name': _PHRMA_BRFSS_DATASET_NAME, 'demographic': "age"}
phrma_brfss_exporter_operator_age = util.create_exporter_operator(
    'phrma_brfss_exporter_age', payload_age, data_ingestion_dag
)

payload_sex = {'dataset_name': _PHRMA_BRFSS_DATASET_NAME, 'demographic': "sex", 'should_export_as_alls': True}
phrma_brfss_exporter_operator_sex = util.create_exporter_operator(
    'phrma_brfss_exporter_sex', payload_sex, data_ingestion_dag
)

payload_insurance_status = {'dataset_name': _PHRMA_BRFSS_DATASET_NAME, 'demographic': "insurance_status"}
phrma_brfss_exporter_operator_insurance_status = util.create_exporter_operator(
    'phrma_brfss_exporter_insurance_status', payload_insurance_status, data_ingestion_dag
)


payload_education = {'dataset_name': _PHRMA_BRFSS_DATASET_NAME, 'demographic': "education"}
phrma_brfss_exporter_operator_education = util.create_exporter_operator(
    'phrma_brfss_exporter_education', payload_education, data_ingestion_dag
)


payload_income = {
    'dataset_name': _PHRMA_BRFSS_DATASET_NAME,
    'demographic': "income",
}
phrma_brfss_exporter_operator_income = util.create_exporter_operator(
    'phrma_brfss_exporter_income', payload_income, data_ingestion_dag
)
# Ingestion DAG
(
    phrma_brfss_bq_operator_race_national
    >> [
        phrma_brfss_bq_operator_age_national,
        phrma_brfss_bq_operator_sex_national,
        phrma_brfss_bq_operator_income_national,
        phrma_brfss_bq_operator_education_national,
        phrma_brfss_bq_operator_insurance_status_national,
    ]
    >> phrma_brfss_bq_operator_race_state
    >> [
        phrma_brfss_bq_operator_age_state,
        phrma_brfss_bq_operator_sex_state,
        phrma_brfss_bq_operator_income_state,
        phrma_brfss_bq_operator_education_state,
        phrma_brfss_bq_operator_insurance_status_state,
    ]
    >> phrma_brfss_exporter_operator_race
    >> [
        phrma_brfss_exporter_operator_income,
        phrma_brfss_exporter_operator_education,
        phrma_brfss_exporter_operator_insurance_status,
    ]
    >> phrma_brfss_exporter_operator_age
    >> phrma_brfss_exporter_operator_sex
)
