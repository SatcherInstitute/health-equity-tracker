"""
https://stackoverflow.com/questions/50735075/how-to-write-query-result-to-google-cloud-storage-bucket-directly

Solution: BigQuery result to Google Cloud Storage bucket directly

from google.cloud import bigquery
from google.cloud import storage

def export_to_gcs():
	# change the table and where condition
	QUERY = "SELECT * FROM TABLE where CONDITION"
	bq_client = bigquery.Client()
	query_job = bq_client.query(QUERY) # BigQuery API request
	rows_df = query_job.result().to_dataframe()

	storage_client = storage.Client() # Storage API request
	bucket = storage_client.get_bucket(BUCKETNAME) # change the bucket name
	blob = bucket.blob('temp/Add_to_Cart.csv')
	blob.upload_from_string(rows_df.to_csv(sep=';',index=False,encoding='utf-8'),content_type='application/octet-stream')
	return "success"
 """

import os
from google.cloud import bigquery, storage

STATE_FIPS_TO_NAME_MAP = {
    "01": "Alabama",
    "02": "Alaska",
    "04": "Arizona",
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
    # "78": "U.S. Virgin Islands"
}

bq_client = bigquery.Client()
project_id = os.environ.get('PROJECT_ID')
dataset_id = "{}.{}".format(project_id, "cdc_restricted_data")

dataset = bq_client.get_dataset(dataset_id)

tables = list(bq_client.list_tables(dataset))

for table in tables:
    if "county" not in table.table_id:
        continue
    table_name = "{}.{}.{}".format(
        table.project, table.dataset_id, table.table_id)

    for fips in STATE_FIPS_TO_NAME_MAP.keys():

        state_file_name = f'{table.dataset_id}-{table.table_id}-{fips}.json'
        query = f"""
								SELECT *
								FROM {table_name}
								WHERE county_fips LIKE '{fips}___'
								LIMIT 5
						"""

        print("from", table_name, "to", state_file_name)

        query_job = bq_client.query(query)

        rows_df = query_job.to_dataframe()

        print(rows_df)

        print("***")
        storage_client = storage.Client()  # Storage API request
        print("-->", state_file_name)

        try:
            bucket = storage_client.get_bucket("bhammond1-dev-export")
            print(bucket)
        except:
            print("couldn't find bhammond1-dev-export bucket")

        blob = bucket.blob(state_file_name)
        blob.upload_from_string(
            rows_df.to_json(), content_type='application/octet-stream')
