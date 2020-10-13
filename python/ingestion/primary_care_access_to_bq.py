import json
import logging
from pandas import DataFrame, read_excel
from .gcs_to_bq_util import append_dataframe_to_bq
# This is implicitly depended on by pandas.read_excel
import xlrd  # noqa: F401
from google.cloud import storage

_STATE_NAMES = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming"
]
_FILEPATH = '{}-{}.xlsx'


def write_primary_care_access_to_bq(dataset, table_name, gcs_bucket, fileprefix):
    """Writes primary care access stats to BigQuery from bucket

       dataset: The BigQuery dataset to write to
       table_name: The name of the biquery table to write to
       gcs_bucket: The name of the gcs bucket to read the data from
       fileprefix: The prefix of the files in the gcs landing bucket to read from"""

    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)

    for state_name in _STATE_NAMES:
        filename = _FILEPATH.format(fileprefix, state_name)
        blob = bucket.blob(filename)
        local_path = '/tmp/{}'.format(filename)
        blob.download_to_filename(local_path)

        try:
            frame = read_excel(
                io=local_path, sheet_name='Ranked Measure Data', skiprows=[0, 1])
            data = []
            for _, row in frame.iterrows():
                data.append([row[0], row[1], row[2],
                             row[108], row[109], row[110]])
            new_dataframe = DataFrame(
                data=data,
                columns=('county_fips_code',
                         'state_name',
                         'county_name',
                         'num_primary_care_physicians',
                         'primary_care_physicians_rate',
                         'primary_care_physicians_ratio'))
            column_types = {
                'county_fips_code': 'STRING',
                'state_name': 'STRING',
                'county_name': 'STRING',
                'num_primary_care_physicians': 'FLOAT64',
                'primary_care_physicians_rate': 'FLOAT64',
                'primary_care_physicians_ratio': 'STRING'
            }
            append_dataframe_to_bq(
                new_dataframe, dataset, table_name, column_types=column_types)
        except json.JSONDecodeError as err:
            msg = 'Unable to write to BigQuery due to improperly formatted data: {}'
            logging.error(msg.format(err))
