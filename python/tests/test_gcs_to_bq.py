import json
import unittest
from datetime import datetime
from datetime import timezone
from freezegun import freeze_time
from google.cloud import bigquery
from pandas import DataFrame
from pandas.testing import assert_frame_equal
from unittest.mock import patch
from unittest.mock import Mock

from ingestion import gcs_to_bq_util


class GcsToBqTest(unittest.TestCase):

  _test_data = [["label1", "label2", "label3"],
               ["valuea", "valueb", "valuec"],
               ["valued", "valuee", "valuef"]]


  def testLoadValuesBlobAsDataframe(self):
    """Tests that data in json list format is loaded into a pandas.DataFrame object using
       the first row as a header."""
    mock_attrs = {'download_as_string.return_value': json.dumps(self._test_data)}
    mock_blob = Mock(**mock_attrs)
    frame = gcs_to_bq_util.load_values_blob_as_dataframe(mock_blob)

    self.assertListEqual(list(frame.columns.array), ["label1", "label2", "label3"])    
    self.assertEqual(frame.size, 6)
    test_frame = DataFrame(data=self._test_data[1:], columns=self._test_data[0], index=[1, 2])
    assert_frame_equal(frame, test_frame)


  @freeze_time("2020-01-01")
  def testAppendDataframeToBq_AutoSchema(self):
    """Tests that autodetect is used when no column_types are provided to append_dataframe_to_bq."""
    test_frame = DataFrame(data=self._test_data[1:], columns=self._test_data[0], index=[1, 2])

    with patch('ingestion.gcs_to_bq_util.bigquery.Client') as mock_client:
      # Set up mock calls
      mock_instance = mock_client.return_value
      mock_table = Mock()
      mock_instance.dataset.return_value = mock_table
      mock_table.table.return_value = 'test-project.test-dataset.test-table'

      gcs_to_bq_util.append_dataframe_to_bq(test_frame.copy(deep=True), "test-dataset", "test-table")

      mock_instance.load_table_from_json.assert_called()
      call_args = mock_instance.load_table_from_json.call_args
      test_frame['ingestion_time'] = datetime(2020, 1, 1, tzinfo=timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f %Z")
      self.assertEqual(call_args.args[0], json.loads(test_frame.to_json(orient='records')))
      job_config = call_args.kwargs['job_config']
      self.assertTrue(job_config.autodetect)


  @freeze_time("2020-01-01")
  def testAppendDataframeToBq_IgnoreColModes(self):
    """Tests that col_modes is ignored when no column_types are provided to append_dataframe_to_bq."""
    test_frame = DataFrame(data=self._test_data[1:], columns=self._test_data[0], index=[1, 2])

    with patch('ingestion.gcs_to_bq_util.bigquery.Client') as mock_client:
      # Set up mock calls
      mock_instance = mock_client.return_value
      mock_table = Mock()
      mock_instance.dataset.return_value = mock_table
      mock_table.table.return_value = 'test-project.test-dataset.test-table'

      gcs_to_bq_util.append_dataframe_to_bq(
        test_frame.copy(deep=True), "test-dataset", "test-table",
        col_modes=['REPEATED', 'REQUIRED'])

      mock_instance.load_table_from_json.assert_called()
      call_args = mock_instance.load_table_from_json.call_args
      test_frame['ingestion_time'] = datetime(
        2020, 1, 1, tzinfo=timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f %Z")
      self.assertEqual(call_args.args[0], json.loads(test_frame.to_json(orient='records')))
      job_config = call_args.kwargs['job_config']
      self.assertTrue(job_config.autodetect)

  @freeze_time("2020-01-01")
  def testAppendDataframeToBq_SpecifySchema(self):
    """Tests that the BigQuery schema is properly defined when column_types are provided to
       append_dataframe_to_bq."""
    test_frame = DataFrame(data=self._test_data[1:], columns=self._test_data[0], index=[1, 2])

    with patch('ingestion.gcs_to_bq_util.bigquery.Client') as mock_client:
      # Set up mock calls
      mock_instance = mock_client.return_value
      mock_table = Mock()
      mock_instance.dataset.return_value = mock_table
      mock_table.table.return_value = 'test-project.test-dataset.test-table'

      column_types = { label : 'STRING' for label in test_frame.columns }
      col_modes = { 'label1' : 'REPEATED',
                    'label2' : 'REQUIRED' }
      gcs_to_bq_util.append_dataframe_to_bq(
        test_frame.copy(deep=True), 'test-dataset', 'test-table',
        column_types=column_types, col_modes=col_modes)

      mock_instance.load_table_from_json.assert_called()
      call_args = mock_instance.load_table_from_json.call_args
      test_frame['ingestion_time'] = datetime(
        2020, 1, 1, tzinfo=timezone.utc).strftime('%Y-%m-%d %H:%M:%S.%f %Z')
      self.assertEqual(call_args.args[0], json.loads(test_frame.to_json(orient='records')))
      job_config = call_args.kwargs['job_config']
      self.assertFalse(job_config.autodetect)

      expected_cols = ['label1', 'label2', 'label3', 'ingestion_time']
      expected_types = ['STRING', 'STRING', 'STRING', 'TIMESTAMP']
      expected_modes = ['REPEATED', 'REQUIRED', 'NULLABLE', 'NULLABLE']
      self.assertListEqual([field.name for field in job_config.schema], expected_cols)
      self.assertListEqual([field.field_type for field in job_config.schema], expected_types)
      self.assertListEqual([field.mode for field in job_config.schema], expected_modes)
    


if __name__ == '__main__':
  unittest.main()
