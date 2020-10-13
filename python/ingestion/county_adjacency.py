from .gcs_to_bq_util import load_csv_as_dataframe, append_dataframe_to_bq


# Note: each county's neighbors list includes itself
def write_adjacencies_to_bq(dataset, table_name, gcs_bucket, filename):
    """Writes county adjacencies to BigQuery from the provided GCS bucket

       dataset: The BigQuery dataset to write to
       table_name: The name of the biquery table to write to
       gcs_bucket: The name of the gcs bucket to read the data from
       filename: The name of the file in the gcs bucket to read from"""
    frame = load_csv_as_dataframe(gcs_bucket, filename, dtype={
        'fipscounty': 'string',
        'fipsneighbor': 'string'
    })
    frame = frame[['fipscounty', 'fipsneighbor']]
    frame = frame.rename(columns={
        'fipscounty': 'county_geoid',
        'fipsneighbor': 'neighbor_geoids'
    })
    frame = frame.groupby('county_geoid', as_index=False).agg(list)

    column_types = {
        'county_geoid': 'STRING',
        'neighbor_geoids': 'STRING'
    }
    col_modes = {'neighbor_geoids': 'REPEATED'}
    append_dataframe_to_bq(frame, dataset, table_name,
                           column_types=column_types, col_modes=col_modes)
