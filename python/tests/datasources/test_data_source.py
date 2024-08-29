import pandas as pd

from datasources.data_source import DataSource


class TestDataSource(DataSource):
    def get_id(self):
        return "test_id"

    def get_table_name(self):
        return "test_table"


def testCleanFrameColumnNames():
    ds = TestDataSource()
    df = pd.DataFrame(
        # /* cSpell:disable */
        {'Upp3rcase': [], 'Special!char': [], 'this=that': [], '%count': [], 'with SPACES': []}
    )
    ds.clean_frame_column_names(df)
    assert set(df.columns) == set(['upp3rcase', 'special_char', 'thiseqthat', 'pctcount', 'with_spaces'])
