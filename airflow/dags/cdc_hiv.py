# TODO: Rename our airflow/ as it tries to import from that and not the pip airflow
# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
import util

_CDC_HIV_WORKFLOW_ID = 'CDC_HIV_DATA'
_CDC_HIV_DATASET_NAME = 'cdc_hiv_data'
_HIV_AGE_ADJUST_WORKFLOW_ID = 'AGE_ADJUST_CDC_HIV'

default_args = {
    'start_date': days_ago(0),
}

data_ingestion_dag = DAG(
    'cdc_hiv_ingestion_dag',
    default_args=default_args,
    schedule_interval=None,
    description='Ingestion configuration for HIV',
)

# RACE NATIONAL
cdc_hiv_bq_payload_race_national = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID,
    _CDC_HIV_DATASET_NAME,
    demographic='race',
    geographic='national',
)
cdc_hiv_bq_operator_race_national = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_race_national', cdc_hiv_bq_payload_race_national, data_ingestion_dag
)

# RACE STATE
cdc_hiv_bq_payload_race_state = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID, _CDC_HIV_DATASET_NAME, demographic='race', geographic='state'
)
cdc_hiv_bq_operator_race_state = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_race_state', cdc_hiv_bq_payload_race_state, data_ingestion_dag
)

# RACE COUNTY
cdc_hiv_bq_payload_race_county = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID, _CDC_HIV_DATASET_NAME, demographic='race', geographic='county'
)
cdc_hiv_bq_operator_race_county = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_race_county', cdc_hiv_bq_payload_race_county, data_ingestion_dag
)


# SEX NATIONAL
cdc_hiv_bq_payload_sex_national = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID,
    _CDC_HIV_DATASET_NAME,
    demographic='sex',
    geographic='national',
)
cdc_hiv_bq_operator_sex_national = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_sex_national', cdc_hiv_bq_payload_sex_national, data_ingestion_dag
)

# SEX STATE
cdc_hiv_bq_payload_sex_state = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID, _CDC_HIV_DATASET_NAME, demographic='sex', geographic='state'
)
cdc_hiv_bq_operator_sex_state = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_sex_state', cdc_hiv_bq_payload_sex_state, data_ingestion_dag
)

# SEX COUNTY
cdc_hiv_bq_payload_sex_county = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID, _CDC_HIV_DATASET_NAME, demographic='sex', geographic='county'
)
cdc_hiv_bq_operator_sex_county = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_sex_county', cdc_hiv_bq_payload_sex_county, data_ingestion_dag
)

# AGE NATIONAL
cdc_hiv_bq_payload_age_national = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID,
    _CDC_HIV_DATASET_NAME,
    demographic='age',
    geographic='national',
)
cdc_hiv_bq_operator_age_national = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_age_national', cdc_hiv_bq_payload_age_national, data_ingestion_dag
)

# AGE STATE
cdc_hiv_bq_payload_age_state = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID, _CDC_HIV_DATASET_NAME, demographic='age', geographic='state'
)
cdc_hiv_bq_operator_age_state = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_age_state', cdc_hiv_bq_payload_age_state, data_ingestion_dag
)

# AGE COUNTY
cdc_hiv_bq_payload_age_county = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID, _CDC_HIV_DATASET_NAME, demographic='age', geographic='county'
)
cdc_hiv_bq_operator_age_county = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_age_county', cdc_hiv_bq_payload_age_county, data_ingestion_dag
)

# BLACK WOMEN NATIONAL
cdc_hiv_bq_payload_black_women_national = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID,
    _CDC_HIV_DATASET_NAME,
    demographic='black_women',
    geographic='national',
)
cdc_hiv_bq_operator_black_women_national = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_black_women_national',
    cdc_hiv_bq_payload_black_women_national,
    data_ingestion_dag,
)

# BLACK WOMEN STATE
cdc_hiv_bq_payload_black_women_state = util.generate_bq_payload(
    _CDC_HIV_WORKFLOW_ID,
    _CDC_HIV_DATASET_NAME,
    demographic='black_women',
    geographic='state',
)
cdc_hiv_bq_operator_black_women_state = util.create_bq_ingest_operator(
    'cdc_hiv_to_bq_black_women_state',
    cdc_hiv_bq_payload_black_women_state,
    data_ingestion_dag,
)


# AGE ADJUST
cdc_hiv_age_adjust_payload = util.generate_bq_payload(
    _HIV_AGE_ADJUST_WORKFLOW_ID,
    _CDC_HIV_DATASET_NAME,
)
cdc_hiv_age_adjust_op = util.create_bq_ingest_operator(
    'cdc_hiv_age_adjust', cdc_hiv_age_adjust_payload, data_ingestion_dag
)

# EXPORTERS

payload_race = {
    'dataset_name': _CDC_HIV_DATASET_NAME,
    'demographic': "race_and_ethnicity",
}
cdc_hiv_exporter_operator_race = util.create_exporter_operator(
    'cdc_hiv_exporter_race', payload_race, data_ingestion_dag
)

payload_age = {'dataset_name': _CDC_HIV_DATASET_NAME, 'demographic': "age"}
cdc_hiv_exporter_operator_age = util.create_exporter_operator('cdc_hiv_exporter_age', payload_age, data_ingestion_dag)


payload_sex = {'dataset_name': _CDC_HIV_DATASET_NAME, 'demographic': "sex", 'should_export_as_alls': True}
cdc_hiv_exporter_operator_sex = util.create_exporter_operator('cdc_hiv_exporter_sex', payload_sex, data_ingestion_dag)

payload_black_women = {
    'dataset_name': _CDC_HIV_DATASET_NAME,
    'demographic': "black_women",
    'should_export_as_alls': True,
}
cdc_hiv_exporter_operator_black_women = util.create_exporter_operator(
    'cdc_hiv_exporter_black_women', payload_black_women, data_ingestion_dag
)

payload_race_with_age_adjust = {
    'dataset_name': _CDC_HIV_DATASET_NAME,
    'demographic': "race_and_ethnicity",
}
cdc_hiv_exporter_operator_race_with_age_adjust = util.create_exporter_operator(
    'cdc_hiv_exporter_race_with_age_adjust',
    payload_race_with_age_adjust,
    data_ingestion_dag,
)


# Ingestion DAG
(
    cdc_hiv_bq_operator_black_women_national
    >> cdc_hiv_bq_operator_black_women_state
    >> [cdc_hiv_bq_operator_sex_national, cdc_hiv_bq_operator_sex_state]
    >> cdc_hiv_bq_operator_sex_county
    >> [cdc_hiv_bq_operator_race_national, cdc_hiv_bq_operator_race_state]
    >> cdc_hiv_bq_operator_race_county
    >> [cdc_hiv_bq_operator_age_national, cdc_hiv_bq_operator_age_state]
    >> cdc_hiv_bq_operator_age_county
    >> [
        cdc_hiv_exporter_operator_race,
        cdc_hiv_exporter_operator_age,
        cdc_hiv_exporter_operator_sex,
        cdc_hiv_exporter_operator_black_women,
    ]
    >> cdc_hiv_age_adjust_op
    >> cdc_hiv_exporter_operator_race_with_age_adjust,
)
