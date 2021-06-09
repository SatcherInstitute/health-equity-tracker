from ingestion.standardized_columns import Race
from ingestion.standardized_columns as std_col

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util

UHC_RACE_GROUPS = [
    'American Indian/Alaska Native',
    'Asian',
    'Black',
    'Hawaiian/Pacific Islander',
    'Hispanic',
    'Multiracial',
    'Other Race',
    'White',
    'All',
]

UHC_AGE_GROUPS = ['18-44', '45-64', '65+', 'All']

UHC_SEX_GROUPS = ['Male', 'Female', 'All']

UHC_AGE_GROUPS_TO_STANDARD = {
    'American Indian/Alaska Native': Race.AIAN_NH.value,
    'Asian': Race.ASIAN_NH.value,
    'Black': Race.BLACK_NH.value,
    'Hispanic': Race.HISP.value,
    'Hawaiian/Pacific Islander': Race.NHPI_NH.value,
    'Other Race': Race.OTHER_STANDARD_NH.value,
    'White': Race.WHITE_NH.value,
    'Multiracial': Race.MULTI_NH.value,
    'All': 'All',
}

BASE_UHC_URL = "https://www.americashealthrankings.org/api/v1/downloads/210"

class UHCData(DataSource):

    @staticmethod
    def get_id():
        return 'UHC_DATA'

    @staticmethod
    def get_table_name():
        return 'uhc_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CDCRestrictedData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        df = gcs_to_bq_util.load_csv_as_dataframe_from_web(BASE_UHC_URL)

        for b in ["race_and_ethnicity", "age", "sex"]:
            write_breakdown_to_bq(b, df, dataset)

def test():

def write_breakdown_to_bq(breakdown, df, dataset):
    breakdown_map = {
        "race_and_ethnicity": UHC_RACE_GROUPS,
        "age": UHC_AGE_GROUPS,
        "sex": UHC_SEX_GROUPS,
    }

    output_cols = [std_col.STATE_NAME_COL, std_col.STATE_FIPS_COL,
            std_col.COPD_PCT, std_col.DIABETES_PCT]

    output = pd.DataFrame(columns=output_cols)

    states = df['State Name'].drop_duplicates().to_list()

    for state in states:
        for value in breakdown_map[breakdown]:
            if value == 'All':
                diabetes_row = df.loc[
                    (df['State Name'] == state) &
                    (df['Measure Name'] == ("Diabetes"))]

                copd_row = df.loc[
                    (df['State Name'] == state) &
                    (df['Measure Name'] == ("Chronic Obstructive Pulmonary Disease"))]
            else:
                diabetes_row = df.loc[
                    (df['State Name'] == state) &
                    (df['Measure Name'].str.contains("Diabetes")) &
                    (df['Measure Name'].str.contains(value))].reset_index()

                copd_row = df.loc[
                    (df['State Name'] == state) &
                    (df['Measure Name'].str.contains("Chronic Obstructive Pulmonary Disease")) &
                    (df['Measure Name'].str.contains(value))].reset_index()

            output_row = {}
            output_row['state_name'] = state

            breakdown_value = value
            if breakdown == "race_and_ethnicity":
                breakdown_value = UHC_AGE_GROUPS_TO_STANDARD[breakdown_value]

            output_row[breakdown] = breakdown_value

            diabetes_pct = diabetes_row['Value'].values[0]
            if diabetes_pct != -1:
                output_row['diabetes_pct'] = diabetes_pct

            copd_pct = copd_row['Value'].values[0]
            if copd_pct != -1:
                output_row['copd_pct'] = copd_pct

            if state != "United States":
                output_row['state_fips'] = us.states.lookup(state.lower()).fips
            else:
                output_row['state_fips'] = "00"

            output = output.append(output_row)

    table_name = "uhc_%s" % breakdown
    gcs_to_bq_util.add_dataframe_to_bq(
        output, dataset, table_name, column_types=column_types)
