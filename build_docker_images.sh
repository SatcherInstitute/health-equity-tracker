ingestion_image_name="ingestion-service"
gcs_to_bq_image_name="gcs-to-bq-service"
data_server_image_name="data-server-service"
aggregator_image_name="aggregator-service"
exporter_image_name="exporter-service"
frontend_image_name="frontend-server"

docker build -t gcr.io/$PROJECT_ID/$ingestion_image_name -f run_ingestion/Dockerfile .
docker build -t gcr.io/$PROJECT_ID/$gcs_to_bq_image_name -f run_gcs_to_bq/Dockerfile .
docker build -t gcr.io/$PROJECT_ID/$data_server_image_name -f data_server/Dockerfile .
docker build -t gcr.io/$PROJECT_ID/$exporter_image_name -f exporter/Dockerfile .
docker build -t gcr.io/$PROJECT_ID/$aggregator_image_name -f aggregator/Dockerfile .
docker build -t gcr.io/$PROJECT_ID/$frontend_image_name -f frontend_server/Dockerfile .


docker push gcr.io/$PROJECT_ID/$ingestion_image_name
docker push gcr.io/$PROJECT_ID/$gcs_to_bq_image_name
docker push gcr.io/$PROJECT_ID/$data_server_image_name
docker push gcr.io/$PROJECT_ID/$exporter_image_name
docker push gcr.io/$PROJECT_ID/$aggregator_image_name
docker push gcr.io/$PROJECT_ID/$frontend_image_name