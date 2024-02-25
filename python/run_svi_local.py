"""
    cdcSviCounty = CDCSviCounty()

    kwargs = {
        'filename': 'test_file.csv',
        'metadata_table_id': 'test_metadata',
        'table_name': 'output_table',
    }

    cdcSviCounty.write_to_bq('dataset', 'gcs_bucket', **kwargs)
 """

from datasources.cdc_svi_county import CDCSviCounty


cdcSviCounty = CDCSviCounty()

cdcSviCounty.run_local_pipeline()
