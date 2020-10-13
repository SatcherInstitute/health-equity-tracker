import math
from pandas import DataFrame, read_excel
from .gcs_to_bq_util import append_dataframe_to_bq
# This is implicitly depended on by pandas.read_excel
import xlrd  # noqa: F401
from google.cloud import storage
from .constants import _STATE_NAMES

_FILEPATH = '{}-{}.xlsx'


def write_primary_care_access_to_bq(dataset, table_name, gcs_bucket,
                                    fileprefix):
    """Writes primary care access stats to BigQuery from bucket
        dataset: The BigQuery dataset to write to
        table_name: The name of the biquery table to write to
        gcs_bucket: The name of the gcs bucket to read the data from
        fileprefix: The prefix of  files in the landing bucket to read from"""
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket)

    data = []
    for state_name in _STATE_NAMES:
        filename = _FILEPATH.format(fileprefix, state_name)
        blob = bucket.blob(filename)
        local_path = '/tmp/{}'.format(filename)
        blob.download_to_filename(local_path)

        frame = read_excel(
            io=local_path, sheet_name='Ranked Measure Data', skiprows=[0, 2])
        for row_index, row in frame.iterrows():
            # These fields may not be set for every county.
            # If they're not set, we'll use -1 as the numerical value
            num_physicians = row[108] if not math.isnan(row[108]) else -1
            physicians_rate = row[109] if not math.isnan(row[108]) else -1
            row = [row[0], row[1], row[2], num_physicians, physicians_rate]
            data.append(row)
    new_dataframe = DataFrame(
        data=data,
        columns=(
            'county_fips_code',
            'state_name',
            'county_name',
            'num_primary_care_physicians',
            'primary_care_physicians_rate')
        )
    column_types = {
        'county_fips_code': 'INT64',
        'state_name': 'STRING',
        'county_name': 'STRING',
        'num_primary_care_physicians': 'FLOAT64',
        'primary_care_physicians_rate': 'FLOAT64',
    }
    append_dataframe_to_bq(
        new_dataframe, dataset, table_name, column_types=column_types)
