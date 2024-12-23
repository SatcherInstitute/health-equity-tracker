# TODO: Rename our airflow/ as it tries to import from that and not the pip airflow
# pylint: disable=no-name-in-module
from airflow import DAG  # type: ignore
from airflow.utils.dates import days_ago  # type: ignore
import util
from datetime import timedelta

_ACS_WORKFLOW_ID = "ACS_CONDITION"
_ACS_DATASET_NAME = "acs_condition"

default_args = {
    "start_date": days_ago(0),
    "execution_timeout": timedelta(minutes=15),
}

data_ingestion_dag = DAG(
    "acs_condition_ingestion_dag",
    default_args=default_args,
    schedule_interval=None,
    description="Ingestion configuration for ACS Condition",
)

# CACHE ACS SOURCE INTO TMP JSON IN BUCKETS

acs_condition_gcs_payload_2012 = util.generate_gcs_payload(_ACS_WORKFLOW_ID, year="2012")
acs_condition_gcs_operator_2012 = util.create_gcs_ingest_operator(
    "acs_condition_to_gcs_2012", acs_condition_gcs_payload_2012, data_ingestion_dag
)

acs_condition_gcs_payload_2013 = util.generate_gcs_payload(_ACS_WORKFLOW_ID, year="2013")
acs_condition_gcs_operator_2013 = util.create_gcs_ingest_operator(
    "acs_condition_to_gcs_2013", acs_condition_gcs_payload_2013, data_ingestion_dag
)

acs_condition_gcs_payload_2014 = util.generate_gcs_payload(_ACS_WORKFLOW_ID, year="2014")
acs_condition_gcs_operator_2014 = util.create_gcs_ingest_operator(
    "acs_condition_to_gcs_2014", acs_condition_gcs_payload_2014, data_ingestion_dag
)

acs_condition_gcs_payload_2015 = util.generate_gcs_payload(_ACS_WORKFLOW_ID, year="2015")
acs_condition_gcs_operator_2015 = util.create_gcs_ingest_operator(
    "acs_condition_to_gcs_2015", acs_condition_gcs_payload_2015, data_ingestion_dag
)

acs_condition_gcs_payload_2016 = util.generate_gcs_payload(_ACS_WORKFLOW_ID, year="2016")
acs_condition_gcs_operator_2016 = util.create_gcs_ingest_operator(
    "acs_condition_to_gcs_2016", acs_condition_gcs_payload_2016, data_ingestion_dag
)

acs_condition_gcs_payload_2017 = util.generate_gcs_payload(_ACS_WORKFLOW_ID, year="2017")
acs_condition_gcs_operator_2017 = util.create_gcs_ingest_operator(
    "acs_condition_to_gcs_2017", acs_condition_gcs_payload_2017, data_ingestion_dag
)

acs_condition_gcs_payload_2018 = util.generate_gcs_payload(_ACS_WORKFLOW_ID, year="2018")
acs_condition_gcs_operator_2018 = util.create_gcs_ingest_operator(
    "acs_condition_to_gcs_2018", acs_condition_gcs_payload_2018, data_ingestion_dag
)

acs_condition_gcs_payload_2019 = util.generate_gcs_payload(_ACS_WORKFLOW_ID, year="2019")
acs_condition_gcs_operator_2019 = util.create_gcs_ingest_operator(
    "acs_condition_to_gcs_2019", acs_condition_gcs_payload_2019, data_ingestion_dag
)

acs_condition_gcs_payload_2020 = util.generate_gcs_payload(_ACS_WORKFLOW_ID, year="2020")
acs_condition_gcs_operator_2020 = util.create_gcs_ingest_operator(
    "acs_condition_to_gcs_2020", acs_condition_gcs_payload_2020, data_ingestion_dag
)

acs_condition_gcs_payload_2021 = util.generate_gcs_payload(_ACS_WORKFLOW_ID, year="2021")
acs_condition_gcs_operator_2021 = util.create_gcs_ingest_operator(
    "acs_condition_to_gcs_2021", acs_condition_gcs_payload_2021, data_ingestion_dag
)

acs_condition_gcs_payload_2022 = util.generate_gcs_payload(_ACS_WORKFLOW_ID, year="2022")
acs_condition_gcs_operator_2022 = util.create_gcs_ingest_operator(
    "acs_condition_to_gcs_2022", acs_condition_gcs_payload_2022, data_ingestion_dag
)

# PROCESS AND WRITE TO BQ

acs_condition_bq_payload_2012 = util.generate_bq_payload(_ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year="2012")
acs_condition_bq_operator_2012 = util.create_bq_ingest_operator(
    "acs_condition_to_bq_2012", acs_condition_bq_payload_2012, data_ingestion_dag
)

acs_condition_bq_payload_2013 = util.generate_bq_payload(_ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year="2013")
acs_condition_bq_operator_2013 = util.create_bq_ingest_operator(
    "acs_condition_to_bq_2013", acs_condition_bq_payload_2013, data_ingestion_dag
)

acs_condition_bq_payload_2014 = util.generate_bq_payload(_ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year="2014")
acs_condition_bq_operator_2014 = util.create_bq_ingest_operator(
    "acs_condition_to_bq_2014", acs_condition_bq_payload_2014, data_ingestion_dag
)

acs_condition_bq_payload_2015 = util.generate_bq_payload(_ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year="2015")
acs_condition_bq_operator_2015 = util.create_bq_ingest_operator(
    "acs_condition_to_bq_2015", acs_condition_bq_payload_2015, data_ingestion_dag
)

acs_condition_bq_payload_2016 = util.generate_bq_payload(_ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year="2016")
acs_condition_bq_operator_2016 = util.create_bq_ingest_operator(
    "acs_condition_to_bq_2016", acs_condition_bq_payload_2016, data_ingestion_dag
)

acs_condition_bq_payload_2017 = util.generate_bq_payload(_ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year="2017")
acs_condition_bq_operator_2017 = util.create_bq_ingest_operator(
    "acs_condition_to_bq_2017", acs_condition_bq_payload_2017, data_ingestion_dag
)

acs_condition_bq_payload_2018 = util.generate_bq_payload(_ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year="2018")
acs_condition_bq_operator_2018 = util.create_bq_ingest_operator(
    "acs_condition_to_bq_2018", acs_condition_bq_payload_2018, data_ingestion_dag
)

acs_condition_bq_payload_2019 = util.generate_bq_payload(_ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year="2019")
acs_condition_bq_operator_2019 = util.create_bq_ingest_operator(
    "acs_condition_to_bq_2019", acs_condition_bq_payload_2019, data_ingestion_dag
)

acs_condition_bq_payload_2020 = util.generate_bq_payload(_ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year="2020")
acs_condition_bq_operator_2020 = util.create_bq_ingest_operator(
    "acs_condition_to_bq_2020", acs_condition_bq_payload_2020, data_ingestion_dag
)

acs_condition_bq_payload_2021 = util.generate_bq_payload(_ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year="2021")
acs_condition_bq_operator_2021 = util.create_bq_ingest_operator(
    "acs_condition_to_bq_2021", acs_condition_bq_payload_2021, data_ingestion_dag
)

acs_condition_bq_payload_2022 = util.generate_bq_payload(_ACS_WORKFLOW_ID, _ACS_DATASET_NAME, year="2022")
acs_condition_bq_operator_2022 = util.create_bq_ingest_operator(
    "acs_condition_to_bq_2022", acs_condition_bq_payload_2022, data_ingestion_dag
)

# EXPORT FROM BQ TO BUCKETS
acs_condition_exporter_payload_race = {
    "dataset_name": _ACS_DATASET_NAME,
    "demographic": "by_race",
}
acs_condition_exporter_operator_race = util.create_exporter_operator(
    "acs_condition_exporter_race",
    acs_condition_exporter_payload_race,
    data_ingestion_dag,
)

acs_condition_exporter_payload_age = {
    "dataset_name": _ACS_DATASET_NAME,
    "demographic": "by_age",
}
acs_condition_exporter_operator_age = util.create_exporter_operator(
    "acs_condition_exporter_age", acs_condition_exporter_payload_age, data_ingestion_dag
)

acs_condition_exporter_payload_sex = {
    "dataset_name": _ACS_DATASET_NAME,
    "demographic": "by_sex",
}
acs_condition_exporter_operator_sex = util.create_exporter_operator(
    "acs_condition_exporter_sex", acs_condition_exporter_payload_sex, data_ingestion_dag
)

# NOTE: running these gcs "cache" steps in parallel causes issues, so run in series
(
    # CACHING STEP
    acs_condition_gcs_operator_2012
    >> acs_condition_gcs_operator_2013
    >> acs_condition_gcs_operator_2014
    >> acs_condition_gcs_operator_2015
    >> acs_condition_gcs_operator_2016
    >> acs_condition_gcs_operator_2017
    >> acs_condition_gcs_operator_2018
    >> acs_condition_gcs_operator_2019
    >> acs_condition_gcs_operator_2020
    >> acs_condition_gcs_operator_2021
    >> acs_condition_gcs_operator_2022
    # PROCESSING STEP
    >> acs_condition_bq_operator_2012
    >> acs_condition_bq_operator_2013
    >> acs_condition_bq_operator_2014
    >> acs_condition_bq_operator_2015
    >> acs_condition_bq_operator_2016
    >> acs_condition_bq_operator_2017
    >> acs_condition_bq_operator_2018
    >> acs_condition_bq_operator_2019
    >> acs_condition_bq_operator_2020
    >> acs_condition_bq_operator_2021
    >> acs_condition_bq_operator_2022
    # EXPORT FROM BQ TO JSON BUCKET
    >> [
        acs_condition_exporter_operator_race,
        acs_condition_exporter_operator_age,
        acs_condition_exporter_operator_sex,
    ]
)
