import pandas as pd  # type: ignore
import numpy as np  # type: ignore

from ingestion.standardized_columns import Race
import ingestion.standardized_columns as std_col
import ingestion.constants as constants

from datasources.data_source import DataSource
from ingestion import gcs_to_bq_util, dataset_utils

UHC_RACE_GROUPS = [
    'American Indian/Alaska Native',
    'Asian',
    'Asian/Pacific Islander',
    'Black',
    'Hawaiian/Pacific Islander',
    'Hispanic',
    'Multiracial',
    'Other Race',
    'White',
    'All',
]

# COPD, Diabetes, Depression, Frequent Mental Distress, Excessive Drinking
BROAD_AGE_GROUPS = ['18-44', '45-64', '65+']

SUICIDE_AGE_GROUPS = [
    '15-24',
    '25-34',
    '35-44',
    '45-54',
    '55-64',
    '65-74',
    '75-84',
    '85+']


VOTER_AGE_GROUPS = [
    '18-24 ',  # NOTE csv has typo extra space which we remove later
    '25-34',
    '35-44',
    '45-64']

# single list of all unique age group options
UHC_AGE_GROUPS = list(dict.fromkeys([
    std_col.TOTAL_VALUE,
    *SUICIDE_AGE_GROUPS,
    *VOTER_AGE_GROUPS,
    *BROAD_AGE_GROUPS
]))

# No Age Breakdowns for: Non-medical Drug (including Illicit Opioid, Non-Medical Rx Opioid)

UHC_SEX_GROUPS = ['Male', 'Female', std_col.TOTAL_VALUE]

RACE_GROUPS_TO_STANDARD = {
    'American Indian/Alaska Native': Race.AIAN_NH.value,
    'Asian': Race.ASIAN_NH.value,
    'Asian/Pacific Islander': Race.API_NH.value,
    'Black': Race.BLACK_NH.value,
    'Hispanic': Race.HISP.value,
    'Hawaiian/Pacific Islander': Race.NHPI_NH.value,
    'Other Race': Race.OTHER_STANDARD_NH.value,
    'White': Race.WHITE_NH.value,
    'Multiracial': Race.MULTI_NH.value,
    'All': Race.TOTAL.value,
}

BASE_UHC_URL = "https://www.americashealthrankings.org/api/v1/downloads/251"

UHC_DETERMINANTS = {
    "Chronic Obstructive Pulmonary Disease": std_col.COPD_PREFIX,
    "Diabetes": std_col.DIABETES_PREFIX,
    "Frequent Mental Distress": std_col.FREQUENT_MENTAL_DISTRESS_PREFIX,
    "Depression": std_col.DEPRESSION_PREFIX,
    "Excessive Drinking": std_col.EXCESSIVE_DRINKING_PREFIX,
    "Non-medical Drug Use": std_col.NON_MEDICAL_DRUG_USE_PREFIX,
    # NOTE: both opioid conditions below are subsets of Non-medical Drug Use above
    "Illicit Opioid Use": std_col.ILLICIT_OPIOID_USE_PREFIX,
    "Non-medical Use of Prescription Opioids": std_col.NON_MEDICAL_RX_OPIOID_USE_PREFIX,
    "Asthma": std_col.ASTHMA_PREFIX,
    "Cardiovascular Diseases": std_col.CARDIOVASCULAR_PREFIX,
    "Chronic Kidney Disease": std_col.CHRONIC_KIDNEY_PREFIX,
    "Avoided Care Due to Cost": std_col.AVOIDED_CARE_PREFIX,
    "Suicide": std_col.SUICIDE_PREFIX,
    "Preventable Hospitalizations": std_col.PREVENTABLE_HOSP_PREFIX,
    "Voter Participation": std_col.VOTER_PARTICIPATION_PREFIX,

    # VOTER PARTICIPATION
    # pres: state total ALL + by age (missing 65+) + by sex + by race
    # midterm: state total ALL + by age (missing 65+)
    # 65+ midterm: only 65+ age tracker
    # average: not using, state totals from AHR match our state totals
}

# When parsing Measure Names from rows with a demographic breakdown
# these aliases will be used instead of the determinant string above
ALT_ROWS_ALL = {
    "Non-medical Drug Use": "Non-medical Drug Use - Past Year",
    "Voter Participation": "Voter Participation (Presidential)"
}

ALT_ROWS_WITH_DEMO = {
    "Illicit Opioid Use": "Use of Illicit Opioids",
    "Voter Participation": "Voter Participation (Presidential)"
}

PER100K_DETERMINANTS = {
    "Suicide": std_col.SUICIDE_PREFIX,
    "Preventable Hospitalizations": std_col.PREVENTABLE_HOSP_PREFIX
}

PLUS_5_AGE_DETERMINANTS = {
    "Suicide": std_col.SUICIDE_PREFIX,
}

AVERAGED_DETERMINANTS = ["Voter Participation"]


BREAKDOWN_MAP = {
    "race_and_ethnicity": UHC_RACE_GROUPS,
    "age": UHC_AGE_GROUPS,
    "sex": UHC_SEX_GROUPS,
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
            'upload_to_gcs should not be called for UHCData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):
        df = gcs_to_bq_util.load_csv_as_df_from_web(BASE_UHC_URL)
        df = df.rename(columns={'State Name': std_col.STATE_NAME_COL})

        for geo in ['state', 'national']:
            loc_df = df.copy()
            if geo == 'national':
                loc_df = loc_df.loc[loc_df[std_col.STATE_NAME_COL] == constants.US_NAME]
            else:
                loc_df = loc_df.loc[loc_df[std_col.STATE_NAME_COL] != constants.US_NAME]

            for breakdown in [std_col.RACE_OR_HISPANIC_COL, std_col.AGE_COL, std_col.SEX_COL]:
                breakdown_df = loc_df.copy()
                breakdown_df = parse_raw_data(breakdown_df, breakdown)
                breakdown_df = post_process(breakdown_df, breakdown, geo)

                column_types = {c: 'STRING' for c in breakdown_df.columns}

                for col in UHC_DETERMINANTS.values():
                    column_types[std_col.generate_column_name(col, std_col.PER_100K_SUFFIX)] = 'FLOAT'
                    column_types[std_col.generate_column_name(col, std_col.PCT_SHARE_SUFFIX)] = 'FLOAT'

                column_types[std_col.BRFSS_POPULATION_PCT] = 'FLOAT'

                if std_col.RACE_INCLUDES_HISPANIC_COL in breakdown_df.columns:
                    column_types[std_col.RACE_INCLUDES_HISPANIC_COL] = 'BOOL'

                table_name = '%s_%s' % (breakdown, geo)

                gcs_to_bq_util.add_df_to_bq(
                    breakdown_df, dataset, table_name, column_types=column_types)


def parse_raw_data(df, breakdown):
    """Parses the raw UHC data into a dataframe with the column names and datatypes
       the frontend can eventually use based on the given breakdown.

       df: Dataframe with raw data directly pulled from the UHC csv
       breakdown: the demographic breakdown to generate a df for."""

    output = []
    states = df[std_col.STATE_NAME_COL].drop_duplicates().to_list()

    for state in states:
        for breakdown_value in BREAKDOWN_MAP[breakdown]:

            output_row = {}
            output_row[std_col.STATE_NAME_COL] = state

            if breakdown == std_col.RACE_OR_HISPANIC_COL:
                output_row[std_col.RACE_CATEGORY_ID_COL] = \
                    RACE_GROUPS_TO_STANDARD[breakdown_value]
            else:
                output_row[breakdown] = breakdown_value.strip()

            for determinant, prefix in UHC_DETERMINANTS.items():
                per_100k_col_name = std_col.generate_column_name(prefix, std_col.PER_100K_SUFFIX)

                if breakdown_value in {'All', 'Total'}:
                    # find row that matches current nested iterations
                    matched_row = df.loc[
                        (df[std_col.STATE_NAME_COL] == state) &
                        (df['Measure Name'] ==
                         ALT_ROWS_ALL.get(determinant, determinant))
                    ]

                    # TOTAL voter_participation is avg of pres and midterm data
                    if determinant in AVERAGED_DETERMINANTS:
                        output_row[per_100k_col_name] = get_average_determinate_value(
                                matched_row, 'Voter Participation (Midterm)', df, state)

                    # already per 100k
                    elif determinant in PER100K_DETERMINANTS:
                        output_row[per_100k_col_name] = matched_row['Value'].values[0]
                    # converted from % to per 100k
                    else:
                        output_row[per_100k_col_name] = matched_row['Value'].values[0] * 1000

                else:
                    # For rows with demographic breakdown, the determinant
                    # and breakdown group are in a single field
                    # We build that string to perfectly match the field,
                    # using any alias for the determinant as needed
                    space_or_ages = " "
                    if breakdown == std_col.AGE_COL:
                        space_or_ages += "Ages "
                    measure_name = (
                        f"{ALT_ROWS_WITH_DEMO.get(determinant, determinant)}"
                        f" -{space_or_ages}"
                        f"{breakdown_value}"
                    )

                    matched_row = df.loc[
                        (df[std_col.STATE_NAME_COL] == state) &
                        (df['Measure Name'] == measure_name)]

                    # BY AGE voter participation is avg of pres and midterm
                    if determinant in AVERAGED_DETERMINANTS and breakdown == std_col.AGE_COL:
                        if breakdown_value in VOTER_AGE_GROUPS:
                            measure_name = (
                                f"Voter Participation (Midterm) - Ages "
                                f"{breakdown_value}"
                            )

                        # or get midterm for 65+ (different format)
                        elif breakdown_value == "65+":
                            measure_name = "Voter Participation - Ages 65+ (Midterm)"

                        # skip midterm calc for all other age groups
                        else:
                            continue

                        output_row[per_100k_col_name] = get_average_determinate_value(
                            matched_row, measure_name, df, state)

                    # for other determinants besides VOTER
                    elif len(matched_row) > 0:
                        pct = matched_row['Value'].values[0]
                        if pct:
                            if determinant in PER100K_DETERMINANTS:
                                output_row[per_100k_col_name] = matched_row['Value'].values[0]

                            # convert from % to per 100k
                            else:
                                output_row[per_100k_col_name] = matched_row['Value'].values[0] * 1000

            output.append(output_row)

    output_df = pd.DataFrame(output)

    if breakdown == std_col.RACE_OR_HISPANIC_COL:
        std_col.add_race_columns_from_category_id(output_df)

    return output_df


def post_process(breakdown_df, breakdown, geo):
    """Merge the population data and then do all needed calculations with it.
       Returns a dataframe ready for the frontend.

       breakdown_df: Dataframe with all the raw UHC data.
       breakdown: demographic breakdown (race, sex, age)
       geo: geographic level (national, state)"""

    breakdown_df = dataset_utils.merge_fips_codes(breakdown_df)

    breakdown_name = 'race' if breakdown == std_col.RACE_OR_HISPANIC_COL else breakdown
    breakdown_df = dataset_utils.merge_pop_numbers(breakdown_df, breakdown_name, geo)
    breakdown_df = breakdown_df.rename(columns={std_col.POPULATION_PCT_COL: std_col.BRFSS_POPULATION_PCT})
    breakdown_df[std_col.BRFSS_POPULATION_PCT] = breakdown_df[std_col.BRFSS_POPULATION_PCT].astype(float)

    for determinant in UHC_DETERMINANTS.values():
        per_100k_col = std_col.generate_column_name(determinant, std_col.PER_100K_SUFFIX)
        breakdown_df[std_col.generate_column_name(determinant, 'estimated_total')] \
            = breakdown_df.apply(estimate_total, axis=1, args=(per_100k_col, ))

    for determinant in UHC_DETERMINANTS.values():
        raw_count_col = std_col.generate_column_name(determinant, 'estimated_total')
        pct_share_col = std_col.generate_column_name(determinant, std_col.PCT_SHARE_SUFFIX)

        total_val = Race.TOTAL.value if breakdown == std_col.RACE_CATEGORY_ID_COL else std_col.TOTAL_VALUE
        breakdown_df = dataset_utils.generate_pct_share_col(
                breakdown_df, raw_count_col, pct_share_col, breakdown, total_val)

    for determinant in UHC_DETERMINANTS.values():
        breakdown_df = breakdown_df.drop(columns=std_col.generate_column_name(determinant, 'estimated_total'))

    breakdown_df = breakdown_df.drop(columns=std_col.POPULATION_COL)
    return breakdown_df


def get_average_determinate_value(matched_row, measure_name, df, state):
    """Gets the average value of two determinents, ignores null values.

       matched_row: row in the dataset that matches the measure and demographic we are looking for
       measure_name: measure name that we want to average with
       df: the dataframe containing all informaiton
       state: string state name"""

    pres_breakdown_value, mid_breakdown_value = np.nan, np.nan

    if len(matched_row) > 0:
        pres_breakdown_value = matched_row['Value'].values[0]

    matched_row_midterm = df.loc[
        (df[std_col.STATE_NAME_COL] == state) &
        (df['Measure Name'] == measure_name)]

    if len(matched_row_midterm) > 0:
        mid_breakdown_value = matched_row_midterm['Value'].values[0]

    average_value = np.nanmean(
        [pres_breakdown_value, mid_breakdown_value])

    return average_value * 1000


def estimate_total(row, condition_name_per_100k):
    """Returns an estimate of the total number of people with a given condition.

       condition_name_per_100k: string column name of the condition per_100k to estimate the total of"""

    if pd.isna(row[condition_name_per_100k]) or \
        pd.isna(row[std_col.POPULATION_COL]) or \
            int(row[std_col.POPULATION_COL]) == 0:

        return None

    return round((float(row[condition_name_per_100k]) / 100000) * float(row[std_col.POPULATION_COL]))
