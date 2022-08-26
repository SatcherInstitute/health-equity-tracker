import logging
import os

from flask import Flask, request
from google.cloud import bigquery, storage


app = Flask(__name__)


@app.route('/', methods=['POST'])
def export_dataset_tables():
    """Exports the tables in the given dataset to GCS.

       Request form must include the dataset name."""
    data = request.get_json()

    if data.get('dataset_name') is None:
        return ('Request must include dataset name.', 400)

    dataset_name = data['dataset_name']
    project_id = os.environ.get('PROJECT_ID')
    export_bucket = os.environ.get('EXPORT_BUCKET')
    dataset_id = "{}.{}".format(project_id, dataset_name)

    bq_client = bigquery.Client()
    dataset = bq_client.get_dataset(dataset_id)
    tables = list(bq_client.list_tables(dataset))

    # If there are no tables in the dataset, return an error so the pipeline will alert
    # and a human can look into any potential issues.
    if not tables:
        return ('Dataset has no tables.', 500)

    for table in tables:

        # export the full table
        dest_uri = "gs://{}/{}-{}.json".format(
            export_bucket, dataset_name, table.table_id)
        table_ref = dataset.table(table.table_id)
        try:
            export_table(bq_client, table_ref, dest_uri,
                         'NEWLINE_DELIMITED_JSON')

            std_table_suffix = "_std"
            if not table.table_id.endswith(std_table_suffix):
                continue

            dest_uri = "gs://{}/{}-{}.csv".format(
                export_bucket, dataset_name, table.table_id)
            export_table(bq_client, table_ref, dest_uri, 'CSV')
        except Exception as err:
            logging.error(err)
            return ('Error exporting table, {}, to {}: {}'.format(table.table_id, dest_uri, err), 500)

        # also split up county-level tables by state and export those individually
        if "county" in table.table_id:
            export_split_county_tables(bq_client, table, export_bucket)

    return ('', 204)


def export_table(bq_client, table_ref, dest_uri, dest_fmt):
    """ Run the extract job to export the given table to the given destination and wait for completion"""
    job_config = bigquery.ExtractJobConfig(destination_format=dest_fmt)
    extract_job = bq_client.extract_table(
        table_ref, dest_uri, location='US', job_config=job_config)
    extract_job.result()
    logging.info("Exported %s to %s", table_ref.table_id, dest_uri)


def export_split_county_tables(bq_client, table, export_bucket):
    """ Split county-level table by parent state FIPS, and export as individual blobs to the given destination and wait for completion"""
    try:
        table_name = "{}.{}.{}".format(
            table.project, table.dataset_id, table.table_id)

        for fips in STATE_LEVEL_FIPS_TO_NAME_MAP.keys():
            state_file_name = f'{table.dataset_id}-{table.table_id}-{fips}.json'
            query = f"""
                SELECT *
                FROM {table_name}
                WHERE county_fips LIKE '{fips}___'
                LIMIT 2
                """

            print("from", table_name, "to", state_file_name)

            query_job = bq_client.query(query)

            rows_df = query_job.to_dataframe()

            print(rows_df)

            print("***")
            storage_client = storage.Client()  # Storage API request

            bucket = storage_client.get_bucket(export_bucket)
            print(bucket)

            blob = bucket.blob(state_file_name)
            blob.upload_from_string(
                # newline delimited json
                rows_df.to_json(orient="records",
                                lines=True), content_type='application/octet-stream')
    except Exception as err:
        logging.error(err)
        return ('Error splitting county-level table, {}, into state-specific file: {}: {}'.format(table_name, state_file_name, err), 500)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))


STATE_LEVEL_FIPS_TO_NAME_MAP = {
    "01": "Alabama",
    # "02": "Alaska",
    # "04": "Arizona",
    # "05": "Arkansas",
    # "06": "California",
    # "08": "Colorado",
    # "09": "Connecticut",
    # "10": "Delaware",
    # "11": "District of Columbia",
    # "12": "Florida",
    # "13": "Georgia",
    # "15": "Hawaii",
    # "16": "Idaho",
    # "17": "Illinois",
    # "18": "Indiana",
    # "19": "Iowa",
    # "20": "Kansas",
    # "21": "Kentucky",
    # "22": "Louisiana",
    # "23": "Maine",
    # "24": "Maryland",
    # "25": "Massachusetts",
    # "26": "Michigan",
    # "27": "Minnesota",
    # "28": "Mississippi",
    # "29": "Missouri",
    # "30": "Montana",
    # "31": "Nebraska",
    # "32": "Nevada",
    # "33": "New Hampshire",
    # "34": "New Jersey",
    # "35": "New Mexico",
    # "36": "New York",
    # "37": "North Carolina",
    # "38": "North Dakota",
    # "39": "Ohio",
    # "40": "Oklahoma",
    # "41": "Oregon",
    # "42": "Pennsylvania",
    # "44": "Rhode Island",
    # "45": "South Carolina",
    # "46": "South Dakota",
    # "47": "Tennessee",
    # "48": "Texas",
    # "49": "Utah",
    # "50": "Vermont",
    # "51": "Virginia",
    # "53": "Washington",
    # "54": "West Virginia",
    # "55": "Wisconsin",
    # "56": "Wyoming",
    # "60": "American Samoa",
    # "66": "Guam",
    # "69": "Northern Mariana Islands",
    # "72": "Puerto Rico",
    "78": "U.S. Virgin Islands"
}
