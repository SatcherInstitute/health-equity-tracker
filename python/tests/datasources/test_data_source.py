import pandas as pd

from datasources.data_source import DataSource


def testCleanFrameColumnNames():
    ds = DataSource()
    df = pd.DataFrame(
        # /* cSpell:disable */
        {'Upp3rcase': [],
         'Special!char': [],
         'this=that': [],
         '%count': [],
         'with SPACES': []})
    ds.clean_frame_column_names(df)
    assert set(df.columns) == set(['upp3rcase', 'special_char', 'thiseqthat',
                                   'pctcount', 'with_spaces'])
