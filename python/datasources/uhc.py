from ingestion.standardized_columns import Race

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, get_first_response

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
        data_file = get_first_response(UHC_BASE_URL, None)

        for b in ["race_and_ethnicity", "age", "sex"]:
            write_breakdown_to_bq(b, datafile.toDf())

def write_breakdown_to_bq(breakdown, df):
    breakdown_map = {
        "race_and_ethnicity": UHC_RACE_GROUPS,
        "age": UHC_AGE_GROUPS,
        "sex": UHC_SEX_GROUPS,
    }

    final_json = []

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

            output = {}
            output['state_name'] = state

            breakdown_value = value
            if breakdown == "race_and_ethnicity":
                breakdown_value = UHC_AGE_GROUPS_TO_STANDARD[breakdown_value]

            output[breakdown] = breakdown_value

            diabetes_pct = diabetes_row['Value'].values[0]
            if diabetes_pct != -1:
                output['diabetes_pct'] = diabetes_pct

            copd_pct = copd_row['Value'].values[0]
            if copd_pct != -1:
                output['copd_pct'] = copd_pct

            if state != "United States":
                output['state_fips'] = us.states.lookup(state.lower()).fips
            else:
                output['state_fips'] = "00"

            final_json.append(output)
