from io import StringIO
from unittest import mock

import pandas as pd

from datasources.uhc import UHCData

test_csv_data = """Edition,Report Type,Measure Name,State Name,Rank,Value,Score,Lower CI,Upper CI,Source,Source Year
2020,2020 Annual,Diabetes,Alabama,48,14.0,1.63,14.9,13,AHR data,
2020,2020 Annual,Diabetes - American Indian/Alaska Native,Alabama,,15.3,,24,6.6,AHR data,
2020,2020 Annual,Diabetes - Asian,Alabama,,,,,,AHR data,
2020,2020 Annual,Diabetes - Black,Alabama,,17.3,,19.3,15.3,AHR data,
2020,2020 Annual,Diabetes - Female,Alabama,48,13.8,1.51,15.1,12.6,AHR data,
2020,2020 Annual,Diabetes - Hawaiian/Pacific Islander,Alabama,,,,,,AHR data,
2020,2020 Annual,Diabetes - Male,Alabama,47,14.1,1.34,15.5,12.6,AHR data,
2020,2020 Annual,Diabetes - Multiracial,Alabama,,,,,,AHR data,
2020,2020 Annual,Diabetes - Other Race,Alabama,,,,,,AHR data,
2020,2020 Annual,Diabetes - White,Alabama,46,13.3,1.48,14.5,12.2,AHR data,
2020,2020 Annual,Diabetes - Ages 18-44,Alabama,,3.3,,4.3,2.4,AHR data,
2020,2020 Annual,Diabetes - Ages 45-64,Alabama,49,20.1,1.84,22.1,18.2,AHR data,
2020,2020 Annual,Diabetes - Ages 65+,Alabama,44,25.9,0.83,27.9,23.8,AHR data,
2020,2020 Annual,Diabetes - Female,Alabama,48,13.8,1.51,15.1,12.6,AHR data,
2020,2020 Annual,Diabetes - Male,Alabama,47,14.1,1.34,15.5,12.6,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease,Alabama,48,14.0,1.63,14.9,13,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - American Indian/Alaska Native,Alabama,,15.3,,24,6.6,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Asian,Alabama,,,,,,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Black,Alabama,,17.3,,19.3,15.3,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Female,Alabama,48,13.8,1.51,15.1,12.6,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Hawaiian/Pacific Islander,Alabama,,,,,,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Male,Alabama,47,14.1,1.34,15.5,12.6,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Multiracial,Alabama,,,,,,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Other Race,Alabama,,,,,,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - White,Alabama,46,13.3,1.48,14.5,12.2,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Ages 18-44,Alabama,,3.3,,4.3,2.4,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Ages 45-64,Alabama,49,20.1,1.84,22.1,18.2,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Ages 65+,Alabama,44,25.9,0.83,27.9,23.8,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Female,Alabama,48,13.8,1.51,15.1,12.6,AHR data,
2020,2020 Annual,Chronic Obstructive Pulmonary Disease - Male,Alabama,47,14.1,1.34,15.5,12.6,AHR data,
"""


def get_test_data_as_df():
    f = StringIO(test_csv_data)
    return pd.read_csv(f, dtype={'state_fips': str})


@mock.patch('ingestion.gcs_to_bq_util.load_csv_as_dataframe_from_web',
            return_value=get_test_data_as_df())
@mock.patch('ingestion.gcs_to_bq_util.add_dataframe_to_bq',
            return_value=None)
def testWriteToBq(mock_bq: mock.MagicMock, mock_csv: mock.MagicMock):
    uhc = UHCData()
    kwargs = {'filename': 'test_file.csv',
              'metadata_table_id': 'test_metadata',
              'table_name': 'output_table'}

    uhc.write_to_bq('dataset', 'gcs_bucket', **kwargs)
    assert mock_bq.call_count == 3

    expected_len = {
        'race_and_ethnicity': 9,
        'age': 4,
        'sex': 3,
    }

    demos = ['race_and_ethnicity', 'age', 'sex']
    for i in range(len(demos)):
        exptected_cols = [
            'state_name',
            'copd_pct',
            'diabetes_pct',
            demos[i],
        ]

        if demos[i] == 'race_and_ethnicity':
            exptected_cols.append('race')
            exptected_cols.append('race_includes_hispanic')
            exptected_cols.append('race_category_id')

        output = mock_bq.call_args_list[i].args[0]
        assert set(output.columns) == set(exptected_cols)
        assert output.shape == (expected_len[demos[i]], len(exptected_cols))
