# General
project_id = "jenniebrown-het-infra-test-e4"
gcs_landing_bucket = "jenniebrown-dev-landing-bucket-automated"
bq_dataset_name = "msm_dataset_automated"

# Pub/Sub topics
upload_to_gcs_topic_name = "upload-to-gcs-automated"
notify_data_ingested_topic = "notify-data-ingested-automated"

# Ingestion Cloud Run Service vars
ingestion_service_name = "ingestion-service-automated"
ingestion_image_name = "ingestion-service-automated"
ingestion_subscription_name = "ingestion-subscription-automated"
ingestion_invoker_identity_id = "ingestion-invoker-automated"
ingestion_runner_identity_id = "ingestion-runner-automated"
ingestion_runner_role_id = "ingestion_runner_role2_automated"

# GCS to BQ Cloud Run Service vars
gcs_to_bq_service_name = "gcs-to-bq-service-automated"
gcs_to_bq_image_name = "gcs-to-bq-service-automated"
notify_data_ingested_subscription_name = "notify-data-ingested-subscription-automated"
gcs_to_bq_invoker_identity_id = "gcs-to-bq-invoker-automated"
gcs_to_bq_runner_identity_id = "gcs-to-bq-runner-automated"
gcs_to_bq_runner_role_id = "gcs_to_bq_runner_role2_automated"

# Data server Cloud Run Service vars
data_server_service_name = "data-server-service-automated"
data_server_image_name = "data-server-service-automated"
data_server_runner_identity_id = "data-server-runner-automated"
data_server_runner_role_id = "data_server_runner_role_automated"