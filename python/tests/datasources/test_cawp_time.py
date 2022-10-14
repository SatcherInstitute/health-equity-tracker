
from unittest import mock
from datasources.cawp_time import (CAWPTimeData)

# RUN INTEGRATION TESTS ON STATE_LEVEL/TERRITORY LEVEL


@ mock.patch('ingestion.gcs_to_bq_util.add_df_to_bq',
             return_value=None)
def testWriteStateLevelToBq(
    mock_bq: mock.MagicMock,
):

    cawp_data = CAWPTimeData()

    # required by bigQuery
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    cawp_data.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    mock_df_state = mock_bq.call_args_list[0].args[0]

    print("state df sent to BQ")
    print(mock_df_state.to_string())
