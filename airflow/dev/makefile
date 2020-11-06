.PHONY: run build

build_ingest_gcs:
	docker build -t het/ingest_to_gcs -f ../../run_ingestion/Dockerfile ../..

build_gcs_to_bq:
	docker build -t het/gcs_to_bq -f ../../run_gcs_to_bq/Dockerfile ../..

build: build_ingest_gcs build_gcs_to_bq

run:
	docker-compose -f docker-compose-data-ingestion.yml up -d

reload_ingest_gcs: build_ingest_gcs run

reload_gcs_to_bq: build_gcs_to_bq run

kill:
	@echo "Killing docker-airflow containers"
	docker kill $(shell docker ps -q)
	docker ps -a -q | xargs docker rm -v