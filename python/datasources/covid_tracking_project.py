from google.cloud import bigquery

from datasources.data_source import DataSource
import ingestion.gcs_to_bq_util as gcs_to_bq_util
import ingestion.standardized_columns as col_std

# Covid Tracking Project race data by state from covidtracking.com/race
class CovidTrackingProject(DataSource):

    @staticmethod
    def get_id():
        return 'COVID_TRACKING_PROJECT'

    @staticmethod
    def get_table_name():
        return 'covid_tracking_project'

    @staticmethod
    def get_standard_columns():
        return {
            'aian': col_std.Race.AIAN,
            'asian': col_std.Race.ASIAN,
            'black': col_std.Race.BLACK,
            'nhpi': col_std.Race.NHPI,
            'white': col_std.Race.WHITE,
            'multiracial': col_std.Race.MULTI,
            'other': col_std.Race.OTHER,
            'unknown': col_std.Race.UNKNOWN,
            'ethnicity_hispanic': col_std.Race.HISP,
            'ethnicity_nonhispanic': col_std.Race.NH,
            'ethnicity_unknown': col_std.Race.ETHNICITY_UNKNOWN,
            'total': col_std.Race.TOTAL
        }

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        filename = self.get_attr(attrs, 'filename')
        metadata_table_id = self.get_attr(attrs, 'metadata_table_id')

        df = gcs_to_bq_util.load_csv_as_dataframe(gcs_bucket, filename)

        # Massage the data into the standard format.
        df.drop(columns=['cases_latinx', 'deaths_latinx',
                         'hosp_latinx', 'tests_latinx'])
        df.melt(id_vars=['date', 'state'])
        df[['variable_type', 'race_and_ethnicity']] = df.variable.str.split(
            "_", 1, expand=True)
        df.drop('variable', axis=1, inplace=True)
        df = df.pivot(index=['date', 'state', 'race_and_ethnicity'],
                      columns='variable_type', values='value').reset_index()
        df.rename(columns={'state': 'state_postal_abbreviation'})
        df.rename(columns=lambda col: col.lower().strip())

        # Get the metadata table
        client = bigquery.Client()
        sql = """
        SELECT *
        FROM {};
        """.format(metadata_table_id)

        metadata = client.query(sql).to_dataframe()
