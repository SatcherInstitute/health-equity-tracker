import pandas as pd
import json
import us

df = pd.read_csv("2020-Annual.csv")

df = df.fillna(-1)

races = [
    'American Indian/Alaska Native',
    'Asian',
    'Black',
    'Hawaiian/Pacific Islander',
    'Hispanic',
    'Multiracial',
    'Other Race',
    'White',
    'All'
    ]

race_map = {
        'American Indian/Alaska Native': 'American Indian and Alaska Native (Non-Hispanic)',
        'Asian': "Asian (Non-Hispanic)",
        "Black": "Black or African American (Non-Hispanic)",
        "Hispanic": "Hispanic or Latino",
        "Hawaiian/Pacific Islander": "Native Hawaiian and Pacific Islander (Non-Hispanic)",
        "Other Race": "Some other race (Non-Hispanic)",
        "White":"White (Non-Hispanic)",
        "Multiracial": "Two or more races (Non-Hispanic)",
        "All": "All"
        }

ages = ['18-44', '45-64', '65+', 'All']

sexes = ['Male', 'Female', 'All']

def generate_breakdown(breakdown):
    info_map = {"race_and_ethnicity": races, "age": ages, "sex": sexes}

    final_json = []

    states = df['State Name'].drop_duplicates().to_list()

    for state in states:
        for value in info_map[breakdown]:
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
                breakdown_value = race_map[breakdown_value]

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

    with open("uch_%s.json" % breakdown, "w") as new_f:
        json.dump(final_json, new_f)


for b in ["race_and_ethnicity", "age", "sex"]:
    generate_breakdown(b)
