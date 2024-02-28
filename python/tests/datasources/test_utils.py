import os
import json
import pandas as pd

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "utils")


def get_acs_metadata_as_json(year: int):
    metadata_file = 'acs_metadata_2021_and_earlier.json' if year < 2022 else 'acs_metadata_2022_and_later.json'
    with open(os.path.join(TEST_DIR, metadata_file)) as f:
        return json.load(f)


def _load_df_from_bigquery(*args, **kwargs) -> pd.DataFrame:
    """Mock calls to HET BiqQuery tables with local versions"""
    datasource_name, table_name, dtypes = args
    if "county" in table_name:
        dtypes["county_fips"] = str
    filename = f'{datasource_name}-{table_name}.ndjson'
    file_path = os.path.join(THIS_DIR, "het_bq_tables_for_mocks", filename)
    print("MOCKING READ FROM HET BQ:", filename)

    pop_df = pd.read_json(file_path, lines=True, dtype=dtypes)

    return pop_df
