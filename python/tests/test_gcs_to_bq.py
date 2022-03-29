import json
from datetime import datetime, timezone
from textwrap import dedent
from unittest import TestCase
from unittest.mock import MagicMock, Mock, patch

import numpy as np
from freezegun import freeze_time
from pandas import DataFrame
from pandas.testing import assert_frame_equal

from ingestion import gcs_to_bq_util  # pylint: disable=no-name-in-module


class GcsToBqTest(TestCase):

    _test_data = [["label1", "label2", "label3"],
                  ["valuea", "valueb", "valuec"],
                  ["valued", "valuee", "valuef"]]

    def testLoadValuesBlobAsDataframe(self):
        """Tests that data in json list format is loaded into a
           pandas.DataFrame object using the first row as a header."""
        mock_attrs = {
            'download_as_string.return_value': json.dumps(self._test_data)}
        mock_blob = Mock(**mock_attrs)
        frame = gcs_to_bq_util.load_values_blob_as_df(mock_blob)

        self.assertListEqual(list(frame.columns.array),
                             ["label1", "label2", "label3"])
        self.assertEqual(frame.size, 6)
        test_frame = DataFrame(
            data=self._test_data[1:], columns=self._test_data[0], index=[1, 2])
        assert_frame_equal(frame, test_frame)

    @freeze_time("2020-01-01")
    def testAddDataframeToBq_AutoSchema(self):
        """Tests that autodetect is used when no column_types are provided to
           add_df_to_bq."""
        test_frame = DataFrame(
            data=self._test_data[1:], columns=self._test_data[0], index=[1, 2])

        with patch('ingestion.gcs_to_bq_util.bigquery.Client') as mock_client:
            # Set up mock calls
            mock_instance = mock_client.return_value
            mock_table = Mock()
            mock_instance.dataset.return_value = mock_table
            mock_table.table.return_value = 'test-project.test-dataset.table'

            gcs_to_bq_util.add_df_to_bq(
                test_frame.copy(deep=True), "test-dataset", "table")

            mock_instance.load_table_from_json.assert_called()
            call_args = mock_instance.load_table_from_json.call_args
            test_frame['ingestion_ts'] = datetime(
                2020, 1, 1, tzinfo=timezone.utc).strftime(
                    "%Y-%m-%d %H:%M:%S.%f %Z")
            self.assertEqual(call_args.args[0],
                             json.loads(test_frame.to_json(orient='records')))
            job_config = call_args.kwargs['job_config']
            self.assertTrue(job_config.autodetect)

    @freeze_time("2020-01-01")
    def testAddDataframeToBq_IgnoreColModes(self):
        """Tests that col_modes is ignored when no column_types are provided
           to add_df_to_bq."""
        test_frame = DataFrame(
            data=self._test_data[1:], columns=self._test_data[0], index=[1, 2])

        with patch('ingestion.gcs_to_bq_util.bigquery.Client') as mock_client:
            # Set up mock calls
            mock_instance = mock_client.return_value
            mock_table = Mock()
            mock_instance.dataset.return_value = mock_table
            mock_table.table.return_value = 'test-project.test-dataset.table'

            gcs_to_bq_util.add_df_to_bq(
                test_frame.copy(deep=True), "test-dataset", "table",
                col_modes={'label1': 'REPEATED', 'label2': 'REQUIRED'})

            mock_instance.load_table_from_json.assert_called()
            call_args = mock_instance.load_table_from_json.call_args
            test_frame['ingestion_ts'] = datetime(
                2020, 1, 1, tzinfo=timezone.utc).strftime(
                    "%Y-%m-%d %H:%M:%S.%f %Z")
            self.assertEqual(call_args.args[0],
                             json.loads(test_frame.to_json(orient='records')))
            job_config = call_args.kwargs['job_config']
            self.assertTrue(job_config.autodetect)

    @freeze_time("2020-01-01")
    def testAddDataframeToBq_SpecifySchema(self):
        """Tests that the BigQuery schema is properly defined when column_types
           are provided to add_df_to_bq."""
        test_frame = DataFrame(
            data=self._test_data[1:], columns=self._test_data[0], index=[1, 2])

        with patch('ingestion.gcs_to_bq_util.bigquery.Client') as mock_client:
            # Set up mock calls
            mock_instance = mock_client.return_value
            mock_table = Mock()
            mock_instance.dataset.return_value = mock_table
            mock_table.table.return_value = 'test-project.test-dataset.table'

            column_types = {label: 'STRING' for label in test_frame.columns}
            col_modes = {'label1': 'REPEATED',
                         'label2': 'REQUIRED'}
            gcs_to_bq_util.add_df_to_bq(
                test_frame.copy(deep=True), 'test-dataset', 'table',
                column_types=column_types, col_modes=col_modes)

            mock_instance.load_table_from_json.assert_called()
            call_args = mock_instance.load_table_from_json.call_args
            test_frame['ingestion_ts'] = datetime(
                2020, 1, 1, tzinfo=timezone.utc).strftime(
                    '%Y-%m-%d %H:%M:%S.%f %Z')
            self.assertEqual(call_args.args[0],
                             json.loads(test_frame.to_json(orient='records')))
            job_config = call_args.kwargs['job_config']
            self.assertFalse(job_config.autodetect)

            expected_cols = ['label1', 'label2', 'label3', 'ingestion_ts']
            expected_types = ['STRING', 'STRING', 'STRING', 'TIMESTAMP']
            expected_modes = ['REPEATED', 'REQUIRED', 'NULLABLE', 'NULLABLE']
            self.assertListEqual([field.name for field in job_config.schema],
                                 expected_cols)
            self.assertListEqual(
                [field.field_type for field in job_config.schema],
                expected_types)
            self.assertListEqual([field.mode for field in job_config.schema],
                                 expected_modes)

    @patch('ingestion.gcs_to_bq_util.storage.Client')
    def testLoadCsvAsDataFrame_ParseTypes(self, mock_bq: MagicMock):
        # Write data to an temporary file
        test_file_path = '/tmp/test_file.csv'
        test_data = dedent(
            """
            col1,col2,col3,col4
            20201209,13,text,"2,937"
            20210105,"1,400",string,
            """)
        with open(test_file_path, 'w') as f:
            f.write(test_data)

        df = gcs_to_bq_util.load_csv_as_df(
            'gcs_bucket', 'test_file.csv', parse_dates=['col1'], thousands=',')
        # With parse_dates, col1 should be interpreted as numpy datetime. With
        # thousands=',', numeric columns should be interpreted correctly even if
        # they are written as strings with commas. Numeric cols with null values
        # are inferred as floats.
        expected_types = {'col1': np.dtype('datetime64[ns]'), 'col2': np.int64,
                          'col3': np.object, 'col4': np.float64}
        for col in df.columns:
            self.assertEqual(df[col].dtype, expected_types[col])

        # Re-write the test data since load_csv_as_df removes the file.
        with open(test_file_path, 'w') as f:
            f.write(test_data)
        df = gcs_to_bq_util.load_csv_as_df('gcs_bucket', 'test_file.csv')
        # Without the additional read_csv args, the data are inferred to the
        # default np.object type.
        expected_types = {'col1': np.int64, 'col2': np.object,
                          'col3': np.object, 'col4': np.object}
        for col in df.columns:
            self.assertEqual(df[col].dtype, expected_types[col])
