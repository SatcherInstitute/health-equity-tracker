import json
import logging

import pandas
from google.cloud import storage

from .gcs_to_bq_util import (append_dataframe_to_bq, load_values_as_dataframe,
                             load_values_blob_as_dataframe)


def write_state_names_to_bq(dataset, table_name, gcs_bucket, filename):
    """Writes state names to BigQuery from the provided GCS bucket

       dataset: The BigQuery dataset to write to
       table_name: The name of the biquery table to write to
       gcs_bucket: The name of the gcs bucket to read the data from
       filename: The name of the file in the gcs bucket to read from"""
    try:
        frame = load_values_as_dataframe(gcs_bucket, filename)
        frame = frame.rename(columns={
            'state': 'state_fips_code',
            'NAME': 'state_name'
        })
        column_types = {'state_fips_code': 'STRING', 'state_name': 'STRING'}
        append_dataframe_to_bq(frame, dataset, table_name,
                               column_types=column_types)
    except json.JSONDecodeError as err:
        msg = 'Unable to write to BigQuery due to improperly formatted data: {}'
        logging.error(msg.format(err))


def write_county_names_to_bq(dataset, table_name, gcs_bucket, filename):
    """Writes county names to BigQuery from the provided GCS bucket

       dataset: The BigQuery dataset to write to
       table_name: The name of the biquery table to write to
       gcs_bucket: The name of the gcs bucket to read the data from
       filename: The name of the file in the gcs bucket to read from"""
    try:
        frame = load_values_as_dataframe(gcs_bucket, filename)
        frame = frame.rename(columns={
            'NAME': 'county_name',
            'state': 'state_fips_code',
            'county': 'county_fips_code'
        })
        column_types = {
            'county_name': 'STRING',
            'state_fips_code': 'STRING',
            'county_fips_code': 'STRING'
        }
        append_dataframe_to_bq(frame, dataset, table_name,
                               column_types=column_types)
    except json.JSONDecodeError as err:
        msg = 'Unable to write to BigQuery due to improperly formatted data: {}'
        logging.error(msg.format(err))


def get_population_by_race_columns():
    """Returns population by race column names of ACS fields and the column names
       to convert them to."""
    return {
        'DP05_0070E': 'pop_total',
        'DP05_0071E': 'pop_his_or_lat',
        'DP05_0077E': 'pop_whi_only_nonhis',
        'DP05_0078E': 'pop_bla_only_nonhis',
        'DP05_0080E': 'pop_asi_only_nonhis',

        # These will be grouped into an "Other" category. They will also be
        # included in the output table for completeness, in case one of the
        'DP05_0079E': 'pop_other__ame_ind__ala_nat_only_nonhis',
        'DP05_0081E': 'pop_other__nat_haw__pac_isl_only_nonhis',
        'DP05_0082E': 'pop_other__other_race_only_nonhis',
        'DP05_0083E': 'pop_other__two_or_more_races_nonhis'
    }


def write_population_by_race_to_bq(dataset, table_name, gcs_bucket, filename):
    """Writes population by race to BigQuery from the provided GCS bucket

       dataset: The BigQuery dataset to write to
       table_name: The name of the biquery table to write to
       gcs_bucket: The name of the gcs bucket to read the data from
       filename: The name of the file in the gcs bucket to read from"""
    try:
        frame = load_values_as_dataframe(gcs_bucket, filename)

        columns = get_population_by_race_columns()
        for col in columns:
            frame = frame.astype({col: 'int64'})

        frame['pop_other'] = (frame['DP05_0079E']
                              + frame['DP05_0081E']
                              + frame['DP05_0082E']
                              + frame['DP05_0083E'])

        frame = frame.rename(columns=columns)
        frame = frame.rename(columns={
            'state': 'state_fips_code',
            'county': 'county_fips_code'
        })

        column_types = {v: 'INT64' for k, v in columns.items()}
        column_types['pop_other'] = 'INT64'
        column_types['state_fips_code'] = 'STRING'
        column_types['county_fips_code'] = 'STRING'

        append_dataframe_to_bq(frame, dataset, table_name,
                               column_types=column_types)
    except json.JSONDecodeError as err:
        msg = 'Unable to write to BigQuery due to improperly formatted data: {}'
        logging.error(msg.format(err))


def write_household_income_to_bq(dataset, table_name, gcs_bucket, file_prefix):
    """Fetches all SAIPE blobs from a GCS bucket and uploads to a single BQ table. Also does some preprocessing.

       dataset: The BigQuery dataset to write to
       table_name: The name of the BigQuery table to write to
       gcs_bucket: The name of the GCS bucket to pull from
       file_prefix: File name prefix used to identify which GCS blobs to fetch"""
    client = storage.Client()
    saipe_blobs = client.list_blobs(gcs_bucket, prefix=file_prefix)

    frames = []
    for blob in saipe_blobs:
        frame = load_values_blob_as_dataframe(blob)
        frames.append(frame)

    concat = pandas.concat(frames, ignore_index=True)
    # The SAIPE API includes the query predicate columns, which are duplicates of their
    # ALL_CAPS counterparts. Toss 'em.
    concat.drop(columns=['state', 'county', 'time'], inplace=True)
    append_dataframe_to_bq(concat, dataset, table_name)
